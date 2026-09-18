'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Eye, MessageCircle, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

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
  liked: boolean;
}

type Block = { type: 'h2' | 'p'; text: string };

// Real content is stored as markdown-lite (## headings, blank-line-separated
// paragraphs) — this parses it into blocks and, from the same pass, produces
// the table of contents from the post's actual section headings.
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

export default function BlogPostPage() {
  const params = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    api.get(`/blog/posts/${params.id}`)
      .then((res) => setPost(res.data))
      .catch(() => toast('Could not load this post.', 'error'))
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
          <p style={{ textAlign: 'center', color: theme.color.text3, padding: '60px 0', fontFamily: F }}>Loading…</p>
        </PageTransition>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <PageTransition>
          <p style={{ textAlign: 'center', color: theme.color.text3, padding: '60px 0', fontFamily: F }}>This post could not be found.</p>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const blocks = parseContent(post.content);
  const toc = blocks.filter((b) => b.type === 'h2').map((b) => b.text);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1100, margin: '0 auto', padding: '8px 4px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Blog</h1>

          {/* Hero */}
          <div style={{
            position: 'relative', height: 320, borderRadius: theme.radius.lg, overflow: 'hidden', marginBottom: 28,
            background: post.imageUrl ? `url(${post.imageUrl}) center/cover` : theme.color.charcoal800,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05) 60%)' }} />
            <h2 style={{ position: 'absolute', left: 28, bottom: 24, right: 28, color: '#fff', fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
              {post.title}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
            {/* Content */}
            <div style={{ position: 'relative' }}>
              <div style={{ maxHeight: expanded ? 'none' : 420, overflow: 'hidden', position: 'relative' }}>
                {blocks.map((b, i) =>
                  b.type === 'h2' ? (
                    <h3 key={i} style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: '22px 0 10px' }}>{b.text}</h3>
                  ) : (
                    <p key={i} style={{ fontSize: 13.5, color: theme.color.text2, lineHeight: 1.75, margin: '0 0 14px' }}>{b.text}</p>
                  )
                )}
                {!expanded && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: `linear-gradient(to bottom, transparent, ${theme.color.bg})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
                    <button
                      onClick={() => setExpanded(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.color.charcoal900, color: '#fff', border: 'none', borderRadius: theme.radius.pill, padding: '10px 20px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
                    >
                      Read Full Blog <ChevronDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={toggleLike}
                  disabled={liking}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: theme.color.charcoal900, color: post.liked ? theme.color.gold : '#fff', border: 'none', borderRadius: theme.radius.pill, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: liking ? 'not-allowed' : 'pointer' }}
                >
                  <Heart size={13} fill={post.liked ? theme.color.gold : 'none'} /> {formatCount(post.likesCount)}
                </button>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: theme.color.charcoal900, color: '#fff', borderRadius: theme.radius.pill, padding: '7px 14px', fontSize: 12, fontWeight: 700 }}>
                  <Eye size={13} /> {formatCount(post.viewsCount)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: theme.color.charcoal900, color: '#fff', borderRadius: theme.radius.pill, padding: '7px 14px', fontSize: 12, fontWeight: 700 }}>
                  <MessageCircle size={13} /> {formatCount(post.commentsCount)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.md, padding: 16 }}>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>Publication Date</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>Category</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{post.category || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>Reading Time</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{post.readingTimeMinutes} Min</p>
                </div>
                <div>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: theme.color.text4, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>Author Name</p>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{post.authorName || '—'}</p>
                </div>
              </div>

              {toc.length > 0 && (
                <div style={{ background: theme.color.charcoal900, borderRadius: theme.radius.md, padding: 18 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>Table of Contents</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {toc.map((t, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: theme.color.gold, marginTop: 6, flexShrink: 0 }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
