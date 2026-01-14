import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Course, Lesson, LessonProgress } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { ChevronLeft, CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function CoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [videoXpEarned, setVideoXpEarned] = useState(false);

  useEffect(() => {
    loadCourse();
    checkEnrollment();
    loadProgress();
    
    // Daily Activity XP
    const trackDailyActivity = async () => {
       try {
         const today = new Date().toISOString().split('T')[0];
         const result = await apiClient.earnXp('daily_activity', today);
         if (result.earned) {
             toast.success(`+${result.xpAdded} XP: Daily Activity! 🔥`, {
                 className: 'bg-orange-50 border-orange-200 text-orange-800'
             });
         }
       } catch (err) {
         // Ignore if already earned or error
       }
    };
    if (user) trackDailyActivity();
  }, [id, user]);

  useEffect(() => {
    // Reset video XP state when lesson changes
    setVideoXpEarned(false);
  }, [currentLesson]);

  const loadProgress = async () => {
    if (!id || !user) return;
    try {
      const { completedLessonIds } = await apiClient.getCourseProgress(id);
      setCompletedLessons(new Set(completedLessonIds));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const loadCourse = async () => {
    try {
      if (!id) return;
      const { course, lessons } = await apiClient.getCourse(id);
      setCourse(course);
      setLessons(lessons);
      if (lessons.length > 0) {
        setCurrentLesson(lessons[0]);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      const { enrollments } = await apiClient.getEnrollments();
      const enrollment = enrollments.find(e => String(e.course_id) === id);
      
      if (!enrollment) {
        toast.error('You are not enrolled in this course');
        navigate(`/course/${id}`);
        return;
      }
      
      setIsEnrolled(true);
      setCourseProgress(enrollment.progress);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !id) return;

    try {
      const { progress } = await apiClient.updateProgress(Number(id), currentLesson.id, true);
      setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
      setCourseProgress(progress);
      toast.success('Lesson marked as complete');

      // Gamification: Earn XP
      try {
        const xpResult = await apiClient.earnXp('lesson_complete', `lesson_${currentLesson.id}`);
        if (xpResult.earned) {
          toast.success(`+${xpResult.xpAdded} XP!`, {
             description: 'Lesson Completed',
             className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
          });
          
          if (xpResult.levelUp) {
            toast.success(`LEVEL UP! You reached Level ${xpResult.level}! 🚀`, {
                duration: 5000,
                className: 'bg-purple-100 border-purple-200 text-purple-800 font-bold'
            });
          }
        }
      } catch (err) {
        console.error('XP Error', err);
      }

      // Move to next lesson
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      } else {
        toast.success('Congratulations! You completed the course!');
        // Gamification: Course Complete
        try {
            const xpResult = await apiClient.earnXp('course_complete', `course_${id}`);
            if (xpResult.earned) {
                toast.success(`+${xpResult.xpAdded} XP!`, {
                    description: 'Course Completed! Badge Unlocked?',
                    className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
                });
            }
        } catch (err) {
            console.error('Course XP Error', err);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleVideoProgress = async (currentTime: number, duration: number) => {
     if (!videoXpEarned && duration > 0 && (currentTime / duration) >= 0.9) {
        setVideoXpEarned(true);
        try {
            const xpResult = await apiClient.earnXp('video_watch', `video_${currentLesson?.id}`);
            if (xpResult.earned) {
                toast.success(`+${xpResult.xpAdded} XP: Video Watched! 🎥`, {
                    className: 'bg-blue-50 border-blue-200 text-blue-800'
                });
            }
        } catch (err) {
            console.error('Video XP Error', err);
        }
     }
  };

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

  if (!course || !isEnrolled) {
    return null;
  }

  const currentLessonIndex = currentLesson ? lessons.findIndex(l => l.id === currentLesson.id) : -1;
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isLessonComplete = currentLesson ? completedLessons.has(currentLesson.id) : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/course/${id}`)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Course
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h2 className="text-lg">{course.title}</h2>
                <p className="text-sm text-gray-500">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Course Progress</p>
                <p>{Math.round(courseProgress)}%</p>
              </div>
              <Progress value={courseProgress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {currentLesson && (
                  <VideoPlayer
                    url={currentLesson.video_url}
                    title={currentLesson.title}
                    posterUrl={course.thumbnail_url}
                    onProgress={handleVideoProgress}
                  />
                )}
              </CardContent>
            </Card>

            {currentLesson && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="mb-2">{currentLesson.title}</h1>
                      {currentLesson.duration && (
                        <p className="text-gray-500">Duration: {currentLesson.duration} minutes</p>
                      )}
                    </div>
                    {isLessonComplete ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <Button onClick={handleLessonComplete}>
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="mb-3">About this lesson</h3>
                    <p className="text-gray-600">{currentLesson.content}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lesson List */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <h3 className="mb-4">Course Content</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isComplete = completedLessons.has(lesson.id);
                    const isCurrent = currentLesson?.id === lesson.id;
                    const isLocked = index > 0 && !completedLessons.has(lessons[index - 1].id);

                    return (
                      <button
                        key={lesson.id}
                        disabled={isLocked}
                        onClick={() => !isLocked && handleLessonSelect(lesson)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : isLocked
                              ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : isComplete ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isCurrent ? (
                              <PlayCircle className="h-5 w-5 text-blue-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm">
                                {index + 1}. {lesson.title}
                              </p>
                              {lesson.duration && (
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {lesson.duration}m
                                </span>
                              )}
                            </div>
                            {isLocked && (
                               <p className="text-xs text-red-500 mt-1">Complete previous lesson to unlock</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {courseProgress === 100 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Course Completed!</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Congratulations on completing this course!
                    </p>
                    <Button className="w-full mt-3" variant="outline">
                      Download Certificate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
