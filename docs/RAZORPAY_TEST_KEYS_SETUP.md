# 🔑 Razorpay Test Keys Configuration

## ✅ Frontend Configuration - COMPLETE!

The frontend is now configured with your test key:
- **Key ID**: `rzp_test_RbXgQEgViEoRDT`
- Location: `/config/razorpay.ts`

## 🔧 Backend Configuration - ACTION REQUIRED!

You need to add the Razorpay keys as environment variables in Supabase:

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to: **Settings** → **Edge Functions** → **Secrets**

### Step 2: Add Environment Variables

Add these two secrets:

**Secret 1: RAZORPAY_KEY_ID**
```
rzp_test_RbXgQEgViEoRDT
```

**Secret 2: RAZORPAY_KEY_SECRET**
```
TogymjROObpyGc2MVIoPovYx
```

### Step 3: Deploy Edge Functions

After adding the secrets, redeploy your edge functions:
```bash
supabase functions deploy
```

Or if using the Supabase dashboard, the functions will automatically use the new secrets.

## 🧪 Test Your Configuration

After setting up the environment variables:

1. **Check Configuration Status**: Visit `/config-debug` in your app
2. **Test Payment Flow**: 
   - Add a course to cart
   - Go to checkout
   - Use Razorpay test cards

### Razorpay Test Cards

**Success Card**:
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)

**Failure Card**:
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI ID**: `success@razorpay`

## 🎯 Current Status

✅ Frontend Key ID: `rzp_test_RbXgQEgViEoRDT` (configured)
⚠️ Backend Secrets: Need to be added in Supabase Dashboard

## 📖 Additional Resources

- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
- Complete setup guide: `/RAZORPAY_SETUP_REQUIRED.md`

---

**Note**: These are TEST credentials. For production, you'll need to:
1. Switch to Live Mode in Razorpay dashboard
2. Get your live keys (start with `rzp_live_`)
3. Update both frontend config and backend secrets
