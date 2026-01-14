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
import { BookOpen, Award, Settings, PlayCircle, Star, PenTool, Lock, CheckCircle, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { StudentStoryForm } from '../components/StudentStoryForm';
import { GamificationStats } from '../components/gamification/GamificationStats';
import { BadgesList } from '../components/gamification/BadgesList';
import { LeaderboardWidget } from '../components/gamification/LeaderboardWidget';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut, refreshProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [myStory, setMyStory] = useState<any>(null);
  const [isEditingStory, setIsEditingStory] = useState(false);
  // Gamification State
  const [gamificationProfile, setGamificationProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name);
    setPhone((user as any).phone || '');
    loadEnrollments();
    loadMyStory();
    loadGamificationData();
  }, [user]);

  const loadGamificationData = async () => {
    try {
      const profile = await apiClient.getGamificationProfile();
      setGamificationProfile(profile);
      
      const lb = await apiClient.getLeaderboard();
      setLeaderboard(lb.leaderboard);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const loadMyStory = async () => {
    try {
      const story = await apiClient.getMyStudentStory();
      setMyStory(story);
    } catch (error) {
      // It's okay if 404
      console.log('No story found');
    }
  }

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
  const isEligibleForStory = enrollments.some(e => e.progress >= 70 || e.completed);

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

        {/* Gamification Stats Section */}
        {gamificationProfile && gamificationProfile.stats && (
          <div className="mb-6">
            <GamificationStats 
              stats={{
                total_xp: gamificationProfile.stats.total_xp,
                level: gamificationProfile.stats.level,
                current_streak: gamificationProfile.stats.current_streak
              }}
              nextLevelXp={gamificationProfile.nextLevelXp || 500}
              rank={gamificationProfile.rank || 0}
            />
          </div>
        )}

        <Tabs defaultValue="courses" className="space-y-5">
          <TabsList className="bg-red-50 border border-red-100">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="journey">My Journey</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
             <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">

                   {gamificationProfile && (
                     <BadgesList badges={gamificationProfile.badges || []} />
                   )}
                </div>
                <div>
                   <LeaderboardWidget leaderboard={leaderboard} currentUserId={user.id} />
                </div>
             </div>
          </TabsContent>

          {/* My Journey */}
          <TabsContent value="journey">
            {myStory ? (
              isEditingStory ? (
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Your Story</h3>
                    <Button variant="ghost" onClick={() => setIsEditingStory(false)}>Cancel</Button>
                  </div>
                  <StudentStoryForm 
                    initialData={myStory} 
                    onSuccess={() => {
                      loadMyStory();
                      setIsEditingStory(false);
                    }} 
                  />
                </div>
              ) : (
                <Card className="border-red-100">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className={`p-4 rounded-full ${
                        myStory.status === 'approved' ? 'bg-green-100 text-green-600' : 
                        myStory.status === 'featured' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {myStory.status === 'approved' ? <CheckCircle className="h-8 w-8" /> : 
                         myStory.status === 'featured' ? <Star className="h-8 w-8" /> : 
                         <Clock className="h-8 w-8" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Story Status: {myStory.status.toUpperCase()}</h3>
                        <p className="text-gray-600 max-w-md">
                          {myStory.status === 'pending' && "Your story has been submitted and is currently under review by our team. We'll notify you once it's approved."}
                          {myStory.status === 'approved' && "Great news! Your story has been approved. It is now visible to other students."}
                          {myStory.status === 'featured' && "Congratulations! Your story has been selected as a Featured Story and is displayed on the homepage!"}
                        </p>
                      </div>
                      {/* Preview of story content could go here */}
                      <div className="w-full max-w-2xl bg-gray-50 p-6 rounded-lg text-left mt-6 border border-gray-100">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Background</p>
                              <p className="font-medium">{myStory.background}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Transformation</p>
                              <p className="font-medium">{myStory.during_course_name}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Current Role</p>
                              <p className="font-medium">{myStory.after_role}</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-end w-full max-w-2xl mt-4">
                        <Button variant="outline" onClick={() => setIsEditingStory(true)}>
                           <Edit className="h-4 w-4 mr-2" /> Edit Story
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : isEligibleForStory ? (
              <div className="py-4">
                <StudentStoryForm onSuccess={loadMyStory} />
              </div>
            ) : (
              <Card className="border-red-100">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Unlock Your Journey</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete at least 70% of a course to unlock the ability to share your transformation story and inspire thousands of other students.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                    if (enrolledCourses.length > 0) {
                      // Redirect to the first incomplete course, or the first course if all are completed
                      const incompleteIndex = enrollments.findIndex(e => !e.completed);
                      const targetIndex = incompleteIndex >= 0 ? incompleteIndex : 0;
                      navigate(`/learn/${enrolledCourses[targetIndex].id}`);
                    } else {
                      // If no courses, go to home page to browse
                      navigate('/');
                    }
                  }}>
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

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
