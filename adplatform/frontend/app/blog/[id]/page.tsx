'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Eye, Send, ChevronDown, Share2 } from 'lucide-react';
import PublicBlogLayout from '@/components/layout/PublicBlogLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  authorName: string | null;
  imageUrl: string | null;
  publishedAt: string;
  readingTimeMinutes: number;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  liked?: boolean;
}

type Block = { type: 'h2' | 'p' | 'img'; text: string; src?: string; alt?: string };

function parseContent(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => { if (buf.length) { blocks.push({ type: 'p', text: buf.join(' ') }); buf = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
    } else if (imgMatch) {
      flush();
      blocks.push({ type: 'img', text: '', alt: imgMatch[1], src: imgMatch[2] });
    } else if (line === '') {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

const FALLBACK_CONTENT = `## Introduction
Artificial intelligence (AI) has emerged as a transformative force in the healthcare industry, reshaping patient care, diagnostics, and research. In this blog post, we explore the profound impact of AI in healthcare, from revolutionizing diagnostic accuracy to enhancing patient outcomes.

## Artificial Intelligence (AI)
Artificial intelligence (AI) has permeated virtually every aspect of our lives, and healthcare is no exception. The integration of AI in healthcare is ushering in a new era of medical practice, where machines complement the capabilities of healthcare professionals, ultimately improving patient outcomes and the efficiency of the healthcare system. In this blog post, we will delve into the diverse applications of AI in healthcare, from diagnostic imaging to personalized treatment plans, and address the ethical considerations surrounding this revolutionary technology.

Artificial intelligence (AI) has permeated virtually every aspect of our lives, and healthcare is no exception. The integration of AI in healthcare is ushering in a new era of medical practice, where machines complement the capabilities of healthcare professionals, ultimately improving patient outcomes and the efficiency of the healthcare system. In this blog post, we will delve into the diverse applications of AI in healthcare, from diagnostic imaging to personalized treatment plans, and address the ethical considerations surrounding this revolutionary technology.

## AI in Diagnostic Imaging
One of the most prominent applications of AI in healthcare is in diagnostic imaging. AI algorithms have demonstrated remarkable proficiency in interpreting medical images such as X-rays, MRIs, and CT scans. They can identify anomalies and deviations that might be overlooked by the human eye. This is particularly valuable in early disease detection, for instance, AI can aid radiologists in detecting minute irregularities in...

## Predictive Analytics and Disease Prevention
AI can help predict...

## Personalized Treatment Plans
AI can customize...

## Drug Discovery and Research
Accelerating the pipeline...

## AI in Telemedicine
Virtual care...

## Ethical Considerations
Data privacy...

## The Future of AI in Healthcare
Looking forward...

## Conclusion
Wrap up...`;

const FALLBACK_POST: BlogPost = {
  id: 'fallback',
  title: 'The Rise of Digital Billboards & High-Impact Media',
  content: FALLBACK_CONTENT,
  category: 'Advertising & Media',
  authorName: 'Studio Arella Insights',
  imageUrl: '/billboard.jpg',
  publishedAt: '2025-10-15T00:00:00.000Z',
  readingTimeMinutes: 6,
  likesCount: 24500,
  viewsCount: 50000,
  commentsCount: 206,
  liked: true
};

export default function BlogPostPage() {
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [liking, setLiking] = useState(false);
  const viewRecordedForId = useRef<string | null>(null);

  useEffect(() => {
    const postId = String(params.id || '');
    if (!postId) return;

    const alreadyCountedInMount = viewRecordedForId.current === postId;
    viewRecordedForId.current = postId;

    const localLiked = typeof window !== 'undefined' && localStorage.getItem(`blog_liked_${postId}`) === '1';

    // Fetch from internal DB route (which atomically increments views_count on initial load)
    fetch(`/api/blog-fallback/${postId}${alreadyCountedInMount ? '?noView=1' : ''}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found in internal DB');
        return res.json();
      })
      .then(data => {
        setPost({ ...data, liked: Boolean(data.liked || localLiked) });
        setLoading(false);
      })
      .catch(() => {
        // Fallback to Render API (which also increments views_count)
        api.get(`/blog/posts/${postId}`)
          .then((res) => {
             if (res.data) setPost({ ...res.data, liked: Boolean(res.data.liked || localLiked) });
             else setPost(FALLBACK_POST);
          })
          .catch(() => {
             setPost(FALLBACK_POST);
          })
          .finally(() => setLoading(false));
      });
  }, [params.id]);

  const toggleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    const wasLiked = Boolean(post.liked);
    const nextLiked = !wasLiked;
    const optimisticLikes = Math.max(0, post.likesCount + (nextLiked ? 1 : -1));

    setPost({ ...post, liked: nextLiked, likesCount: optimisticLikes });
    if (typeof window !== 'undefined') {
      if (nextLiked) localStorage.setItem(`blog_liked_${post.id}`, '1');
      else localStorage.removeItem(`blog_liked_${post.id}`);
    }

    try {
      const res = await fetch(`/api/blog-fallback/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextLiked ? 'like' : 'unlike',
          userId: (user as any)?.id
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPost((prev) => prev ? { ...prev, liked: nextLiked, likesCount: updated.likesCount } : prev);
      } else {
        if (wasLiked) await api.delete(`/blog/posts/${post.id}/like`);
        else await api.post(`/blog/posts/${post.id}/like`);
      }
    } catch {
      setPost((p) => (p ? { ...p, liked: wasLiked, likesCount: Math.max(0, p.likesCount + (wasLiked ? 1 : -1)) } : p));
      toast('Could not update your like. Please try again.', 'error');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    // Optimistically increment the share/send counter and persist to DB
    setPost((prev) => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev);
    fetch(`/api/blog-fallback/${post.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'share' }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.commentsCount === 'number') {
          setPost((prev) => (prev ? { ...prev, commentsCount: data.commentsCount } : prev));
        }
      })
      .catch(() => {
        api.post(`/blog/posts/${post.id}/share`).catch(() => {});
      });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Studio Arella News',
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard copy if user cancels native share sheet
      }
    }
    if (shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast('Article link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <PublicBlogLayout>
        <PageTransition>
          <div className="flex justify-center items-center h-screen bg-[#FFFFFF] rounded-[24px]">
            <p className="text-[rgba(0,0,0,0.4)] font-normal text-[16px]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Loading...</p>
          </div>
        </PageTransition>
      </PublicBlogLayout>
    );
  }

  const currentPost = post || FALLBACK_POST;
  const blocks = parseContent(currentPost.content || FALLBACK_CONTENT);
  const toc = blocks.filter((b) => b.type === 'h2').map((b) => b.text);

  return (
    <PublicBlogLayout>
      <PageTransition>
        <div className="flex flex-col items-start w-full min-h-screen bg-[#FFFFFF] rounded-[24px]">
          
          {/* Hero Image */}
          <div 
            className="relative w-full h-[439px] shrink-0" 
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.880208) 75.52%, #141414 100%), url('${currentPost.imageUrl || FALLBACK_POST.imageUrl}')`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center 20%' 
            }}
          >
            <h1 
              className="absolute bottom-[35px] left-1/2 -translate-x-1/2 w-full max-w-[908px] px-[20px] text-center text-[#FFFFFF] font-semibold text-[32px] md:text-[44px] leading-[150%] tracking-[-0.03em]" 
              style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
            >
              {currentPost.title}
            </h1>
          </div>

          {/* 2-Column Section */}
          <div className="flex flex-col lg:flex-row items-start w-full max-w-[1228px] mx-auto">
            
            {/* Left Column (Article Text) */}
            <div className="flex flex-col flex-1 py-[40px] px-[20px] lg:py-[60px] lg:px-[40px] w-full relative">
               <div className={`flex flex-col relative w-full ${!expanded ? 'max-h-[600px] overflow-hidden' : ''}`}>
                 {blocks.map((b, i) => {
                     if (b.type === 'h2') {
                       return (
                         <h2 
                           key={i} 
                           className="text-[#000000] font-medium text-[20px] leading-[150%] tracking-[-0.03em] mt-[40px] mb-[16px]" 
                           style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                         >
                           {b.text}
                         </h2>
                       );
                     } else if (b.type === 'img') {
                       return (
                         <img 
                           key={i} 
                           src={b.src} 
                           alt={b.alt} 
                           className="w-full rounded-lg my-8 object-cover shadow-sm border border-gray-100"
                           style={{ maxHeight: '500px' }}
                         />
                       );
                     } else {
                       return (
                         <p 
                           key={i} 
                           className="text-gray-700 font-normal text-[17px] leading-[170%] tracking-[-0.02em] mb-[20px]" 
                           style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                         >
                           {b.text}
                         </p>
                       );
                     }
                   })}
                 
                 {/* Fade Out Overlay */}
                 {!expanded && (
                   <div className="absolute bottom-0 left-0 right-0 h-[180px] flex items-end justify-center pb-[20px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%)' }}>
                     <button
                       onClick={() => setExpanded(true)}
                       className="flex flex-row justify-center items-center px-[20px] py-[12px] gap-[8px] bg-[#1A1A1A] rounded-[100px] hover:bg-[#262626] transition-colors cursor-pointer"
                     >
                       <span className="text-[#FFFFFF] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>Read Full Blog</span>
                       <ChevronDown size={16} color="#FFFFFF" />
                     </button>
                   </div>
                 )}
               </div>

               {/* Contextual Platform CTA Banner at the bottom of the article */}
               <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#D4AF37]/30 text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                 <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full mb-3">
                   Studio Arella Platform
                 </span>
                 <h3 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                   Advertise on Digital Billboards or Earn as a Creator
                 </h3>
                 <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                   Studio Arella connects brands with high-impact digital billboard screens and top creators across Nigeria. Launch an ad campaign in minutes or join our creator network to monetize your audience.
                 </p>
                 <div className="flex flex-wrap items-center gap-3">
                   {!user && (
                     <Link
                       href="/auth/register"
                       className="px-6 py-3 rounded-lg bg-[#D4AF37] text-[#121212] font-bold text-sm hover:bg-white transition-colors"
                     >
                       Create Free Account &rarr;
                     </Link>
                   )}
                   <Link
                     href="/book-ad"
                     className="px-6 py-3 rounded-lg bg-[#262626] text-white font-semibold text-sm border border-gray-700 hover:border-[#D4AF37] transition-colors"
                   >
                     Book Ad Slot
                   </Link>
                   <button
                     onClick={handleShare}
                     className="px-4 py-3 rounded-lg bg-transparent text-gray-300 font-semibold text-sm border border-gray-800 hover:text-white hover:border-gray-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
                   >
                     <Share2 size={15} />
                     Share Story
                   </button>
                 </div>
               </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="flex flex-col w-full lg:w-[400px] shrink-0 lg:border-l lg:border-[rgba(38,38,38,0.2)]">
               
               {/* 3 Metrics Row: Likes, Views, Shares */}
               <div className="flex flex-row items-center justify-between py-[40px] px-[20px] lg:px-[40px] gap-[14px] lg:border-t lg:border-b lg:border-[rgba(38,38,38,0.2)] lg:border-t-transparent border-b border-[rgba(38,38,38,0.2)] w-full">
                  <button 
                     onClick={toggleLike}
                     disabled={liking}
                     title="Like this article"
                     className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[92px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px] hover:bg-[#1f1f1f] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                     <Heart size={16} fill={currentPost.liked ? '#D4AF37' : 'none'} color="#D4AF37" />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.likesCount)}
                     </span>
                  </button>
                  
                  <div
                     title="Total article views"
                     className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[81px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px]"
                  >
                     <Eye size={16} color="#98989A" />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.viewsCount)}
                     </span>
                  </div>
                  
                  <button
                     onClick={handleShare}
                     title="Share this article"
                     className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[82px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px] hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                  >
                     <Send size={16} color="#98989A" />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.commentsCount)}
                     </span>
                  </button>
               </div>

               {/* Details & TOC */}
               <div className="flex flex-col items-start p-[40px_20px] lg:p-[40px] gap-[40px] w-full">
                  {/* Metadata Grid */}
                  <div className="flex flex-col gap-[20px] w-full max-w-[430px]">
                    <div className="flex flex-row items-start gap-[20px] w-full h-auto lg:h-[54px]">
                       <div className="flex flex-col flex-1 gap-[6px] h-full">
                          <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Publication Date</span>
                          <span className="text-[#000000] font-medium text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            {new Date(currentPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                       </div>
                       <div className="flex flex-col flex-1 gap-[6px] h-full">
                          <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Category</span>
                          <span className="text-[#000000] font-medium text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            {currentPost.category || 'News'}
                          </span>
                       </div>
                    </div>
                    
                    <div className="flex flex-row items-start gap-[20px] w-full h-auto lg:h-[54px]">
                       <div className="flex flex-col flex-1 gap-[6px] h-full">
                          <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Reading Time</span>
                          <span className="text-[#000000] font-medium text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            {currentPost.readingTimeMinutes} Min
                          </span>
                       </div>
                       <div className="flex flex-col flex-1 gap-[6px] h-full">
                          <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Author Name</span>
                          <span className="text-[#000000] font-medium text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            {currentPost.authorName || 'Studio Arella'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Table of Contents */}
                  {toc.length > 0 && (
                    <div className="flex flex-col items-start gap-[14px] w-full max-w-[430px]">
                       <h3 className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Table of Contents</h3>
                       <div className="flex flex-col items-start p-[18px] gap-[16px] w-full bg-[#1A1A1A] rounded-[10px]">
                          {toc.map((t, i) => (
                            <div key={i} className="flex flex-row items-center gap-[12px] w-full">
                              <div className="w-[4px] h-[4px] bg-[#FFFFFF] rounded-full shrink-0" />
                              <span className="text-[#FFFFFF] font-normal text-[16px] leading-[24px] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                                {t}
                              </span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Sidebar Advertising & App Signup CTA Card */}
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-6 rounded-[12px] shadow-lg border border-[#D4AF37]/20 relative overflow-hidden w-full max-w-[430px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                    <h4 className="text-[#D4AF37] font-bold text-[18px] mb-2 text-center z-10 uppercase tracking-widest drop-shadow-md">
                      Grow Your Business
                    </h4>
                    <p className="text-gray-300 text-[14px] text-center mb-5 z-10 leading-relaxed">
                      Advertise on Umuahia&apos;s premier digital screen or partner with creators. Book a slot instantly.
                    </p>
                    <div className="flex flex-col gap-2.5 w-full z-10">
                      <Link
                        href="/book-ad"
                        className="w-full text-center bg-[#D4AF37] text-black text-[13px] font-bold px-5 py-2.5 rounded-sm hover:bg-white transition-colors shadow-md"
                      >
                        Book Ad Slot &rarr;
                      </Link>
                      {!user && (
                        <Link
                          href="/auth/register"
                          className="w-full text-center bg-[#262626] text-white text-[13px] font-semibold px-5 py-2.5 rounded-sm hover:bg-[#333333] transition-colors border border-gray-700"
                        >
                          Create Free Account
                        </Link>
                      )}
                    </div>
                  </div>

               </div>
            </div>

          </div>
        </div>
      </PageTransition>
    </PublicBlogLayout>
  );
}
