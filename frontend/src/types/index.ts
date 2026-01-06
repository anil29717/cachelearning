export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  instructor_name?: string;
  status: 'draft' | 'published';
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string;
  order: number;
  duration?: number;
  created_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  order_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  amount: number;
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  course_ids: number[];
  currency: string;
  payment_method?: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'paylater' | string;
  payment_email?: string;
  payment_contact?: string;
  bank_name?: string;
  wallet_name?: string;
  upi_id?: string;
  card_network?: string;
  card_last4?: string;
  invoice_id?: string;
  refund_id?: string;
  refund_amount?: number;
  refund_status?: string;
  failure_reason?: string;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  refunded_at?: string;
}

export interface Payment {
  payment_id: string;
  order_id: number | string;
  razorpay_order_id: string;
  user_id: number;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method: string;
  email?: string;
  contact?: string;
  created_at: string;
}

export interface Refund {
  refund_id: string;
  order_id: number | string;
  payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  reason?: string;
  processed_by?: string;
  created_at: string;
}

export interface CartItem {
  course: Course;
  quantity: number;
}

export interface LessonProgress {
  user_id: number;
  lesson_id: number;
  course_id: number;
  completed: boolean;
  completed_at?: string;
}

export interface Blog {
  id: number;
  title: string;
  content?: string;
  featured_image_url?: string;
  author_id: number;
  author_name?: string;
  category: string;
  status: 'draft' | 'published';
  like_count?: number;
  is_liked?: boolean;
  created_at: string;
  updated_at?: string;
}
