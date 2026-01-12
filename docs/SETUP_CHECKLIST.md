# ✅ Setup Checklist - Get Your LMS Running in 5 Minutes

## Step 1: Frontend Configuration ✅ DONE!

- [x] Razorpay Key ID configured in `/config/razorpay.ts`
- [x] Value: `rzp_test_RbXgQEgViEoRDT`
- [x] No action needed - already complete!

## Step 2: Backend Configuration ⚠️ ACTION REQUIRED

Visit your Supabase Dashboard and add these secrets:

### Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **Edge Functions** → **Secrets**

### Add Two Secrets

**Secret 1: RAZORPAY_KEY_ID**
```
rzp_test_RbXgQEgViEoRDT
```

**Secret 2: RAZORPAY_KEY_SECRET**
```
TogymjROObpyGc2MVIoPovYx
```

### Quick Copy-Paste
Visit `/config-debug` in your app - all keys are there with copy buttons!

## Step 3: Verify Configuration

- [ ] Visit `/config-debug` in your app
- [ ] Check that Frontend shows: ✅ Key ID present
- [ ] Check that Backend shows: ✅ Environment variables set
- [ ] All checks should be green!

## Step 4: Test Payment Flow

### Add Course to Cart
- [ ] Go to homepage
- [ ] Click on any course (or create one as instructor)
- [ ] Click "Add to Cart"

### Checkout
- [ ] Go to cart (click cart icon in navbar)
- [ ] Click "Proceed to Checkout"
- [ ] Razorpay modal should open

### Test Payment
Use these test card details:
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry Date: 12/25
Name: Test User
```

- [ ] Enter test card details
- [ ] Click "Pay"
- [ ] Payment should succeed
- [ ] You should see success message
- [ ] Course should appear in "My Courses"

## Step 5: Test Other Features

### As Student
- [ ] Register new account (role: Student)
- [ ] Browse courses
- [ ] Add to cart
- [ ] Complete checkout
- [ ] Access course player
- [ ] Watch video

### As Instructor
- [ ] Register new account (role: Instructor)
- [ ] Create new course
- [ ] Add lessons and videos
- [ ] Publish course
- [ ] View in instructor dashboard
- [ ] Check enrollment analytics

### As Admin
- [ ] Register account (role: Admin)
- [ ] View admin dashboard
- [ ] See all users
- [ ] View all courses
- [ ] Check payment reports
- [ ] Review analytics

## Common Issues & Fixes

### ❌ "Payment failed" immediately
**Fix:** Backend secrets not added to Supabase
- Go to Supabase Dashboard → Edge Functions → Secrets
- Add both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- Wait 1-2 minutes for changes to apply

### ❌ Razorpay modal doesn't open
**Fix:** Frontend key not loaded
- Check browser console for errors
- Verify `/config/razorpay.ts` has correct key
- Clear browser cache and refresh

### ❌ Payment succeeds but no enrollment
**Fix:** Webhook configuration issue
- Check Supabase Edge Function logs
- Verify payment was actually successful in Razorpay dashboard
- Check that course ID is correct

### ❌ Video player doesn't work
**Fix:** Video URL issue
- Ensure video URL is accessible
- Check if URL requires authentication
- Try with a different video URL

## Testing Scenarios

### Successful Payment
- Card: `4111 1111 1111 1111`
- Should: Complete successfully, create enrollment

### Failed Payment
- Card: `4000 0000 0000 0002`
- Should: Show error message, no enrollment created

### UPI Payment
- UPI ID: `success@razorpay`
- Should: Complete successfully

### Multiple Courses
- Add 3+ courses to cart
- Should: Show correct total
- Should: Process all at once

## Performance Checklist

- [ ] Homepage loads in < 2 seconds
- [ ] Course player video starts in < 3 seconds
- [ ] Search is responsive
- [ ] Cart updates instantly
- [ ] Dashboard loads all data

## Security Checklist

- [ ] Key Secret is NOT in frontend code
- [ ] Using test keys for development
- [ ] HTTPS enabled for production
- [ ] Webhook signature verification enabled
- [ ] User authentication working

## Documentation

### Quick Reference Guides
- 📚 [Quick Test Payment Guide](QUICK_TEST_PAYMENT.md)
- 🔑 [Test Keys Setup](RAZORPAY_TEST_KEYS_SETUP.md)
- 🔧 [Complete Setup Guide](RAZORPAY_SETUP_REQUIRED.md)
- 🪝 [Webhook Setup](RAZORPAY_WEBHOOK_SETUP.md)
- ❓ [Troubleshooting](UNDERSTANDING_ERROR_LOGS.md)

### In-App Tools
- 🔍 Configuration Debug: `/config-debug`
- 👤 User Profile: `/profile`
- 🎓 Instructor Dashboard: `/instructor/dashboard`
- 👑 Admin Dashboard: `/admin/dashboard`

## Next Steps After Setup

### 1. Create Real Content
- [ ] Create 3-5 actual courses
- [ ] Add proper descriptions and thumbnails
- [ ] Upload quality video content
- [ ] Set appropriate pricing

### 2. Customize Branding
- [ ] Update app name in navbar
- [ ] Change color scheme
- [ ] Add your logo
- [ ] Customize email templates

### 3. Configure Webhooks
- [ ] Set webhook URL in Razorpay dashboard
- [ ] Test webhook events
- [ ] Monitor webhook logs

### 4. Prepare for Production
- [ ] Complete Razorpay KYC
- [ ] Get live API keys
- [ ] Update environment variables
- [ ] Test with real small transaction (₹1)
- [ ] Set up proper domain
- [ ] Configure SSL certificate

## Support

**Need Help?**
1. Check `/config-debug` page first
2. Review error logs in browser console
3. Check Supabase Edge Function logs
4. Read troubleshooting guides
5. Verify all environment variables are set

## Status Summary

| Component | Status | Action |
|-----------|--------|--------|
| Frontend Config | ✅ Done | None |
| Backend Secrets | ⚠️ Pending | Add to Supabase |
| Database | ✅ Auto-init | None |
| Authentication | ✅ Working | None |
| Payment Gateway | ⏳ Setup | Add secrets |
| Video Player | ✅ Working | None |
| Webhooks | ✅ Configured | Test |

---

**Current Step:** Add backend secrets to Supabase (Step 2)
**Time Required:** 2-3 minutes
**Next Test:** Payment checkout with test card
