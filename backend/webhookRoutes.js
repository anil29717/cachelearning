import express from 'express';
import crypto from 'crypto';
import { initDb, query } from './db.js';
import { emit } from './realtime.js';

const router = express.Router();

router.post('/razorpay-webhook', express.json({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) return res.status(200).json({ status: 'ignored' });
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (signature !== expected) return res.status(400).json({ status: 'invalid' });
  const event = req.body?.event;
  try {
    await initDb();
    if (event === 'payment.captured') {
      const entity = req.body?.payload?.payment?.entity || {};
      const orderId = entity.order_id || null;
      const paymentId = entity.id || null;
      const amount = Number(entity.amount || 0);
      const currency = String(entity.currency || 'INR');
      if (paymentId) {
        // Upsert captured payment
        try {
          await query(
            'INSERT INTO payments (user_id, order_id, razorpay_payment_id, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount), currency = VALUES(currency), status = VALUES(status)',
            [null, orderId || null, paymentId, amount, currency, 'captured']
          );
        } catch (_) {}
        emit('payment_captured', {
          paymentId,
          orderId,
          amount,
          currency,
          at: new Date().toISOString(),
        });
      }
    }
    if (event === 'payment.refunded') {
      const entity = req.body?.payload?.payment?.entity || {};
      const paymentId = entity.id || null;
      const refund = req.body?.payload?.refund?.entity || {};
      const refundId = refund.id || null;
      if (paymentId) {
        try {
          await query('UPDATE payments SET status = ?, refund_id = ? WHERE razorpay_payment_id = ?', ['refunded', refundId, paymentId]);
        } catch (_) {}
      }
    }
  } catch (e) {
    console.error('Webhook error', e);
  }
  res.json({ status: 'ok' });
});

export default router;
