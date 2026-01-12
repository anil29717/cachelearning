import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Users, Target, CheckCircle, Rocket, Building, LineChart } from 'lucide-react';

export function CareersPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900">
      {/* <div className="bg-gradient-to-r from-red-400 to-red-400 text-white shadow-lg">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="mb-4 flex gap-2">
                <Badge className="bg-white/20 border border-red-200 text-white">Careers</Badge>
                <Badge className="bg-white/20 border border-red-200 text-white">Outcomes</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">Build Your Dream Career</h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-8">
                Learn industry-relevant skills, build real projects, and launch a successful tech career with guidance from experts and a strong hiring network.
              </p>
              <div className="flex gap-4">
                <Button className="bg-white text-red-700 hover:bg-red-50 border border-red-200" onClick={() => navigate('/courses')}>Explore Programs</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/hiring')}>Hiring Now</Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-lg aspect-video flex items-center justify-center">
                <Rocket className="h-24 w-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Learners’ Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-red-700" />
                      <span className="font-medium text-gray-900">Aarav • Cloud Engineer at TechCorp</span>
                    </div>
                    <p className="text-sm text-gray-700">The hands-on labs and guidance helped me move from beginner to certified cloud engineer and land a role in under 4 months.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-red-700" />
                      <span className="font-medium text-gray-900">Diya • Security Analyst at SecureNet</span>
                    </div>
                    <p className="text-sm text-gray-700">Live projects and mentor feedback made me industry-ready. I cracked interviews with confidence and showcased real work.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">How We Help You Achieve Your Dream Career</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Skill-first learning</h3>
                      <p className="text-gray-600 leading-relaxed">Structured paths in AI, Cloud, Cybersecurity, and Networking with real projects and assessments.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Mentorship and counseling</h3>
                      <p className="text-gray-600 leading-relaxed">Resume reviews, mock interviews, and career counseling to position you for success.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Successful Career Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Role transitions</span>
                    </div>
                    <p className="text-sm text-gray-700">From student to junior developer, from support to cloud engineer, and more.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Certifications and portfolios</span>
                    </div>
                    <p className="text-sm text-gray-700">Learners graduate with projects, skills validation, and a strong portfolio.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Hackathons & Live Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <Rocket className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Hackathons</span>
                    </div>
                    <p className="text-sm text-gray-700">Compete, build, and showcase innovative solutions with peers.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-red-100 hover:bg-red-50 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <Rocket className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Live projects</span>
                    </div>
                    <p className="text-sm text-gray-700">Gain experience through guided real-world project work.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="sticky top-4 border border-red-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Hiring Partners & Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border border-red-100 p-4 text-center">
                    <Building className="mx-auto h-6 w-6 text-red-700 mb-1" />
                    <div className="text-sm text-gray-600">Hiring partners</div>
                    <div className="text-lg font-semibold text-red-700">150+</div>
                  </div>
                  <div className="rounded-md border border-red-100 p-4 text-center">
                    <LineChart className="mx-auto h-6 w-6 text-red-700 mb-1" />
                    <div className="text-sm text-gray-600">Placement rate</div>
                    <div className="text-lg font-semibold text-red-700">87%</div>
                  </div>
                </div>
                <Separator />
                <Button className="bg-red-600 hover:bg-red-700 text-white w-full" onClick={() => navigate('/hiring')}>Hiring</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareersPage;
