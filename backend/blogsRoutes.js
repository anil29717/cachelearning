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

function requireInstructorOrAdmin(req, res, next) {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'instructor') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

router.get('/', async (req, res) => {
  try {
    await initDb();
    const { status, category, author_id } = req.query || {};
    const where = [];
    const params = [];
    if (status) {
      where.push('status = ?');
      params.push(String(status));
    }
    if (category) {
      where.push('category = ?');
      params.push(String(category));
    }
    if (author_id) {
      where.push('author_id = ?');
      params.push(Number(author_id));
    }
    const sql =
      'SELECT b.id, b.title, b.content, b.featured_image_url, b.author_id, u.name as author_name, b.category, b.status, b.like_count, b.created_at, b.updated_at ' +
      'FROM blogs b LEFT JOIN users u ON b.author_id = u.id ' +
      (where.length ? `WHERE ${where.join(' AND ')} ` : '') +
      'ORDER BY b.created_at DESC';
    const rows = await query(sql, params);
    return res.json({ blogs: rows });
  } catch (err) {
    console.error('List blogs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    let userId = null;
    
    // Optional auth check to determine if user liked this blog
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
       try {
         const token = header.slice(7);
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         userId = decoded.id;
       } catch (e) {}
    }

    const sql =
      'SELECT b.id, b.title, b.content, b.featured_image_url, b.author_id, u.name as author_name, b.category, b.status, b.like_count, b.created_at, b.updated_at ' +
      'FROM blogs b LEFT JOIN users u ON b.author_id = u.id ' +
      'WHERE b.id = ?';
    const rows = await query(sql, [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const blog = rows[0];
    let isLiked = false;
    
    if (userId) {
       const likeCheck = await query('SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?', [id, userId]);
       isLiked = likeCheck.length > 0;
    }

    return res.json({ blog: { ...blog, is_liked: isLiked } });
  } catch (err) {
    console.error('Get blog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if blog exists
    const blogCheck = await query('SELECT id FROM blogs WHERE id = ?', [blogId]);
    if (!blogCheck.length) return res.status(404).json({ error: 'Blog not found' });
    
    // Check if already liked
    const existingLike = await query('SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, userId]);
    
    if (existingLike.length > 0) {
       // Already liked -> Unlike
       await query('DELETE FROM blog_likes WHERE id = ?', [existingLike[0].id]);
       await query('UPDATE blogs SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [blogId]);
       
       const updatedBlog = await query('SELECT like_count FROM blogs WHERE id = ?', [blogId]);
       return res.json({ success: true, liked: false, like_count: updatedBlog[0].like_count });
    } else {
       // Not liked -> Like
       await query('INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)', [blogId, userId]);
       await query('UPDATE blogs SET like_count = like_count + 1 WHERE id = ?', [blogId]);
       
       const updatedBlog = await query('SELECT like_count FROM blogs WHERE id = ?', [blogId]);
       return res.json({ success: true, liked: true, like_count: updatedBlog[0].like_count });
    }
  } catch (err) {
     console.error('Like blog error', err);
     return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, requireInstructorOrAdmin, async (req, res) => {
  try {
    await initDb();
    const { title, content, featured_image_url, category, status } = req.body || {};
    const t = String(title || '').trim();
    const c = String(category || '').trim();
    const s = String(status || 'draft').trim();
    if (t.length < 2) return res.status(400).json({ error: 'Title is required' });
    if (c.length < 2) return res.status(400).json({ error: 'Category is required' });
    if (!['draft', 'published'].includes(s)) return res.status(400).json({ error: 'Invalid status' });
    const authorId = req.user.id;
    const insert = await query(
      `INSERT INTO blogs (title, content, featured_image_url, author_id, category, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [t, content || null, featured_image_url || null, authorId, c, s]
    );
    const id = insert.insertId;
    const rows = await query(
      `SELECT b.id, b.title, b.content, b.featured_image_url, b.author_id, u.name as author_name, b.category, b.status, b.created_at, b.updated_at
       FROM blogs b LEFT JOIN users u ON b.author_id = u.id WHERE b.id = ?`,
      [id]
    );
    return res.json({ blog: rows[0] });
  } catch (err) {
    console.error('Create blog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, requireInstructorOrAdmin, async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    const existing = await query('SELECT id, author_id FROM blogs WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const ownerId = existing[0].author_id;
    if (req.user.role !== 'admin' && req.user.id !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, content, featured_image_url, category, status } = req.body || {};
    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push('title = ?'); params.push(title); }
    if (content !== undefined) { sets.push('content = ?'); params.push(content); }
    if (featured_image_url !== undefined) { sets.push('featured_image_url = ?'); params.push(featured_image_url); }
    if (category !== undefined) { sets.push('category = ?'); params.push(category); }
    if (status !== undefined) {
      if (!['draft', 'published'].includes(String(status))) return res.status(400).json({ error: 'Invalid status' });
      sets.push('status = ?'); params.push(status);
    }
    if (!sets.length) return res.status(400).json({ error: 'No changes provided' });
    params.push(id);
    await query(`UPDATE blogs SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await query(
      `SELECT b.id, b.title, b.content, b.featured_image_url, b.author_id, u.name as author_name, b.category, b.status, b.created_at, b.updated_at
       FROM blogs b LEFT JOIN users u ON b.author_id = u.id WHERE b.id = ?`,
      [id]
    );
    return res.json({ blog: rows[0] });
  } catch (err) {
    console.error('Update blog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, requireInstructorOrAdmin, async (req, res) => {
  try {
    await initDb();
    const id = Number(req.params.id);
    const existing = await query('SELECT id, author_id FROM blogs WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const ownerId = existing[0].author_id;
    if (req.user.role !== 'admin' && req.user.id !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await query('DELETE FROM blogs WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete blog error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

