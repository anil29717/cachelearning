import React from 'react';
import { Clock, Star, Users } from 'lucide-react';
import { Course } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

// Curated fallback images per category for a richer visual grid
const CATEGORY_FALLBACKS: Record<string, string> = {
  Programming:
    'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop',
  Design:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop',
  Business:
    'https://images.unsplash.com/photo-1556767576-cfba0f3fb6d0?q=80&w=1600&auto=format&fit=crop',
  Marketing:
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop',
  'Data Science':
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
  all:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
  General:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
};

function getThumbnail(course: Course) {
  if (course.thumbnail_url && course.thumbnail_url.trim().length > 0) return course.thumbnail_url;
  return CATEGORY_FALLBACKS[course.category] || CATEGORY_FALLBACKS.General;
}

export function CourseCard({ course, onSelect }: { course: Course; onSelect: (courseId: string) => void; }) {
  return (
    <div className="border-gray-300 border rounded-md p-1 bg-white">
      <div
      onClick={() => onSelect(String(course.id))}
      className="bg-white rounded-xl  border-gray-200 transition-colors cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100 overflow-hidden rounded-sm">
        <ImageWithFallback
          src={(course.thumbnail_url && course.thumbnail_url.trim().length > 0) ? course.thumbnail_url : (CATEGORY_FALLBACKS[course.category] || CATEGORY_FALLBACKS.General)}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {/* <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
            {course.status || 'draft'}
          </Badge> */}
          <div className="flex gap-2">
            <Badge className="bg-black text-white text-xs font-medium" variant="outline">{course.category || 'General'}</Badge>
            <Badge className="text-xs font-medium" variant="secondary">
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Badge>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        <div className="">
        </div>

        <h3 className="text-gray-900 text-base font-semibold mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        {course.instructor_name && (
          <p className="text-gray-500 text-sm">By {course.instructor_name}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">₹{course.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">View details</span>
        </div>
      </div>
    </div>
    </div>
  );
}
