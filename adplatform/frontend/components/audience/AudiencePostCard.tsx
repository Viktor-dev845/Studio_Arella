'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Mic, 
  Image as ImageIcon,
  Heart,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
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
}

interface AudiencePostCardProps {
  post: PostData;
}

export default function AudiencePostCard({ post }: AudiencePostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(post.initialLikes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.initialComments || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([]);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    post.isUnlocked ?? (!post.isPremium || post.author.id === user?.id)
  );
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (post.isBookmarked !== undefined) {
      setIsBookmarked(post.isBookmarked);
    }
    if (post.isUnlocked !== undefined) {
      setIsUnlocked(post.isUnlocked);
    }
  }, [post.isBookmarked, post.isUnlocked]);

  const badgeBg = post.badgeTheme === 'green' ? 'bg-[#15411F]' : 'bg-[#D4AF37]';
  const userAvatar = user?.avatar || '';

  const handleLike = async () => {
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await api.post(`/content/${post.id}/like`);
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  const handleToggleBookmark = async () => {
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    try {
      await api.post(`/content/${post.id}/bookmark`);
      toast(nextBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch (err) {
      console.warn('Bookmark toggle failed:', err);
    }
  };

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    if (nextShow && commentsList.length === 0) {
      try {
        const res = await api.get(`/content/${post.id}/comments`);
        if (res.data?.comments) {
          setCommentsList(res.data.comments.map((c: any) => c.text || c.comment));
        }
      } catch (err) {
        console.warn('Could not fetch comments:', err);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const text = commentInput.trim();
    setCommentsList((prev) => [...prev, text]);
    setCommentsCount((prev) => prev + 1);
    setCommentInput('');
    setShowComments(true);
    try {
      await api.post(`/content/${post.id}/comments`, { comment: text });
    } catch (err) {
      console.warn('Comment post failed:', err);
    }
  };

  const handleUnlock = async () => {
    if (!user) {
      toast('Please sign in to unlock premium content.', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsUnlocking(true);
      await api.post(`/content/${post.id}/purchase`);
      setIsUnlocked(true);
      toast(`You now have full access to "${post.title.replace(/^-/, '')}".`, 'success');
    } catch (err: any) {
      console.error('Failed to unlock content:', err);
      toast(err.response?.data?.error || 'Could not complete purchase. Please try again.', 'error');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <article className="w-full bg-white rounded-[18px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/60 flex flex-col gap-4 font-quicksand">
      {/* ─── 1. Header: Author Info & PRO Badge ─── */}
      <div className="flex items-center justify-between">
        <div 
          onClick={() => router.push(`/audience?view=creator-profile&creatorId=${post.author.id || ''}`)}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View ${post.author.name}'s profile`}
        >
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-[44px] h-[44px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-[44px] h-[44px] rounded-[18px] bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-extrabold flex items-center justify-center shrink-0 border border-gray-100 shadow-sm text-sm uppercase">
              {post.author.name ? post.author.name.charAt(0) : 'A'}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h4 className="text-[13px] font-semibold text-[#000000] leading-[16px] group-hover:text-[#D9BA54] transition-colors">
                {post.author.name}
              </h4>
              {post.author.tier === 'pro' && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-black shadow-xs tracking-wider">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] font-normal text-black/50 leading-[13px] mt-0.5">
              {post.author.role}
            </p>
          </div>
        </div>

        {/* Top right: Tip shortcut button */}
        <button
          type="button"
          onClick={() => setIsTipModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-[#8c711a] border border-amber-200/60 text-xs font-semibold hover:scale-102 transition-all cursor-pointer"
          title={`Tip ${post.author.name}`}
        >
          <Heart size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
          <span>Tip</span>
        </button>
      </div>

      {/* ─── 2. Post Caption / Title & Premium Badge ─── */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[14px] font-medium text-[#000000] leading-[20px]">
          {post.title}
        </div>
        {post.isPremium && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#8c711a] text-[11px] font-bold">
              <Lock size={11} /> PREMIUM • ₦{(post.price || 1500).toLocaleString()}
            </span>
            {isUnlocked && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ Unlocked
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── 3. Media Card & Audio Player Bar ─── */}
      {post.mediaUrl ? (
        <div className="relative w-full h-[280px] sm:h-[307px] rounded-[18px] overflow-hidden bg-gray-900 group shadow-inner">
          <img 
            src={post.mediaUrl} 
            alt={post.title} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-101 ${
              post.isPremium && !isUnlocked ? 'filter blur-sm scale-105' : ''
            }`}
          />

          {/* Paywall Overlay for Locked Premium Content */}
          {post.isPremium && !isUnlocked ? (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-lg">
                <Lock size={22} className="text-[#D4AF37]" />
              </div>
              <h4 className="text-base font-bold text-white">Exclusive Creator Content</h4>
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
            /* Audio Player Overlay Bar */
            post.duration && (
              <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-md rounded-[14px] p-3 shadow-md flex flex-col gap-2 border border-white/60">
                <div className="w-full h-[4px] bg-[#F6F6F6]/90 rounded-[20px] overflow-hidden cursor-pointer relative">
                  <div 
                    className="h-full bg-[#E1C875] rounded-[20px] transition-all" 
                    style={{ width: `${post.progressPercent || 25}%` }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#28303F] hover:opacity-80 transition-opacity cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <div className="flex gap-[3px] items-center">
                        <span className="w-[3px] h-[14px] bg-[#28303F] rounded-[2px]" />
                        <span className="w-[3px] h-[14px] bg-[#28303F] rounded-[2px]" />
                      </div>
                    ) : (
                      <Play size={15} fill="#28303F" className="text-[#28303F]" />
                    )}
                  </button>
                  <span className="text-[13px] font-semibold text-black/60 tracking-[-0.01em]">
                    {post.currentTime || '00:04:15'} / {post.duration || '01:15:00'}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      ) : null}

      {/* ─── 4. Engagement Row ─── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Like Button */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleLike}>
            <button
              type="button"
              className="hover:scale-105 transition-transform"
              title="Like"
            >
              <ThumbsUp size={20} strokeWidth={1.8} className={hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-black'} />
            </button>
            <div className={`h-[18px] px-2 ${badgeBg} text-white rounded-[8px] border-2 border-white flex items-center gap-1 shadow-sm`}>
              <span className="text-[10px]">❤️</span>
              <span className="text-[11px] font-quicksand font-normal leading-[13px] ml-0.5">
                +{likes}
              </span>
            </div>
          </div>

          {/* Comment Icon */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={handleToggleComments}
          >
            <button 
              type="button"
              className="text-[#200E32] hover:scale-105 transition-transform cursor-pointer"
              title="Comments"
            >
              <MessageSquare size={20} strokeWidth={1.8} className="text-[#200E32]" />
            </button>
            <div className={`w-[18px] h-[18px] ${badgeBg} text-white rounded-[8px] border-2 border-white flex items-center justify-center text-[11px] font-quicksand font-normal shadow-sm`}>
              {commentsCount}
            </div>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast('Share link copied to clipboard', 'info');
            }}
            className="text-[#200E32] hover:scale-105 transition-transform"
            title="Share"
          >
            <Send size={20} strokeWidth={1.8} className="text-[#200E32]" />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleBookmark}
          className="text-[#200E32] hover:scale-105 transition-transform cursor-pointer"
          title="Bookmark"
        >
          <Bookmark size={20} strokeWidth={1.8} className={isBookmarked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#200E32]'} />
        </button>
      </div>

      {/* ─── 5. Add Comment Bar ─── */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2.5 pt-1">
        {userAvatar ? (
          <img 
            src={userAvatar} 
            alt={user?.name || 'You'} 
            className="w-[26px] h-[26px] rounded-[18px] object-cover shrink-0 border border-gray-100"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-[26px] h-[26px] rounded-[18px] bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-extrabold flex items-center justify-center shrink-0 border border-gray-100 text-[10px] uppercase">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        )}

        <div className="flex-1 h-[42px] bg-[#F6F6F6] rounded-[18px] px-4 flex items-center justify-between border border-transparent focus-within:border-[#D4AF37]/50 transition-all">
          <input 
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-[11px] font-quicksand text-black placeholder:text-black/35 outline-none leading-[14px]"
          />
          <button 
            type="submit" 
            disabled={!commentInput.trim()}
            className="text-[#D4AF37] hover:text-[#b39227] disabled:text-gray-300 font-semibold text-xs ml-2 cursor-pointer"
          >
            Post
          </button>
        </div>
      </form>

      {/* Comments Drawer */}
      {showComments && commentsList.length > 0 && (
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
          {commentsList.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-50/70 p-2.5 rounded-[12px]">
              <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold flex items-center justify-center shrink-0">
                U
              </span>
              <p className="text-[12px] text-gray-700 leading-snug">{c}</p>
            </div>
          ))}
        </div>
      )}

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
