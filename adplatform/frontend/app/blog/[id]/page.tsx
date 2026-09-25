'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Eye, Send, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
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

type Block = { type: 'h2' | 'p'; text: string };

function parseContent(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => { if (buf.length) { blocks.push({ type: 'p', text: buf.join(' ') }); buf = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
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
  title: 'The Rise of Artificial Intelligence in Healthcare',
  content: FALLBACK_CONTENT,
  category: 'Healthcare',
  authorName: 'Dr. Emily Walker',
  imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80',
  publishedAt: '2023-10-15T00:00:00.000Z',
  readingTimeMinutes: 10,
  likesCount: 24500,
  viewsCount: 50000,
  commentsCount: 206,
  liked: true
};

export default function BlogPostPage() {
  const params = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    api.get(`/blog/posts/${params.id}`)
      .then((res) => {
         if (res.data) setPost(res.data);
         else setPost(FALLBACK_POST);
      })
      .catch(() => {
         setPost(FALLBACK_POST);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const toggleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    const wasLiked = post.liked;
    setPost({ ...post, liked: !wasLiked, likesCount: post.likesCount + (wasLiked ? -1 : 1) });
    try {
      if (wasLiked) await api.delete(`/blog/posts/${post.id}/like`);
      else await api.post(`/blog/posts/${post.id}/like`);
    } catch {
      setPost((p) => (p ? { ...p, liked: wasLiked, likesCount: p.likesCount + (wasLiked ? 1 : -1) } : p));
      toast('Could not update your like. Please try again.', 'error');
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="flex justify-center items-center h-screen bg-[#FFFFFF] rounded-[24px]">
            <p className="text-[rgba(0,0,0,0.4)] font-normal text-[16px]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Loading...</p>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const currentPost = post || FALLBACK_POST;
  const blocks = parseContent(currentPost.content || FALLBACK_CONTENT);
  const toc = blocks.filter((b) => b.type === 'h2').map((b) => b.text);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col items-start w-full min-h-screen bg-[#FFFFFF] rounded-[24px]">
          
          {/* Hero Image */}
          <div 
            className="relative w-full h-[439px] shrink-0" 
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.880208) 75.52%, #141414 100%), url(${currentPost.imageUrl || FALLBACK_POST.imageUrl})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
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
          <div className="flex flex-col lg:flex-row items-start w-full max-w-[1228px]">
            
            {/* Left Column (Article Text) */}
            <div className="flex flex-col flex-1 py-[40px] px-[20px] lg:py-[60px] lg:px-[80px] w-full relative">
               <div className={`flex flex-col relative w-full ${!expanded ? 'max-h-[600px] overflow-hidden' : ''}`}>
                 {blocks.map((b, i) =>
                   b.type === 'h2' ? (
                     <h2 
                       key={i} 
                       className="text-[#000000] font-medium text-[16px] leading-[150%] tracking-[-0.03em] mt-[32px] mb-[12px]" 
                       style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                     >
                       {b.text}
                     </h2>
                   ) : (
                     <p 
                       key={i} 
                       className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[150%] tracking-[-0.03em] mb-[16px]" 
                       style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
                     >
                       {b.text}
                     </p>
                   )
                 )}
                 
                 {/* Fade Out Overlay */}
                 {!expanded && (
                   <div className="absolute bottom-0 left-0 right-0 h-[180px] flex items-end justify-center pb-[20px]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%)' }}>
                     <button
                       onClick={() => setExpanded(true)}
                       className="flex flex-row justify-center items-center px-[20px] py-[12px] gap-[8px] bg-[#1A1A1A] rounded-[100px] hover:bg-[#262626] transition-colors"
                     >
                       <span className="text-[#FFFFFF] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>Read Full Blog</span>
                       <ChevronDown size={16} color="#FFFFFF" />
                     </button>
                   </div>
                 )}
               </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="flex flex-col w-full lg:w-[570px] shrink-0 lg:border-l lg:border-[rgba(38,38,38,0.2)]">
               
               {/* 3 Buttons Row */}
               <div className="flex flex-row items-center py-[40px] px-[20px] lg:px-[60px] gap-[14px] lg:border-t lg:border-b lg:border-[rgba(38,38,38,0.2)] lg:border-t-transparent border-b border-[rgba(38,38,38,0.2)] w-full">
                  <button 
                     onClick={toggleLike}
                     disabled={liking}
                     className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[92px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px] hover:bg-[#1f1f1f] transition-colors disabled:opacity-50"
                  >
                     <Heart size={16} fill={currentPost.liked ? '#D4AF37' : 'none'} color={currentPost.liked ? '#D4AF37' : '#D4AF37'} />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.likesCount)}
                     </span>
                  </button>
                  
                  <div className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[81px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px]">
                     <Eye size={16} color="#98989A" />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.viewsCount)}
                     </span>
                  </div>
                  
                  <div className="flex flex-row justify-center items-center px-[14px] py-[8px] gap-[4px] min-w-[82px] h-[42px] bg-[#141414] border border-[#262626] rounded-[100px]">
                     <Send size={16} color="#98989A" />
                     <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                       {formatCount(currentPost.commentsCount)}
                     </span>
                  </div>
               </div>

               {/* Details & TOC */}
               <div className="flex flex-col items-start p-[40px_20px] lg:p-[60px_80px_60px_60px] gap-[40px] w-full">
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
                            {currentPost.category || 'Healthcare'}
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
                            {currentPost.authorName || 'Dr. Emily Walker'}
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

               </div>
            </div>

          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
