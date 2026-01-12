# 🚨 QUICK FIX: Razorpay Configuration Error

## The Error You're Seeing
```
"Invalid Razorpay API credentials detected"
"RAZORPAY_CONFIG_ERROR"
```

## 3-Step Fix (5 minutes)

### Step 1: Get Razorpay Keys (2 minutes)
1. Visit https://dashboard.razorpay.com/app/keys
2. Switch to **Test Mode** (top bar)
3. Click **Generate Test Key** if needed
4. Copy both:
   - **Key ID**: `rzp_test_xxxxx...`
   - **Key Secret**: `xxxxx...` (longer)

### Step 2: Set in Supabase (2 minutes)
1. Visit https://supabase.com/dashboard
2. Select project: `wugzmhtnsffpwhgsxkgx`
3. Go to: **Settings** → **Edge Functions** → **Secrets**
4. Add two secrets:

| Secret Name | Value |
|------------|-------|
| `RAZORPAY_KEY_ID` | Paste your Key ID |
| `RAZORPAY_KEY_SECRET` | Paste your Key Secret |

5. Click **Save**

### Step 3: Verify (1 minute)
1. Wait 1-2 minutes ⏰
2. Go to `/debug/config` in your app
3. Click "Check Configuration"
4. Should show ✅ all green

## Quick Test

**Test Card for Success:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`

## Still Not Working?

### Check These:
- [ ] No extra spaces in keys
- [ ] Key ID starts with `rzp_test_`
- [ ] Both keys from same Razorpay account
- [ ] Waited 2 minutes after setting keys
- [ ] Refreshed the browser

### Debug Tools:
- **Debug Page:** `/debug/config`
- **Server Logs:** Supabase Dashboard → Edge Functions → Logs

## Need More Help?

📖 **Full Guide:** See `RAZORPAY_ENV_SETUP.md`

---

**TL;DR:** Get keys from Razorpay → Add to Supabase secrets → Wait 2 min → Test at `/debug/config`
