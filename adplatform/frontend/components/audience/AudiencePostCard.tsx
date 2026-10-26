'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Heart,
  Lock,
  Unlock,
  Sparkles,
  Volume2,
  Check
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
  isPremium?: boolean;
  price?: number;
  isUnlocked?: boolean;
  category?: string;
  tags?: string[];
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
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const [commentsCount, setCommentsCount] = useState(post.initialComments || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Tip modal & unlock state
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    post.isUnlocked ?? (!post.isPremium || post.author.id === user?.id)
  );
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (post.isBookmarked !== undefined) setIsBookmarked(post.isBookmarked);
    if (post.isUnlocked !== undefined) setIsUnlocked(post.isUnlocked);
  }, [post.isBookmarked, post.isUnlocked]);

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

  // ── TOGGLE & LOAD COMMENTS ───────────────────────────────────────────────────
  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
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

  // ── SHARE ───────────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/audience?view=trending#${post.id}`;
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      toast('Episode link copied to clipboard!', 'info');
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

  return (
    <article 
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

        {post.description && (
          <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed font-normal">
            {post.description}
          </p>
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

      {/* ─── 3. Media Card & Sleek Audio Player ─── */}
      {post.mediaUrl && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 group shadow-md border border-gray-100">
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
                Unlock full audio streaming & download access. 85% goes directly to {post.author.name}'s creator wallet.
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
        </div>
      )}

      {/* ─── 4. Modern Clean Engagement Bar ─── */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100/80">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Like Button: Sleek Pill */}
          <button
            type="button"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              hasLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 border border-transparent'
            }`}
            title="Like this episode"
          >
            <Heart 
              size={16} 
              className={`transition-transform duration-200 ${
                hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600'
              }`} 
            />
            <span className="font-quicksand font-bold text-[13px]">{likes}</span>
          </button>

          {/* Comment Button: Sleek Pill */}
          <button
            type="button"
            onClick={handleToggleComments}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              showComments
                ? 'bg-amber-50 text-[#8c711a] border border-amber-200/80 shadow-2xs'
                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 border border-transparent'
            }`}
            title="View or add comments"
          >
            <MessageSquare size={16} className={showComments ? 'text-[#8c711a]' : 'text-gray-600'} />
            <span className="font-quicksand font-bold text-[13px]">{commentsCount}</span>
          </button>

          {/* Share Button: Sleek Pill */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 transition-all cursor-pointer active:scale-95 border border-transparent"
            title="Share episode link"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700 text-[12px] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={15} className="text-gray-600" />
                <span className="hidden sm:inline text-[12px]">Share</span>
              </>
            )}
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleBookmark}
          className={`p-2 rounded-full transition-all cursor-pointer active:scale-90 ${
            isBookmarked
              ? 'bg-amber-50 text-[#D4AF37] border border-amber-200/80'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark episode'}
        >
          <Bookmark 
            size={18} 
            className={isBookmarked ? 'fill-[#D4AF37] text-[#D4AF37]' : ''} 
          />
        </button>
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
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-bold flex items-center justify-center text-xs uppercase ring-1 ring-amber-200">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 h-10 bg-gray-50 hover:bg-gray-100/80 focus-within:bg-white rounded-full px-4 flex items-center justify-between border border-gray-200/80 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all">
            <input 
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment or share your thoughts..."
              className="flex-1 bg-transparent text-[13px] font-quicksand text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <button 
              type="submit" 
              disabled={!commentInput.trim() || isPostingComment}
              className="text-[#8c711a] hover:text-[#5a4810] disabled:text-gray-300 font-bold text-xs ml-2 cursor-pointer transition-colors"
            >
              {isPostingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Comments Drawer */}
        {showComments && (
          <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {isLoadingComments ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading conversation...</div>
            ) : commentsList.length === 0 ? (
              <div className="py-3 text-center text-xs text-gray-400">
                No comments yet. Be the first to share your thoughts!
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
    </article>
  );
}
