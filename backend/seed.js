import bcrypt from 'bcryptjs';
import { initDb, query } from './db.js';

async function ensureUser(email, name, role, password) {
  const users = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (users.length) return users[0].id;
  const hash = await bcrypt.hash(password, 10);
  const res = await query(
    'INSERT INTO users (email, name, role, password_hash, is_verified, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
    [email, name, role, hash]
  );
  return res.insertId;
}

async function ensureCourse(title, description, price, instructorId, category = 'General', difficulty = 'basic') {
  const courses = await query('SELECT id FROM courses WHERE title = ?', [title]);
  if (courses.length) return courses[0].id;
  const res = await query(
    'INSERT INTO courses (title, description, price, instructor_id, status, category, difficulty, created_at) VALUES (?, ?, ?, ?, "published", ?, ?, NOW())',
    [title, description, price, instructorId, category, difficulty]
  );
  return res.insertId;
}

async function ensureLesson(courseId, title, content, orderIndex) {
  const res = await query(
    'INSERT INTO lessons (course_id, title, content, order_index, created_at) VALUES (?, ?, ?, ?, NOW())',
    [courseId, title, content, orderIndex]
  );
  return res.insertId;
}

async function ensureEnrollment(userId, courseId) {
  const exists = await query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
  if (exists.length) return exists[0].id;
  const res = await query(
    'INSERT INTO enrollments (user_id, course_id, created_at) VALUES (?, ?, NOW())',
    [userId, courseId]
  );
  return res.insertId;
}

async function run() {
  await initDb();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'AdminPass123!';

  const adminId = await ensureUser(adminEmail, 'Admin', 'admin', adminPass);
  const instructorId = await ensureUser('instructor@example.com', 'Instructor One', 'instructor', 'Instructor123!');
  const studentId = await ensureUser('student@example.com', 'Student One', 'student', 'Student123!');

  const course1Id = await ensureCourse('Cloud Foundations', 'Intro to Cloud', 999, instructorId, 'Cloud', 'basic');
  const course2Id = await ensureCourse('Network Security Basics', 'Security essentials', 799, instructorId, 'Networking', 'intermediate');
  const course3Id = await ensureCourse('Data Visualization', 'Charts and dashboards', 699, instructorId, 'Data Analytics & AI', 'advanced');

  await ensureLesson(course1Id, 'Welcome', 'Welcome to the course', 1);
  await ensureLesson(course1Id, 'Cloud Models', 'IaaS/PaaS/SaaS', 2);
  await ensureLesson(course1Id, 'Best Practices', 'Security and cost', 3);

  await ensureEnrollment(studentId, course1Id);
  await ensureEnrollment(studentId, course2Id);

  console.log('Seed completed:', { adminId, instructorId, studentId, course1Id, course2Id, course3Id });
}

run().catch((e) => {
  console.error('Seed error', e);
  process.exit(1);
});
