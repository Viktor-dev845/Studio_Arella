'use client';

import { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export interface PostData {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  title: string;
  mediaUrl: string;
  duration?: string;
  currentTime?: string;
  progressPercent?: number;
  initialLikes?: number;
  initialComments?: number;
}

interface AudiencePostCardProps {
  post: PostData;
}

export default function AudiencePostCard({ post }: AudiencePostCardProps) {
  const { user } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(post.initialLikes || 99);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.initialComments || 8);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([
    'Amazing episode! The sound design was fantastic.',
  ]);

  const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop';

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentsList(prev => [...prev, commentInput.trim()]);
    setCommentsCount(prev => prev + 1);
    setCommentInput('');
  };

  return (
    <article className="w-full bg-white rounded-[18px] p-4 sm:p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col gap-3.5">
      {/* ─── 1. Header (Author Info & 3-Dot Menu) ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name} 
            className="w-[44px] h-[44px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm"
          />
          <div>
            <h4 className="text-[13px] font-semibold text-[#000000] leading-tight">
              {post.author.name}
            </h4>
            <p className="text-[11px] text-black/50 font-light mt-0.5">
              {post.author.role}
            </p>
          </div>
        </div>

        {/* 3-Dot Options Button */}
        <button 
          type="button"
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#C4C4C4] transition-colors"
          title="More options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* ─── 2. Post Caption / Title ─── */}
      <div className="text-[14px] text-[#000000] font-normal tracking-tight">
        {post.title}
      </div>

      {/* ─── 3. Media Preview & Player Bar ─── */}
      <div className="relative w-full h-[260px] sm:h-[307px] rounded-[18px] overflow-hidden bg-gray-900 group shadow-inner">
        <img 
          src={post.mediaUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* In-Media Audio Player Controls Bar (Floating bottom overlay) */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 bg-white/85 backdrop-blur-md rounded-[14px] p-2.5 sm:p-3 shadow-lg flex flex-col gap-2 border border-white/40">
          {/* Scrubber Progress Bar */}
          <div className="w-full h-[4px] bg-[#F6F6F6] rounded-full overflow-hidden cursor-pointer relative">
            <div 
              className="h-full bg-[#E1C875] rounded-full transition-all" 
              style={{ width: `${post.progressPercent || 25}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-full bg-[#28303F] text-white flex items-center justify-center hover:bg-black transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={13} fill="white" />
                ) : (
                  <Play size={13} fill="white" className="ml-0.5" />
                )}
              </button>
              <span className="text-[13px] font-semibold text-[#28303F] tracking-tight">
                {post.currentTime || '00:04:15'} / {post.duration || '02:35:19'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Engagement Row ─── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button & Reactions Badge */}
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={handleLike}>
            <button
              type="button"
              className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                hasLiked ? 'text-[#D4AF37]' : 'text-[#200E32]'
              }`}
            >
              <ThumbsUp size={20} strokeWidth={hasLiked ? 2.5 : 1.8} fill={hasLiked ? '#D4AF37' : 'none'} />
            </button>

            {/* Reactions Stack & Badge */}
            <div className="flex items-center -space-x-1 text-[11px]">
              <span className="inline-block transform scale-90">👏</span>
              <span className="inline-block transform scale-90">❤️</span>
              <span className="ml-1 min-w-[28px] h-[16px] px-1 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                +{likes}
              </span>
            </div>
          </div>

          {/* Comment Button & Badge */}
          <div 
            className="flex items-center gap-1.5 cursor-pointer select-none" 
            onClick={() => setShowComments(!showComments)}
          >
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#200E32] transition-colors"
            >
              <MessageSquare size={20} strokeWidth={1.8} />
            </button>
            <span className="min-w-[16px] h-[16px] px-1 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
              {commentsCount}
            </span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#200E32] transition-colors"
            title="Share"
          >
            <Send size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
            isBookmarked ? 'text-[#D4AF37]' : 'text-[#200E32]'
          }`}
          title="Bookmark"
        >
          <Bookmark size={20} strokeWidth={1.8} fill={isBookmarked ? '#D4AF37' : 'none'} />
        </button>
      </div>

      {/* ─── 5. Add Comment Bar ─── */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2.5 pt-1">
        <img 
          src={userAvatar} 
          alt={user?.name || 'You'} 
          className="w-[26px] h-[26px] rounded-[18px] object-cover shrink-0 border border-gray-100"
        />

        <div className="flex-1 h-[42px] bg-[#F6F6F6] rounded-[18px] px-4 flex items-center justify-between border border-transparent focus-within:border-[#D4AF37]/40 transition-all">
          <input 
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment"
            className="flex-1 bg-transparent text-[12px] text-gray-800 placeholder:text-black/40 outline-none"
          />

          <div className="flex items-center gap-2 text-black/50 shrink-0">
            <button 
              type="button" 
              className="hover:text-black transition-colors" 
              title="Voice comment"
            >
              <Mic size={16} strokeWidth={1.8} />
            </button>
            <button 
              type="button" 
              className="hover:text-black transition-colors" 
              title="Attach image"
            >
              <ImageIcon size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </form>

      {/* Comments Drawer if expanded */}
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
    </article>
  );
}
