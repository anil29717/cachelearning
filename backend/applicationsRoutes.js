import express from 'express';
import { initDb, query } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getTransport, sendVerificationEmail } from './email.js';

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

// POST /api/applications/instructor
router.post('/instructor', async (req, res) => {
  const { name, email, expertise, experience_years, portfolio_url, bio } = req.body || {};
  if (!name || !email || !expertise || experience_years === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await initDb();
    const result = await query(
      `INSERT INTO instructor_applications (name, email, expertise, experience_years, portfolio_url, bio)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [name, email, expertise, Number(experience_years), portfolio_url || null, bio || null]
    );
    const applicationId = result.insertId;

    // Attempt to send acknowledgement email (non-blocking for the API)
    try {
      const transporter = getTransport();
      const fromName = process.env.SMTP_FROM_NAME || 'Cache Learning';
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Instructor Application Received',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
            <h2>Thanks, ${name}!</h2>
            <p>We received your instructor application with expertise in <strong>${expertise}</strong>.</p>
            <p>Status: <strong>pending review</strong></p>
            <p>Our team will verify your details and update the status. You will receive an email once it is <strong>approved</strong> or <strong>rejected</strong>.</p>
            <p>— ${fromName}</p>
          </div>
        `,
      });
    } catch (mailErr) {
      // Log and continue; do not fail the API if SMTP is not configured
      console.warn('SMTP send error (instructor application acknowledgement):', mailErr?.message || mailErr);
    }

    res.json({ applicationId });
  } catch (err) {
    console.error('Error creating instructor application', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// POST /api/applications/hiring
router.post('/hiring', async (req, res) => {
  const { name, email, role_applied, resume_url, cover_letter } = req.body || {};
  if (!name || !email || !role_applied || !resume_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await query(
      `INSERT INTO job_applications (name, email, role_applied, resume_url, cover_letter)
       VALUES (?, ?, ?, ?, ?);`,
      [name, email, role_applied, resume_url, cover_letter || null]
    );
    const applicationId = result.insertId;
    res.json({ applicationId });
  } catch (err) {
    console.error('Error creating job application', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Admin: list job applications
router.get('/hiring', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    await initDb();
    const rows = await query(
      `SELECT id, name, email, role_applied, resume_url, cover_letter, status, created_at
       FROM job_applications
       ORDER BY created_at DESC`
    );
    return res.json({ applications: rows });
  } catch (err) {
    console.error('Error listing job applications', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update job application status and notify applicant
router.put('/hiring/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await initDb();
    const existing = await query('SELECT id, name, email, role_applied FROM job_applications WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    await query('UPDATE job_applications SET status = ? WHERE id = ?', [status, id]);

    try {
      const transporter = getTransport();
      const { name, email, role_applied } = existing[0];
      const subject = status === 'approved'
        ? 'Your Job Application Has Been Approved'
        : status === 'rejected'
        ? 'Your Job Application Was Not Selected'
        : 'Your Job Application Status Updated';
      const message = status === 'approved'
        ? `Good news! Your application for ${role_applied} has been approved.`
        : status === 'rejected'
        ? `Thank you for applying for ${role_applied}. We appreciate your interest, but we will not be moving forward at this time.`
        : `Your application for ${role_applied} is now marked as ${status}.`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif"><h2>Hello ${name},</h2><p>${message}</p><p>— Cache Learning Team</p></div>`,
      });
    } catch (mailErr) {
      console.warn('SMTP send error (job application status):', mailErr?.message || mailErr);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating job application status', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: list instructor applications
router.get('/instructor', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    await initDb();
    const rows = await query(
      `SELECT id, name, email, expertise, experience_years, portfolio_url, bio, status, created_at
       FROM instructor_applications
       ORDER BY created_at DESC`
    );
    return res.json({ applications: rows });
  } catch (err) {
    console.error('Error listing instructor applications', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update application status
router.put('/instructor/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const allowed = ['pending', 'approved', 'rejected', 'verified'];
  if (!allowed.includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await initDb();
    const existing = await query('SELECT id, name, email FROM instructor_applications WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    await query('UPDATE instructor_applications SET status = ? WHERE id = ?', [status, id]);

    // Notify applicant about status change (best-effort)
    try {
      const transporter = getTransport();
      const { name, email } = existing[0];
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your Instructor Application Status Updated',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
            <h2>Hello ${name},</h2>
            <p>Your instructor application status has been updated to: <strong>${status}</strong>.</p>
            <p>If approved, our team will reach out with next steps. If rejected, you may re-apply with improved details.</p>
            <p>— Cache Learning Team</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('SMTP send error (status update):', mailErr?.message || mailErr);
    }

    // If approved, provision instructor account and send credentials when needed
    if (status === 'approved') {
      const { name, email } = existing[0];
      const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) {
        const tempPassword = Math.random().toString(36).slice(-10);
        const password_hash = await bcrypt.hash(tempPassword, 10);
        const insert = await query(
          'INSERT INTO users (email, password_hash, name, role, is_verified) VALUES (?, ?, ?, ?, 1)',
          [email, password_hash, name, 'instructor']
        );
        const loginUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/login';
        try {
          const transporter = getTransport();
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Your Instructor Account Is Approved',
            html: `
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
                <h2>Welcome, ${name}!</h2>
                <p>Your instructor application has been <strong>approved</strong>.</p>
                <p>Use the credentials below to sign in:</p>
                <p><strong>Email:</strong> ${email}<br/><strong>Password:</strong> ${tempPassword}</p>
                <p><a href="${loginUrl}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">Sign In</a></p>
                <p>For security, please change your password after signing in.</p>
              </div>
            `,
          });
        } catch (mailErr) {
          console.warn('SMTP send error (instructor credentials):', mailErr?.message || mailErr);
        }
      } else {
        // Promote existing account to instructor and verify it
        const userId = rows[0].id;
        await query('UPDATE users SET role = "instructor", is_verified = 1 WHERE id = ?', [userId]);
        try {
          const transporter = getTransport();
          const loginUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/login';
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Instructor Application Approved',
            html: `
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
                <h2>Good news!</h2>
                <p>Your instructor application has been <strong>approved</strong>.</p>
                <p>You can sign in using your existing account credentials.</p>
                <p><a href="${loginUrl}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">Sign In</a></p>
              </div>
            `,
          });
        } catch (mailErr) {
          console.warn('SMTP send error (instructor approved existing):', mailErr?.message || mailErr);
        }
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating application status', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin: send verification email to applicant's user account (if exists)
router.post('/instructor/:id/verify-email', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await initDb();
    const apps = await query('SELECT id, name, email FROM instructor_applications WHERE id = ?', [id]);
    if (!apps.length) return res.status(404).json({ error: 'Application not found' });
    const app = apps[0];

    const users = await query('SELECT id, is_verified FROM users WHERE email = ?', [app.email]);
    if (!users.length) {
      // Fallback: send an invitation email asking the applicant to register
      try {
        const transporter = getTransport();
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: app.email,
          subject: 'Action required: Create your account to verify email',
          html: `
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
              <h2>Hello ${app.name},</h2>
              <p>We’re ready to verify your email for your instructor application.</p>
              <p>First, please create your account using this email. Then you can verify your email from your inbox.</p>
              <p><a href="${frontendBase}/register" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Create Account</a></p>
              <p>If the button doesn’t work, copy and paste this link:</p>
              <p><a href="${frontendBase}/register">${frontendBase}/register</a></p>
              <p>— Cache Learning Team</p>
            </div>
          `,
        });
        return res.json({ success: true, invited: true });
      } catch (mailErr) {
        console.error('SMTP send error (invite to register):', mailErr?.message || mailErr);
        return res.status(500).json({ error: 'Failed to send invitation email' });
      }
    }
    const user = users[0];
    if (user.is_verified) {
      return res.status(200).json({ message: 'User already verified' });
    }

    // Generate new verification token (invalidate not required; tokens are unique and expire)
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const verifyLink = `${backendBase}/api/auth/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(app.email, verifyLink);
    } catch (mailErr) {
      console.error('SMTP send error (admin-triggered verification):', mailErr?.message || mailErr);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error sending verification email', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
