import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Course } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import { CourseExplorerSection } from '../components/CourseExplorerSection';
import { Button } from '../components/ui/button';
import { Globe, Handshake, Layers, Star, Users, Award, Briefcase, CheckCircle2 } from 'lucide-react';
 

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'basic' | 'intermediate' | 'advanced'>('All');

  const differentiators = [
    {
      title: 'Industry-aligned curriculum',
      description: 'Programs designed with inputs from hiring managers and practitioners across AI, Cloud, Cyber, and Networking.',
      icon: Briefcase,
    },
    {
      title: 'Hands-on projects',
      description: 'Work on labs, capstones, and real-world scenarios instead of only theory or slides.',
      icon: Layers,
    },
    {
      title: 'Expert instructors',
      description: 'Learn from experienced engineers and trainers who ship systems, not just teach from slides.',
      icon: Award,
    },
    {
      title: 'Certification that signals',
      description: 'Earn verifiable certificates backed by projects and assessments to showcase your skills.',
      icon: CheckCircle2,
    },
    {
      title: 'Career support',
      description: 'Resume reviews, mock interviews, and access to a growing network of hiring partners.',
      icon: Handshake,
    },
    {
      title: 'Built for busy schedules',
      description: 'Structured paths with live + recorded sessions so you can learn without pausing work or college.',
      icon: Globe,
    },
  ];

  const trustMetrics = [
    { label: 'Learners', value: '50,000+', icon: Users },
    { label: 'Star rating', value: '4.8', icon: Star },
    { label: 'Hiring partners', value: '100+', icon: Handshake },
    { label: 'Countries', value: '20+', icon: Globe },
  ];

  const categories = [
    'All',
    'Artificial Intelligence & Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Data Analytics & AI',
    'Networking',
    'DevOps',
    'Full Stack Development',
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  // Pick up header search query param `q` and category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const category = params.get('category');
    if (q) setSearchTerm(q);
    if (category) setSelectedCategory(category);
  }, [location.search]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { courses: allCourses } = await apiClient.getCourses({ status: 'published' });
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (s: string) => s.toLowerCase();

  const matchesCategory = (course: Course) => {
    const c = normalize(course.category);
    const title = normalize(course.title);
    switch (selectedCategory) {
      case 'Artificial Intelligence & Machine Learning':
        return title.includes('ai') || title.includes('machine') || title.includes('deep learning') || title.includes('ml');
      case 'Cloud Computing':
        return c.includes('cloud');
      case 'Cybersecurity':
        return c.includes('cyber');
      case 'Data Analytics & AI':
        return c.includes('data') || c.includes('analytics') || title.includes('data') || title.includes('analytics') || title.includes('bi') || title.includes('sql');
      case 'Networking':
        return c.includes('network') || title.includes('network') || title.includes('ccna');
      case 'DevOps':
        return title.includes('devops') || title.includes('automation');
      case 'Full Stack Development':
        return title.includes('full stack') || title.includes('frontend') || title.includes('backend');
      default:
        return true;
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory(course) && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />

      {loading ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : (
        <>
          <CourseExplorerSection 
            courses={filteredCourses}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectCourse={(id: string) => navigate(`/course/${id}`)}
            categories={categories}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={(v) => setSelectedDifficulty(v)}
          />

          <section className="bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Why learners choose Cache Learning
                </h2>
                <p className="mt-3 text-slate-600 leading-7">
                  A modern platform that combines structured paths, real projects, and human support
                  so you can actually ship skills to production.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {differentiators.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="relative px-6 py-10 sm:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-white"></div>
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                    Trusted outcomes
                  </div>
                  <div className="mt-4 max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Trusted by learners and teams worldwide
                    </h2>
                    <p className="mt-2 text-slate-600 leading-7">
                      Proven learning impact with mentorship, practical labs, and career-ready programs.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => navigate('/courses')}>Explore Courses</Button>
                      <Button variant="outline" onClick={() => navigate('/contact')}>Talk to Us</Button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {trustMetrics.map((m) => {
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.label}
                          className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50">
                              <Icon className="h-4 w-4 text-slate-700" />
                            </span>
                            <span className="text-xs font-medium tracking-wide uppercase">{m.label}</span>
                          </div>
                          <div className="mt-4 flex items-end justify-between">
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                              {m.value}
                            </span>
                            {m.label === 'Star rating' && (
                              <span className="text-xs font-medium text-slate-600">out of 5</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
