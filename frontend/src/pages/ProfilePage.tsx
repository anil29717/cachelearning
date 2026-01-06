import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Course, Enrollment } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, Award, Settings, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, refreshProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name);
    setPhone((user as any).phone || '');
    loadEnrollments();
  }, [user]);

  const loadEnrollments = async () => {
    try {
      const { enrollments } = await apiClient.getEnrollments();
      setEnrollments(enrollments);

      // Load course details for each enrollment
      const coursePromises = enrollments.map(enrollment =>
        apiClient.getCourse(enrollment.course_id)
      );
      const courseResults = await Promise.all(coursePromises);
      setEnrolledCourses(courseResults.map(result => result.course));
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiClient.updateProfile({ name, phone });
      await refreshProfile();
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return null;
  }

  const completedCourses = enrollments.filter(e => e.completed).length;
  const inProgressCourses = enrollments.filter(e => !e.completed && e.progress > 0).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-10">
        <Card className="mb-6 border border-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight mb-1">{user.name}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-red-50 text-red-700 border border-red-100 capitalize">{user.role}</Badge>
                  {user.role === 'instructor' && (
                    <Button size="sm" className="bg-white text-red-700 hover:bg-red-50 border border-red-200" onClick={() => navigate('/instructor')}>
                      Instructor Dashboard
                    </Button>
                  )}
                  {user.role === 'admin' && (
                    <Button size="sm" className="bg-white text-red-700 hover:bg-red-50 border border-red-200" onClick={() => navigate('/admin')}>
                      Admin Dashboard
                    </Button>
                  )}
                </div>
              </div>
              <Button variant="outline" className="border-red-200" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="rounded-lg border border-red-100 bg-white p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-xl font-semibold">{enrollments.length}</div>
                <div className="text-xs text-gray-600">Enrolled Courses</div>
              </div>
              <div className="rounded-lg border border-red-100 bg-white p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-xl font-semibold">{inProgressCourses}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="rounded-lg border border-red-100 bg-white p-4 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-xl font-semibold">{completedCourses}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs defaultValue="courses" className="space-y-5">
          <TabsList className="bg-red-50 border border-red-100">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Courses */}
          <TabsContent value="courses">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Loading courses...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <BookOpen className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No courses yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start learning by enrolling in a course
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/')}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {enrolledCourses.map((course, index) => {
                  const enrollment = enrollments[index];
                  return (
                    <Card key={course.id} className="border border-red-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex gap-3 mb-3">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-28 h-18 object-cover rounded"
                            />
                          ) : (
                            <div className="w-28 h-18 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen className="h-7 w-7 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-base font-semibold mb-1">{course.title}</h3>
                            <Badge className="bg-red-50 text-red-700 border border-red-100">{course.category}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span>{Math.round(enrollment.progress)}%</span>
                            </div>
                            <Progress value={enrollment.progress} />
                          </div>
                          {enrollment.completed ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <Award className="h-4 w-4" />
                              <span className="text-xs">Completed</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => navigate(`/learn/${course.id}`)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Continue Learning
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">My Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                {completedCourses === 0 ? (
                  <div className="text-center py-10">
                    <Award className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No certificates yet</h3>
                    <p className="text-gray-600">
                      Complete courses to earn certificates
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map((course, index) => {
                      const enrollment = enrollments[index];
                      if (!enrollment.completed) return null;

                      return (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <Award className="h-8 w-8 text-red-600" />
                            <div>
                              <h4 className="text-sm font-semibold">{course.title}</h4>
                              <p className="text-xs text-gray-600">
                                Completed on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="border-red-200">
                            Download Certificate
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user.role}
                      disabled
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    {editMode ? (
                      <>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleUpdateProfile}>
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditMode(false);
                            setName(user.name);
                            setPhone((user as any).phone || '');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setEditMode(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
