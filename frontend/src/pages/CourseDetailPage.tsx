import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Course, Lesson } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { PlayCircle, Clock, FileText, ShoppingCart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cart: items } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
    checkEnrollment();
  }, [id]);

  // Always start at top when opening a course
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  const loadCourse = async () => {
    try {
      if (!id) return;
      const { course, lessons } = await apiClient.getCourse(id);
      setCourse(course);
      setLessons(lessons);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      if (!user) return;
      const { enrollments } = await apiClient.getEnrollments();
      const enrolled = enrollments.some(e => e.course_id === Number(id));
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleAddToCart = () => {
    if (user && user.role !== 'student') {
      toast.error('Only students can purchase courses');
      return;
    }
    if (course) {
      addToCart(course);
      toast.success('Course added to cart');
    }
  };

  const handleEnroll = () => {
    if (!user) {
      toast.error('Please sign in to enroll');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can purchase courses');
      return;
    }
    navigate('/cart');
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  const inCart = items.some(item => item.course.id === Number(id));
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2>Course not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-red-400 to-red-400 text-white shadow-lg">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="mb-4 flex gap-2">
                <Badge className="bg-white/20 border border-red-200 text-white">{course.category}</Badge>
                <Badge className="bg-white/20 border border-red-200 text-white">
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">{course.title}</h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-8">{course.description}</p>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
              </div>
              <div className="flex gap-4">
                {isEnrolled ? (
                  <Button onClick={handleStartLearning} size="lg" className="bg-white text-red-600 hover:bg-red-50 border border-red-200">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Continue Learning
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleEnroll} size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      Enroll Now - ₹{course.price}
                    </Button>
                    {!inCart && (
                      <Button onClick={handleAddToCart} size="lg" className="bg-white text-red-700 hover:bg-red-50 border border-red-200">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                    )}
                    {inCart && (
                      <Button size="lg" className="bg-white text-red-600 opacity-70 border border-red-200" disabled>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        In Cart
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="rounded-xl shadow-2xl ring-1 ring-white/20 w-full"
                />
              ) : (
                <div className="bg-white/10 rounded-lg aspect-video flex items-center justify-center">
                  <PlayCircle className="h-24 w-24 text-white/70" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Course Curriculum</CardTitle>
                <CardDescription className="text-sm text-gray-600">{lessons.length} lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id}>
                      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-700">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">{lesson.title}</h3>
                          <p className="text-gray-600 leading-relaxed mb-2">{lesson.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <PlayCircle className="h-4 w-4" />
                              <span>Video</span>
                            </div>
                            {lesson.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration} min</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isEnrolled ? (
                          <PlayCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      {index < lessons.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed italic">{course.description}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4 border border-red-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                  <div className="text-2xl text-red-600">₹{course.price}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Instructor</div>
                  <div>{course.instructor_name || 'Unknown'}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <Badge className="bg-red-50 text-red-700 border border-red-100">{course.category}</Badge>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Difficulty</div>
                  <Badge className="bg-red-50 text-red-700 border border-red-100">
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-gray-900">What you'll learn</h4>
                  <ul className="space-y-2">
                    {lessons.slice(0, 5).map((lesson) => (
                      <li key={lesson.id} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
