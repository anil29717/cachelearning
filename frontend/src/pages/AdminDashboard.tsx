import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Course, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, CheckCircle, XCircle, Clock, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card';
import AdminPaymentManager from '../components/AdminPaymentManager';
import { io } from 'socket.io-client';
import AdminPurchaseStream from '../components/AdminPurchaseStream';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import type { Blog } from '../types';

interface Stats {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_orders: number;
  total_revenue: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const updateJobApplicationStatus = async (id: number, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await apiClient.updateJobApplicationStatus(id, status);
      toast.success('Job application status updated');
      setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error('Update job application status error:', err);
      toast.error('Failed to update job application');
    }
  };
  const [userSummaries, setUserSummaries] = useState<Record<number, any>>({});
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [tab, setTab] = useState<'users'|'courses'|'analytics'|'payments'|'applications'|'blog'>('users');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogStatus, setBlogStatus] = useState<'draft'|'published'>('draft');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);

  const handleToggleCourseStatus = async (courseId: number, currentStatus: string) => {
    try {
      const next = currentStatus === 'published' ? 'draft' : 'published';
      await apiClient.updateCourse(courseId, { status: next });
      toast.success(`Course ${next === 'published' ? 'published' : 'unpublished'}`);
      // Refresh courses list
      const { courses: updated } = await apiClient.getCourses();
      setCourses(updated);
    } catch (error) {
      console.error('Admin toggle course status error:', error);
      toast.error('Failed to update course status');
    }
  };

  const fetchUserSummary = async (id: number) => {
    try {
      if (userSummaries[id]) return;
      const { summary } = await apiClient.getUserSummary(id);
      setUserSummaries((prev) => ({ ...prev, [id]: summary }));
    } catch (err) {
      console.error('Load user summary error:', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const ok = window.confirm(`Delete user "${target.name}" (${target.role})?`);
    if (!ok) return;
    try {
      setDeletingUserId(id);
      const res = await apiClient.deleteUser(id);
      if (res && res.success) {
        toast.success('User deleted');
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error('Failed to delete user');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      const msg = err?.code === 'LAST_ADMIN'
        ? 'Cannot delete the last remaining admin'
        : err?.code === 'SELF_DELETE'
        ? 'You cannot delete yourself'
        : err?.message || 'Failed to delete user';
      toast.error(msg);
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    loadDashboardData();
    // Real-time connection
    const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendBase, {
      transports: ['websocket'],
      reconnection: true,
    });
    let pollInterval: any = null;
    socket.on('connect', () => {
      // noop
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    });
    socket.on('payment_captured', async () => {
      try {
        toast.success('Payment captured');
        const statsResult = await apiClient.getAdminStats();
        setStats(statsResult.stats);
      } catch {}
    });
    socket.on('enrollment_created', async () => {
      try {
        toast.info('New enrollment');
        const statsResult = await apiClient.getAdminStats();
        setStats(statsResult.stats);
      } catch {}
    });
    socket.on('disconnect', () => {
      if (!pollInterval) {
        pollInterval = setInterval(async () => {
          try {
            const statsResult = await apiClient.getAdminStats();
            setStats(statsResult.stats);
          } catch {}
        }, 20000);
      }
    });
    return () => {
      socket.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [statsResult, usersResult, coursesResult, applicationsResult, jobApplicationsResult, blogsResult] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getUsers(),
        apiClient.getCourses(),
        apiClient.getInstructorApplications(),
        apiClient.getJobApplications(),
        apiClient.getBlogs(),
      ]);

      setStats(statsResult.stats);
      setUsers(usersResult.users);
      setCourses(coursesResult.courses);
      setApplications(applicationsResult.applications || []);
      setJobApplications(jobApplicationsResult.applications || []);
      setBlogs(blogsResult.blogs || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogTitle('');
    setBlogCategory('');
    setBlogStatus('draft');
    setBlogContent('');
    setBlogImageFile(null);
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl: string | undefined = undefined;
      if (blogImageFile) {
        const formData = new FormData();
        formData.append('file', blogImageFile);
        const { url } = await apiClient.uploadFile(formData);
        const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        imageUrl = `${backendBase}${url}`;
      }
      const { blog } = await apiClient.createBlog({
        title: blogTitle,
        category: blogCategory,
        status: blogStatus,
        content: blogContent || undefined,
        featured_image_url: imageUrl,
      });
      toast.success('Blog created');
      setBlogs((prev) => [blog, ...prev]);
      resetBlogForm();
    } catch (err) {
      console.error('Create blog error:', err);
      toast.error('Failed to create blog');
    }
  };

  const handleToggleBlogStatus = async (id: number, current: 'draft'|'published') => {
    try {
      const next = current === 'published' ? 'draft' : 'published';
      const { blog } = await apiClient.updateBlog(id, { status: next });
      setBlogs((prev) => prev.map((b) => b.id === id ? blog : b));
      toast.success(next === 'published' ? 'Blog published' : 'Blog moved to draft');
    } catch (err) {
      console.error('Update blog status error:', err);
      toast.error('Failed to update blog');
    }
  };

  const handleDeleteBlog = async (id: number) => {
    const ok = window.confirm('Delete this blog post?');
    if (!ok) return;
    try {
      const res = await apiClient.deleteBlog(id);
      if (res?.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        toast.success('Blog deleted');
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (err) {
      console.error('Delete blog error:', err);
      toast.error('Failed to delete blog');
    }
  };

  const updateApplicationStatus = async (id: number, status: 'pending' | 'approved' | 'rejected' | 'verified') => {
    try {
      await apiClient.updateInstructorApplicationStatus(id, status);
      toast.success('Application status updated');
      // Update local state
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (status === 'approved') {
        // Refresh users and navigate to Users tab
        try {
          const res = await apiClient.getUsers();
          setUsers(res.users);
        } catch {}
        setTab('users');
      }
    } catch (err) {
      console.error('Update application status error:', err);
      toast.error('Failed to update status');
    }
  };

  const sendVerification = async (id: number) => {
    try {
      const res = await apiClient.sendApplicationVerificationEmail(id);
      if (res?.success) {
        toast.success('Verification email sent');
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (err: any) {
      console.error('Send verification email error:', err);
      const msg = err?.code === 'USER_NOT_FOUND'
        ? 'No user account found for this email'
        : err?.message || 'Failed to send verification email';
      toast.error(msg);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and management</p>
          </div>
          <button
            onClick={() => navigate('/debug/config')}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Check Configuration
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl">{stats?.total_users || 0}</p>
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                  <p className="text-2xl">{stats?.total_courses || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrollments</p>
                  <p className="text-2xl">{stats?.total_enrollments || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl">{stats?.total_orders || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl">₹{stats?.total_revenue.toFixed(2) || '0.00'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'users'|'courses'|'analytics'|'payments'|'applications'|'blog')} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage all users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span
                                className="cursor-help underline decoration-dotted"
                                onMouseEnter={() => fetchUserSummary(u.id)}
                              >
                                {u.name}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="space-y-2">
                                <div className="font-medium">{u.name}</div>
                                <div className="text-sm text-gray-600">{u.email}</div>
                                <div className="text-sm">Role: {u.role}</div>
                                <div className="text-sm">Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                                {userSummaries[u.id] ? (
                                  u.role === 'instructor' ? (
                                    <div className="mt-2 text-sm">
                                      <div>Courses: {userSummaries[u.id].courses_count}</div>
                                      <div>Students: {userSummaries[u.id].students_count}</div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-sm">
                                      <div>Enrollments: {userSummaries[u.id].enrollments_count}</div>
                                      <div>Completed lessons: {userSummaries[u.id].completed_lessons}</div>
                                    </div>
                                  )
                                ) : (
                                  <div className="mt-2 text-sm text-gray-500">Loading details…</div>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'default'
                                : u.role === 'instructor'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className={`px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 ${deletingUserId === u.id || (user && u.id === user.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={deletingUserId === u.id || (user && u.id === user.id)}
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>
                  All courses on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-16 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div>{course.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {course.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.instructor_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.category}</Badge>
                        </TableCell>
                        <TableCell>₹{course.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === 'published' ? 'default' : 'outline'
                            }
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleCourseStatus(course.id, course.status)}
                            className={`px-3 py-1 rounded text-sm ${
                              course.status === 'published'
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {course.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                        </TableCell>
                        <TableCell>
                          {new Date(course.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded"></div>
                        <span>Students</span>
                      </div>
                      <span>
                        {users.filter((u) => u.role === 'student').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                        <span>Instructors</span>
                      </div>
                      <span>
                        {users.filter((u) => u.role === 'instructor').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Admins</span>
                      </div>
                      <span>
                        {users.filter((u) => u.role === 'admin').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                        <span>Published</span>
                      </div>
                      <span>
                        {courses.filter((c) => c.status === 'published').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-600 rounded"></div>
                        <span>Draft</span>
                      </div>
                      <span>
                        {courses.filter((c) => c.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="text-2xl">
                        ₹{stats?.total_revenue.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="text-xl">
                        ₹
                        {stats && stats.total_orders > 0
                          ? (stats.total_revenue / stats.total_orders).toFixed(2)
                          : '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Enrollments</span>
                      <span className="text-2xl">
                        {stats?.total_enrollments || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Enrollments/Course</span>
                      <span className="text-xl">
                        {stats && stats.total_courses > 0
                          ? (stats.total_enrollments / stats.total_courses).toFixed(1)
                          : '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-6">
              <AdminPurchaseStream />
              <AdminPaymentManager />
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Instructor Applications</CardTitle>
                <CardDescription>Review and update verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Expertise</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Portfolio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.expertise}</TableCell>
                        <TableCell>{app.experience_years} yrs</TableCell>
                        <TableCell>
                          {app.portfolio_url ? (
                            <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Link</a>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : app.status === 'verified' ? 'secondary' : 'outline'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'approved')}
                              className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" /> Approve
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'rejected')}
                              className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                            <button
                              onClick={() => sendVerification(app.id)}
                              className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            >
                              <Clock className="h-4 w-4" /> Verify Email
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>Applicants for hiring opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.role_applied}</TableCell>
                        <TableCell>
                          <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">Resume</a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateJobApplicationStatus(app.id, 'approved')}
                              className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" /> Approve
                            </button>
                            <button
                              onClick={() => updateJobApplicationStatus(app.id, 'rejected')}
                              className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Create Blog Post</CardTitle>
                  <CardDescription>Only Admins and Instructors can create</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBlog} className="space-y-4">
                    <div>
                      <Label htmlFor="blog-title">Title *</Label>
                      <Input id="blog-title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="blog-category">Category *</Label>
                      <Input id="blog-category" value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} placeholder="e.g., AI, Cloud" required />
                    </div>
                    <div>
                      <Label htmlFor="blog-status">Status *</Label>
                      <Select value={blogStatus} onValueChange={(v) => setBlogStatus(v as 'draft'|'published')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="blog-content">Content</Label>
                      <Textarea id="blog-content" value={blogContent} onChange={(e) => setBlogContent(e.target.value)} rows={4} placeholder="Optional brief content" />
                    </div>
                    <div>
                      <Label htmlFor="blog-image">Featured Image</Label>
                      <Input id="blog-image" type="file" accept="image/*" onChange={(e) => setBlogImageFile((e.target as HTMLInputElement).files?.[0] || null)} />
                      {blogImageFile && <p className="text-xs text-gray-600 mt-2">Selected: {blogImageFile.name}</p>}
                    </div>
                    <Button type="submit" className="w-full">Create</Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>All Blog Posts</CardTitle>
                  <CardDescription>Manage visibility and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>{b.title}</TableCell>
                          <TableCell>{b.author_name || 'Unknown'}</TableCell>
                          <TableCell><Badge variant="secondary">{b.category}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={b.status === 'published' ? 'default' : 'outline'}>{b.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {b.featured_image_url ? (
                              <img src={b.featured_image_url} alt={b.title} className="w-16 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleBlogStatus(b.id, b.status)}
                                className={`px-3 py-1 rounded text-sm ${b.status === 'published' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                              >
                                {b.status === 'published' ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                                title="Delete blog"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
