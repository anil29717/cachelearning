# ✅ Razorpay Webhook Already Configured

## Webhook URL
Your webhook endpoint is **ready to use** at:
```
https://count-door-40486460.figma.site/webhook
```

## Setup in Razorpay Dashboard

### Step 1: Access Webhook Settings
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **Webhooks**
3. Click **+ Add Webhook URL**

### Step 2: Configure Webhook
Enter the following details:

**Webhook URL:**
```
https://count-door-40486460.figma.site/webhook
```

**Active Events** (Select these):
- ✅ `payment.captured` - Triggered when payment is successfully captured
- ✅ `payment.failed` - Triggered when payment fails
- ✅ `refund.processed` - Triggered when refund is processed

**Alert Email:** (Your email for webhook failure notifications)

### Step 3: Get Webhook Secret
1. After saving, Razorpay will generate a **Webhook Secret**
2. Copy this secret (starts with `whsec_...`)
3. Add it to your Supabase environment variables:
   - Variable name: `RAZORPAY_WEBHOOK_SECRET`
   - Value: Your webhook secret from Razorpay

### Step 4: Test Webhook (Optional but Recommended)
In Razorpay Dashboard:
1. Go to your webhook settings
2. Click **Test Webhook**
3. Select event type: `payment.captured`
4. Click **Send Test**
5. Check your server logs - you should see "Webhook received: payment.captured"

---

## What Happens When Webhook is Triggered

### Payment Success (`payment.captured`)
```
1. Razorpay sends webhook → Your server receives it
2. Signature is verified for security
3. Order status updated to 'paid'
4. Payment details saved (method, email, etc.)
5. User is automatically enrolled in courses
```

### Payment Failed (`payment.failed`)
```
1. Webhook received and verified
2. Order status updated to 'failed'
3. Failure reason logged for debugging
```

### Refund Processed (`refund.processed`)
```
1. Webhook received and verified
2. Order status updated to 'refunded'
3. Refund amount and ID stored
```

---

## Security Features ✅
- ✅ **Signature Verification**: Every webhook is verified using HMAC SHA256
- ✅ **Secret Key Protection**: Webhook secret stored securely in environment variables
- ✅ **Audit Trail**: All webhook events stored for compliance
- ✅ **Duplicate Prevention**: Orders already marked as 'paid' won't be processed again

---

## Environment Variables Checklist

Make sure these are set in Supabase Edge Functions:

| Variable | Purpose | Status |
|----------|---------|--------|
| `RAZORPAY_KEY_ID` | Your Razorpay API Key ID | ⚠️ **Add your key** |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Secret | ⚠️ **Add your secret** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature secret | ⚠️ **Add after webhook creation** |

Get your API keys from: https://dashboard.razorpay.com/app/keys

---

## Testing the Complete Flow

### 1. Test Payment
```bash
# The webhook will automatically:
✅ Verify payment signature
✅ Update order status
✅ Enroll user in courses
✅ Store payment details
```

### 2. Check Webhook Logs
View webhook events in your server console:
```bash
# You'll see logs like:
Webhook received: { event: 'payment.captured', timestamp: '...' }
Payment captured via webhook: { order_id: '...', payment_id: '...' }
```

### 3. Verify Database
After successful webhook:
- Order status: `'paid'`
- Payment ID: Populated
- Enrollment: Created automatically
- Webhook audit: Stored in `webhook:` prefix

---

## Webhook Event Details

### payment.captured Payload
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_...",
        "order_id": "order_...",
        "method": "upi",
        "amount": 49900,
        "email": "user@example.com",
        "status": "captured"
      }
    }
  }
}
```

### What Our Server Does
1. Extracts `payment.entity.id` and `payment.entity.order_id`
2. Finds matching order in database by `razorpay_order_id`
3. Updates order with:
   - `status = 'paid'`
   - `razorpay_payment_id = pay_...`
   - `payment_method = 'upi'`
   - `payment_email = user@example.com`
   - `completed_at = current timestamp`
4. Stores webhook event for audit

---

## Troubleshooting

### Webhook Not Receiving Events
**Check:**
- ✅ Webhook URL is correct: `https://count-door-40486460.figma.site/webhook`
- ✅ Webhook is **Active** in Razorpay Dashboard
- ✅ Events are selected: `payment.captured`, `payment.failed`, `refund.processed`
- ✅ Your server is running (test with `/make-server-ff6dfb68/health`)

### Signature Verification Failed
**Check:**
- ✅ `RAZORPAY_WEBHOOK_SECRET` is set correctly in Supabase
- ✅ Secret matches the one shown in Razorpay Dashboard
- ✅ No extra spaces or characters in the secret

### Order Not Updating
**Check server logs:**
```bash
# Expected logs:
Webhook received: { event: 'payment.captured', ... }
Payment captured via webhook: { order_id: '...', payment_id: '...' }

# If you see:
Order already completed  # This is normal - prevents duplicate processing
```

---

## Quick Reference

**Webhook URL:**
```
https://count-door-40486460.figma.site/webhook
```

**Alternative Full Path** (also works):
```
https://count-door-40486460.figma.site/make-server-ff6dfb68/payments/webhook
```

**Debug Endpoint:**
```
https://count-door-40486460.figma.site/make-server-ff6dfb68/debug/razorpay-config
```

**Events to Enable:**
- `payment.captured`
- `payment.failed`
- `refund.processed`

---

## Next Steps

1. ✅ Webhook code is ready - **No changes needed**
2. ⚠️ Add webhook URL in Razorpay Dashboard
3. ⚠️ Copy webhook secret and add to Supabase environment variables
4. ⚠️ Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` if not already added
5. ✅ Test a payment - webhook will handle everything automatically

---

**Your webhook is production-ready and includes:**
- Automatic payment verification
- Order status updates
- Course enrollment
- Refund handling
- Complete audit trail
- Security via signature verification

Just add your credentials and you're good to go! 🚀
