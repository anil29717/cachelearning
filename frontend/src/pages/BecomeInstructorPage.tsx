import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export default function BecomeInstructorPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [expertise, setExpertise] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !expertise || !experienceYears) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        expertise,
        experience_years: Number(experienceYears),
        portfolio_url: portfolioUrl || null,
        bio: bio || '',
      };
      const { applicationId } = await apiClient.submitInstructorApplication(payload);
      toast.success('Application submitted successfully');
      setExpertise('');
      setExperienceYears('');
      setPortfolioUrl('');
      setBio('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Become an Instructor</CardTitle>
              <CardDescription>
                Share your expertise with learners worldwide. Submit your application and our team will review it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Two-column grid for cleaner layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white border border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Primary Expertise *</Label>
                    <Input
                      id="expertise"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g., Cloud, AI, Cyber Security"
                      required
                      className="bg-white border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input id="experience" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} required className="bg-white border border-gray-300" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input id="portfolio" type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://your-portfolio.com" className="bg-white border border-gray-300" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Tell us about your teaching philosophy, achievements, etc." className="bg-white border border-gray-300" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting} className="px-6">
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
