# 🚀 Quick Start Guide - Course Platform

## Getting Started in 3 Minutes

### ⚠️ IMPORTANT: Authentication Error Fix

If you see **"Invalid login credentials"** error:
- ✅ This means you need to **register first** before signing in
- ✅ The platform doesn't have pre-created accounts
- ✅ Follow the steps below to get started

---

## Step-by-Step Setup

### 1️⃣ Create Your First Admin Account

1. Click **"Sign Up"** in the top right corner
2. Fill in the form:
   ```
   Full Name: Admin User
   Email: admin@yoursite.com
   Password: admin123456 (or any password you want)
   Role: Select "Admin"
   ```
3. Click **"Create Account"**
4. ✅ You're now signed in as admin!

### 2️⃣ Create an Instructor Account

1. Click on your profile menu → **"Sign Out"**
2. Click **"Sign Up"** again
3. Fill in the form:
   ```
   Full Name: John Instructor
   Email: instructor@yoursite.com
   Password: instructor123
   Role: Select "Instructor"
   ```
4. Click **"Create Account"**
5. ✅ You're now signed in as instructor!

### 3️⃣ Create Your First Course

1. In the navbar, you'll see access to **"Instructor Dashboard"**
2. Click it to go to your dashboard
3. Click **"Create Course"** button
4. Fill in the course details:
   ```
   Title: Complete Web Development Bootcamp
   Description: Learn HTML, CSS, JavaScript, React and more
   Price: 49.99
   Category: Programming
   Thumbnail URL: (leave empty for now)
   ```
5. Click **"Create Course"**
6. ✅ Course created!

### 4️⃣ Add Lessons to Your Course

1. In the Instructor Dashboard, find your course in the table
2. Click **"Add Lesson"** button
3. Fill in lesson details:
   ```
   Title: Introduction to HTML
   Content: In this lesson, you'll learn the basics of HTML structure
   Video URL: https://vimeo.com/76979871
   Order: 1
   Duration: 15
   ```
4. Click **"Add Lesson"**
5. Repeat to add more lessons (use Order: 2, 3, 4, etc.)
6. ✅ Lessons added!

### 5️⃣ Publish Your Course

1. In the Instructor Dashboard course table
2. Find your course
3. Click **"Publish"** button
4. ✅ Course is now live on the homepage!

### 6️⃣ Test as a Student

1. Sign out from instructor account
2. Click **"Sign Up"** to create a student account:
   ```
   Full Name: Sarah Student
   Email: student@yoursite.com
   Password: student123
   Role: Select "Student"
   ```
3. Browse the homepage - you'll see your published course!
4. Click on the course to view details
5. Click **"Add to Cart"**
6. Click the cart icon in navbar
7. Click **"Proceed to Checkout"**
8. Enter test payment info:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ZIP: 12345
   ```
9. Click **"Pay"**
10. ✅ You're now enrolled!

### 7️⃣ Start Learning

1. You'll be redirected to your profile
2. Click **"Continue Learning"** on any enrolled course
3. Watch videos and mark lessons as complete
4. Track your progress
5. ✅ Complete the course!

---

## 🔐 Understanding Authentication

### Why Do I Get "Invalid Login Credentials"?

This error means:
- ❌ The email/password combination doesn't exist in the database
- ✅ You need to create an account first using the Sign Up form

### How Authentication Works

1. **Sign Up**: Creates a new user in Supabase Auth + stores profile in database
2. **Sign In**: Verifies credentials against Supabase Auth
3. **Session**: Keeps you logged in with JWT token
4. **Sign Out**: Clears session and logs you out

### Three User Roles

**Student**
- Browse and purchase courses
- Access enrolled courses
- Track learning progress
- View certificates

**Instructor**
- Everything students can do, PLUS:
- Create and publish courses
- Add lessons and videos
- View course statistics
- Manage course content

**Admin**
- Everything instructors can do, PLUS:
- View all users
- Manage all courses
- Access platform analytics
- Monitor revenue

---

## 🎯 Common Issues & Solutions

### Issue: "Invalid login credentials"
**Solution**: You need to register first! Click "Sign Up" instead of "Sign In"

### Issue: "Email already exists"
**Solution**: This email is registered. Use the "Sign In" form instead

### Issue: Can't see Instructor Dashboard
**Solution**: Make sure you selected "Instructor" or "Admin" role during registration

### Issue: Course not showing on homepage
**Solution**: Make sure you clicked "Publish" in the Instructor Dashboard

### Issue: Payment failing
**Solution**: Use the test card: 4242 4242 4242 4242 with any future expiry

### Issue: Video not playing
**Solution**: 
- Make sure the video URL is from Vimeo or YouTube
- Use embed URLs like: `https://vimeo.com/76979871`
- Make sure the video is public

