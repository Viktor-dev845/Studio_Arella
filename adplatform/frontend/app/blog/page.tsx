'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicBlogLayout from '@/components/layout/PublicBlogLayout';
import { PageTransition } from '@/components/ui/Animations';
import api from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  authorName: string | null;
  imageUrl: string | null;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export default function BlogPage() {
  return (
    <Suspense fallback={<PublicBlogLayout><div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-gray-400 text-lg">Loading...</div></div></PublicBlogLayout>}>
      <BlogPageInner />
    </Suspense>
  );
}

function BlogPageInner() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

useEffect(() => {
    api.get('/blog/posts?limit=20')
      .then((res) => {
        setPosts(res.data?.posts || []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = categoryFilter 
    ? posts.filter(p => p.category?.toUpperCase() === categoryFilter.toUpperCase()) 
    : posts;
  const [featured, ...rest] = filteredPosts;

return (
    <PublicBlogLayout>
      <PageTransition>
        <div className="relative flex flex-col items-center w-full min-h-screen pb-[100px] overflow-hidden">
          
          {/* Dynamic Blurred Background with Frosted Glass Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#F8F9FA]">
            {featured?.imageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center scale-110 opacity-60"
                style={{ backgroundImage: `url('${featured.imageUrl}')`, filter: 'blur(80px)' }}
              />
            )}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl" />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 w-full w-full max-w-[1800px] mx-auto px-4 lg:px-10 mt-10">
            
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading...</p>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <h2 className="text-2xl font-bold mb-2 text-black">Stay Tuned!</h2>
                 <p className="text-gray-500">We are currently preparing some amazing content. Check back soon.</p>
              </div>
            ) : (
              <>
                {/* Category Badges Styling Component */}
                <style dangerouslySetInnerHTML={{__html: `
                  .category-badge {
                    background-color: #0A0A0A;
                    color: #FFFFFF;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 6px 12px;
                    display: inline-block;
                  }
                  .hover-scale {
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  }
                  .group:hover .hover-scale {
                    transform: scale(1.05);
                  }
                `}} />

                {/* Bento Box Hero Section */}
                {featured && (
                  <div className="flex flex-col xl:flex-row gap-8 mb-16 w-full">
                    
                    {/* HUGE LEFT CARD - Breaking News */}
                    <Link href={`/blog/${featured.id}`} className="group relative w-full xl:w-[70%] h-[500px] lg:h-[75vh] min-h-[600px] max-h-[850px] overflow-hidden bg-black flex-shrink-0 cursor-pointer shadow-2xl rounded-sm">
                      <img 
                        src={featured.imageUrl || ""} 
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 hover-scale"
                      />
                      {/* Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 p-8 lg:p-14 w-full max-w-[1000px]">
                        <div className="category-badge mb-5 bg-[#FF3B30]">{featured.category || 'BREAKING NEWS'}</div>
                        <h2 className="text-white font-bold text-[36px] lg:text-[56px] leading-[1.1] mb-5 drop-shadow-md" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                          {featured.title}
                        </h2>
                        <p className="text-gray-200 text-[18px] lg:text-[22px] line-clamp-2 mb-8 max-w-[800px]">
                          {featured.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-gray-300 text-base font-semibold tracking-wide mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black overflow-hidden border-2 border-gray-500 shadow-md flex items-center justify-center p-1.5">
                               <img src="/logo-white.png" alt="Author" className="w-full h-full object-contain opacity-90" />
                            </div>
                            <span>{featured.authorName || 'Studio Arella'}</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                        </div>
                      </div>
                    </Link>

                    {/* RIGHT COLUMN - Popular Now Grid */}
                    <div className="w-full xl:w-[30%] flex flex-col gap-6 h-auto xl:h-[75vh] xl:min-h-[600px] xl:max-h-[850px]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold border-b-4 border-black pb-2 inline-block">Popular Now</h3>
                      </div>
                      
                      <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-4" style={{ flex: 1 }}>
                        {rest.slice(0, 4).map((post) => (
                          <Link key={post.id} href={`/blog/${post.id}`} className="group flex gap-5 items-center bg-white/40 p-3 rounded-sm hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm backdrop-blur-md">
                            <div className="relative w-[140px] lg:w-[180px] h-[110px] lg:h-[135px] flex-shrink-0 overflow-hidden bg-gray-200 shadow-inner">
                              <img 
                                src={post.imageUrl || ""} 
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover hover-scale"
                              />
                              {post.category && (
                                <div className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                                  {post.category}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col justify-center pr-2">
                              <h4 className="font-bold text-[16px] lg:text-[19px] leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-3">
                                {post.title}
                              </h4>
                              <div className="text-gray-600 text-[12px] lg:text-[13px] font-bold tracking-wide uppercase">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Advertising CTA */}
                      <Link href="/book-ad" className="group flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-6 rounded-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 shadow-lg border border-[#D4AF37]/20 relative overflow-hidden mt-2 shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                        <h4 className="text-[#D4AF37] font-bold text-[19px] mb-2 text-center z-10 uppercase tracking-widest drop-shadow-md">Grow Your Business</h4>
                        <p className="text-gray-300 text-[14px] text-center mb-5 z-10 leading-relaxed max-w-[250px]">Advertise on Umuahia's premier digital screen. Book a slot instantly.</p>
                        <span className="bg-[#D4AF37] text-black text-[13px] font-bold px-5 py-2.5 rounded-sm z-10 group-hover:bg-white transition-colors shadow-md">Book Ad Slot &rarr;</span>
                      </Link>
                    </div>

                  </div>

                )}

                {/* EDITOR CHOICE (Masonry or standard grid) */}
                {rest.length > 4 && (
                  <div className="mt-20">
                    <h3 className="text-3xl font-bold border-b-4 border-black pb-3 mb-10 inline-block">Editor's Choice</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                      {rest.slice(4).map((post) => (
                        <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col gap-5 bg-white/40 p-4 rounded-sm hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm backdrop-blur-md">
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200 shadow-md">
                            <img 
                              src={post.imageUrl || ""} 
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover hover-scale"
                            />
                            {post.category && (
                              <div className="absolute bottom-4 left-4 category-badge shadow-lg">
                                {post.category}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start gap-3 mt-2">
                            <h4 className="font-bold text-[22px] leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-gray-600 text-[16px] line-clamp-2 leading-relaxed">
                              {post.excerpt}
                            </p>
                            <div className="text-gray-500 text-[13px] mt-2 font-bold uppercase tracking-widest">
                              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </PublicBlogLayout>
  );
}
