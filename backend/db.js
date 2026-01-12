import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const required = (name) => {
  const val = process.env[name];
  if (!val || String(val).trim() === '') {
    throw new Error(`${name} must be set in environment`);
  }
  return val;
};

const pool = mysql.createPool({
  host: required('DB_HOST'),
  port: Number(required('DB_PORT')),
  user: required('DB_USER'),
  password: (() => {
    const pwd = process.env.DB_PASSWORD;
    const env = process.env.NODE_ENV || 'development';
    if (!pwd || String(pwd).trim() === '') {
      if (env === 'production') {
        throw new Error('DB_PASSWORD must be set in environment');
      }
      return '';
    }
    return pwd;
  })(),
  database: required('DB_NAME'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

export async function initDb() {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'student',
      avatar_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  await pool.query(createUsers);

  // Ensure verification flag exists on users (ignore error if already added)
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0;`);
  } catch (e) {
    // Older MySQL may not support IF NOT EXISTS; attempt without it and ignore duplicate errors
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0;`);
    } catch (_) {}
  }

  const createCourses = `
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      instructor_id INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      category VARCHAR(100) NOT NULL DEFAULT 'general',
      thumbnail_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createCourses);

  // Ensure difficulty column exists on courses (idempotent)
  try {
    await pool.query(
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'basic';`
    );
  } catch (e) {
    try {
      await pool.query(
        `ALTER TABLE courses ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'basic';`
      );
    } catch (_) {}
  }

  const createLessons = `
    CREATE TABLE IF NOT EXISTS lessons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      video_url VARCHAR(255),
      ` +
      // order is reserved word; use lesson_order
      `lesson_order INT DEFAULT 1,
      duration INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createLessons);

  const createEnrollments = `
    CREATE TABLE IF NOT EXISTS enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      order_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_course (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createEnrollments);

  const createProgress = `
    CREATE TABLE IF NOT EXISTS progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      lesson_id INT NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_lesson (user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createProgress);

  const createEmailVerification = `
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(128) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_token (token),
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createEmailVerification);
  
  const createPayments = `
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100) NOT NULL,
      amount INT NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      status VARCHAR(20) NOT NULL DEFAULT 'created',
      refund_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createPayments);

  // Add indexes/columns if missing (idempotent attempts)
  try { await pool.query('ALTER TABLE payments ADD COLUMN refund_id VARCHAR(100)'); } catch (_) {}
  try { await pool.query('ALTER TABLE payments ADD UNIQUE KEY uniq_order_id (order_id)'); } catch (_) {}
  try { await pool.query('ALTER TABLE payments ADD UNIQUE KEY uniq_payment_id (razorpay_payment_id)'); } catch (_) {}
  try { await pool.query('ALTER TABLE payments ADD INDEX idx_user_id (user_id)'); } catch (_) {}
  try { await pool.query('ALTER TABLE payments ADD INDEX idx_created_at (created_at)'); } catch (_) {}
  
  const createInstructorApplications = `
    CREATE TABLE IF NOT EXISTS instructor_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      expertise VARCHAR(255) NOT NULL,
      experience_years INT NOT NULL,
      portfolio_url VARCHAR(255),
      bio TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  await pool.query(createInstructorApplications);

  const createJobApplications = `
    CREATE TABLE IF NOT EXISTS job_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role_applied VARCHAR(255) NOT NULL,
      resume_url VARCHAR(255) NOT NULL,
      cover_letter TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  await pool.query(createJobApplications);

  const createCourseViews = `
    CREATE TABLE IF NOT EXISTS course_views (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      user_id INT,
      session_id VARCHAR(100),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      duration_seconds INT DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createCourseViews);

  const createStudentEngagement = `
    CREATE TABLE IF NOT EXISTS student_engagement (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completion_percentage DECIMAL(5,2) DEFAULT 0,
      total_time_minutes INT DEFAULT 0,
      UNIQUE KEY unique_student_course (student_id, course_id)
    ) ENGINE=InnoDB;
  `;

  await pool.query(createStudentEngagement);
  
  const createContactMessages = `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;
  await pool.query(createContactMessages);

  const createBlogs = `
    CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      featured_image_url VARCHAR(255),
      author_id INT NOT NULL,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      like_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    ) ENGINE=InnoDB;
  `;
  await pool.query(createBlogs);

  // Ensure like_count column exists (idempotent)
  try {
    await pool.query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;`);
  } catch (e) {
    try {
      await pool.query(`ALTER TABLE blogs ADD COLUMN like_count INT DEFAULT 0;`);
    } catch (_) {}
  }

  const createBlogLikes = `
    CREATE TABLE IF NOT EXISTS blog_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blog_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_blog_user (blog_id, user_id),
      FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  await pool.query(createBlogLikes);

  const createStudentStories = `
    CREATE TABLE IF NOT EXISTS student_stories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      student_name VARCHAR(255),
      profile_image VARCHAR(255),
      background VARCHAR(255),
      before_struggle TEXT,
      before_goal TEXT,
      during_course_name VARCHAR(255),
      during_duration VARCHAR(50),
      during_projects TEXT,
      during_mentor_rating INT,
      after_role VARCHAR(255),
      after_company VARCHAR(255),
      after_salary_hike VARCHAR(255),
      after_confidence INT,
      advice TEXT,
      linkedin_url VARCHAR(255),
      github_url VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  await pool.query(createStudentStories);
}

export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export default pool;