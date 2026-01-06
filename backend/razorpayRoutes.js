import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { initDb, query } from './db.js';
import { emit } from './realtime.js';

// Ensure env vars are loaded regardless of import order
dotenv.config();

const router = express.Router();

const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set or empty after trimming. Set them in .env');
}

// Initialize Razorpay client lazily inside handlers to avoid crashing on startup

// Create order for card payment (INR only)
router.post('/create-card-order', authMiddleware, async (req, res) => {
  try {
    // Restrict order creation to students
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can purchase courses' });
    }
    const { amount, course_ids } = req.body || {};
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const amt = Math.round(Number(amount));
    if (amt <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

    // Normalize course IDs
    const courseIdsArr = Array.isArray(course_ids)
      ? course_ids.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
      : [];

    const options = {
      amount: amt * 100,
      currency: 'INR',
      payment_capture: 1,
      notes: {
        type: 'card_only',
        course_ids: courseIdsArr.join(',')
      }
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      razorpay_order_id: order.id,
      order_id: order.receipt || order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    const msg = err?.error?.description || err?.message || 'Create order failed';
    const status = err?.statusCode || 500;
    console.error('Create card-only order error:', { status, message: msg });
    return res.status(status).json({ error: msg });
  }
});

// Verify card payment signature
router.post('/verify-card-payment', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can purchase courses' });
    }
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const success = expectedSignature === razorpay_signature;
    if (!success) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Optionally fetch payment and order details
    let payment = null;
    let order = null;
    try {
      const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (e) {
      // Ignore fetch errors; signature verification suffices
    }

    // Create enrollments for notes.course_ids
    try {
      await initDb();
      const notes = order?.notes || {};
      const noteIds = typeof notes.course_ids === 'string' ? notes.course_ids.split(',').map((s) => s.trim()).filter(Boolean) : [];
      for (const cidStr of noteIds) {
        const courseId = Number(cidStr);
        if (!courseId) continue;
        try {
          await query('INSERT INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)', [req.user.id, courseId, order_id || null]);
        } catch (_) {}
        emit('enrollment_created', {
          user_id: req.user.id,
          course_id: courseId,
          order_id: order_id || null,
          at: new Date().toISOString(),
        });
      }
      // Record payment
      const amt = Number(payment?.amount || order?.amount || 0);
      const curr = String(payment?.currency || order?.currency || 'INR');
      await query(
        'INSERT INTO payments (user_id, order_id, razorpay_payment_id, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, order_id || razorpay_order_id, razorpay_payment_id, amt, curr, 'captured']
      );
      emit('payment_captured', {
        paymentId: razorpay_payment_id,
        orderId: order_id || razorpay_order_id,
        amount: amt,
        currency: curr,
        at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('Enrollment create error (card verify):', dbErr?.message || dbErr);
    }

    return res.json({ success: true, order_id, razorpay_order_id, razorpay_payment_id, payment });
  } catch (err) {
    console.error('Verify payment error', err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Create order for any payment method (INR, generic)
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can purchase courses' });
    }
    const { amount, course_ids } = req.body || {};
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const amt = Math.round(Number(amount));
    if (amt <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

    const courseIdsArr = Array.isArray(course_ids)
      ? course_ids.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
      : [];

    const options = {
      amount: amt * 100,
      currency: 'INR',
      payment_capture: 1,
      notes: {
        type: 'generic',
        course_ids: courseIdsArr.join(',')
      }
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      razorpay_order_id: order.id,
      order_id: order.receipt || order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    const msg = err?.error?.description || err?.message || 'Create order failed';
    const status = err?.statusCode || 500;
    console.error('Create generic order error:', { status, message: msg });
    return res.status(status).json({ error: msg });
  }
});

// Verify payment signature for any method
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can purchase courses' });
    }
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const success = expectedSignature === razorpay_signature;
    if (!success) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    let payment = null;
    let order = null;
    try {
      const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (e) {}
    // Create enrollments for notes.course_ids
    try {
      await initDb();
      const notes = order?.notes || {};
      const noteIds = typeof notes.course_ids === 'string' ? notes.course_ids.split(',').map((s) => s.trim()).filter(Boolean) : [];
      for (const cidStr of noteIds) {
        const courseId = Number(cidStr);
        if (!courseId) continue;
        try {
          await query('INSERT INTO enrollments (user_id, course_id, order_id) VALUES (?, ?, ?)', [req.user.id, courseId, order_id || null]);
        } catch (_) {}
        emit('enrollment_created', {
          user_id: req.user.id,
          course_id: courseId,
          order_id: order_id || null,
          at: new Date().toISOString(),
        });
      }
      // Record payment
      const amt = Number(payment?.amount || order?.amount || 0);
      const curr = String(payment?.currency || order?.currency || 'INR');
      await query(
        'INSERT INTO payments (user_id, order_id, razorpay_payment_id, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, order_id || razorpay_order_id, razorpay_payment_id, amt, curr, 'captured']
      );
      emit('payment_captured', {
        paymentId: razorpay_payment_id,
        orderId: order_id || razorpay_order_id,
        amount: amt,
        currency: curr,
        at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn('Enrollment create error (generic verify):', dbErr?.message || dbErr);
    }

    return res.json({ success: true, order_id, razorpay_order_id, razorpay_payment_id, payment });
  } catch (err) {
    console.error('Verify payment error', err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
// Simple JWT auth middleware for role-gated payment actions
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
