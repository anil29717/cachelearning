# Complete Setup Guide

## Quick Start (5 minutes)

### Step 1: Configure Razorpay

1. **Get your Razorpay API keys**:
   - Go to https://dashboard.razorpay.com/app/keys
   - Copy your **Key ID** (starts with `rzp_test_`)
   - Copy your **Key Secret**
   - Both keys are already configured in the backend environment

2. **Set the frontend key**:
   - Update `/config/razorpay.ts` with your Key ID
   - Replace `'rzp_test_1234567890'` with your actual Key ID

### Step 2: Create Your First Admin Account

1. Click "Register" in the app
2. Fill in:
   - Email: `admin@yourdomain.com`
   - Password: (choose a strong password)
   - Name: Your name
   - Role: Select "admin"
3. Click "Create Account"

### Step 3: Create an Instructor Account

1. Sign out from admin account
2. Click "Register" again
3. Fill in:
   - Email: `instructor@yourdomain.com`
   - Password: (choose a password)
   - Name: Instructor name
   - Role: Select "instructor"
4. Click "Create Account"

### Step 4: Create Your First Course

1. Log in with instructor account
2. Click "Instructor Dashboard" (or navigate to `/instructor`)
3. Click "Create Course"
4. Fill in course details:
   - Title: e.g., "Complete Web Development Bootcamp"
   - Description: Course overview
   - Price: e.g., 49.99
   - Category: Select from dropdown
   - Thumbnail URL: (optional) Any image URL
5. Click "Create Course"

### Step 5: Add Lessons to Your Course

1. In the course table, click "Add Lesson"
2. Fill in lesson details:
   - Title: e.g., "Introduction to HTML"
   - Content: Lesson description
   - Video URL: Use a Vimeo URL or test URL like `https://vimeo.com/76979871`
   - Order: 1 (increment for each lesson)
   - Duration: e.g., 15 (minutes)
3. Click "Add Lesson"
4. Repeat to add more lessons

### Step 6: Publish Your Course

1. In the course table, click "Publish" button
2. The course status will change to "published"
3. The course is now visible on the homepage

### Step 7: Test Student Flow

1. Sign out from instructor account
2. Register a new student account (or sign in)
3. Browse the homepage to see your published course
4. Click on the course card
5. Click "Add to Cart"
6. Navigate to cart (shopping cart icon in navbar)
7. Click "Proceed to Checkout"
8. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
9. Complete payment
10. Go to Profile to see enrolled course
11. Click "Continue Learning" to start the course

## Advanced Configuration

### Custom Branding

1. **Update Site Title**:
   - Edit `index.html` and change `<title>` tag

2. **Update Colors**:
   - Edit `styles/globals.css`
   - Modify CSS variables under `:root`

3. **Add Logo**:
   - Update `Navbar.tsx` component
   - Replace the "CourseHub" text with your logo image

### Video Hosting Options

#### Option 1: Vimeo (Recommended)
1. Upload videos to Vimeo
2. Get video URL from Vimeo
3. Use URL in lesson creation
4. Ensure video privacy is set to "Public" or "Unlisted"

#### Option 2: YouTube
1. Upload videos to YouTube
2. Get video ID from URL
3. Use embed format: `https://www.youtube.com/embed/VIDEO_ID`

#### Option 3: Direct Video URLs
1. Host MP4 files on any CDN
2. Use direct URL to .mp4 file
3. Ensure CORS is enabled on your server

### Email Notifications (Future)

The platform uses Supabase Auth which can send emails:
1. Configure email templates in Supabase dashboard
2. Set up SMTP settings
3. Enable email confirmation
4. Customize email templates

### Custom Domain

To use a custom domain:
1. Deploy to Vercel or similar platform
2. Configure DNS settings
3. Update Supabase allowed URLs
4. Update Razorpay webhook URLs (if needed)

## Database Management

### Viewing Data

Since this uses Supabase's KV store, data is stored as key-value pairs:

- **User profiles**: `user_profile:{userId}`
- **Courses**: `course:{courseId}`
- **Lessons**: `lesson:{courseId}:{lessonId}`
- **Enrollments**: `enrollment:{userId}:{courseId}`
- **Progress**: `progress:{userId}:{lessonId}`
- **Orders**: `order:{orderId}`

