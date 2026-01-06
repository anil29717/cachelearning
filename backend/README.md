# Razorpay Card-Only Express Server

This server provides two endpoints to support INR card-only payments via Razorpay Checkout.

## Endpoints

- `POST /api/razorpay/create-card-order`
  - Body: `{ amount: number, course_ids?: string[] }`
  - Returns: `{ razorpay_order_id, order_id, amount, currency }`
  - Notes: Validates positive amount, enforces currency `INR`, and tags order as `card_only`.

- `POST /api/razorpay/verify-card-payment`
  - Body: `{ order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }`
  - Returns: `{ success: boolean, ... }`
  - Verifies the payment signature with HMAC SHA256 using `RAZORPAY_KEY_SECRET`.

## Setup

1. Copy `.env.example` to `.env` and set real test keys:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
PORT=4000
```

2. Install dependencies:

```
cd server
npm install
```

3. Start server:

```
npm start
```

## Frontend Configuration

In the React app `.env.local`:

```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
VITE_BACKEND_URL=http://localhost:4000
```

The frontend automatically prefers this Express backend for order creation and verification. Checkout options restrict methods to cards only and use `INR`.

## Testing

- Use Razorpay test card: `4111 1111 1111 1111`, CVV `123`, Expiry `12/25`.
- Verify success and failure flows; errors are surfaced via the `PaymentStatus` component.

## Notes

- Keys are required for real order creation; without them, endpoints return a configuration error.
- Do not expose `RAZORPAY_KEY_SECRET` in the frontend.

