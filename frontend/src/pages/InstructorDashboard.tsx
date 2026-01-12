import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Course } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Eye, BookOpen, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { Blog } from '../types';

const CATEGORIES = ['Cloud', 'Cyber Security', 'Networking', 'Data Analytics & AI'];

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  // Removed unused showLessonDialog state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [tab, setTab] = useState<'courses'|'blog'>('courses');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogStatus, setBlogStatus] = useState<'draft'|'published'>('draft');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  
  // Course form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Lesson form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonDuration, setLessonDuration] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'instructor') {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    loadCourses();
    loadBlogs();
  }, [user]);

  const loadCourses = async () => {
    try {
      const { courses } = await apiClient.getCourses();
      // Filter to show only instructor's courses
      const myCourses = courses.filter(c => c.instructor_id === user?.id);
      setCourses(myCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload thumbnail image locally if provided
      let uploadedThumbnailUrl: string | undefined = undefined;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        const { url } = await apiClient.uploadFile(formData);
        const envMeta = import.meta as unknown as { env?: { VITE_BACKEND_URL?: string } };
        const backendBase = envMeta?.env?.VITE_BACKEND_URL || 'http://localhost:5000';
        uploadedThumbnailUrl = `${backendBase}${url}`;
      }

      // TODO: Cloud upload snippet (AWS S3 / GCP) for future use
      // If you later add backend routes like /api/media/upload-s3 or /api/media/upload-gcs,
      // you can swap the above local upload with something like:
      // const formData = new FormData();
      // formData.append('file', thumbnailFile);
      // const { url } = await apiClient.request<{ url: string }>("/media/upload-s3", { method: "POST", body: formData });
      // uploadedThumbnailUrl = url; // ensure this is a fully-qualified URL
      
      await apiClient.createCourse({
        title,
        description,
        price: parseFloat(price),
        // Publish by default so new courses appear on Home
        status: 'published',
        category,
        difficulty,
        thumbnail_url: uploadedThumbnailUrl,
      });
      
      toast.success('Course created successfully');
      setShowCreateDialog(false);
      resetCourseForm();
      loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handlePublishCourse = async (courseId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
      await apiClient.updateCourse(Number(courseId), { status: newStatus });
      toast.success(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      loadCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) return;
    
    try {
      await apiClient.createLesson(selectedCourse.id, {
        title: lessonTitle,
        content: lessonContent,
        video_url: lessonVideoUrl,
        order: parseInt(lessonOrder),
        duration: lessonDuration ? parseInt(lessonDuration) : undefined,
      });
      
      toast.success('Lesson added successfully');
      resetLessonForm();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    }
  };

  const loadBlogs = async () => {
    try {
      const { blogs } = await apiClient.getBlogs({ author_id: String(user?.id || '') });
      setBlogs(blogs || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
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
        const envMeta = import.meta as unknown as { env?: { VITE_BACKEND_URL?: string } };
        const backendBase = envMeta?.env?.VITE_BACKEND_URL || 'http://localhost:5000';
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
      if (res.success) {
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

  const resetCourseForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setThumbnailFile(null);
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonContent('');
    setLessonVideoUrl('');
    setLessonOrder('1');
    setLessonDuration('');
  };

  if (!user || user.role !== 'instructor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage your courses and content</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Complete Web Development Bootcamp"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what students will learn..."
                      rows={4}
                      required
                    />
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49.99"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'basic' | 'intermediate' | 'advanced')} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail Image (optional)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0] || null;
                        setThumbnailFile(file);
                      }}
                    />
                    {thumbnailFile && (
                      <p className="text-xs text-gray-600 mt-2">Selected: {thumbnailFile.name}</p>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'courses'|'blog')} className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                      <p className="text-2xl">{courses.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Published</p>
                      <p className="text-2xl">{courses.filter(c => c.status === 'published').length}</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Drafts</p>
                      <p className="text-2xl">{courses.filter(c => c.status === 'draft').length}</p>
                    </div>
                    <Edit className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-2xl">₹{courses.reduce((sum, c) => sum + c.price, 0).toFixed(0)}</p>
                    </div>
                    <div className="h-8 w-8 text-purple-600">💰</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Manage and edit your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading courses...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-6">Create your first course to get started</p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
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
                            <Badge variant="secondary">{course.category}</Badge>
                          </TableCell>
                          <TableCell>₹{course.price}</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'published' ? 'default' : 'outline'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(course.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedCourse(course)}
                                  >
                                    <Video className="h-4 w-4 mr-1" />
                                    Add Lesson
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Lesson to {course.title}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleAddLesson}>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="lesson-title">Lesson Title *</Label>
                                        <Input
                                          id="lesson-title"
                                          value={lessonTitle}
                                          onChange={(e) => setLessonTitle(e.target.value)}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="lesson-content">Content *</Label>
                                        <Textarea
                                          id="lesson-content"
                                          value={lessonContent}
                                          onChange={(e) => setLessonContent(e.target.value)}
                                          rows={3}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="video-url">Vimeo Video URL *</Label>
                                        <Input
                                          id="video-url"
                                          value={lessonVideoUrl}
                                          onChange={(e) => setLessonVideoUrl(e.target.value)}
                                          placeholder="https://vimeo.com/..."
                                          required
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="order">Order *</Label>
                                          <Input
                                            id="order"
                                            type="number"
                                            value={lessonOrder}
                                            onChange={(e) => setLessonOrder(e.target.value)}
                                            required
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="duration">Duration (min)</Label>
                                          <Input
                                            id="duration"
                                            type="number"
                                            value={lessonDuration}
                                            onChange={(e) => setLessonDuration(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter className="mt-6">
                                      <Button type="submit">Add Lesson</Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant={course.status === 'draft' ? 'default' : 'outline'}
                                onClick={() => handlePublishCourse(course.id, course.status)}
                              >
                                {course.status === 'draft' ? 'Publish' : 'Unpublish'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/course/${course.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Create Blog Post</CardTitle>
                  <CardDescription>Share updates and insights</CardDescription>
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
                    </div>
                    <Button type="submit" className="w-full">Create</Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>My Blog Posts</CardTitle>
                  <CardDescription>Manage visibility and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>{b.title}</TableCell>
                          <TableCell><Badge variant="secondary">{b.category}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={b.status === 'published' ? 'default' : 'outline'}>{b.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={b.status === 'published' ? 'outline' : 'default'}
                                onClick={() => handleToggleBlogStatus(b.id, b.status)}
                              >
                                {b.status === 'published' ? 'Unpublish' : 'Publish'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBlog(b.id)}
                              >
                                Delete
                              </Button>
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
