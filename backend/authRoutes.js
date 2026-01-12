import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { initDb, query } from './db.js';
import { sendVerificationEmail } from './email.js';

const router = express.Router();

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim() === '') {
    throw new Error('JWT secret not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

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

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await initDb();
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, password_hash, name, role]
    );

    const userId = result.insertId;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    // Build verify link to backend endpoint
    const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const verifyLink = `${backendBase}/api/auth/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(email, verifyLink);
    } catch (mailErr) {
      console.error('SMTP send error', mailErr);
      // Still consider registration successful, but report mail error
      return res.status(201).json({ message: 'Account created. Verification email failed to send. Contact support.' });
    }

    return res.status(201).json({ message: 'Account created. Check your email to verify before signing in.' });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    await initDb();

    // Bootstrap admin from env if configured
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL) {
      const existingAdmin = await query('SELECT * FROM users WHERE email = ?', [ADMIN_EMAIL]);
      if (!existingAdmin.length) {
        const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await query('INSERT INTO users (email, password_hash, name, role, is_verified) VALUES (?, ?, ?, ?, 1)', [
          ADMIN_EMAIL,
          password_hash,
          'Administrator',
          'admin',
        ]);
      } else {
        // Ensure role and verification are correct
        await query('UPDATE users SET role = "admin", is_verified = 1 WHERE email = ?', [ADMIN_EMAIL]);
      }
    }

    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });
    const userRow = rows[0];
    const match = await bcrypt.compare(password, userRow.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    if (!userRow.is_verified) {
      return res.status(403).json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' });
    }
    const user = { id: userRow.id, email: userRow.email, name: userRow.name, role: userRow.role };
    let token;
    try {
      token = signToken({ id: user.id, email: user.email, role: user.role });
    } catch (e) {
      console.error('JWT sign error', e);
      return res.status(500).json({ error: 'Server configuration error' });
    }
    return res.json({ user, token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT id, email, name, role, avatar_url, created_at, is_verified FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Profile error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing token' });
  }
  try {
    await initDb();
    const rows = await query('SELECT * FROM email_verification_tokens WHERE token = ?', [token]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid token' });
    const rec = rows[0];
    if (rec.used) return res.status(400).json({ error: 'Token already used' });
    if (new Date(rec.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    await query('UPDATE users SET is_verified = 1 WHERE id = ?', [rec.user_id]);
    await query('UPDATE email_verification_tokens SET used = 1 WHERE id = ?', [rec.id]);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (req.query.redirect) {
      return res.redirect(`${frontend}/login?verified=1`);
    }
    return res.json({ message: 'Email verified successfully. You can now sign in.', redirect: `${frontend}/login?verified=1` });
  } catch (err) {
    console.error('Verify email error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await initDb();
    const users = await query('SELECT id, is_verified FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];
    if (user.is_verified) {
      return res.status(200).json({ message: 'Email already verified' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );
    const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const verifyLink = `${backendBase}/api/auth/verify-email?token=${token}`;
    try {
      await sendVerificationEmail(email, verifyLink);
    } catch (mailErr) {
      console.error('SMTP send error (resend):', mailErr);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
