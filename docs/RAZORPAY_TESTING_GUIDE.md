# Razorpay Payment Testing Guide

This guide will help you test all payment scenarios in your LMS platform.

## Table of Contents
1. [Test Mode Setup](#test-mode-setup)
2. [Test Payment Methods](#test-payment-methods)
3. [Testing Scenarios](#testing-scenarios)
4. [Webhook Testing](#webhook-testing)
5. [Error Testing](#error-testing)

## Test Mode Setup

### 1. Switch to Test Mode
1. Go to https://dashboard.razorpay.com
2. Click on "Test Mode" toggle in the top-right
3. Generate test API keys from https://dashboard.razorpay.com/app/keys

### 2. Update API Keys
Replace the placeholder keys with your test keys:
- `RAZORPAY_KEY_ID` (starts with `rzp_test_`)
- `RAZORPAY_KEY_SECRET`

## Test Payment Methods

### UPI Payment
**Test UPI IDs:**
```
success@razorpay  → Successful payment
failure@razorpay  → Failed payment
```

**Testing Steps:**
1. Select UPI payment method
2. Click "Pay" button
3. Enter test UPI ID: `success@razorpay`
4. Payment will be auto-approved

### Card Payment
**Test Cards:**

✅ **Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

❌ **Failed Payment:**
```
Card Number: 4111 1111 1111 1234
CVV: Any 3 digits
Expiry: Any future date
```

**Other Test Cards:**
```
Visa: 4012 8888 8888 1881
Mastercard: 5555 5555 5555 4444
RuPay: 6076 0000 0000 0004
Amex: 3782 822463 10005
```

**3D Secure Testing:**
- In test mode, 3D Secure authentication is simulated
- No actual OTP required

### Net Banking
**Test Banks:**
- All banks are available in test mode
- Any selection will show success/failure option
- No actual bank login required

**Testing Steps:**
1. Select Net Banking
2. Choose any bank (e.g., HDFC, SBI)
3. Click "Pay"
4. Select "Success" or "Failure" in the test screen

### Wallets
**Supported Wallets in Test:**
- Paytm
- MobiKwik
- Freecharge
- AmazonPay

**Testing Steps:**
1. Select Wallet payment
2. Choose a wallet
3. Click "Pay"
4. Simulated success screen appears

## Testing Scenarios

### 1. Successful Payment Flow
```
1. Add courses to cart
2. Proceed to checkout
3. Select payment method (UPI recommended)
4. Use test credentials: success@razorpay
5. Verify payment success toast
6. Check enrollment in profile page
7. Verify order status in database
```

### 2. Failed Payment
```
1. Add courses to cart
2. Proceed to checkout
3. Use failure credentials: failure@razorpay
4. Verify error message displayed
5. Order status should be "failed"
```

### 3. Abandoned Payment
```
1. Initiate payment
2. Close the Razorpay modal without completing
3. Verify order status remains "created"
4. User should be able to retry
```

### 4. Multiple Payment Methods
```
Test each method:
- ✅ UPI (success@razorpay)
- ✅ Card (4111 1111 1111 1111)
- ✅ Net Banking (Any bank → Success)
- ✅ Wallet (Any wallet → Success)
```

### 5. Payment Retry
```
1. First attempt: Use failure credentials
2. Second attempt: Use success credentials
3. Verify only one enrollment is created
```

## Webhook Testing

### Setup Webhook URL
1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Add webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/make-server-ff6dfb68/payments/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
4. Save webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### Test Webhook Events

**1. Payment Captured:**
```
1. Make a successful test payment
2. Check webhook logs in Razorpay dashboard
3. Verify order status updated to "paid"
```

**2. Payment Failed:**
```
1. Make a failed test payment
2. Check webhook received
3. Verify order status updated to "failed"
```

**3. Refund Processed:**
```
1. Complete a successful payment
2. Process refund via admin panel
3. Verify refund webhook received
4. Check order status updated to "refunded"
```

## Error Testing

### 1. Network Error Simulation
```javascript
// In browser console during payment:
// Disconnect internet before clicking pay
// Expected: Error message about network issue
```

### 2. Invalid API Key
```
1. Use wrong RAZORPAY_KEY_ID
2. Try to make payment
3. Expected: Configuration error message
```

### 3. Signature Verification Failure
```
This is automatically handled by the backend.
If signature doesn't match, payment is rejected.
```

### 4. Insufficient Balance (Wallet)
```
1. Select wallet payment
2. Choose "insufficient balance" option if available
3. Expected: Wallet balance error
```

### 5. OTP Timeout
```
1. Use card payment
2. Don't enter OTP for 5 minutes
3. Expected: Session timeout error
```

## Test Checklist

### Payment Flow
- [ ] UPI payment successful
- [ ] Card payment successful
- [ ] Net Banking successful
- [ ] Wallet payment successful
- [ ] Payment failure handled correctly
- [ ] Payment cancellation works
- [ ] Multiple items in cart
- [ ] Single item payment
- [ ] Payment retry works

### Data Integrity
- [ ] Order created with correct amount
- [ ] Payment details saved (method, email, etc.)
- [ ] Enrollment created after payment
- [ ] User can access purchased course
- [ ] Invoice/receipt generated
- [ ] No duplicate enrollments

### Error Handling
- [ ] Invalid credentials error
- [ ] Network error message
- [ ] Timeout error
- [ ] Payment declined message
- [ ] Session expired handling
- [ ] Webhook signature validation

### Admin Features
- [ ] View all orders
- [ ] View payment details
- [ ] Process refund
- [ ] Refund webhook received
- [ ] Order status updates

### Security
- [ ] Payment signature verified
- [ ] Webhook signature verified
- [ ] User can only view own orders
- [ ] Sensitive data not exposed
- [ ] API keys not in frontend

## Common Test Scenarios

### Scenario 1: First Time User Purchase
```
1. Register new account
2. Browse courses
3. Add course to cart
4. Complete payment with UPI (success@razorpay)
5. Access course from profile
✓ Expected: Smooth enrollment
```

### Scenario 2: Bulk Purchase
```
1. Add 5 courses to cart
2. Proceed to checkout
3. Complete payment
4. Check all 5 enrollments created
✓ Expected: All courses accessible
```

### Scenario 3: Failed Payment Recovery
```
1. Try payment with failure@razorpay
2. Payment fails
3. Retry with success@razorpay
4. Payment succeeds
5. Enrollment created
✓ Expected: Order updated, no duplicates
```

### Scenario 4: Admin Refund
```
1. User makes successful payment
2. Admin logs in
3. Admin processes refund
4. User loses course access
5. Order marked as refunded
✓ Expected: Refund processed correctly
```

## Debugging Tips

### Check Order Status
```javascript
// In browser console:
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-ff6dfb68/payments/status/ORDER_ID', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(r => r.json())
.then(console.log);
```

### View Console Logs
- Open browser DevTools → Console
- Look for payment-related logs
- Check for error messages

### Check Network Tab
- DevTools → Network
- Filter for "payment" requests
- Check request/response data

### Backend Logs
- Check Supabase function logs
- Look for Razorpay API errors
- Verify webhook events received

## Production Testing Checklist

Before going live:
- [ ] Switch to Live Mode keys (rzp_live_)
- [ ] Update RAZORPAY_KEY_ID with live key
- [ ] Update RAZORPAY_KEY_SECRET with live key
- [ ] Test with real (small amount) payment
- [ ] Verify webhook URL in production
- [ ] Set up proper SSL certificate
- [ ] Enable 2FA for Razorpay account
- [ ] Set up email notifications
- [ ] Configure payment timeout settings
- [ ] Test refund in live mode
- [ ] Monitor first few transactions

## Support

If you encounter issues:
1. Check error messages in console
2. Review backend logs
3. Verify API keys are correct
4. Check Razorpay dashboard for payment status
5. Contact Razorpay support: https://razorpay.com/support/

## Additional Resources

- Razorpay Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Razorpay Webhooks: https://razorpay.com/docs/webhooks/
- Razorpay API Docs: https://razorpay.com/docs/api/
