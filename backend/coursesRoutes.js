import express from 'express';
import { initDb, query } from './db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const DIFFICULTIES = ['basic', 'intermediate', 'advanced'];

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

// List courses with optional filters: status, category, instructor_id
router.get('/', async (req, res) => {
  try {
    await initDb();
    const { status, category, instructor_id, difficulty } = req.query;
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(String(status)); }
    if (category) { where.push('category = ?'); params.push(String(category)); }
    if (instructor_id) { where.push('instructor_id = ?'); params.push(Number(instructor_id)); }
    if (difficulty) {
      const d = String(difficulty).toLowerCase();
      if (!DIFFICULTIES.includes(d)) {
        return res.status(400).json({ error: 'Invalid difficulty' });
      }
      where.push('difficulty = ?'); params.push(d);
    }
    const sql = `SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY c.created_at DESC`;
    const rows = await query(sql, params);
    const normalized = rows.map(r => ({ ...r, price: Number(r.price) }));
    return res.json({ courses: normalized });
  } catch (err) {
    console.error('List courses error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create course (requires auth); creator is req.user.id
router.post('/', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const { title, description = '', price = 0, status = 'draft', category = 'general', thumbnail_url = null, difficulty = 'basic' } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const d = String(difficulty).toLowerCase();
    if (!DIFFICULTIES.includes(d)) return res.status(400).json({ error: 'Invalid difficulty' });
    const instructorId = req.user.id;
    const result = await query(
      'INSERT INTO courses (title, description, price, instructor_id, status, category, thumbnail_url, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, price, instructorId, status, category, thumbnail_url, d]
    );
    const rows = await query('SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?', [result.insertId]);
    const course = rows[0];
    course.price = Number(course.price);
    return res.json({ course });
  } catch (err) {
    console.error('Create course error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get course by id
router.get('/:id', async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    const rows = await query('SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const course = rows[0];
    course.price = Number(course.price);
    const lessons = await query('SELECT id, title, content, video_url, lesson_order as `order`, duration, created_at FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC, id ASC', [id]);
    return res.json({ course, lessons });
  } catch (err) {
    console.error('Get course error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update course (creator or admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    const ownerRows = await query('SELECT instructor_id FROM courses WHERE id = ?', [id]);
    if (!ownerRows.length) return res.status(404).json({ error: 'Not found' });
    const ownerId = ownerRows[0].instructor_id;
    const isOwner = ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, price, status, category, thumbnail_url, difficulty } = req.body;
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (price !== undefined) { fields.push('price = ?'); params.push(price); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (thumbnail_url !== undefined) { fields.push('thumbnail_url = ?'); params.push(thumbnail_url); }
    if (difficulty !== undefined) {
      const d = String(difficulty).toLowerCase();
      if (!DIFFICULTIES.includes(d)) return res.status(400).json({ error: 'Invalid difficulty' });
      fields.push('difficulty = ?'); params.push(d);
    }
    if (!fields.length) return res.status(400).json({ error: 'No changes provided' });
    params.push(id);
    await query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query('SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?', [id]);
    const course = rows[0];
    course.price = Number(course.price);
    return res.json({ course });
  } catch (err) {
    console.error('Update course error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create lesson for a course (creator or admin)
router.post('/:id/lessons', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const courseId = Number(req.params.id);
    const ownerRows = await query('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
    if (!ownerRows.length) return res.status(404).json({ error: 'Course not found' });
    const ownerId = ownerRows[0].instructor_id;
    const isOwner = ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { title, content = '', video_url = null, order = 1, duration = null } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await query(
      'INSERT INTO lessons (course_id, title, content, video_url, lesson_order, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title, content, video_url, Number(order), duration !== null ? Number(duration) : null]
    );
    const rows = await query('SELECT id, title, content, video_url, lesson_order as `order`, duration, created_at FROM lessons WHERE id = ?', [result.insertId]);
    return res.json({ lesson: rows[0] });
  } catch (err) {
    console.error('Create lesson error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
