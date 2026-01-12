import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function CourseListingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qParam = params.get('q') || '';
  const categoryParam = params.get('category') || 'All';
  const difficultyParam = (params.get('difficulty') as 'All' | 'basic' | 'intermediate' | 'advanced') || 'All';

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
    const load = async () => {
      try {
        setLoading(true);
        const { courses: all } = await apiClient.getCourses({ status: 'published' });
        setCourses(all);
      } catch (e) {
        console.error('Error loading courses:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const normalize = (s: string) => s.toLowerCase();

  const matchesCategory = (course: Course) => {
    const c = normalize(course.category);
    const title = normalize(course.title);
    switch (categoryParam) {
      case 'Artificial Intelligence & Machine Learning':
        return title.includes('ai') || title.includes('machine') || title.includes('deep learning') || title.includes('ml');
      case 'Cloud Computing':
        return c.includes('cloud');
      case 'Cybersecurity':
        return c.includes('cyber') || title.includes('security');
      case 'Data Analytics & AI':
        return (
          c.includes('data') ||
          c.includes('analytics') ||
          title.includes('data') ||
          title.includes('analytics') ||
          title.includes('bi') ||
          title.includes('sql')
        );
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

  const filtered = courses
    .filter(matchesCategory)
    .filter((course) => {
      const q = normalize(qParam);
      if (!q) return true;
      return (
        normalize(course.title).includes(q) ||
        normalize(course.description).includes(q)
      );
    })
    .filter((course) => {
      if (difficultyParam === 'All') return true;
      return course.difficulty === difficultyParam;
    });

  const sorted = useMemo(() => {
    if (!qParam) return filtered;
    const q = normalize(qParam);
    return [...filtered].sort((a, b) => {
      const aExact = normalize(a.title) === q ? 1 : 0;
      const bExact = normalize(b.title) === q ? 1 : 0;
      const aIncl = normalize(a.title).includes(q) ? 1 : 0;
      const bIncl = normalize(b.title).includes(q) ? 1 : 0;
      return (bExact - aExact) || (bIncl - aIncl);
    });
  }, [filtered, qParam]);

  const setParam = (key: string, value?: string) => {
    const p = new URLSearchParams(location.search);
    if (!value || value === 'All') {
      p.delete(key);
    } else {
      p.set(key, value);
    }
    navigate(`/courses?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:gap-6">
          <aside className="md:w-[28%] md:shrink-0">
            <div className="rounded-md border border-red-100 bg-white p-4 md:sticky md:top-24">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Course Categories</h3>
              <div className="space-y-2">
                {categories.map((label) => {
                  const active = categoryParam === label || (label === 'All' && categoryParam === 'All');
                  return (
                    <button
                      key={label}
                      onClick={() => setParam('category', label)}
                      className={`w-full text-left px-4 py-2 rounded-sm text-sm transition-colors border ${
                        active ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800 border-gray-200 hover:bg-red-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Difficulty</h4>
                <Select value={difficultyParam} onValueChange={(v) => setParam('difficulty', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          <div className="mt-6 md:mt-0 md:w-[72%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {categoryParam === 'All' ? 'All Courses' : categoryParam}
                </h2>
                {qParam && (
                  <p className="text-sm text-slate-600">
                    Showing results for “{qParam}”
                  </p>
                )}
              </div>
              <span className="text-sm text-slate-600">{sorted.length} {sorted.length === 1 ? 'course' : 'courses'}</span>
            </div>

            {loading ? (
              <div className="text-center py-14 border rounded-xl bg-white">
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-14 border rounded-xl bg-white">
                <p className="text-gray-600">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sorted.map((course) => (
                  <CourseCard key={course.id} course={course} onSelect={(id) => navigate(`/course/${id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseListingPage;
