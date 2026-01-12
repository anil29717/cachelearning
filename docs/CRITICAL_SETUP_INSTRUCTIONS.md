# ⚠️ CRITICAL: Complete This Setup Now!

## 🔴 Current Error

```
RAZORPAY_KEY_SECRET appears invalid (length: 8)
```

## 💡 What This Means

The backend **cannot read** the environment variables because they haven't been added to Supabase yet!

## ✅ Fix in 2 Minutes - Follow These Exact Steps

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Click on your project
3. Navigate to: **Settings** (gear icon in sidebar)
4. Click: **Edge Functions**
5. Click: **Secrets** tab

### Step 2: Add First Secret

Click **"Add new secret"** button and enter:

**Name:** (type exactly)
```
RAZORPAY_KEY_ID
```

**Value:** (copy and paste this exactly)
```
rzp_test_RbXgQEgViEoRDT
```

Click **Save**

### Step 3: Add Second Secret

Click **"Add new secret"** again and enter:

**Name:** (type exactly)
```
RAZORPAY_KEY_SECRET
```

**Value:** (copy and paste this exactly)
```
TogymjROObpyGc2MVIoPovYx
```

Click **Save**

### Step 4: Wait & Verify

1. **Wait 1-2 minutes** for changes to propagate
2. **Refresh your app**
3. **Visit `/config-debug`** to verify
4. You should see ✅ green checkmarks

## 🧪 Test Payment

Once setup is complete, test with:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

## 📸 Visual Guide

Your Supabase Secrets page should look like this:

```
Secrets
─────────────────────────────────────────
Name                    | Value
─────────────────────────────────────────
RAZORPAY_KEY_ID        | rzp_test_RbXgQE...
RAZORPAY_KEY_SECRET    | TogymjROObpyGc2...
SUPABASE_ANON_KEY      | (already set)
SUPABASE_SERVICE_...   | (already set)
SUPABASE_URL           | (already set)
```

## ❓ Common Mistakes

### ❌ Wrong: Adding to .env file
- .env files don't work for Supabase Edge Functions
- You MUST use Supabase Dashboard → Secrets

### ❌ Wrong: Adding to frontend environment
- These are backend secrets
- Must be in Supabase Edge Functions Secrets

### ❌ Wrong: Copy-paste includes extra spaces
- Make sure no spaces before/after the value
- Use the exact values above

### ❌ Wrong: Not waiting for propagation
- Changes take 1-2 minutes to apply
- Wait, then refresh your app

## 🎯 How to Verify It Worked

### Method 1: Config Debug Page
Visit: `/config-debug`

Should show:
- ✅ Frontend: Key ID present (length: 24)
- ✅ Backend: Key ID present (length: 24)
- ✅ Backend: Key Secret present (length: 25)

### Method 2: Browser Console
Open Developer Tools → Console

Should see:
```
✅ Database initialized
Razorpay config check: {
  key_id_length: 24,
  key_secret_length: 25
}
```

### Method 3: Try Checkout
1. Add course to cart
2. Click "Proceed to Checkout"
3. Razorpay modal should open (no error)

## 🆘 Still Not Working?

### Double-check these:

1. **Secret names are EXACTLY:**
   - `RAZORPAY_KEY_ID` (all caps, underscores)
   - `RAZORPAY_KEY_SECRET` (all caps, underscores)

2. **Values have NO extra characters:**
   - No spaces before or after
   - No line breaks
   - No quotes around them

3. **You're in the right place:**
   - Supabase Dashboard → Your Project → Settings → Edge Functions → Secrets
   - NOT in Environment Variables
   - NOT in .env file

4. **You waited:**
   - Give it 2 full minutes
   - Hard refresh your browser (Ctrl+Shift+R)

## 📞 Next Steps After Setup

Once you see all green checkmarks:

1. ✅ Test a payment with test card
2. ✅ Verify enrollment works
3. ✅ Check course player access
4. ✅ Review the complete system

---

**🚀 You're almost there! Just need to add those two secrets to Supabase!**

Need the values again? They're displayed with copy buttons at: `/config-debug`
