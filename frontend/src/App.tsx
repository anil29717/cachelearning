import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ConfigDebugPage } from './pages/ConfigDebugPage';
import BecomeInstructorPage from './pages/BecomeInstructorPage';
import HiringOpportunitiesPage from './pages/HiringOpportunitiesPage';
import { CareersPage } from './pages/CareersPage';
import TestimonialsPage from './pages/TestimonialsPage';
import ContactPage from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import { AboutPage } from './pages/AboutPage';
import { Footer } from './components/Footer';
import { CourseListingPage } from './pages/CourseListingPage';

import { Toaster } from './components/ui/sonner';
// Payment gateway removed: SetupRequiredBanner and ConfigDebugPage no longer used
import { apiClient } from './utils/api';

import LandingPage from './components/Landingpage';

// import ChatbotEmbed from './components/embeddedchat';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    // Startup message
    console.log(
      '%cðŸŽ“ CourseHub LMS ',
      'background: linear-gradient(90deg, #3b82f6, #8b5cf6); color: white; padding: 10px 20px; font-size: 16px; border-radius: 8px; font-weight: bold;'
    );
    // Payments enabled

    // Initialize database on app load
    const initDb = async () => {
      try {
        await apiClient.initDatabase();
        console.log('âœ… Database initialized');
      } catch (error) {
        console.error('âŒ Database initialization error:', error);
      }
    };
    initDb();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100">
            <Navbar />
      {/* <ChatbotEmbed  /> */}
      
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/landing" element={<LandingPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              <Route path="/learn/:id" element={<CoursePlayerPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/debug/config" element={<ConfigDebugPage />} />
              <Route path="/become-instructor" element={<BecomeInstructorPage />} />
              <Route path="/hiring" element={<HiringOpportunitiesPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              
              <Route path="/courses" element={<CourseListingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
