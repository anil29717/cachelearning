import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Course } from '../types';
import { CourseCard } from './CourseCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CourseExplorerSectionProps {
  courses: Course[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectCourse: (id: string) => void;
  categories?: string[];
  selectedDifficulty: 'All' | 'basic' | 'intermediate' | 'advanced';
  onSelectDifficulty: (v: 'All' | 'basic' | 'intermediate' | 'advanced') => void;
}

export const CourseExplorerSection: React.FC<CourseExplorerSectionProps> = ({
  courses,
  selectedCategory,
  onSelectCategory,
  onSelectCourse,
  categories,
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs with 'All' for showing all courses
  const categoryTabs =
    categories ?? ['All', 'Cloud', 'Cyber Security', 'Data Analytics & AI', 'Networking'];

  const handleTabClick = (label: string) => {
    const category = label;
    onSelectCategory(category);

    // Reflect category in URL for deep-linking
    const params = new URLSearchParams(location.search);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate(`/?${params.toString()}`);
  };

  return (
    <section id="courses" className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-red-50">
      {/* 30/70 ratio using flex with explicit widths on md+ */}
      <div className="md:flex md:gap-6">
        {/* Left: Vertical Tabs */}
        <aside className="md:w-[30%] md:shrink-0">
          <div className="rounded-sm border border-gray-200 bg-white p-4 md:sticky md:top-24">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Browse Categories</h3>
            <div className="space-y-2">
              {categoryTabs.map((label) => {
                const isActive = selectedCategory === label;
                return (
                  <button
                    key={label}
                    onClick={() => handleTabClick(label)}
                    className={`w-full text-left px-4 py-2 rounded-sm text-sm transition-colors border ${
                      isActive
                        ? 'bg-red-600 text-white border-red-600 '
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-red-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Filter by difficulty</h4>
              <Select value={selectedDifficulty} onValueChange={(v) => onSelectDifficulty(v as 'All' | 'basic' | 'intermediate' | 'advanced')}>
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

        {/* Right: Course Tiles */}
        <div className="mt-6 md:mt-0 md:w-[70%]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedCategory === 'All' ? 'All Courses' : selectedCategory}
            </h2>
            <span className="text-sm text-slate-500">{courses.length} {courses.length === 1 ? 'course' : 'courses'}</span>
          </div>
          {courses.length === 0 ? (
            <div className="text-center py-14 border rounded-xl bg-white">
              <p className="text-gray-600">No courses found for this selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseExplorerSection;
