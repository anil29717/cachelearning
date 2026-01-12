# 🔴 Payment Error Fix - Quick Guide

## Current Error You're Seeing

```
API Error at /payments/create-order: {
  "error": "Invalid Razorpay API credentials detected...",
  "code": "RAZORPAY_CONFIG_ERROR"
}

Payment error: Invalid Razorpay API credentials detected
```

---

## What This Means

**You need to configure your Razorpay API keys!**

The system has placeholder values for:
- `RAZORPAY_KEY_ID` (environment variable)
- `RAZORPAY_KEY_SECRET` (environment variable)
- `/config/razorpay.ts` (frontend config)

These need to be replaced with **real Razorpay API keys** from your account.

---

## 👉 Complete Setup Guide

**📖 [RAZORPAY_SETUP_REQUIRED.md](RAZORPAY_SETUP_REQUIRED.md)**

This guide contains:
- Step-by-step instructions
- Screenshots and examples
- Troubleshooting tips
- Test card information

---

## ⚡ Quick Fix (5 Minutes)

### 1. Get Your Razorpay Keys

Visit: **https://dashboard.razorpay.com/app/keys**

- Sign in (or create a free account)
- Switch to **Test Mode**
- Copy your **Key ID** (starts with `rzp_test_`)
- Copy your **Key Secret** (click "Generate Secret")

### 2. Update Environment Variables

Update these in your Supabase/Figma Make environment:

```
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
```

### 3. Update Frontend Config

Edit `/config/razorpay.ts`:

```typescript
export const RAZORPAY_KEY_ID = 'rzp_test_YOUR_ACTUAL_KEY_ID';
```

### 4. Test

- Clear browser cache
- Add course to cart
- Proceed to checkout
- Use test card: **4111 1111 1111 1111**
- Payment should succeed!

---

## ✅ Verification Checklist

Before testing, make sure:

- [ ] You have a Razorpay account
- [ ] You're in Test Mode on Razorpay dashboard
- [ ] You've copied both Key ID and Key Secret
- [ ] `RAZORPAY_KEY_ID` environment variable is updated
- [ ] `RAZORPAY_KEY_SECRET` environment variable is updated
- [ ] `/config/razorpay.ts` has the same Key ID
- [ ] Key ID starts with `rzp_test_` (for test mode)
- [ ] Key Secret is at least 24 characters
- [ ] Browser cache is cleared

---

## 🎯 Expected Key Format

**Valid Test Mode Keys:**

```
✅ Key ID: rzp_test_A1b2C3d4E5f6G7  (starts with rzp_test_)
✅ Key Secret: abcdefghij1234567890XYZ (24+ characters)
```

**Invalid Examples:**

```
❌ rzp_test_1234567890  (too short, placeholder)
❌ 12345678  (not a real Razorpay key)
❌ test_key  (wrong format)
```

---

## 🚨 Common Mistakes

### Mistake 1: Only updating one location

**Problem:** Updated environment variable but not the config file (or vice versa)

**Solution:** Update ALL THREE:
1. `RAZORPAY_KEY_ID` environment variable
2. `RAZORPAY_KEY_SECRET` environment variable  
3. `/config/razorpay.ts` file

### Mistake 2: Using live keys in test mode

**Problem:** Copied live keys (`rzp_live_...`) instead of test keys

**Solution:** Make sure you're in Test Mode on Razorpay dashboard and use test keys (`rzp_test_...`)

### Mistake 3: Not clearing cache

**Problem:** Updated keys but still seeing errors

**Solution:** Clear browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Mistake 4: Copying keys with extra spaces

**Problem:** Accidentally copied spaces before/after the key

**Solution:** Make sure to trim any whitespace when copying

---

## 🎓 Test Cards

Once configured, use these Razorpay test cards:

| Card Number | Result |
|------------|--------|
| 4111 1111 1111 1111 | ✅ Payment Success |
| 4000 0000 0000 0002 | ❌ Payment Declined |

**Use:**
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name

---

## 📚 Additional Resources

- **Complete Setup Guide**: [RAZORPAY_SETUP_REQUIRED.md](RAZORPAY_SETUP_REQUIRED.md)
- **Razorpay Dashboard**: https://dashboard.razorpay.com/app/keys
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/

---

## ❓ Still Having Issues?

1. **Check server logs** - Look for specific error messages
2. **Verify key format** - Ensure keys match the expected format
3. **Test in Razorpay dashboard** - Make sure your account is active
4. **Contact support** - Razorpay has excellent documentation and support

---

## 💡 Summary

**Before Setup:**
```
❌ Placeholder keys
❌ Payments fail
❌ Error messages in console
```

**After Setup:**
```
✅ Real Razorpay keys configured
✅ Payments work perfectly
✅ Students can enroll in courses
```

---

**Take 5 minutes to set this up now, and payments will work perfectly! 🎉**
