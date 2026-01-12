import React from 'react';
import { Linkedin } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  highlight: string;
  body: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'A. Sharma',
    role: 'Vice President',
    company: 'Material+ Academy',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&q=60&auto=format&fit=crop',
    highlight:
      'Web and mobile access let me learn anytime, anywhere, with comprehensive materials.',
    body:
      "This course ticked all the boxes. Its accessibility across platforms allowed me to learn anytime, anywhere. The comprehensive material—live sessions, recordings, videos, books, and practice labs—was invaluable. What truly stood out was the instructors' expertise and the quality of training.",
  },
  {
    name: 'D. Ghosh',
    role: 'Site Reliability Engineer',
    company: 'ANZ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=60&auto=format&fit=crop',
    highlight:
      'I gained deep knowledge in Generative AI, prompt creation, and NLP, boosting my confidence.',
    body:
      'The Gen AI course greatly improved my understanding of Generative AI. I gained expertise in prompt creation and NLP libraries, boosting my confidence to take on projects with ease.',
  },
];

export function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 id="testimonials-heading" className="sr-only">Learner Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <header className="flex items-start gap-4">
                <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-blue-100 shrink-0">
                  <img
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-600">
                    {t.role}, <span className="font-medium">{t.company}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-gray-500">
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs">LinkedIn</span>
                  </div>
                </div>
              </header>
              <blockquote className="mt-6">
                <p className="text-xl md:text-2xl font-medium text-gray-900">
                  “{t.highlight}”
                </p>
              </blockquote>
              <p className="mt-4 text-gray-700 leading-relaxed">{t.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
