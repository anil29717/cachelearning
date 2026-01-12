import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, refreshProfile, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const msg = await signUp(email, password, name, role);
      toast.success(msg || 'Account created. Verify your email to continue.');
      // Redirect to login after signup; user must verify first
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Better error messages based on error code or message
      if (err.code === 'EMAIL_EXISTS' || 
          err.message?.includes('already registered') || 
          err.message?.includes('already been registered') ||
          err.message?.includes('Please sign in instead')) {
        setEmailExists(true);
        setError(`An account with "${email}" already exists.`);
      } else if (err.code === 'INVALID_EMAIL' || err.message?.includes('invalid email')) {
        setEmailExists(false);
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('Password must be')) {
        setEmailExists(false);
        setError(err.message);
      } else {
        setEmailExists(false);
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Already have account reminder */}
        <Alert className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Already have an account?</strong> Use the{' '}
            <Link to="/login" className="underline hover:text-amber-700 font-semibold">
              Sign In page
            </Link>{' '}
            instead.
          </AlertDescription>
        </Alert>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-50 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Join our learning platform and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant={emailExists ? "default" : "destructive"} className={`mb-6 ${emailExists ? 'bg-blue-50 border-blue-200' : ''}`}>
                <AlertCircle className={`h-4 w-4 ${emailExists ? 'text-blue-600' : ''}`} />
                <AlertDescription className={emailExists ? 'text-blue-900' : ''}>
                  {error}
                  {emailExists && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        onClick={() => navigate('/login')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Sign In
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setError('');
                          setEmailExists(false);
                          setEmail('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Try Different Email
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500">At least 6 characters</p>
              </div>

              <div className="space-y-3">
                <Label>I want to join as</Label>
                <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="flex-1 cursor-pointer">
                      <div className="font-medium">Student</div>
                      <div className="text-sm text-gray-500">Learn from courses</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="instructor" id="instructor" />
                    <Label htmlFor="instructor" className="flex-1 cursor-pointer">
                      <div className="font-medium">Instructor</div>
                      <div className="text-sm text-gray-500">Create and sell courses</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer">
                      <div className="font-medium">Admin</div>
                      <div className="text-sm text-gray-500">Manage platform</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">
                    <strong>Get started in seconds</strong>
                  </p>
                </div>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 ml-7">
                <li>✓ Access to all courses</li>
                <li>✓ Track your learning progress</li>
                <li>✓ Get certificates on completion</li>
                {role === 'instructor' && (
                  <>
                    <li>✓ Create and sell unlimited courses</li>
                    <li>✓ Manage your students</li>
                    <li>✓ Earn revenue from your courses</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
