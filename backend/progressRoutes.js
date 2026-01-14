import express from 'express';
import { initDb, query } from './db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

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
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get progress for a specific course (returns list of completed lesson IDs)
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const courseId = Number(req.params.courseId);
    if (!courseId) return res.status(400).json({ error: 'Invalid course ID' });

    const rows = await query(
      'SELECT lesson_id FROM progress WHERE user_id = ? AND course_id = ? AND completed = 1',
      [req.user.id, courseId]
    );
    
    const completedLessonIds = rows.map(r => r.lesson_id);
    return res.json({ completedLessonIds });
  } catch (err) {
    console.error('Get progress error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update progress: mark lesson completed/uncompleted, return percent completed for the course
router.post('/', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const { course_id, lesson_id, completed } = req.body || {};
    const courseId = Number(course_id);
    const lessonId = Number(lesson_id);
    if (!courseId || !lessonId || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'course_id, lesson_id, and completed are required' });
    }

    // Ensure lesson belongs to course
    const checkLesson = await query('SELECT id, lesson_order FROM lessons WHERE id = ? AND course_id = ?', [lessonId, courseId]);
    if (!checkLesson.length) return res.status(404).json({ error: 'Lesson not found for course' });
    const currentLesson = checkLesson[0];

    // Enforce unlock rule: Previous lesson must be completed (unless it's the first one)
    if (completed) {
       // Find previous lesson
       const prevLessonRows = await query(
         'SELECT id FROM lessons WHERE course_id = ? AND lesson_order < ? ORDER BY lesson_order DESC LIMIT 1',
         [courseId, currentLesson.lesson_order]
       );
       
       if (prevLessonRows.length > 0) {
         const prevLessonId = prevLessonRows[0].id;
         const prevProgress = await query(
           'SELECT completed FROM progress WHERE user_id = ? AND lesson_id = ? AND completed = 1',
           [req.user.id, prevLessonId]
         );
         
         if (!prevProgress.length) {
           return res.status(403).json({ error: 'Previous lesson must be completed first' });
         }
       }
    }

    // Upsert progress by unique user+lesson
    const existing = await query('SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, lessonId]);
    if (existing.length) {
      await query('UPDATE progress SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [completed ? 1 : 0, existing[0].id]);
    } else {
      await query('INSERT INTO progress (user_id, course_id, lesson_id, completed) VALUES (?, ?, ?, ?)', [req.user.id, courseId, lessonId, completed ? 1 : 0]);
    }

    // Compute percent: completed lessons / total lessons
    const totalLessonsRows = await query('SELECT COUNT(*) as cnt FROM lessons WHERE course_id = ?', [courseId]);
    const total = totalLessonsRows[0]?.cnt || 0;
    let percent = 0;
    if (total > 0) {
      const completedRows = await query('SELECT COUNT(*) as cnt FROM progress WHERE user_id = ? AND course_id = ? AND completed = 1', [req.user.id, courseId]);
      const done = completedRows[0]?.cnt || 0;
      percent = Math.round((done / total) * 100);
    }
    return res.json({ progress: percent });
  } catch (err) {
    console.error('Update progress error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
