import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { Blog } from '../types';
import { Button } from '../components/ui/button';
import { ArrowLeft, User, Share2, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { blog } = await apiClient.getBlog(id);
        setBlog(blog);
      } catch (err) {
        console.error('Fetch blog detail error:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      const result = await apiClient.likeBlog(blog.id);
      setBlog(prev => prev ? { ...prev, like_count: result.like_count, is_liked: result.liked } : null);
    } catch (err: unknown) {
      console.error('Failed to like blog', err);
      // If unauthorized, redirect to login
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401') || msg.includes('Unauthorized')) navigate('/login');
    }
  };

  const handleShare = async (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    // For Instagram, since there's no direct web share, we copy the link
    if (platform === 'Instagram') {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied! You can now paste it on Instagram.');
      } catch (err) {
        console.error('Failed to copy link', err);
        toast.error('Failed to copy link');
      }
      return;
    }
    
    // For other platforms, we let the link open in new tab (default behavior)
    // We don't copy to clipboard to avoid confusion as the platform pre-fills the link
  };

  const shareUrl = window.location.href;
  const shareText = blog ? `Check out this amazing article: ${blog.title}` : 'Check out this article!';

  const socialLinks = [
    { icon: <Twitter className="h-4 w-4" />, label: 'Twitter', color: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: <Facebook className="h-4 w-4" />, label: 'Facebook', color: 'hover:text-[#4267B2] hover:bg-[#4267B2]/10', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { icon: <Linkedin className="h-4 w-4" />, label: 'LinkedIn', color: 'hover:text-[#0077b5] hover:bg-[#0077b5]/10', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { icon: <Instagram className="h-4 w-4" />, label: 'Instagram', color: 'hover:text-[#E1306C] hover:bg-[#E1306C]/10', url: '#' },
    { 
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ), 
      label: 'WhatsApp', 
      color: 'hover:text-[#25D366] hover:bg-[#25D366]/10',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
        <Button onClick={() => navigate('/blog')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4 bg-none" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-white to-violet-100 dark:from-indigo-950 dark:via-gray-900 dark:to-violet-900 pb-12">
      <div className="container mx-auto px-4 max-w-[1280px] pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content (Left/Center) - 8 Cols */}
          <main className="lg:col-span-8 lg:col-start-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 md:p-12">
              
              {/* Back Button */}
              <div className="mb-6">
                 <Button 
                  variant="ghost" 
                  className="pl-0 hover:pl-2 transition-all text-red-600 hover:text-red-900"
                  onClick={() => navigate('/blog')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 text-red-700" /> Back to All Posts
                </Button>
              </div>

              {/* Featured Image (if exists) */}
              {blog.featured_image_url && (
                <div className="mb-8 rounded-lg overflow-hidden w-full aspect-video bg-gray-100">
                  <img 
                    src={blog.featured_image_url} 
                    alt={blog.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {blog.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">#{blog.category.toLowerCase().replace(/\s+/g, '')}</span>
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">#programming</span>
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">#learning</span>
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">#discuss</span>
              </div>

              {/* Main Content Body */}
              <div className="prose prose-lg md:prose-xl max-w-none text-gray-800 prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
                {blog.content ? (
                  <div className="whitespace-pre-wrap font-sans">
                    {blog.content}
                  </div>
                ) : (
                  <p className="italic text-gray-500">No content available.</p>
                )}
              </div>

            </div>
          </main>

          {/* Sidebar (Right) - 4 Cols */}
          <aside className="lg:col-span-4 lg:col-start-9 space-y-6">
            
            {/* Author Info & Reactions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
              
              {/* Author Header */}
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                   {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 leading-none">{blog.author_name || 'Unknown Author'}</p>
                   <p className="text-xs text-gray-500 mt-1">Posted on {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                 </div>
              </div>

              {/* Reactions Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 cursor-pointer p-2 -ml-2 rounded-md transition-colors ${blog.is_liked ? 'bg-red-50 ring-1 ring-red-200' : 'hover:bg-gray-50'}`}
                  title={blog.is_liked ? 'Unlike' : 'Like'}
                >
                   <span className={`text-xl ${blog.is_liked ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>❤️</span>
                   <span className={`font-medium ${blog.is_liked ? 'text-red-600' : 'text-gray-600'}`}>
                     {blog.like_count || 0}
                   </span>
                </button>
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 p-2 rounded-md transition-colors opacity-60 hover:opacity-100">
                   <span className="text-xl">🦄</span>
                   <span className="text-gray-600 font-medium">1</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-yellow-50 p-2 rounded-md transition-colors opacity-60 hover:opacity-100">
                   <span className="text-xl">🤯</span>
                   <span className="text-gray-600 font-medium">1</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-green-50 p-2 rounded-md transition-colors opacity-60 hover:opacity-100">
                   <span className="text-xl">🙌</span>
                   <span className="text-gray-600 font-medium">1</span>
                </div>
                 <div className="flex items-center gap-1.5 cursor-pointer hover:bg-orange-50 p-2 rounded-md transition-colors opacity-60 hover:opacity-100">
                   <span className="text-xl">🔥</span>
                   <span className="text-gray-600 font-medium">2</span>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="pt-4 border-t border-gray-100">
                 <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Share</h3>
                 <div className="flex flex-col gap-2">
                    {socialLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleShare(e, link.label)}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-gray-600 ${link.color} hover:pl-3`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-white">
                          {link.icon}
                        </div>
                        <span className="font-medium text-sm">{link.label}</span>
                      </a>
                    ))}
                 </div>
              </div>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default BlogDetailPage;
