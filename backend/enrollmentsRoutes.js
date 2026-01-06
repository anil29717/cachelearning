import express from 'express';
import { initDb, query } from './db.js';
import jwt from 'jsonwebtoken';
import { emit } from './realtime.js';

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

// Create enrollment for a course after payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    await initDb();
    // Restrict purchases to students only
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can enroll in courses' });
    }
    const { course_id, order_id } = req.body || {};
    const courseId = Number(course_id);
    if (!courseId) return res.status(400).json({ error: 'course_id is required' });

    // Ensure course exists
    const courseRows = await query('SELECT id, price FROM courses WHERE id = ?', [courseId]);
    if (!courseRows.length) return res.status(404).json({ error: 'Course not found' });

    // Upsert-like: try insert, ignore duplicate
    try {
      await query('INSERT INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)', [req.user.id, courseId, order_id || null]);
    } catch (e) {
      // ignore duplicate entry errors
    }

    const rows = await query(
      'SELECT e.id, e.user_id, e.course_id, e.order_id, e.created_at, c.title, c.price FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ? AND e.course_id = ?',
      [req.user.id, courseId]
    );
    const enrollment = rows[0];
    if (enrollment && enrollment.price !== undefined) enrollment.price = Number(enrollment.price);
    emit('enrollment_created', {
      user_id: req.user.id,
      course_id: courseId,
      order_id: order_id || null,
      price: enrollment?.price,
      title: enrollment?.title,
      at: new Date().toISOString(),
    });
    return res.json({ enrollment });
  } catch (err) {
    console.error('Create enrollment error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List current user's enrollments
router.get('/', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const rows = await query(
      'SELECT e.id, e.user_id, e.course_id, e.order_id, e.created_at, c.title, c.price FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ? ORDER BY e.created_at DESC',
      [req.user.id]
    );
    const normalized = rows.map(r => ({ ...r, price: Number(r.price) }));
    return res.json({ enrollments: normalized });
  } catch (err) {
    console.error('List enrollments error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
