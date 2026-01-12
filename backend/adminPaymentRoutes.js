import express from 'express';
import jwt from 'jsonwebtoken';
import { initDb, query } from './db.js';
import Razorpay from 'razorpay';

const router = express.Router();

function verifyToken(req, res, next) {
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

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

// GET /api/admin/payments - List all payments
router.get('/payments', verifyToken, isAdmin, async (_req, res) => {
  try {
    await initDb();
    await query(`
      INSERT INTO payments (user_id, order_id, razorpay_payment_id, amount, currency, status)
      SELECT 
        e.user_id,
        e.order_id,
        'unknown' AS razorpay_payment_id,
        COALESCE(SUM(c.price * 100), 0) AS amount,
        'INR' AS currency,
        'captured' AS status
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id
      WHERE e.order_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM payments p WHERE p.order_id = e.order_id
        )
      GROUP BY e.user_id, e.order_id
    `);
    await query(`
      INSERT INTO payments (user_id, order_id, razorpay_payment_id, amount, currency, status)
      SELECT 
        e.user_id,
        COALESCE(e.order_id, CONCAT('enr_', e.id)) AS synth_order_id,
        'unknown' AS razorpay_payment_id,
        COALESCE(SUM(c.price * 100), 0) AS amount,
        'INR' AS currency,
        'captured' AS status
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id
      WHERE NOT EXISTS (
        SELECT 1 FROM payments p WHERE p.order_id = COALESCE(e.order_id, CONCAT('enr_', e.id))
      )
      GROUP BY e.user_id, COALESCE(e.order_id, CONCAT('enr_', e.id))
    `);
    const sql = `
      SELECT
        p.id,
        p.order_id,
        p.razorpay_payment_id,
        p.amount,
        p.currency,
        p.status,
        p.created_at,
        u.email AS user_email,
        u.name AS user_name,
        (
          SELECT GROUP_CONCAT(c.id)
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.order_id = p.order_id
        ) AS course_ids,
        (
          SELECT GROUP_CONCAT(c.title)
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.order_id = p.order_id
        ) AS course_titles
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    const payments = await query(sql);
    return res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/payments/:orderId - Get payment details
router.get('/payments/:orderId', verifyToken, isAdmin, async (req, res) => {
  try {
    await initDb();
    const { orderId } = req.params;
    const payments = await query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
    if (!payments.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const enrollments = await query(
      `SELECT e.*, c.title AS course_title 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.order_id = ?`,
      [orderId]
    );
    return res.json({ payment: payments[0], enrollments });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/payments/refund - Initiate refund (stub)
router.post('/payments/refund', verifyToken, isAdmin, async (req, res) => {
  try {
    await initDb();
    const { paymentId, payment_id, razorpay_payment_id, amount, reason } = req.body || {};
    const resolvedPaymentId = String(paymentId || payment_id || razorpay_payment_id || '').trim();
    if (!resolvedPaymentId) return res.status(400).json({ error: 'paymentId is required' });
    if (resolvedPaymentId === 'unknown') {
      return res.status(400).json({ error: 'Payment not refundable: missing Razorpay payment id' });
    }

    const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!key_id || !key_secret) return res.status(500).json({ error: 'Razorpay not configured' });

    const razorpay = new Razorpay({ key_id, key_secret });
    // Validate payment and compute refundable amount
    const payment = await razorpay.payments.fetch(resolvedPaymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found on gateway' });
    if (String(payment.status).toLowerCase() !== 'captured') {
      return res.status(400).json({ error: `Payment status not refundable: ${payment.status}` });
    }
    const capturedAmt = Number(payment.amount || 0);
    const refundedAmt = Number(payment.amount_refunded || 0);
    const remaining = Math.max(capturedAmt - refundedAmt, 0);
    if (remaining <= 0) {
      return res.status(400).json({ error: 'Payment already fully refunded' });
    }
    let refundAmount = amount ? Math.min(Math.floor(Number(amount)), remaining) : remaining;
    // Razorpay requires integer paise and minimum ₹1 (100 paise)
    refundAmount = Math.max(Math.floor(refundAmount), 100);
    // Use payments.refund (available in current SDK)
    const refundRes = await razorpay.payments.refund(resolvedPaymentId, { amount: refundAmount });

    await query('UPDATE payments SET status = ?, refund_id = ? WHERE razorpay_payment_id = ?', ['refunded', refundRes?.id || null, resolvedPaymentId]);
    return res.json({ success: true, message: 'Refund initiated', refundId: refundRes?.id || null, amount: refundAmount, reason: reason || null });
  } catch (error) {
    const msg = error?.error?.description || error?.message || 'Refund failed';
    const status = error?.statusCode || 500;
    console.error('Error processing refund:', { status, message: msg, error });
    return res.status(status).json({
      error: msg,
      details: (error && typeof error === 'object') ? {
        code: error?.error?.code || null,
        description: error?.error?.description || null,
        field: error?.error?.field || null
      } : undefined
    });
  }
});

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', verifyToken, isAdmin, async (_req, res) => {
  try {
    await initDb();
    const usersRows = await query('SELECT COUNT(*) AS totalUsers FROM users');
    const coursesRows = await query('SELECT COUNT(*) AS totalCourses FROM courses');
    const enrollmentsRows = await query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
    const revenueRows = await query('SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM payments WHERE status = "captured"');
    const todayRows = await query(
      'SELECT COALESCE(SUM(amount), 0) AS todayRevenue FROM payments WHERE status = "captured" AND DATE(created_at) = CURDATE()'
    );
    return res.json({
      totalUsers: Number(usersRows[0]?.totalUsers || 0),
      totalCourses: Number(coursesRows[0]?.totalCourses || 0),
      totalEnrollments: Number(enrollmentsRows[0]?.totalEnrollments || 0),
      totalRevenue: Number(revenueRows[0]?.totalRevenue || 0),
      todayRevenue: Number(todayRows[0]?.todayRevenue || 0),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
