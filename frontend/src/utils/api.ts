import { Course, Lesson, Enrollment, Blog } from '../types';

// Resolve API base from env; default to local Express server on port 5000
const ENV_BACKEND = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const USE_PROXY = typeof window !== 'undefined';
const API_BASE_URL = ENV_BACKEND ? `${ENV_BACKEND}/api` : (USE_PROXY ? '/api' : 'http://localhost:5000/api');

export class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    // Initialize with persisted token if available
    if (typeof window !== 'undefined') {
      this.accessToken = window.localStorage.getItem('auth_token');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const baseHeaders: HeadersInit = {
      ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      ...options.headers,
    };
    const headers: HeadersInit = isFormData
      ? baseHeaders
      : { 'Content-Type': 'application/json', ...baseHeaders };

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (e: any) {
      const err: any = new Error('Network error: failed to reach backend');
      err.cause = e?.message || e;
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`API Error at ${endpoint}:`, error);
      
      // Create error object with code if available
      const errorObj: any = new Error(error.error || 'API request failed');
      if (error.code) {
        errorObj.code = error.code;
      }
      throw errorObj;
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string, role: string = 'student') {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // User
  async getProfile() {
    return this.request<{ profile: any }>('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request<{ profile: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Courses
  async getCourses(params?: { status?: string; category?: string; instructor_id?: string; difficulty?: 'basic' | 'intermediate' | 'advanced' }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/courses${queryParams ? `?${queryParams}` : ''}`;
    return this.request<{ courses: Course[] }>(endpoint);
  }

  async getCourse(id: number | string) {
    return this.request<{ course: Course; lessons: Lesson[] }>(`/courses/${String(id)}`);
  }

  async createCourse(data: Partial<Course>) {
    return this.request<{ course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: Partial<Course>) {
    return this.request<{ course: Course }>(`/courses/${String(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Lessons
  async createLesson(courseId: number, data: Partial<Lesson>) {
    return this.request<{ lesson: Lesson }>(`/courses/${String(courseId)}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Enrollments
  async enroll(courseId: number, orderId?: string) {
    return this.request<{ enrollment: Enrollment }>('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, order_id: orderId }),
    });
  }

  async getEnrollments() {
    return this.request<{ enrollments: Enrollment[] }>('/enrollments');
  }

  // Progress
  async updateProgress(courseId: number, lessonId: number, completed: boolean) {
    return this.request<{ progress: number }>('/progress', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, completed }),
    });
  }

  async getCourseProgress(courseId: number | string) {
    return this.request<{ completedLessonIds: number[] }>(`/progress/${String(courseId)}`);
  }

  // Blogs
  async getBlogs(params?: { status?: 'published' | 'draft'; category?: string; author_id?: string }) {
    const queryParams = new URLSearchParams(params as any).toString();
    const endpoint = `/blogs${queryParams ? `?${queryParams}` : ''}`;
    return this.request<{ blogs: Blog[] }>(endpoint);
  }

  async getBlog(id: number | string) {
    return this.request<{ blog: Blog }>(`/blogs/${String(id)}`);
  }

  async createBlog(data: { title: string; content?: string; featured_image_url?: string; category: string; status: 'draft' | 'published' }) {
    return this.request<{ blog: Blog }>('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlog(id: number, data: Partial<{ title: string; content: string; featured_image_url: string; category: string; status: 'draft' | 'published' }>) {
    return this.request<{ blog: Blog }>(`/blogs/${String(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBlog(id: number) {
    return this.request<{ success: boolean }>(`/blogs/${String(id)}`, {
      method: 'DELETE',
    });
  }

  async likeBlog(id: number | string) {
    return this.request<{ success: boolean; liked: boolean; like_count: number }>(`/blogs/${String(id)}/like`, {
      method: 'POST',
    });
  }

  // Admin
  async getUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  async getAdminStats() {
    return this.request<{ stats: any }>('/admin/stats');
  }

  async deleteUser(id: number | string) {
    return this.request<{ success: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserSummary(id: number | string) {
    return this.request<{ summary: any }>(`/admin/users/${id}/summary`);
  }

  async initDatabase() {
    return this.request<{ message: string }>('/init-db', {
      method: 'POST',
    });
  }

  async uploadFile(formData: FormData) {
    return this.request<{ filename: string; url: string }>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Applications
  async submitInstructorApplication(data: {
    name: string;
    email: string;
    expertise: string;
    experience_years: number;
    portfolio_url?: string | null;
    bio?: string;
  }) {
    return this.request<{ applicationId: number }>('/applications/instructor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInstructorApplications() {
    return this.request<{ applications: any[] }>('/applications/instructor');
  }

  async updateInstructorApplicationStatus(id: number | string, status: 'pending' | 'approved' | 'rejected' | 'verified') {
    return this.request<{ success: boolean }>(`/applications/instructor/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async sendApplicationVerificationEmail(id: number | string) {
    return this.request<{ success: boolean }>(`/applications/instructor/${id}/verify-email`, {
      method: 'POST',
    });
  }

  async submitJobApplication(data: {
    name: string;
    email: string;
    role_applied: string;
    resume_url: string;
    cover_letter?: string;
  }) {
    return this.request<{ applicationId: number }>('/applications/hiring', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobApplications() {
    return this.request<{ applications: any[] }>('/applications/hiring');
  }

  async updateJobApplicationStatus(id: number | string, status: 'pending' | 'approved' | 'rejected') {
    return this.request<{ success: boolean }>(`/applications/hiring/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async sendContactMessage(data: { name: string; email: string; subject?: string; message: string }) {
    return this.request<{ success: boolean }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Student Stories
  async getStudentStories(params?: { status?: string; limit?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/student-stories${queryParams ? `?${queryParams}` : ''}`);
  }

  async getMyStudentStory() {
    return this.request<any>('/student-stories/my-story');
  }

  async updateMyStudentStory(data: any) {
    return this.request<{ message: string }>('/student-stories', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createStudentStory(data: any) {
    return this.request<{ message: string; id: number }>('/student-stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudentStoryStatus(id: number | string, status: string) {
    return this.request<{ message: string }>(`/student-stories/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateStudentStory(id: number | string, data: any) {
    return this.request<{ message: string }>(`/student-stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Gamification
  async earnXp(action: 'video_watch' | 'lesson_complete' | 'quiz_pass' | 'daily_activity' | 'course_complete', referenceId?: string) {
    return this.request<{ earned: boolean; xpAdded: number; totalXp: number; level: number; levelUp: boolean; streak: number; badges: string[] }>('/gamification/earn-xp', {
      method: 'POST',
      body: JSON.stringify({ action, referenceId }),
    });
  }

  async getGamificationProfile() {
    return this.request<{ stats: any; badges: any[]; rank: number; nextLevelXp: number }>('/gamification/me');
  }

  async getLeaderboard() {
    return this.request<{ leaderboard: any[] }>('/gamification/leaderboard');
  }
}

export const apiClient = new ApiClient();
