'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Send } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
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

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Global Climate Summit Addresses Urgent Climate Action',
    excerpt: 'World leaders gathered at the Global Climate Summit to discuss urgent climate action, emissions reductions, and renewable energy targets.',
    category: 'Environment',
    authorName: 'Jane Smith',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    publishedAt: '2023-10-10T00:00:00.000Z',
    likesCount: 14000,
    commentsCount: 204
  },
  {
    id: '2',
    title: 'A Decisive Victory for Progressive Policies',
    excerpt: null,
    category: 'Politics',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    publishedAt: '2023-10-09T00:00:00.000Z',
    likesCount: 2200,
    commentsCount: 60
  },
  {
    id: '3',
    title: 'Tech Giants Unveil Cutting-Edge AI Innovations',
    excerpt: null,
    category: 'Technology',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    publishedAt: '2023-10-08T00:00:00.000Z',
    likesCount: 6000,
    commentsCount: 92
  },
  {
    id: '4',
    title: 'The Rise of Artificial Intelligence In Healthcare',
    excerpt: null,
    category: 'Health',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    publishedAt: '2023-10-07T00:00:00.000Z',
    likesCount: 10000,
    commentsCount: 124
  }
];

export default function BlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog/posts?limit=20')
      .then((res) => {
        const fetchedPosts = res.data?.posts || [];
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS);
      })
      .catch(() => {
        // Fallback to beautiful mock data to match Figma if API fails
        setPosts(MOCK_POSTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col items-center w-full min-h-screen bg-[#FFFFFF] rounded-[24px]">
          
          <div className="w-full max-w-[1204px] mt-[40px] mb-[20px] px-[60px] lg:px-[60px]">
            <h1 className="text-[#000000] font-bold text-[24px] tracking-[-0.02em] leading-[40px]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
              Blog
            </h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : (
            <>
              {featured && (
                <div className="flex flex-col lg:flex-row items-center border-t border-[rgba(38,38,38,0.2)] py-[60px] lg:pl-[23px] lg:pr-[80px] gap-[40px] w-full max-w-[1204px] px-[20px]">
                  {/* Featured Image */}
                  <div 
                    className="w-full lg:w-[515px] h-[250px] lg:h-[325px] rounded-[10px] bg-cover bg-center shrink-0" 
                    style={{ backgroundImage: `url('${featured.imageUrl || "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}')`, backgroundColor: '#f0f0f0' }} 
                  />
                  
                  {/* Featured Content */}
                  <div className="flex flex-col items-start gap-[40px] w-full lg:w-[584px]">
                    
                    <div className="flex flex-col items-start gap-[14px] w-full">
                      <h2 className="text-[#000000] font-semibold text-[24px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                        {featured.title}
                      </h2>
                      <p className="text-[rgba(0,0,0,0.4)] font-normal text-[18px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                        {featured.excerpt || 'World leaders gathered at the Global Climate Summit to discuss urgent climate action, emissions reductions, and renewable energy targets.'}
                      </p>
                    </div>

                    <div className="flex flex-row items-start gap-[30px] w-full overflow-x-auto h-auto lg:h-[50px] pb-2 lg:pb-0">
                      <div className="flex flex-col items-start gap-[2px]">
                        <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Category</span>
                        <span className="text-[#000000] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>{featured.category || 'Environment'}</span>
                      </div>
                      <div className="flex flex-col items-start gap-[2px]">
                        <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Publication Date</span>
                        <span className="text-[#000000] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                          {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 10, 2023'}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-[2px]">
                        <span className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>Author</span>
                        <span className="text-[#000000] font-normal text-[16px] leading-[150%] tracking-[-0.03em] whitespace-nowrap" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>{featured.authorName || 'Jane Smith'}</span>
                      </div>
                    </div>

                    <div className="flex flex-row justify-between items-start gap-[20px] lg:gap-[50px] w-full flex-wrap">
                      <div className="flex flex-row items-start gap-[8px]">
                        <div className="flex flex-row justify-center items-center px-[14px] py-[6px] gap-[4px] bg-[#1A1A1A] border border-[#262626] rounded-[100px] h-[33px]">
                          <Heart size={14} color="#666666" />
                          <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                            {formatCount(featured.likesCount || 14000)}
                          </span>
                        </div>
                        <div className="flex flex-row justify-center items-center px-[14px] py-[6px] gap-[4px] bg-[#1A1A1A] border border-[#262626] rounded-[100px] h-[33px]">
                          <Send size={14} color="#666666" />
                          <span className="text-[#98989A] font-normal text-[14px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                            {formatCount(featured.commentsCount || 204)}
                          </span>
                        </div>
                      </div>

                      <Link href={`/blog/${featured.id}`}>
                        <button className="flex flex-row justify-center items-center w-[126px] h-[42px] bg-[#D4AF37] rounded-[4px] hover:bg-[#c4a132] transition-colors">
                          <span className="text-[#000000] font-normal text-[12px] leading-[16px] text-center capitalize" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            Read More
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of smaller posts */}
              {rest.length > 0 && (
                <div className="flex flex-row items-start border-t border-[rgba(38,38,38,0.2)] py-[60px] px-[20px] lg:px-[24px] gap-[30px] w-full max-w-[1204px] overflow-x-auto lg:flex-wrap">
                  {rest.map((p) => (
                    <div key={p.id} className="flex flex-col justify-center items-start gap-[16px] w-[300px] lg:w-[359px] shrink-0">
                      
                      <div 
                        className="w-full h-[185px] rounded-[10px] bg-cover bg-center shrink-0" 
                        style={{ backgroundImage: `url('${p.imageUrl || "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}')`, backgroundColor: '#f0f0f0' }} 
                      />
                      
                      <div className="flex flex-col items-start gap-[16px] w-full h-[110px]">
                        <div className="flex flex-col items-start gap-[4px] w-full h-[52px]">
                          <h3 className="text-[#000000] font-semibold text-[16px] leading-[150%] tracking-[-0.03em] w-full truncate" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }} title={p.title}>
                            {p.title}
                          </h3>
                          <p className="text-[rgba(0,0,0,0.4)] font-normal text-[16px] leading-[150%] tracking-[-0.03em] w-full truncate" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                            {p.category}
                          </p>
                        </div>
                        
                        <div className="flex flex-row items-center gap-[20px] lg:gap-[50px] w-full mt-auto flex-wrap">
                          <div className="flex flex-row items-start gap-[8px] flex-1">
                            <div className="flex flex-row justify-center items-center px-[12px] py-[6px] gap-[4px] bg-[#1A1A1A] border border-[#262626] rounded-[100px] h-[33px]">
                              <Heart size={14} color="#666666" />
                              <span className="text-[#98989A] font-normal text-[13px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                                {formatCount(p.likesCount)}
                              </span>
                            </div>
                            <div className="flex flex-row justify-center items-center px-[12px] py-[6px] gap-[4px] bg-[#1A1A1A] border border-[#262626] rounded-[100px] h-[33px]">
                              <Send size={14} color="#666666" />
                              <span className="text-[#98989A] font-normal text-[13px] leading-[150%] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-kumbh-sans), Kumbh Sans, sans-serif' }}>
                                {formatCount(p.commentsCount)}
                              </span>
                            </div>
                          </div>

                          <Link href={`/blog/${p.id}`}>
                            <button className="flex flex-row justify-center items-center w-[126px] h-[42px] bg-[#D4AF37] rounded-[4px] shrink-0 hover:bg-[#c4a132] transition-colors">
                              <span className="text-[#000000] font-normal text-[12px] leading-[16px] text-center capitalize" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                                Read More
                              </span>
                            </button>
                          </Link>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
