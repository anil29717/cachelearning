import express from 'express';

const router = express.Router();

router.get('/check', (req, res) => {
  const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const jwtConfigured = !!(process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim() !== '');
  res.json({ status: 'ok', razorpayConfigured, jwtConfigured });
});

export default router;

