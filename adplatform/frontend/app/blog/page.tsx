'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

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

function StatBadge({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: theme.color.charcoal900, color: '#fff', borderRadius: theme.radius.pill, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>
      {icon} {formatCount(value)}
    </span>
  );
}

export default function BlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog/posts?limit=20')
      .then((res) => setPosts(res.data?.posts || []))
      .catch(() => toast('Could not load the blog. Please refresh.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1100, margin: '0 auto', padding: '8px 4px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Blog</h1>

          {loading ? (
            <p style={{ textAlign: 'center', color: theme.color.text3, padding: '40px 0' }}>Loading…</p>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: theme.color.text3, padding: '40px 0' }}>No posts published yet.</p>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 24, marginBottom: 32, alignItems: 'stretch' }}>
                    <div style={{
                      borderRadius: theme.radius.lg, overflow: 'hidden', minHeight: 260,
                      background: featured.imageUrl ? `url(${featured.imageUrl}) center/cover` : theme.color.charcoal800,
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h2 style={{ fontSize: 19, fontWeight: 800, color: theme.color.text1, margin: '0 0 10px', lineHeight: 1.3 }}>{featured.title}</h2>
                        {featured.excerpt && <p style={{ fontSize: 13, color: theme.color.text3, lineHeight: 1.6, margin: '0 0 18px' }}>{featured.excerpt}</p>}
                        <div style={{ display: 'flex', gap: 28, marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 3px' }}>Category</p>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{featured.category || '—'}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 3px' }}>Publication Date</p>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 3px' }}>Author</p>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{featured.authorName || '—'}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <StatBadge icon={<Heart size={12} />} value={featured.likesCount} />
                          <StatBadge icon={<MessageCircle size={12} />} value={featured.commentsCount} />
                        </div>
                        <span style={{ background: theme.color.gold, color: theme.color.charcoal900, borderRadius: 10, padding: '9px 20px', fontSize: 12.5, fontWeight: 800 }}>Read More</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                {rest.map((p) => (
                  <Link key={p.id} href={`/blog/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden', background: theme.color.surface }}>
                      <div style={{
                        height: 140,
                        background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : theme.color.charcoal800,
                      }} />
                      <div style={{ padding: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 4px', lineHeight: 1.35, minHeight: 38 }}>{p.title}</h3>
                        <p style={{ fontSize: 11.5, color: theme.color.text4, margin: '0 0 12px' }}>{p.category || '—'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <StatBadge icon={<Heart size={11} />} value={p.likesCount} />
                            <StatBadge icon={<MessageCircle size={11} />} value={p.commentsCount} />
                          </div>
                          <span style={{ background: theme.color.gold, color: theme.color.charcoal900, borderRadius: 8, padding: '7px 14px', fontSize: 11.5, fontWeight: 800 }}>Read More</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
