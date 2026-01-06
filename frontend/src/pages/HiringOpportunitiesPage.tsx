import React, { useState } from 'react';
import { apiClient } from '../utils/api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Briefcase, Globe, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function HiringOpportunitiesPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleApplied, setRoleApplied] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleApplied || !resumeUrl) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        role_applied: roleApplied,
        resume_url: resumeUrl,
        cover_letter: coverLetter || '',
      };
      const { applicationId } = await apiClient.submitJobApplication(payload);
      toast.success('Application submitted successfully');
      setName('');
      setEmail('');
      setRoleApplied('');
      setResumeUrl('');
      setCoverLetter('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Hiring Opportunities</h1>
            <p className="mt-2 text-sm text-slate-600">Explore roles on the left and apply using the form on the right.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Open Roles */}
          <div>
            {/* <h2 className="text-lg font-semibold text-slate-900 mb-4">Open Roles</h2> */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: 'Frontend Engineer', tags: ['Remote', 'Full-time'], icon: <Briefcase className="h-5 w-5" /> },
                { title: 'Content Strategist', tags: ['Remote', 'Full-time'], icon: <Globe className="h-5 w-5" /> },
                { title: 'Community Manager', tags: ['Remote', 'Full-time'], icon: <Clock className="h-5 w-5" /> },
              ].map((role) => (
                <Card key={role.title} className="border border-red-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      {role.icon}
                      {role.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.tags.map((t) => (
                          <Badge key={t} variant="outline" className="border-red-200 text-red-700">{t}</Badge>
                        ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">Help shape learning experiences for thousands of learners. Collaborate with product and content to build delightful experiences.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Application Form */}
          <div>
            <Card id="apply" className="border border-red-100 bg-white shadow-sm md:sticky md:top-24">
              <CardHeader>
                <CardTitle className="text-red-700">Apply for a Role</CardTitle>
                <CardDescription className="text-slate-600">Tell us about yourself and include a link to your resume.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role Applied *</Label>
                    <Input id="role" value={roleApplied} onChange={(e) => setRoleApplied(e.target.value)} placeholder="e.g., Frontend Engineer" required />
                  </div>
                  <div>
                    <Label htmlFor="resume">Resume URL *</Label>
                    <Input id="resume" type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="Link to your resume" required />
                  </div>
                  <div>
                    <Label htmlFor="cover">Cover Letter</Label>
                    <Textarea id="cover" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} placeholder="Tell us why you’re a great fit" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
