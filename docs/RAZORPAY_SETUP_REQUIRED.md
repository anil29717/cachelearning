# 🔴 RAZORPAY SETUP REQUIRED

## ❌ Current Error

```
Invalid Razorpay API credentials detected. 
Please provide valid Razorpay keys.
```

## 🎯 What This Means

**Your Razorpay API credentials are not configured correctly!**

The environment variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` exist but contain placeholder values, not real Razorpay API keys.

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Get Your Razorpay API Keys

1. **Go to Razorpay Dashboard**:
   - Visit: https://dashboard.razorpay.com/app/keys
   - Sign in (or create a free account if you don't have one)

2. **Make sure you're in Test Mode**:
   - Look for the toggle in the top navigation
   - Switch to **Test Mode** (recommended for development)

3. **Copy Your Keys**:
   - **Key ID**: Starts with `rzp_test_` (for test mode) or `rzp_live_` (for production)
   - **Key Secret**: Click "Generate Secret" or reveal existing secret

**Example values:**
- Key ID: `rzp_test_1A2B3C4D5E6F7G`
- Key Secret: `abcdefghijklmnopqrstuvwxyz1234567890`

---

### Step 2: Update Environment Variables in Figma Make

The environment variables are already created in your Supabase backend, but they need to be updated with your **real Razorpay keys**.

**Important:** You need to update these in the Figma Make/Supabase environment settings:

1. **RAZORPAY_KEY_ID**
   - Current value: (placeholder)
   - New value: Your actual Key ID from Step 1 (e.g., `rzp_test_1A2B3C4D5E6F7G`)

2. **RAZORPAY_KEY_SECRET**
   - Current value: (placeholder)
   - New value: Your actual Key Secret from Step 1

---

### Step 3: Update Frontend Configuration

Update the Razorpay Key ID in the frontend config file:

**File:** `/config/razorpay.ts`

Replace the placeholder with your actual Key ID:

```typescript
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_YOUR_ACTUAL_KEY_ID_HERE', // ← Update this
};
```

---

### Step 4: Test the Payment Flow

After updating the keys:

1. **Clear your browser cache** (or do a hard refresh)
2. Go to the app and add a course to cart
3. Proceed to checkout
4. Use Razorpay test card: **4111 1111 1111 1111**
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - Name: Any name

5. Complete the payment
6. You should see the payment succeed and get redirected to your profile with the enrolled course!

---

## 🔍 How to Verify Your Keys Are Valid

### Valid Key Format:

✅ **Test Mode Key ID**: `rzp_test_` followed by 14+ characters  
✅ **Test Mode Key Secret**: 24+ characters long

❌ **Invalid Examples**:
- `12345678` (too short, placeholder)
- `test_key` (not a real Razorpay format)
- Empty or null

---

## 🚨 Common Issues

### Issue 1: "Where do I update environment variables in Figma Make?"

The environment variables are managed in the Supabase backend. If you're using Figma Make, you may need to:
- Contact support or check the environment settings panel
- The variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are already created
- You just need to update their values with your real keys

### Issue 2: "I updated the keys but still getting the error"

**Solution:**
- Make sure you updated BOTH keys (Key ID and Key Secret)
- Restart the backend/server after updating
- Clear browser cache
- Check that you copied the full key (no extra spaces)

### Issue 3: "Should I use test or live mode?"

**For Development:** Always use **Test Mode**
- Keys start with `rzp_test_`
- No real money is processed
- Use test cards for payments

**For Production:** Use **Live Mode**
- Keys start with `rzp_live_`
- Real payments are processed
- Only switch after thorough testing

---

## 📋 Checklist

Before you can accept payments, make sure:

- [ ] You have a Razorpay account (free to create)
- [ ] You're in **Test Mode** on the Razorpay dashboard
- [ ] You've copied both **Key ID** and **Key Secret**
- [ ] You've updated `RAZORPAY_KEY_ID` environment variable
- [ ] You've updated `RAZORPAY_KEY_SECRET` environment variable
- [ ] You've updated `/config/razorpay.ts` with the Key ID
- [ ] The Key ID starts with `rzp_test_` (for test mode)
- [ ] The Key Secret is at least 24 characters long
- [ ] You've cleared browser cache after updating

---

## 🎓 Test Cards for Razorpay

Once configured, use these test cards:

| Card Number | Expiry | CVV | Result |
|------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | ✅ Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | ❌ Declined |

---

## 🔗 Quick Links

- **Get API Keys**: https://dashboard.razorpay.com/app/keys
- **Razorpay Documentation**: https://razorpay.com/docs/payments/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/

---

## 💡 Summary

**The Problem:**
```
❌ RAZORPAY_KEY_ID = "placeholder_value"
❌ RAZORPAY_KEY_SECRET = "placeholder_value"
❌ Payments fail with config error
```

**The Solution:**
```
✅ Get real keys from dashboard.razorpay.com/app/keys
✅ Update both environment variables with real keys
✅ Update /config/razorpay.ts with Key ID
✅ Use test card: 4111 1111 1111 1111
✅ Payments work!
```

---

**Once you've completed these steps, payments will work perfectly! 🎉**

**Need Help?** Check the Razorpay dashboard for detailed documentation and support.
