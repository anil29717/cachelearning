import React from 'react';
import { Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

type BlogItem = {
  id: string | number;
  title: string;
  image: string;
  updatedOn: string;
  views: string | number;
};

type Props = {
  title?: string;
  items?: BlogItem[];
};

export function BlogCarousel({
  title = 'Latest Artificial Intelligence Blogs',
  items = [
    {
      id: 1,
      title: 'AI Applications: Top 10 Real World Applications',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
      updatedOn: 'September 11, 2025',
      views: '160.1K',
    },
    {
      id: 2,
      title: 'What is Agentic AI? – A Complete Guide',
      image:
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
      updatedOn: 'August 06, 2025',
      views: '527',
    },
    {
      id: 3,
      title: '50+ Agentic AI Interview Questions and Answers',
      image:
        'https://images.unsplash.com/photo-1526378722484-b1142d6b8e28?q=80&w=1200&auto=format&fit=crop',
      updatedOn: 'August 01, 2025',
      views: '438',
    },
  ],
}: Props) {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          {title}
        </h2>

        <Carousel className="relative" orientation="horizontal" opts={{ align: 'start' }}>
          <CarouselContent className="-ml-2">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-2"
                style={{ flex: '0 0 33.333%' }}
              >
                <article className="h-full rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold leading-snug">
                      {item.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <p className="text-gray-600">Last updated on {item.updatedOn}</p>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        <Eye className="h-4 w-4" />
                        {item.views}
                      </span>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-8 bg-white border shadow-sm" />
          <CarouselNext className="-right-8 bg-white border shadow-sm" />
        </Carousel>
      </div>
    </section>
  );
}

export default BlogCarousel;
