import express from 'express';
import { getTransport } from './email.js';
import { initDb, query } from './db.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    const n = String(name || '').trim();
    const em = String(email || '').trim();
    const sub = String(subject || '').trim() || 'Contact';
    const msg = String(message || '').trim();
    if (n.length < 2) return res.status(400).json({ error: 'Name is required' });
    if (!em || !em.includes('@')) return res.status(400).json({ error: 'Valid email is required' });
    if (msg.length < 3) return res.status(400).json({ error: 'Message must be at least 3 characters' });

    await initDb();
    const insertSql = `INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)`;
    const status = 'new';
    const result = await query(insertSql, [n, em, sub, msg, status]);
    const insertedId = result?.insertId;

    const to = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || '').trim();
    if (!to) return res.status(500).json({ error: 'Contact not configured' });

    const transporter = getTransport();
    await transporter.sendMail({
      from: (process.env.SMTP_FROM || process.env.SMTP_USER || em),
      to,
      replyTo: em,
      subject: `[Contact] ${sub}`,
      text: `From: ${n} <${em}>\n\n${msg}`,
      html: `<p><strong>From:</strong> ${n} &lt;${em}&gt;</p><p>${msg.replace(/\n/g, '<br/>')}</p>`,
    });
    return res.json({ success: true, id: insertedId });
  } catch (e) {
    const m = e?.message || 'Failed to send';
    return res.status(500).json({ error: m });
  }
});

export default router;
