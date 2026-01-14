import express from 'express';
import { query } from './db.js';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';

const router = express.Router();

// Middleware (copied from other routes to ensure consistency)
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || String(secret).trim() === '') {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// XP Values
const XP_VALUES = {
  video_watch: 10,
  lesson_complete: 20,
  quiz_pass: 30,
  daily_activity: 5
};

// Level Thresholds
const LEVELS = [
  { name: 'Beginner', min: 0, max: 500 },
  { name: 'Intermediate', min: 501, max: 1500 },
  { name: 'Pro', min: 1501, max: 3000 },
  { name: 'Master', min: 3001, max: Infinity }
];

function calculateLevel(xp) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min && xp <= LEVELS[i].max) {
      return i + 1; // Level number (1-based)
    }
  }
  return LEVELS.length; // Max level
}

// Ensure gamification record exists for user
async function ensureUserGamification(userId) {
  const [existing] = await query('SELECT * FROM user_gamification WHERE user_id = ?', [userId]);
  if (!existing) {
    await query('INSERT INTO user_gamification (user_id) VALUES (?)', [userId]);
    return { user_id: userId, total_xp: 0, level: 1, current_streak: 0, longest_streak: 0, last_activity: new Date() };
  }
  return existing;
}

// POST /earn-xp
router.post('/earn-xp', authMiddleware, async (req, res) => {
  const { action, referenceId } = req.body;
  const userId = req.user.id;

  if (!XP_VALUES[action]) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const xpAmount = XP_VALUES[action];

  try {
    // 1. Log XP (Anti-cheat: UNIQUE constraint handles duplicates)
    try {
      await query(
        'INSERT INTO xp_logs (user_id, action, reference_id, xp) VALUES (?, ?, ?, ?)',
        [userId, action, referenceId, xpAmount]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({ message: 'XP already earned for this action', earned: false });
      }
      throw err;
    }

    // 2. Update User Stats
    let userStats = await ensureUserGamification(userId);
    let newTotalXp = userStats.total_xp + xpAmount;
    let newLevel = calculateLevel(newTotalXp);
    let levelUp = newLevel > userStats.level;

    // Streak Logic
    // If last activity was yesterday (between 24h and 48h ago), increment streak.
    // If today ( < 24h and same day), keep streak.
    // If older, reset to 1.
    // Simplified: Check date string match
    const lastDate = new Date(userStats.last_activity).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = userStats.current_streak;
    
    if (lastDate === today) {
      // Already active today, no streak change
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset or Start
    }

    let newLongest = Math.max(userStats.longest_streak, newStreak);

    await query(
      `UPDATE user_gamification 
       SET total_xp = ?, level = ?, current_streak = ?, longest_streak = ?, last_activity = NOW() 
       WHERE user_id = ?`,
      [newTotalXp, newLevel, newStreak, newLongest, userId]
    );

    // 3. Check Badges
    const earnedBadges = [];

    // Badge: First Lesson
    if (action === 'lesson_complete') {
      const [count] = await query('SELECT COUNT(*) as c FROM xp_logs WHERE user_id = ? AND action = ?', [userId, 'lesson_complete']);
      if (count.c === 1) { // First one just inserted
        await awardBadge(userId, 'First Lesson', earnedBadges);
      }
    }

    // Badge: 7-Day Streak
    if (newStreak >= 7) {
      await awardBadge(userId, '7-Day Streak', earnedBadges);
      // Bonus XP for 7-day streak (once per streak? or everyday after 7? Requirements say "+50 XP". Assuming once when hitting 7)
      // Check if we already gave bonus for this streak? Simplified: Just give it if exactly 7
      if (newStreak === 7 && lastDate === yesterday) { // Only trigger on the day it becomes 7
         await query('INSERT IGNORE INTO xp_logs (user_id, action, reference_id, xp) VALUES (?, ?, ?, ?)', [userId, 'streak_bonus_7', `streak_${Date.now()}`, 50]);
         // Re-update total XP
         newTotalXp += 50;
         await query('UPDATE user_gamification SET total_xp = ? WHERE user_id = ?', [newTotalXp, userId]);
      }
    }

    // Badge: Course Finisher (Optional check)
    // Client should send 'course_complete' action separately, or we check DB here.
    // For MVP, let's rely on client sending action='course_complete'
    if (action === 'course_complete') {
       await awardBadge(userId, 'Course Finisher', earnedBadges);
    }

    res.json({
      earned: true,
      xpAdded: xpAmount,
      totalXp: newTotalXp,
      level: newLevel,
      levelUp,
      streak: newStreak,
      badges: earnedBadges
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process XP' });
  }
});

async function awardBadge(userId, badgeName, earnedList) {
  try {
    const [badge] = await query('SELECT id FROM badges WHERE name = ?', [badgeName]);
    if (badge) {
      await query('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
      earnedList.push(badgeName);
    }
  } catch (e) {
    // Ignore duplicate badge errors
  }
}

// GET /me
router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const stats = await ensureUserGamification(userId);
    const badges = await query(
      `SELECT b.*, ub.earned_at 
       FROM user_badges ub 
       JOIN badges b ON ub.badge_id = b.id 
       WHERE ub.user_id = ?`,
      [userId]
    );
    
    // Get rank
    const [rankResult] = await query(
      `SELECT COUNT(*) + 1 as rank FROM user_gamification WHERE total_xp > ?`,
      [stats.total_xp]
    );

    res.json({
      stats,
      badges,
      rank: rankResult.rank,
      nextLevelXp: LEVELS[stats.level - 1]?.max || 'Max'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gamification profile' });
  }
});

// GET /leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const leaderboard = await query(
      `SELECT u.name, u.avatar_url, g.total_xp, g.level, g.current_streak 
       FROM user_gamification g 
       JOIN users u ON g.user_id = u.id 
       ORDER BY g.total_xp DESC 
       LIMIT 10`
    );
    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Cron Job: Reset streaks (Run every midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running streak reset cron job...');
  try {
    // Reset streak to 0 if last_activity < 24h ago (actually < yesterday)
    // Logic: If last_activity was NOT today and NOT yesterday, streak = 0.
    // SQL: UPDATE user_gamification SET current_streak = 0 WHERE last_activity < DATE_SUB(NOW(), INTERVAL 1 DAY) -- simplified
    // Better: WHERE DATEDIFF(NOW(), last_activity) > 1
    await query(`UPDATE user_gamification SET current_streak = 0 WHERE DATEDIFF(NOW(), last_activity) > 1`);
  } catch (err) {
    console.error('Streak reset failed', err);
  }
});

export default router;
