import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

type StoryFormData = {
  // Step 1
  background: string;
  before_struggle: string;
  before_goal: string;
  // Step 2
  during_course_name: string;
  during_duration: string;
  during_projects: string; // comma separated for input, convert to array for submit
  during_mentor_rating: string;
  // Step 3
  after_role: string;
  after_company: string;
  after_salary_hike: string;
  after_confidence: string;
  advice: string;
  linkedin_url: string;
  github_url: string;
  // Extra
  student_name: string;
  profile_image: string;
};

export function StudentStoryForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, trigger, formState: { errors }, setValue } = useForm<StoryFormData>({
    defaultValues: initialData ? {
      ...initialData,
      during_projects: Array.isArray(initialData.during_projects) 
        ? initialData.during_projects.join(', ') 
        : initialData.during_projects,
      during_mentor_rating: String(initialData.during_mentor_rating),
      after_confidence: String(initialData.after_confidence)
    } : undefined
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Pre-fill user name/image if available
    apiClient.getProfile().then(res => {
      if (res.profile) {
        setUserProfile(res.profile);
        // Pre-fill profile image in form if not set and no initialData
        if (!watch('profile_image') && !initialData) {
          setValue('profile_image', res.profile.avatar_url);
        }
      }
    }).catch(() => {});

    // Load enrollments for project selection
    apiClient.getEnrollments().then(res => {
      setMyCourses(res.enrollments);
    }).catch(err => console.error(err));
  }, []);

  const handleProjectToggle = (projectName: string) => {
    const currentProjects = watch('during_projects') || '';
    const projectsArray = currentProjects.split(',').map(s => s.trim()).filter(Boolean);
    
    if (projectsArray.includes(projectName)) {
      // Remove
      setValue('during_projects', projectsArray.filter(p => p !== projectName).join(', '));
    } else {
      // Add
      projectsArray.push(projectName);
      setValue('during_projects', projectsArray.join(', '));
    }
  };

  const onSubmit = async (data: StoryFormData) => {
    setSubmitting(true);
    try {
      let profileImageUrl = data.profile_image || userProfile?.avatar_url || '';

      if (imageFile) {
        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB');
        }

        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await apiClient.uploadFile(formData);
        profileImageUrl = uploadRes.url;
      }

      const payload = {
        ...data,
        student_name: userProfile?.name || 'Student',
        profile_image: profileImageUrl,
        during_projects: data.during_projects.split(',').map(s => s.trim()).filter(Boolean),
        during_mentor_rating: parseInt(data.during_mentor_rating),
        after_confidence: parseInt(data.after_confidence)
      };
      
      if (initialData) {
        await apiClient.updateMyStudentStory(payload);
        toast.success('Story updated successfully! Sent for re-approval.');
      } else {
        await apiClient.createStudentStory(payload);
        toast.success('Story submitted successfully! Pending approval.');
      }
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof StoryFormData)[] = [];
    if (step === 1) fieldsToValidate = ['background', 'before_struggle', 'before_goal'];
    if (step === 2) fieldsToValidate = ['during_course_name', 'during_duration', 'during_projects', 'during_mentor_rating'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-100 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Share Your Learning Journey</span>
          <span className="text-sm font-normal text-gray-500">Step {step} of 3</span>
        </CardTitle>
        <CardDescription>Inspire others by sharing your transformation story.</CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
          <div 
            className="h-full bg-red-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: BEFORE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Background</Label>
                <Select onValueChange={(val) => {
                  const elem = document.getElementById('background-hidden') as HTMLInputElement;
                  if (elem) {
                    elem.value = val;
                    elem.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  register('background').onChange({ target: { name: 'background', value: val } });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non-tech">Non-tech Background</SelectItem>
                    <SelectItem value="College Student">College Student</SelectItem>
                    <SelectItem value="Working Professional">Working Professional</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('background', { required: 'Background is required' })} />
                {errors.background && <p className="text-sm text-red-500">{errors.background.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Biggest struggle before joining</Label>
                <Textarea 
                  placeholder="e.g. I didn't know where to start, concepts were confusing..."
                  {...register('before_struggle', { required: 'This field is required' })}
                />
                {errors.before_struggle && <p className="text-sm text-red-500">{errors.before_struggle.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Goal before enrolling</Label>
                <Input 
                  placeholder="e.g. To get a full-stack developer job"
                  {...register('before_goal', { required: 'This field is required' })}
                />
                {errors.before_goal && <p className="text-sm text-red-500">{errors.before_goal.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: DURING */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Course / Program Name</Label>
                <Input 
                  placeholder="e.g. Full Stack Web Development"
                  {...register('during_course_name', { required: 'Course name is required' })}
                />
                {errors.during_course_name && <p className="text-sm text-red-500">{errors.during_course_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 6"
                  {...register('during_duration', { required: 'Duration is required' })}
                />
                {errors.during_duration && <p className="text-sm text-red-500">{errors.during_duration.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Projects Built (select from completed projects)</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto bg-gray-50">
                  {myCourses.length > 0 ? (
                    myCourses.map((enrollment: any) => {
                      const projectName = `${enrollment.title} Capstone`;
                      const currentProjects = watch('during_projects') || '';
                      const isSelected = currentProjects.split(',').map(s => s.trim()).includes(projectName);
                      
                      return (
                        <div key={enrollment.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`proj-${enrollment.id}`}
                            checked={isSelected}
                            onChange={() => handleProjectToggle(projectName)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <label htmlFor={`proj-${enrollment.id}`} className="text-sm cursor-pointer select-none">
                            {projectName}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic">No enrolled courses found.</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">Or type manually below:</p>
                <Input 
                  placeholder="e.g. E-commerce App, Task Manager, Portfolio"
                  {...register('during_projects', { required: 'List at least one project' })}
                />
                {errors.during_projects && <p className="text-sm text-red-500">{errors.during_projects.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Mentor Support Rating (1-5)</Label>
                <Select onValueChange={(val) => register('during_mentor_rating').onChange({ target: { name: 'during_mentor_rating', value: val } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate mentor support" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('during_mentor_rating', { required: 'Rating is required' })} />
                {errors.during_mentor_rating && <p className="text-sm text-red-500">{errors.during_mentor_rating.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: AFTER */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Select onValueChange={(val) => register('after_role').onChange({ target: { name: 'after_role', value: val } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Job">Full-time Job</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('after_role', { required: 'Current role is required' })} />
                  {errors.after_role && <p className="text-sm text-red-500">{errors.after_role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Company Name (Optional)</Label>
                  <Input 
                    placeholder="e.g. Google, Microsoft, Startup"
                    {...register('after_company')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Salary Hike / Role Change (Optional)</Label>
                <Input 
                  placeholder="e.g. 50% hike, promoted to Senior Dev"
                  {...register('after_salary_hike')}
                />
              </div>

              <div className="space-y-2">
                <Label>Confidence Level (1-5)</Label>
                <Select onValueChange={(val) => register('after_confidence').onChange({ target: { name: 'after_confidence', value: val } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate your confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Low</SelectItem>
                    <SelectItem value="2">2 - Moderate</SelectItem>
                    <SelectItem value="3">3 - High</SelectItem>
                    <SelectItem value="4">4 - Very High</SelectItem>
                    <SelectItem value="5">5 - Unstoppable</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('after_confidence', { required: 'Confidence level is required' })} />
                {errors.after_confidence && <p className="text-sm text-red-500">{errors.after_confidence.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Advice to new learners</Label>
                <Textarea 
                  placeholder="Short advice for someone just starting..."
                  {...register('advice', { required: 'Advice is required' })}
                />
                {errors.advice && <p className="text-sm text-red-500">{errors.advice.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL (Optional)</Label>
                  <Input 
                    placeholder="https://linkedin.com/in/..."
                    {...register('linkedin_url')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL (Optional)</Label>
                  <Input 
                    placeholder="https://github.com/..."
                    {...register('github_url')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">Or enter URL below:</p>
                  <Input 
                    placeholder="https://..."
                    {...register('profile_image')}
                  />
                </div>
                <p className="text-xs text-gray-500">Leave blank to use your current profile picture</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} disabled={submitting}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div></div> // Spacer
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="bg-red-600 hover:bg-red-700 text-white">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Story <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
