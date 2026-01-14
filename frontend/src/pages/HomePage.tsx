import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Course } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import { CourseExplorerSection } from '../components/CourseExplorerSection';
import { FeaturedStoriesCarousel } from '../components/FeaturedStoriesCarousel';
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
      
      {/* Gamification Highlight Banner */}
      <div className="bg-slate-900 text-white py-4 border-b border-slate-800">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm md:text-base font-medium">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Earn XP for Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 flex items-center justify-center">🔥</div>
            <span>Maintain Daily Streaks</span>
          </div>
          <div className="flex items-center gap-2">
             <Award className="h-5 w-5 text-purple-400" />
             <span>Unlock Exclusive Badges</span>
          </div>
        </div>
      </div>

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
                      className="group rounded-2xl border border-slate-200 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
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

          <FeaturedStoriesCarousel />

        </>
      )}

    </div>
  );
}
