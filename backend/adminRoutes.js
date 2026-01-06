import express from 'express';
import pool, { initDb, query } from './db.js';
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

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// List users (admin only)
router.get('/users', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    await initDb();
    const rows = await query('SELECT id, email, name, role, avatar_url, created_at FROM users ORDER BY created_at DESC');
    return res.json({ users: rows });
  } catch (err) {
    console.error('Admin list users error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user id' });
    if (req.user?.id === id) return res.status(400).json({ error: 'You cannot delete yourself', code: 'SELF_DELETE' });

    const userRows = await query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    if (user.role === 'admin') {
      const [adminCount] = await query("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
      const count = Number(adminCount?.c || 0);
      if (count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining admin', code: 'LAST_ADMIN' });
      }
    }

    if (user.role === 'instructor') {
      const [courseCount] = await query('SELECT COUNT(*) as c FROM courses WHERE instructor_id = ?', [id]);
      const count = Number(courseCount?.c || 0);
      if (count > 0) {
        return res.status(400).json({
          error: 'Cannot delete instructor with existing courses',
          details: { courses_count: count },
        });
      }
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM progress WHERE user_id = ?', [id]);
      await conn.query('DELETE FROM enrollments WHERE user_id = ?', [id]);
      await conn.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [id]);
      await conn.query('DELETE FROM users WHERE id = ?', [id]);
      await conn.commit();
      return res.json({ success: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Admin delete user error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// User summary (admin only) for hover details
router.get('/users/:id/summary', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user id' });

    const userRows = await query('SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?', [id]);
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    let summary = { user };
    if (user.role === 'instructor') {
      const [coursesCount] = await query('SELECT COUNT(*) as c FROM courses WHERE instructor_id = ?', [id]);
      const [studentsCount] = await query(
        'SELECT COUNT(*) as c FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.instructor_id = ?',
        [id]
      );
      summary = {
        user,
        courses_count: Number(coursesCount?.c || 0),
        students_count: Number(studentsCount?.c || 0),
      };
    } else {
      const [enrollmentsCount] = await query('SELECT COUNT(*) as c FROM enrollments WHERE user_id = ?', [id]);
      const [completedLessons] = await query('SELECT COUNT(*) as c FROM progress WHERE user_id = ? AND completed = 1', [id]);
      summary = {
        user,
        enrollments_count: Number(enrollmentsCount?.c || 0),
        completed_lessons: Number(completedLessons?.c || 0),
      };
    }

    return res.json({ summary });
  } catch (err) {
    console.error('Admin user summary error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Stats (admin only)
router.get('/stats', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    await initDb();
    const [usersCount] = await query('SELECT COUNT(*) as c FROM users');
    const [coursesCount] = await query('SELECT COUNT(*) as c FROM courses');
    const [enrollmentsCount] = await query('SELECT COUNT(*) as c FROM enrollments');

    // Revenue from payments table: only include captured (exclude refunded)
    const revenueRows = await query('SELECT COALESCE(SUM(amount), 0) as totalPaise FROM payments WHERE status = "captured"');
    const totalRevenue = Number(revenueRows[0]?.totalPaise || 0) / 100; // convert paise to rupees

    // Orders proxy: number of captured payments
    const ordersRows = await query('SELECT COUNT(*) as c FROM payments WHERE status = "captured"');

    const stats = {
      total_users: Number(usersCount?.c || 0),
      total_courses: Number(coursesCount?.c || 0),
      total_enrollments: Number(enrollmentsCount?.c || 0),
      total_orders: Number(ordersRows?.c || 0),
      total_revenue: totalRevenue,
    };
    return res.json({ stats });
  } catch (err) {
    console.error('Admin stats error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