---

## 📝 Sample Test Data

### Test Accounts to Create

```
Admin:
Email: admin@test.com
Password: admin123456
Role: Admin

Instructor:
Email: instructor@test.com
Password: instructor123
Role: Instructor

Student:
Email: student@test.com
Password: student123
Role: Student
```

### Sample Course Data

```
Course 1:
Title: Complete Web Development Bootcamp
Description: Learn HTML, CSS, JavaScript, React and Node.js from scratch
Price: 49.99
Category: Programming

Course 2:
Title: UI/UX Design Masterclass
Description: Master user interface and user experience design
Price: 39.99
Category: Design

Course 3:
Title: Digital Marketing Fundamentals
Description: Learn SEO, social media, and content marketing
Price: 29.99
Category: Marketing
```

### Sample Lesson Data

```
Lesson 1:
Title: Introduction to HTML
Content: Learn the basic structure of HTML documents
Video URL: https://vimeo.com/76979871
Order: 1
Duration: 15

Lesson 2:
Title: CSS Fundamentals
Content: Style your web pages with CSS
Video URL: https://vimeo.com/76979871
Order: 2
Duration: 20

Lesson 3:
Title: JavaScript Basics
Content: Add interactivity with JavaScript
Video URL: https://vimeo.com/76979871
Order: 3
Duration: 25
```

---

## 🎨 Customization Tips

### Change Platform Name
Edit `/components/Navbar.tsx` line ~30:
```tsx
<span className="text-xl">CourseHub</span>
```

### Change Primary Color
Edit `/styles/globals.css`:
```css
:root {
  --primary: 220 90% 56%; /* Blue - change these values */
}
```

### Add More Categories
Edit `/pages/InstructorDashboard.tsx`:
```tsx
const CATEGORIES = ['Programming', 'Design', 'Business', 'Your Category'];
```

---

## 📊 Testing Checklist

- [ ] Create admin account
- [ ] Create instructor account  
- [ ] Create student account
- [ ] Create a course as instructor
- [ ] Add 3+ lessons to course
- [ ] Publish course
- [ ] View course on homepage as student
- [ ] Add course to cart
- [ ] Complete checkout with test card
- [ ] Access enrolled course
- [ ] Watch video and complete lesson
- [ ] View progress on profile
- [ ] Check instructor dashboard stats
- [ ] Check admin dashboard analytics

---

## 🆘 Need Help?

### Debug Mode

Open browser console (F12) to see detailed error messages:
- Registration errors
- Login errors
- API call errors
- Payment errors

### Common Console Messages

```
✅ "Database initialized" - Good!
✅ "Auth state changed: SIGNED_IN" - Login successful
✅ "Payment successful!" - Purchase complete
❌ "Invalid login credentials" - Need to register first
❌ "Unauthorized" - Session expired, sign in again
```

---

## 🎉 You're All Set!

Your course platform is ready to:
- ✅ Register and authenticate users
- ✅ Create and manage courses
- ✅ Process payments
- ✅ Track learning progress
- ✅ Generate revenue

**Happy teaching and learning! 📚**

---

**Pro Tip**: Bookmark this guide and keep it handy while setting up your platform!
