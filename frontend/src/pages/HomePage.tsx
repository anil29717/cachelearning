import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Course } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import { CourseExplorerSection } from '../components/CourseExplorerSection';
 

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'basic' | 'intermediate' | 'advanced'>('All');

  // Fixed categories with 'All'
  const categories = ['All', 'Cloud', 'Cyber Security', 'Data Analytics & AI', 'Networking'];

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />

      {/* Explorer Section: Left tabs (30%) + Right tiles (70%) */}
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
        </>
      )}

    </div>
  );
}
