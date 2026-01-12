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

// Update current user's profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    await initDb();
    const { name, avatar_url } = req.body || {};
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); params.push(avatar_url); }
    if (!fields.length) return res.status(400).json({ error: 'No changes provided' });
    params.push(req.user.id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query('SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    return res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Update profile error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
