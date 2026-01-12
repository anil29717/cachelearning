import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Blog } from '../types';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function BlogPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { blogs } = await apiClient.getBlogs({ status: 'published' });
        setBlogs(blogs);
      } catch {
        const sample: Blog[] = [
          { id: 1, title: 'Getting Started with Cloud', category: 'Cloud', status: 'published', author_id: 2, author_name: 'Instructor A', featured_image_url: '', created_at: new Date().toISOString() },
          { id: 2, title: 'AI Basics for Beginners', category: 'AI', status: 'published', author_id: 3, author_name: 'Instructor B', featured_image_url: '', created_at: new Date().toISOString() },
          { id: 3, title: 'Cybersecurity Best Practices', category: 'Cyber Security', status: 'published', author_id: 2, author_name: 'Instructor A', featured_image_url: '', created_at: new Date().toISOString() },
        ];
        setBlogs(sample);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach(b => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return blogs;
    return blogs.filter(b => b.category === selectedCategory);
  }, [blogs, selectedCategory]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900">
      <div className="container mx-auto px-4 py-10">
        <div className="md:flex md:gap-6">
          <aside className="md:w-[28%] md:shrink-0">
            <div className="rounded-md border border-red-100 bg-white p-4 md:sticky md:top-24">
              <h3 className="text-sm font-semibold text-red-700 mb-3">Browse Categories</h3>
              <div className="space-y-2">
                {categories.map((label) => {
                  const active = selectedCategory === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setSelectedCategory(label)}
                      className={`w-full text-left px-4 py-2 rounded-sm text-sm transition-colors border ${
                        active ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800 border-gray-200 hover:bg-red-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="mt-6 md:mt-0 md:w-[72%]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedCategory === 'All' ? 'All Blogs' : selectedCategory}
                </h2>
                <p className="text-sm text-slate-600">Posts are managed via Instructor and Admin panels.</p>
              </div>
              <span className="text-sm text-slate-600">{filtered.length} {filtered.length === 1 ? 'post' : 'posts'}</span>
            </div>

            {loading ? (
              <div className="text-center py-14 border rounded-xl bg-white">
                <p className="text-gray-600">Loading blogs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14 border rounded-xl bg-white">
                <p className="text-gray-600">No blogs found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((b) => (
                  <Card 
                    key={b.id} 
                    className="group flex flex-col overflow-hidden border border-red-100 hover:bg-red-50 transition-all duration-300 hover:shadow-xl cursor-pointer h-full"
                    onClick={() => navigate(`/blog/${b.id}`)}
                  >
                    {/* Thumbnail Image - 16:9 Aspect Ratio */}
                    <div className="w-full aspect-video overflow-hidden bg-gray-100 relative">
                      {b.featured_image_url ? (
                        <img 
                          src={b.featured_image_url} 
                          alt={b.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-200">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                         <Badge className="bg-white/90 text-red-600 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                           {b.category}
                         </Badge>
                      </div>
                    </div>

                    {/* Blog Details */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-red-700 transition-colors">
                          {b.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
                        <span>By {b.author_name || 'Unknown'}</span>
                        <span className="text-red-300">•</span>
                        <span>{new Date(b.created_at).toLocaleDateString()}</span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-3 flex-grow leading-relaxed mb-4">
                        {b.content 
                          ? b.content.replace(/<[^>]*>/g, '').slice(0, 150) + (b.content.length > 150 ? '...' : '') 
                          : 'No description available for this blog post.'}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-red-100/50 flex items-center text-red-600 text-sm font-bold group-hover:text-red-700">
                        Read Article <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
