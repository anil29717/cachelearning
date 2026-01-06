import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      setResending(true);
      setShowResend(false);
      await apiClient.resendVerification(email);
      setError('Verification email sent. Please check your inbox.');
    } catch (e: any) {
      setError(e?.message || 'Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email, password);
      // Ensure we have the latest profile
      await refreshProfile();
      const role = user?.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'instructor') {
        navigate('/instructor');
      } else {
        // Default student view
        navigate('/profile');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Better error message
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials or sign up for a new account.');
      } else if (err.code === 'EMAIL_NOT_VERIFIED' || err.message?.includes('Email not verified')) {
        setError('Please verify your email address before signing in.');
        setShowResend(true);
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If already signed in (JWT in localStorage and user loaded), redirect away from login
  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'instructor') navigate('/instructor');
      else navigate('/profile');
    }
  }, [loading, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-red-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full relative z-10">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-400 rounded-2xl blur opacity-50 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 via-red-500 to-red-400 rounded-2xl shadow-xl">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to continue your learning journey</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {showResend && (
                    <div className="mt-3">
                      <Button type="button" size="sm" onClick={handleResend} disabled={resending}>
                        {resending ? 'Sending…' : 'Resend verification email'}
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 hover:from-red-700 hover:via-red-600 hover:to-red-500 shadow-lg transform hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-red-600 hover:text-red-700 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Quick Start Guide */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm mb-3">
                <strong>🚀 First time here?</strong>
              </p>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  1. Click "Sign up" above to create an account
                </p>
                <p>
                  2. Choose your role (Student, Instructor, or Admin)
                </p>
                <p>
                  3. Start learning or creating courses!
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-xs text-red-700 mb-2">
                  <strong>💡 Pro tip:</strong> Register as an instructor to create and sell courses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
