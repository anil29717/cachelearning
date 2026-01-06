import React from 'react';
import TestimonialsSection from '../components/TestimonialsSection';

export default function TestimonialsPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-2">Testimonials</h1>
        <p className="text-gray-600 mb-8">Hear from learners who have advanced their careers with Cache Learning.</p>
      </div>
      <TestimonialsSection />
    </div>
  );
}

