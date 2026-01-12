import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Target, Users, Rocket } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900">
      {/* <div className="bg-gradient-to-r from-red-400 to-red-400 text-white shadow-lg">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="mb-4 flex gap-2">
                <Badge className="bg-white/20 border border-red-200 text-white">Company</Badge>
                <Badge className="bg-white/20 border border-red-200 text-white">About</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">About Cache Learning</h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-8">
                We help learners build in-demand tech skills across AI, Cloud, Cybersecurity, Networking and more.
                Learn with real projects, expert mentorship, and industry-focused curricula.
              </p>
              <div className="flex gap-4">
                <Button className="bg-white text-red-700 hover:bg-red-50 border border-red-200">Browse Courses</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">Contact Us</Button>
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
          <div className="lg:col-span-2">
            <Card className="border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Skill-first learning</h3>
                      <p className="text-gray-600 leading-relaxed mb-2">
                        Practical, hands-on programs designed to make learners job-ready.
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Mentorship that matters</h3>
                      <p className="text-gray-600 leading-relaxed mb-2">
                        Learn with guidance from experienced instructors and industry experts.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border border-red-100">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">What We Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Curated courses in AI, Cloud, Cybersecurity, Networking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Real projects, labs, and assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Certificates and progression tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4 border border-red-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Fast Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Programs</div>
                  <Badge className="bg-red-50 text-red-700 border border-red-100">20+ tracks</Badge>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Focus Areas</div>
                  <Badge className="bg-red-50 text-red-700 border border-red-100">AI • Cloud • Cyber • Networks</Badge>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Contact</div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white w-full">Get in touch</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