### Backup Data

To backup your data:
1. Use the Supabase dashboard
2. Access the KV store directly
3. Export data using the API

### Reset Database

To start fresh:
1. Clear all KV store entries
2. Re-initialize by clicking around the app
3. Create new admin account

## Testing Scenarios

### Test 1: Complete Purchase Flow
1. Browse as guest
2. Sign in/register
3. Add course to cart
4. Complete checkout
5. Verify enrollment
6. Access course content

### Test 2: Course Creation Flow
1. Log in as instructor
2. Create course
3. Add multiple lessons
4. Publish course
5. View on homepage
6. Enroll as student

### Test 3: Progress Tracking
1. Enroll in course
2. Start course player
3. Complete lessons
4. Verify progress updates
5. Check certificate on completion

### Test 4: Admin Analytics
1. Log in as admin
2. View dashboard statistics
3. Check user list
4. Review course list
5. Analyze revenue data

## Razorpay Configuration

### Test Mode
- Always use test mode keys (rzp_test_)
- Use test cards for payments
- No real money is processed

### Production Mode
1. Get live API keys from Razorpay
2. Replace test keys with live keys
3. Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables
4. Test thoroughly before going live
5. Enable required payment methods
6. Set up tax calculation if needed

### Webhook Setup (optional for production)
1. Go to Razorpay Dashboard > Settings > Webhooks
2. Add endpoint: `https://your-domain.com/api/razorpay/webhook`
3. Select required events
4. Copy webhook secret
5. Add to environment variables if implementing webhooks

## Troubleshooting Common Issues

### Issue: "Database not initialized"
**Solution**: Click around the app to trigger initialization, or call the `/init-db` endpoint

### Issue: "Unauthorized" errors
**Solution**: 
- Sign out and sign in again
- Clear browser cookies
- Check that JWT token is valid

### Issue: Video not playing
**Solution**:
- Verify video URL is accessible
- Check video privacy settings
- Ensure CORS is enabled
- Try different video URL

### Issue: Payment failing
**Solution**:
- Use correct test card number
- Check Razorpay dashboard for errors
- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
- Check browser console for errors

### Issue: Cart not persisting
**Solution**:
- Cart is stored in browser localStorage
- Don't clear browser data
- Check CartContext is wrapping app

### Issue: Role permissions
**Solution**:
- Verify user role in profile
- Admin can access all features
- Instructor can only access instructor dashboard
- Students can only view and enroll

## Performance Optimization

### Frontend
- Images are lazy loaded
- React components are optimized
- Minimal re-renders with proper keys

### Backend
- KV store is fast and efficient
- Queries are optimized
- Caching can be added

### Video Delivery
- Use CDN for video hosting
- Enable adaptive bitrate
- Implement video preloading

## Security Best Practices

1. **Never expose**:
   - Razorpay Secret Key in frontend
   - Supabase Service Role Key in frontend
   - User passwords

2. **Always validate**:
   - User input
   - API responses
   - Payment amounts

3. **Use HTTPS**:
   - Required for Razorpay
   - Required for production
   - Enforced by Supabase

4. **Implement rate limiting**:
   - Prevent brute force attacks
   - Limit API calls
   - Monitor suspicious activity

## Support Resources

- **Razorpay Documentation**: https://razorpay.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **Shadcn/ui**: https://ui.shadcn.com

## Next Steps

After setup, you can:

1. **Customize Design**:
   - Update colors and fonts
   - Add your branding
   - Customize components

2. **Add Features**:
   - Course reviews
   - Discussion forums
   - Quizzes and assignments
   - Certificates with custom design

3. **Integrate Services**:
   - Email marketing (Mailchimp)
   - Analytics (Google Analytics)
   - Customer support (Intercom)
   - Social login (Google, Facebook)

4. **Launch**:
   - Deploy to production
   - Configure custom domain
   - Set up monitoring
   - Market your platform

---

**Need Help?** Check the README.md for more information or consult the code comments.
