# Razorpay Integration - Quick Reference

## 🚀 Quick Start

### 1. Get Your API Keys
```
1. Visit: https://dashboard.razorpay.com/app/keys
2. Switch to "Test Mode"
3. Copy Key ID (rzp_test_...)
4. Copy Key Secret
```

### 2. Update Environment Variables
In Supabase dashboard → Project Settings → Edge Functions:
```bash
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_here
```

### 3. Update Frontend Config
Edit `/config/razorpay.ts`:
```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXX';
```

### 4. Test Payment
```
1. Add course to cart
2. Checkout
3. Select UPI
4. Use: success@razorpay
5. ✓ Done!
```

## 📁 File Structure

```
Backend:
├── /supabase/functions/server/
│   ├── razorpay-service.tsx     # Razorpay service class
│   └── index.tsx                # API endpoints

Frontend:
├── /components/
│   ├── PaymentMethodSelector.tsx    # Payment method UI
│   └── AdminPaymentManager.tsx      # Admin panel
├── /pages/
│   └── CartPage.tsx                 # Checkout page
├── /utils/
│   ├── api.ts                       # API client
│   └── razorpay-error-handler.ts   # Error handling
└── /config/
    └── razorpay.ts                  # Frontend config
```

## 🔌 API Endpoints

Base URL: `https://YOUR_PROJECT.supabase.co/functions/v1/make-server-ff6dfb68`

### Payment Endpoints
```typescript
POST /payments/create-order
Body: { amount: number, course_ids: string[] }
Returns: { razorpay_order_id, order_id, amount, currency }

POST /payments/verify
Body: { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
Returns: { success: boolean, order: Order }

GET /payments/status/:orderId
Returns: { order_id, status, amount, currency, payment_method }

POST /payments/refund (Admin only)
Body: { order_id, amount?, reason? }
Returns: { success: boolean, refund, order }

POST /payments/webhook
Headers: X-Razorpay-Signature
Body: Razorpay webhook payload
Returns: { success: boolean }
```

### Admin Endpoints
```typescript
GET /admin/payments
Returns: { orders: Order[] }

GET /admin/stats
Returns: { stats: { total_revenue, total_orders, ... } }
```

## 💳 Test Credentials

### UPI
```
Success: success@razorpay
Failure: failure@razorpay
```

### Cards
```
Success Card:
  Number: 4111 1111 1111 1111
  CVV: 123
  Expiry: 12/25

Failure Card:
  Number: 4111 1111 1111 1234
  CVV: 123
  Expiry: 12/25
```

### Net Banking
```
Select any bank → Success/Failure option appears
```

### Wallets
```
Select any wallet → Auto success in test mode
```

## 🎨 Using Components

### Payment Method Selector
```tsx
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';

<PaymentMethodSelector 
  selectedMethod={selectedMethod}
  onMethodSelect={(method) => setSelectedMethod(method)}
/>
```

### Admin Payment Manager
```tsx
import { AdminPaymentManager } from '../components/AdminPaymentManager';

// In admin dashboard:
<AdminPaymentManager />
```

## 🔧 Common Tasks

### Check Payment Status (Frontend)
```typescript
const status = await apiClient.getPaymentStatus(orderId);
console.log(status);
```

### Process Refund (Frontend - Admin)
```typescript
await apiClient.processRefund(orderId, amount, reason);
```

### Create Order (Backend)
```typescript
const service = getRazorpayService();
const order = await service.createOrder({
  amount: 999,
  currency: 'INR',
  receipt: 'receipt_123',
  notes: { user_id: 'xxx' }
});
```

### Verify Payment (Backend)
```typescript
const service = getRazorpayService();
const isValid = service.verifyPaymentSignature({
  razorpay_order_id: 'order_xxx',
  razorpay_payment_id: 'pay_xxx',
  razorpay_signature: 'signature_xxx'
});
```

## 🐛 Debugging

### Check Order in Database
```javascript
// Browser console:
const orderId = 'your-order-id';
fetch(`https://YOUR_PROJECT.supabase.co/functions/v1/make-server-ff6dfb68/payments/status/${orderId}`, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(console.log);
```

### View Backend Logs
```
Supabase Dashboard → Edge Functions → Logs
Filter by "payment" or "razorpay"
```

### Common Issues

**"Invalid Razorpay API credentials"**
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
- Ensure keys start with `rzp_test_` or `rzp_live_`
- Verify keys match in frontend config and backend env

**Payment modal doesn't open**
- Check browser console for errors
- Verify Razorpay script loaded
- Check RAZORPAY_KEY_ID in frontend config

**Payment succeeds but enrollment not created**
- Check backend logs for verification errors
- Verify signature verification passed
- Check enrollment creation code

**Webhook not working**
- Verify webhook URL is correct
- Check webhook secret matches
- Look for signature verification errors
- Check Razorpay dashboard webhook logs

## 📊 Order Status Flow

```
created → User initiated payment
   ↓
attempted → User opened payment modal
   ↓
paid → Payment successful ✓
   ↓
refunded → Payment refunded

OR

created → User initiated payment
   ↓
attempted → User opened payment modal
   ↓
failed → Payment failed ✗
```

## 🔐 Security Checklist

- [x] API keys in environment variables
- [x] No secrets in frontend code
- [x] Payment signature verification
- [x] Webhook signature verification
- [x] User authorization checks
- [x] Admin-only refund endpoint
- [x] HTTPS for all API calls
- [x] No card data storage

## 📞 Support

**Razorpay:**
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

**Your Integration:**
- Full docs: `RAZORPAY_INTEGRATION_COMPLETE.md`
- Testing guide: `RAZORPAY_TESTING_GUIDE.md`
- Error fixes: `PAYMENT_ERROR_FIX.md`

## 🎯 Next Steps

1. ✅ Set up API keys
2. ✅ Test payment flow
3. ✅ Configure webhooks
4. ✅ Test refund process
5. ✅ Switch to live mode
6. ✅ Monitor transactions
7. ✅ Launch! 🚀
