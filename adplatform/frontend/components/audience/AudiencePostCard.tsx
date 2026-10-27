'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  Check,
  PenLine,
  X,
  Eye
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import AudienceTipModal from './AudienceTipModal';

export interface PostData {
  id: string;
  author: {
    id?: string;
    name: string;
    role: string;
    avatar: string;
    tier?: string;
  };
  title: string;
  description?: string;
  mediaUrl: string;
  duration?: string;
  currentTime?: string;
  progressPercent?: number;
  initialLikes?: number;
  initialComments?: number;
  badgeTheme?: 'gold' | 'green';
  isBookmarked?: boolean;
  hasLiked?: boolean;
  isPremium?: boolean;
  price?: number;
  isUnlocked?: boolean;
  category?: string;
  tags?: string[];
  viewsCount?: number;
  repostsCount?: number;
  hasReposted?: boolean;
  quoteParentId?: string | null;
  quotePost?: {
    id?: string;
    author: {
      id?: string;
      name: string;
      role?: string;
      avatar?: string;
    };
    title: string;
    mediaUrl?: string;
  } | null;
}

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt?: string;
}

interface AudiencePostCardProps {
  post: PostData;
}

export default function AudiencePostCard({ post }: AudiencePostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(255); // 04:15 default
  const totalSeconds = 4500; // 01:15:00 default
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Engagement state
  const [likes, setLikes] = useState(post.initialLikes || 0);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const [commentsCount, setCommentsCount] = useState(post.initialComments || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Tip modal & unlock state
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    post.isUnlocked ?? (!post.isPremium || post.author.id === user?.id)
  );
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasReposted, setHasReposted] = useState(post.hasReposted || false);
  const [repostCount, setRepostCount] = useState(post.repostsCount || 0);
  const [viewsCountState, setViewsCountState] = useState(
    post.viewsCount || Math.max(34, (post.initialLikes || 0) * 8 + 42)
  );

  // X-Style Repost Menu, Quote Modal, and Analytics Modal states
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const repostMenuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (post.isBookmarked !== undefined) setIsBookmarked(post.isBookmarked);
    if (post.isUnlocked !== undefined) setIsUnlocked(post.isUnlocked);
    if (typeof post.initialLikes === 'number') setLikes(post.initialLikes);
    if (typeof post.initialComments === 'number') setCommentsCount(post.initialComments);
    if (post.hasLiked !== undefined) setHasLiked(post.hasLiked);
    if (typeof post.repostsCount === 'number') setRepostCount(post.repostsCount);
    if (post.hasReposted !== undefined) setHasReposted(post.hasReposted);
    if (typeof post.viewsCount === 'number' && post.viewsCount > 0) setViewsCountState(post.viewsCount);
  }, [post.isBookmarked, post.isUnlocked, post.initialLikes, post.initialComments, post.hasLiked, post.repostsCount, post.hasReposted, post.viewsCount]);

  // ── X / IAB-Standard Viewability Tracking (50% Visible for 1s + Session Deduplication) ──
  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.id);
    if (!isUuid || !cardRef.current) return;

    // Check if this post was already counted in the current browser session
    const sessionKey = `viewed_post_${post.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      return;
    }

    let visibilityTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Standard viewability: at least 50% in view (or 35% if card is taller than viewport on mobile)
        const isSufficientlyVisible = 
          entry.isIntersecting && 
          (entry.intersectionRatio >= 0.5 || (entry.boundingClientRect.height > (window.innerHeight * 0.7) && entry.intersectionRatio >= 0.35));

        if (isSufficientlyVisible) {
          if (!visibilityTimer) {
            // User is actively focused on this post; track after 1.0 second dwell time
            visibilityTimer = setTimeout(() => {
              try {
                sessionStorage.setItem(sessionKey, '1');
              } catch (_) {}

              fetch(`/api/content/${post.id}/view`, { method: 'POST' })
                .then((r) => r.json())
                .then((data) => {
                  if (typeof data?.viewsCount === 'number') {
                    setViewsCountState(data.viewsCount);
                  }
                })
                .catch(() => {});

              observer.disconnect();
            }, 1000);
          }
        } else {
          // User scrolled away before 1 second elapsed; cancel tracking
          if (visibilityTimer) {
            clearTimeout(visibilityTimer);
            visibilityTimer = null;
          }
        }
      },
      {
        threshold: [0.35, 0.5]
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
      observer.disconnect();
    };
  }, [post.id]);

  // Close repost dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
        setShowRepostMenu(false);
      }
    };
    if (showRepostMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showRepostMenu]);

  // Handle Simulated Audio Playback
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentSeconds(Math.floor(newPercent * totalSeconds));
  };

  // Helper for direct Next.js API requests with auth token
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // ── LIKE TOGGLE (Connected to Next.js API -> Supabase DB) ───────────────────
  const handleLike = async () => {
    if (isLiking) return;
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    setIsLiking(true);

    try {
      const res = await fetch(`/api/content/${post.id}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: user?.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likesCount === 'number') {
          setLikes(data.likesCount);
        }
        if (typeof data.liked === 'boolean') {
          setHasLiked(data.liked);
        }
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // ── BOOKMARK TOGGLE ──────────────────────────────────────────────────────────
  const handleToggleBookmark = async () => {
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bookmarks-changed', {
          detail: { contentId: post.id, bookmarked: nextBookmarked },
        })
      );
    }

    try {
      const res = await fetch(`/api/content/${post.id}/bookmark`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: user?.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.bookmarked === 'boolean') {
          setIsBookmarked(data.bookmarked);
        }
      }
      toast(nextBookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks', 'info');
    } catch (err) {
      console.warn('Bookmark toggle failed:', err);
    }
  };

  // ── TOGGLE & LOAD COMMENTS (Enlarged interactive response) ──────────────────
  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    // Immediately focus into the comment input so the user sees something happened
    if (nextShow) {
      setTimeout(() => {
        commentInputRef.current?.focus();
        commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }

    if (nextShow && commentsList.length === 0) {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/content/${post.id}/comments`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.comments)) {
            setCommentsList(data.comments);
            if (typeof data.total === 'number') {
              setCommentsCount(data.total);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  // ── ADD COMMENT ──────────────────────────────────────────────────────────────
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isPostingComment) return;
    const text = commentInput.trim();
    setIsPostingComment(true);

    const tempComment: CommentItem = {
      id: `temp-${Date.now()}`,
      author: user?.name || 'You',
      avatar: user?.avatar || '/audience/adam-udochi.png',
      text,
      createdAt: new Date().toISOString()
    };

    setCommentsList((prev) => [...prev, tempComment]);
    setCommentsCount((prev) => prev + 1);
    setCommentInput('');
    setShowComments(true);

    try {
      const res = await fetch(`/api/content/${post.id}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          comment: text,
          authorName: user?.name || 'You',
          authorAvatar: user?.avatar || '/audience/adam-udochi.png',
          userId: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsList((prev) =>
            prev.map((c) => (c.id === tempComment.id ? data.comment : c))
          );
        }
        if (typeof data.commentsCount === 'number') {
          setCommentsCount(data.commentsCount);
        }
        toast('Comment posted!', 'success');
      }
    } catch (err) {
      console.warn('Comment post failed:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  // ── REPOST (Connected to Next.js API -> PostgreSQL) ────────────────────────
  const handleInstantRepost = async () => {
    setShowRepostMenu(false);
    if (!user) {
      toast('Please sign in to repost.', 'error');
      return;
    }
    const nextReposted = !hasReposted;
    setHasReposted(nextReposted);
    setRepostCount((prev) => (nextReposted ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/content/${post.id}/repost`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: user?.id })
      });
      if (res.ok) {
        const data = await res.json();
        setHasReposted(data.reposted);
        setRepostCount(data.repostsCount);
        toast(data.reposted ? 'Reposted to your audience feed!' : 'Removed repost', 'info');
      }
    } catch (err) {
      console.warn('Repost error:', err);
    }
  };

  // ── QUOTE POST (Connected to Next.js API -> PostgreSQL) ─────────────────────
  const handleQuoteSubmit = async () => {
    if (!quoteText.trim()) return;
    if (!user) {
      toast('Please sign in to quote posts.', 'error');
      return;
    }
    setIsQuoting(true);

    try {
      const payload = {
        title: quoteText.trim(),
        content_type: 'quote',
        quote_parent_id: post.id,
        quote_post: {
          id: post.id,
          author: {
            id: post.author.id,
            name: post.author.name,
            role: post.author.role,
            avatar: post.author.avatar
          },
          title: post.title,
          mediaUrl: post.mediaUrl || ''
        },
        userId: user?.id
      };

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const createdPost = data.post;
        if (createdPost) {
          const authorName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'You';
          const authorRole = user?.role === 'screen_owner' 
            ? 'Media Partner' 
            : user?.role === 'admin' 
            ? 'Administrator' 
            : (user?.creator_niche || 'Creator');

          const newFormattedPost: PostData = {
            id: String(createdPost.id),
            author: {
              id: user?.id || '',
              name: authorName,
              role: authorRole,
              avatar: user?.avatar || '/audience/adam-udochi.png',
              tier: user?.creator_tier || 'free',
            },
            title: quoteText.trim(),
            description: '',
            mediaUrl: '',
            initialLikes: 0,
            initialComments: 0,
            repostsCount: 0,
            viewsCount: 1,
            quoteParentId: post.id,
            quotePost: payload.quote_post,
            badgeTheme: 'gold'
          };

          window.dispatchEvent(new CustomEvent('post-created', { detail: newFormattedPost }));
        }

        setIsQuoteModalOpen(false);
        setQuoteText('');
        setRepostCount((prev) => prev + 1);
        toast('Quoted post published to your feed!', 'success');
      } else {
        toast('Failed to publish quote post.', 'error');
      }
    } catch (err) {
      console.error('Quote error:', err);
      toast('Failed to publish quote post.', 'error');
    } finally {
      setIsQuoting(false);
    }
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  // ── SHARE ───────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/audience#${post.id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: post.title,
            text: `Check out this post on Studio Arella: ${post.title}`,
            url: shareUrl,
          });
          return;
        } catch {
          // Fallback to clipboard
        }
      }
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      toast('Post link copied to clipboard!', 'info');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // ── UNLOCK PREMIUM CONTENT ───────────────────────────────────────────────────
  const handleUnlock = async () => {
    if (!user) {
      toast('Please sign in to unlock premium content.', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsUnlocking(true);
      const res = await fetch(`/api/content/${post.id}/purchase`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setIsUnlocked(true);
        toast(`You now have full access to "${post.title}".`, 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast(errData.error || 'Could not complete purchase. Please try again.', 'error');
      }
    } catch (err: any) {
      console.error('Failed to unlock content:', err);
      toast('Could not complete purchase. Please try again.', 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  const cleanTitle = post.title.replace(/^[-–—\s]+/, '');
  const isVideoMedia = Boolean(
    post.mediaUrl && (
      post.mediaUrl.startsWith('data:video/') ||
      post.mediaUrl.match(/\.(mp4|mov|webm|ogg|m4v)($|\?)/i) ||
      post.category?.toLowerCase() === 'video'
    )
  );

  return (
    <article 
      ref={cardRef}
      id={post.id}
      className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-3.5 font-quicksand transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
    >
      {/* ─── 1. Header: Author Info & Tip Action ─── */}
      <div className="flex items-center justify-between">
        <div 
          onClick={() => router.push(`/audience?view=creator-profile&creatorId=${post.author.id || ''}`)}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View ${post.author.name}'s profile`}
        >
          <div className="relative">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-amber-100 group-hover:ring-[#D4AF37] transition-all shadow-xs"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-bold flex items-center justify-center shrink-0 ring-2 ring-amber-100 text-sm uppercase">
                {post.author.name ? post.author.name.charAt(0) : 'A'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors leading-tight">
                {post.author.name}
              </h4>
              {post.author.tier === 'pro' && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-black tracking-wider shadow-2xs">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-normal mt-0.5">
              {post.author.role}
            </p>
          </div>
        </div>

        {/* Tip Button */}
        <button
          type="button"
          onClick={() => setIsTipModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/90 text-[#8c711a] border border-amber-200/80 text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
          title={`Tip ${post.author.name}`}
        >
          <Heart size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
          <span>Tip</span>
        </button>
      </div>

      {/* ─── 2. Post Title & Description ─── */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-950 leading-snug tracking-tight">
          {cleanTitle}
        </h3>

        {post.description && post.description.trim() !== cleanTitle.trim() && (
          <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed font-normal">
            {post.description}
          </p>
        )}

        {/* Embedded Quoted Post Card */}
        {post.quotePost && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (post.quotePost?.id) {
                const el = document.getElementById(post.quotePost.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="mt-1 w-full rounded-2xl border border-gray-200/90 bg-gray-50/70 hover:bg-gray-100/70 transition-all p-3.5 flex flex-col gap-2 cursor-pointer shadow-2xs group/quote"
          >
            <div className="flex items-center gap-2">
              {post.quotePost.author?.avatar ? (
                <img 
                  src={post.quotePost.author.avatar} 
                  alt={post.quotePost.author.name} 
                  className="w-5 h-5 rounded-full object-cover shrink-0" 
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {post.quotePost.author?.name ? post.quotePost.author.name.charAt(0) : 'A'}
                </div>
              )}
              <span className="text-xs font-bold text-gray-900 group-hover/quote:text-[#D4AF37] transition-colors truncate">
                {post.quotePost.author?.name}
              </span>
              <span className="text-[11px] text-gray-500 truncate">
                · {post.quotePost.author?.role || 'Creator'}
              </span>
            </div>

            <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed font-normal">
              {post.quotePost.title}
            </p>

            {Boolean(post.quotePost.mediaUrl && post.quotePost.mediaUrl.trim()) && (
              <div className="w-full aspect-[21/9] max-h-36 rounded-xl overflow-hidden bg-black mt-1">
                <img 
                  src={post.quotePost.mediaUrl} 
                  alt="Quoted media" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
          </div>
        )}

        {post.isPremium && (
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/70 border border-amber-300/80 text-[#8c711a] text-xs font-bold shadow-2xs">
              <Lock size={12} /> PREMIUM • ₦{(post.price || 1500).toLocaleString()}
            </span>
            {isUnlocked && (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ✓ Unlocked
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── 3. Media Card & Sleek Video / Audio Player ─── */}
      {Boolean(post.mediaUrl && post.mediaUrl.trim()) && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black group shadow-md border border-gray-100">
          {isVideoMedia ? (
            <video 
              src={post.mediaUrl} 
              controls 
              playsInline 
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              <img 
                src={post.mediaUrl} 
                alt={cleanTitle} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${
                  post.isPremium && !isUnlocked ? 'filter blur-md scale-105' : ''
                }`}
              />

              {/* Paywall Overlay for Locked Content */}
              {post.isPremium && !isUnlocked ? (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-lg">
                    <Lock size={22} className="text-[#D4AF37]" />
                  </div>
                  <h4 className="text-base font-bold text-white">Exclusive Creator Episode</h4>
                  <p className="text-xs text-gray-300 max-w-xs mt-1.5 mb-5 leading-relaxed">
                    Unlock full streaming & download access. 85% goes directly to {post.author.name}&apos;s creator wallet.
                  </p>
                  <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#c49f2b] text-black text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUnlocking ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Unlock size={14} />
                        <span>Unlock for ₦{(post.price || 1500).toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Sleek Floating Audio Player */
                <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 sm:px-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col gap-2 z-10">
                  {/* Progress Bar & Scrubber */}
                  <div 
                    onClick={handleSeek}
                    className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer relative transition-all group/scrub"
                    title="Seek audio position"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3D77A] rounded-full transition-all relative" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between text-white text-xs mt-0.5">
                    <div className="flex items-center gap-3">
                      {/* Play / Pause Circular Button */}
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-[#D4AF37] hover:bg-[#e2c151] text-black flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer shrink-0"
                        title={isPlaying ? 'Pause' : 'Play Episode'}
                      >
                        {isPlaying ? (
                          <Pause size={14} className="fill-black text-black" />
                        ) : (
                          <Play size={14} className="fill-black text-black translate-x-0.5" />
                        )}
                      </button>

                      {/* Dynamic Soundwave Bars */}
                      <div className="flex items-center gap-0.5 h-4">
                        {[40, 80, 50, 95, 60, 30].map((height, idx) => (
                          <span
                            key={idx}
                            className={`w-1 rounded-full bg-[#D4AF37] transition-all duration-300 ${
                              isPlaying ? 'animate-pulse' : 'opacity-60'
                            }`}
                            style={{
                              height: isPlaying ? `${Math.max(20, (height + (idx % 2) * 20))}%` : '30%',
                              animationDelay: `${idx * 120}ms`
                            }}
                          />
                        ))}
                      </div>

                      <span className="font-semibold text-white/95 text-[12px] tracking-tight">
                        {formatTime(currentSeconds)} / {post.duration || '01:15:00'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80">
                      <span className="text-[11px] font-medium hidden sm:inline text-white/70">Studio Audio HD</span>
                      <Volume2 size={15} className="text-white/80" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── 4. Modern X (Twitter) Style Engagement Bar ─── */}
      <div className="flex items-center justify-between pt-2.5 pb-0.5 border-t border-gray-100 text-gray-500 select-none">
        {/* 1. Reply / Comments */}
        <button
          type="button"
          onClick={handleToggleComments}
          className="flex items-center gap-1 group cursor-pointer transition-colors"
          title="Reply / View comments"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-sky-50 group-hover:text-sky-500">
            <MessageCircle 
              size={18} 
              strokeWidth={1.8} 
              className={showComments ? 'text-sky-500 fill-sky-100' : 'text-gray-500 group-hover:text-sky-500 transition-colors'} 
            />
          </div>
          <span className={`text-[13px] font-medium transition-colors ${showComments ? 'text-sky-600 font-semibold' : 'text-gray-500 group-hover:text-sky-500'}`}>
            {commentsCount > 0 ? commentsCount : ''}
          </span>
        </button>

        {/* 2. Repost / Retweet Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRepostMenu((prev) => !prev);
            }}
            className="flex items-center gap-1 group cursor-pointer transition-colors"
            title="Repost or Quote"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500">
              <Repeat2 
                size={18} 
                strokeWidth={1.9} 
                className={hasReposted ? 'text-emerald-500 font-bold' : 'text-gray-500 group-hover:text-emerald-500 transition-colors'} 
              />
            </div>
            <span className={`text-[13px] font-medium transition-colors ${hasReposted ? 'text-emerald-600 font-semibold' : 'text-gray-500 group-hover:text-emerald-500'}`}>
              {repostCount > 0 ? repostCount : ''}
            </span>
          </button>

          {/* X-Style Floating Repost / Quote Menu */}
          {showRepostMenu && (
            <div 
              ref={repostMenuRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-2 w-44 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.14)] border border-gray-100 py-1.5 z-40 flex flex-col animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                type="button"
                onClick={handleInstantRepost}
                className="flex items-center gap-3 px-4 py-2.5 text-left text-[14px] font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Repeat2 size={18} className={hasReposted ? 'text-emerald-500' : 'text-gray-600'} />
                <span>{hasReposted ? 'Undo Repost' : 'Repost'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRepostMenu(false);
                  setIsQuoteModalOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-left text-[14px] font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <PenLine size={18} className="text-gray-600" />
                <span>Quote Post</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Like (Heart with lively pop effect) */}
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1 group cursor-pointer transition-colors"
          title={hasLiked ? 'Unlike' : 'Like'}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-rose-50 group-hover:text-rose-500">
            <Heart 
              size={18} 
              strokeWidth={1.8} 
              className={`transition-all duration-200 ${
                hasLiked 
                  ? 'text-[#D4AF37] fill-[#D4AF37] scale-110 drop-shadow-xs' 
                  : 'text-gray-500 group-hover:text-rose-500 group-active:scale-125'
              }`} 
            />
          </div>
          <span className={`text-[13px] font-medium transition-colors ${hasLiked ? 'text-[#c49f2b] font-bold' : 'text-gray-500 group-hover:text-rose-500'}`}>
            {likes > 0 ? likes.toLocaleString() : ''}
          </span>
        </button>

        {/* 4. Views / Impressions Analytics Button */}
        <button
          type="button"
          onClick={() => setIsAnalyticsModalOpen(true)}
          className="flex items-center gap-1 group cursor-pointer transition-colors"
          title={`${viewsCountState.toLocaleString()} views • Click for analytics`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-sky-50 group-hover:text-sky-500">
            <BarChart2 
              size={18} 
              strokeWidth={1.8} 
              className="text-gray-500 group-hover:text-sky-500 transition-colors" 
            />
          </div>
          <span className="text-[13px] font-medium text-gray-500 group-hover:text-sky-500 transition-colors">
            {formatViews(viewsCountState)}
          </span>
        </button>

        {/* 5. Right Action Group: Bookmark & Share */}
        <div className="flex items-center gap-0.5">
          {/* Bookmark */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:bg-amber-50 active:scale-90 transition-all cursor-pointer"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <Bookmark 
              size={18} 
              strokeWidth={1.8} 
              className={isBookmarked ? 'fill-[#D4AF37] text-[#D4AF37]' : 'transition-colors'} 
            />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-sky-500 hover:bg-sky-50 active:scale-90 transition-all cursor-pointer"
            title="Share post"
          >
            {copiedLink ? (
              <Check size={18} strokeWidth={2.2} className="text-emerald-600 animate-bounce" />
            ) : (
              <Share size={18} strokeWidth={1.8} className="transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* ─── 5. Comments Section & Input ─── */}
      <div className="flex flex-col gap-2.5 pt-1">
        {/* Comment Input Row */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name || 'You'} 
                className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-bold flex items-center justify-center text-xs uppercase ring-1 ring-amber-200 shadow-xs">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
            )}
          </div>

          <div className={`flex-1 h-11 bg-gray-50 hover:bg-gray-100/80 focus-within:bg-white rounded-full px-4 flex items-center justify-between border transition-all ${
            showComments ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 bg-white' : 'border-gray-200/80'
          }`}>
            <input 
              ref={commentInputRef}
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment or share your thoughts..."
              className="flex-1 bg-transparent text-[13px] font-quicksand text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <button 
              type="submit" 
              disabled={!commentInput.trim() || isPostingComment}
              className="px-4 py-1.5 rounded-full bg-[#D4AF37] hover:bg-[#c9a32c] text-white disabled:bg-gray-200 disabled:text-gray-400 font-bold text-xs ml-2 cursor-pointer transition-all shadow-xs"
            >
              {isPostingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Comments Drawer */}
        {showComments && (
          <div className="mt-1 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {isLoadingComments ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading conversation...</div>
            ) : commentsList.length === 0 ? (
              <div className="py-3 px-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-[#8c711a] flex items-center justify-between shadow-2xs">
                <span className="font-medium">💬 Be the first to share your thoughts on this episode!</span>
                <span 
                  className="text-[11px] underline font-bold cursor-pointer hover:text-black" 
                  onClick={() => commentInputRef.current?.focus()}
                >
                  Type below ↓
                </span>
              </div>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 bg-gray-50/80 p-3 rounded-xl border border-gray-100/60">
                  <div className="relative shrink-0">
                    {c.avatar ? (
                      <img 
                        src={c.avatar} 
                        alt={c.author} 
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-[#8c711a] font-bold flex items-center justify-center text-[10px]">
                        {c.author.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-gray-900">{c.author}</span>
                      {c.createdAt && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-700 leading-snug font-normal">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tip Creator Modal */}
      <AudienceTipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creatorId={post.author.id || ''}
        creatorName={post.author.name}
        creatorRole={post.author.role}
        creatorAvatar={post.author.avatar}
        contentId={post.id}
      />

      {/* ─── Quote Post Modal (X/Twitter Style) ─── */}
      {isQuoteModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsQuoteModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">Quote Post</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              {/* Creator commentary textarea */}
              <div className="flex items-start gap-3">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || 'User'} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-200 text-black font-bold flex items-center justify-center text-sm shrink-0">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <textarea 
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="Add your thoughts or commentary..."
                    rows={3}
                    autoFocus
                    className="w-full text-[15px] text-gray-900 placeholder:text-gray-400 border-none focus:outline-hidden focus:ring-0 resize-none bg-transparent"
                  />
                </div>
              </div>

              {/* Preview of Quoted Post */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3.5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200 shrink-0" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-[#8c711a] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {post.author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-900 truncate">{post.author.name}</span>
                  <span className="text-[11px] text-gray-500 truncate">· {post.author.role}</span>
                </div>
                <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed font-normal">
                  {cleanTitle}
                </p>
                {post.mediaUrl && !post.mediaUrl.includes('mockup-sphinx') && (
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-black/5 mt-0.5">
                    <img 
                      src={post.mediaUrl} 
                      alt="Media preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/70 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium">
                Will be published to your audience feed
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!quoteText.trim() || isQuoting}
                  onClick={handleQuoteSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-full transition-all shadow-sm shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {isQuoting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Quote Post</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Analytics Modal (X/Twitter Post Activity Style) ─── */}
      {isAnalyticsModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAnalyticsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                  <BarChart2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Post Analytics</h3>
                  <p className="text-[11px] text-gray-400">Live audience metrics</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-5">
              {/* Hero Impression Stat */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-gray-50 p-4 rounded-2xl border border-amber-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700/80">Total Impressions</span>
                  <div className="text-3xl font-extrabold text-gray-950 mt-0.5 tracking-tight">
                    {viewsCountState.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Times this post was viewed by listeners and fans</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <Eye size={24} />
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-gray-900">Engagements Breakdown</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <Heart size={16} className="text-rose-500 mb-1" />
                    <span className="text-lg font-bold text-gray-900">{likes}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Likes</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <Repeat2 size={16} className="text-emerald-500 mb-1" />
                    <span className="text-lg font-bold text-gray-900">{repostCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Reposts</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <MessageCircle size={16} className="text-sky-500 mb-1" />
                    <span className="text-lg font-bold text-gray-900">{commentsCount}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Replies</span>
                  </div>
                </div>
              </div>

              {/* Engagement Rate Bar */}
              {(() => {
                const totalEngagements = likes + repostCount + commentsCount;
                // In creator analytics, rate represents % of viewers who engaged (capped at 100.0%)
                const ratePercent = viewsCountState > 0
                  ? Math.min(100, (totalEngagements / viewsCountState) * 100)
                  : (totalEngagements > 0 ? 100 : 0);

                return (
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Engagement Rate</span>
                      <span className="font-bold text-[#8c711a]">
                        {ratePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-[#D4AF37] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(totalEngagements > 0 ? 5 : 0, ratePercent))}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col items-center gap-1 text-[11px] text-gray-400 justify-center text-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-500 font-medium">Connected live to Supabase PostgreSQL</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Measures IAB & X standard viewability (≥50% visible for 1s+)
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
