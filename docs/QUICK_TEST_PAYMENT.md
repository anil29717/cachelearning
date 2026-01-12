# 🚀 Quick Payment Testing Guide

Your Razorpay test keys are now configured in the frontend!

## ✅ What's Already Done

1. **Frontend Key ID**: `rzp_test_RbXgQEgViEoRDT` ✅
   - Configured in `/config/razorpay.ts`
   - Ready to use!

## ⚡ Quick Start - 3 Steps

### Step 1: Add Backend Secrets (Supabase Dashboard)

Go to your Supabase project:
```
Settings → Edge Functions → Secrets
```

Add these two secrets:

| Secret Name | Secret Value |
|------------|--------------|
| `RAZORPAY_KEY_ID` | `rzp_test_RbXgQEgViEoRDT` |
| `RAZORPAY_KEY_SECRET` | `TogymjROObpyGc2MVIoPovYx` |

### Step 2: Verify Configuration

Visit the debug page in your app:
```
/config-debug
```

You should see:
- ✅ Frontend: Key ID present
- ✅ Backend: Environment variables set

### Step 3: Test a Payment!

1. **Browse courses** on the homepage
2. **Add a course to cart**
3. **Go to cart** and click "Proceed to Checkout"
4. **Use test card details**:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

5. Click "Pay" - it should succeed! 🎉

## 🧪 Test Payment Methods

### ✅ Successful Payment (Card)
- **Card**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (`123`)
- **Expiry**: Any future date (`12/25`)
- **Result**: Payment succeeds

### ❌ Failed Payment (Card)
- **Card**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Result**: Payment fails (for testing error handling)

### 💳 UPI (Indian Payment Method)
- **UPI ID**: `success@razorpay`
- **Result**: Payment succeeds

### 🏦 Net Banking
- **Select**: Any bank
- **Result**: Opens test payment page

## 🎯 What Happens After Payment

1. **Order Created**: Razorpay generates order ID
2. **Payment Gateway Opens**: User enters card details
3. **Payment Processed**: Backend verifies signature
4. **Webhook Triggered**: Payment status updated
5. **Enrollment Created**: User gets access to course
6. **Redirect**: User sent to course player

## 🔍 Debugging

If payment fails, check:

1. **Frontend Console** - Check for errors
2. **Network Tab** - See API responses
3. **Supabase Edge Logs** - Check backend errors
4. **Debug Page**: `/config-debug` - Verify config

### Common Issues

**"Payment failed" immediately**
- ❌ Backend secrets not set
- ❌ Key ID mismatch between frontend and backend
- ❌ Invalid key format

**Payment gateway doesn't open**
- ❌ Frontend key ID not loaded
- ❌ Razorpay script failed to load
- ❌ Browser blocked popup

**Payment succeeds but enrollment fails**
- ❌ Webhook signature verification failed
- ❌ Database write error
- ❌ Course ID mismatch

## 📝 Test Checklist

Use this to verify everything works:

- [ ] Environment variables added in Supabase
- [ ] `/config-debug` shows all green checkmarks
- [ ] Can add course to cart
- [ ] Checkout page loads
- [ ] Razorpay modal opens with correct amount
- [ ] Test card payment succeeds
- [ ] Order appears in instructor dashboard
- [ ] Course appears in "My Courses"
- [ ] Can access course player
- [ ] Video player works

## 🎓 Next Steps

Once testing works:

1. **Create your first real course** (as instructor)
2. **Test the full flow** end-to-end
3. **Check admin dashboard** for analytics
4. **Review payment reports** in Razorpay dashboard

## 🔐 Moving to Production

When ready for real payments:

1. **KYC Verification**: Complete in Razorpay dashboard
2. **Get Live Keys**: Switch to Live Mode
   - Key ID: `rzp_live_...`
   - Key Secret: `(new secret)`
3. **Update Config**:
   - Frontend: `/config/razorpay.ts`
   - Backend: Supabase Edge Function secrets
4. **Enable Webhooks**: Point to your production URL
5. **Test with small amount**: ₹1 test transaction

## 📚 Additional Resources

- **Full Setup Guide**: `/RAZORPAY_TEST_KEYS_SETUP.md`
- **Webhook Guide**: `/RAZORPAY_WEBHOOK_SETUP.md`
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Need Help?** Check `/config-debug` page first - it shows exactly what's wrong!
