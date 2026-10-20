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
  Image as ImageIcon 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

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
  badgeTheme?: 'gold' | 'green';
  isBookmarked?: boolean;
}

interface AudiencePostCardProps {
  post: PostData;
}

export default function AudiencePostCard({ post }: AudiencePostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(post.initialLikes || 99);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.initialComments || 8);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([]);

  useEffect(() => {
    if (post.isBookmarked !== undefined) {
      setIsBookmarked(post.isBookmarked);
    }
  }, [post.isBookmarked]);

  const badgeBg = post.badgeTheme === 'green' ? 'bg-[#15411F]' : 'bg-[#D4AF37]';
  const userAvatar = user?.avatar || '/audience/adam-udochi.png';

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
          setCommentsList(res.data.comments.map((c: any) => c.comment));
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

  return (
    <article className="w-full max-w-[570px] bg-white rounded-[18px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/60 flex flex-col gap-4 font-['DM_Sans',sans-serif]">
      {/* ─── 1. Header (Group 48095426: Author Info & 3-Dot Menu) ─── */}
      <div className="flex items-center justify-between">
        <div 
          onClick={() => router.push('/audience?view=creator-profile')}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View ${post.author.name}'s profile`}
        >
          {/* Avatar: 44x44, radius 18px */}
          <img 
            src={post.author.avatar} 
            alt={post.author.name} 
            className="w-[44px] h-[44px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <h4 className="text-[12px] font-normal text-[#000000] leading-[16px] group-hover:text-[#D9BA54] transition-colors">
              {post.author.name}
            </h4>
            <p className="text-[10px] font-normal text-black/45 leading-[13px] mt-0.5">
              {post.author.role}
            </p>
          </div>
        </div>

        {/* 3-Dot Options Button (Group 48095420: 3 dots, 4px each, #C4C4C4) */}
        <button 
          type="button"
          className="flex flex-col gap-[3px] p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="More options"
        >
          <span className="w-1 h-1 bg-[#C4C4C4] rounded-full" />
          <span className="w-1 h-1 bg-[#C4C4C4] rounded-full" />
          <span className="w-1 h-1 bg-[#C4C4C4] rounded-full" />
        </button>
      </div>

      {/* ─── 2. Post Caption / Title ─── */}
      <div className="text-[14px] font-normal text-[#000000] leading-[18px]">
        {post.title}
      </div>

      {/* ─── 3. Media Card & Audio Player Bar (Rectangle 22: 516px x 307px) ─── */}
      <div className="relative w-full h-[280px] sm:h-[307px] rounded-[18px] overflow-hidden bg-gray-900 group shadow-inner">
        <img 
          src={post.mediaUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
        />

        {/* Audio Player Overlay Bar at bottom of media */}
        <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-md rounded-[14px] p-3 shadow-md flex flex-col gap-2 border border-white/50">
          {/* Progress Track (Group 427319002: 459px x 4px, fill #E1C875) */}
          <div className="w-full h-[4px] bg-[#F6F6F6] rounded-[20px] overflow-hidden cursor-pointer relative">
            <div 
              className="h-full bg-[#E1C875] rounded-[20px] transition-all" 
              style={{ width: `${post.progressPercent || 30}%` }}
            />
          </div>

          {/* Controls Row (Frame 1618873026) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-6 h-6 rounded flex items-center justify-center text-[#28303F] hover:opacity-80 transition-opacity"
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
            <span className="text-[14px] font-semibold text-black/50 tracking-[-0.01em] leading-[24px]">
              {post.currentTime || '00:04:15'} / {post.duration || '02:35:19'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4. Engagement Row (Icons: width 518px, height 31px) ─── */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Like Button & Reactions Stack */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleLike}>
            <button
              type="button"
              className="hover:scale-105 transition-transform"
              title="Like"
            >
              <ThumbsUp size={22} strokeWidth={1.8} className={hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-black'} />
            </button>

            {/* Reactions Stack Badge (Rectangle 2: 47px x 16px, background gold/green, border 2px solid white, radius 8px) */}
            <div className={`h-[18px] px-2 ${badgeBg} text-white rounded-[8px] border-2 border-white flex items-center gap-1 shadow-sm`}>
              <span className="text-[10px] transform scale-90">👏</span>
              <span className="text-[10px] transform scale-90">❤️</span>
              <span className="text-[11px] font-['Roboto',sans-serif] font-normal leading-[13px] ml-0.5">
                +{likes}
              </span>
            </div>
          </div>

          {/* Comment Icon & Badge */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => setShowComments(!showComments)}
          >
            <button 
              type="button"
              onClick={handleToggleComments}
              className="text-[#200E32] hover:scale-105 transition-transform cursor-pointer"
              title="Comments"
            >
              <MessageSquare size={22} strokeWidth={1.8} className="text-[#200E32]" />
            </button>
            {/* Comment Counter Badge: 16px x 16px, gold/green */}
            <div className={`w-[18px] h-[18px] ${badgeBg} text-white rounded-[8px] border-2 border-white flex items-center justify-center text-[11px] font-['Roboto',sans-serif] font-normal shadow-sm`}>
              {commentsCount}
            </div>
          </div>

          {/* Share / Send Button */}
          <button
            type="button"
            className="text-[#200E32] hover:scale-105 transition-transform"
            title="Share"
          >
            <Send size={22} strokeWidth={1.8} className="text-[#200E32]" />
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleToggleBookmark}
          className="text-[#200E32] hover:scale-105 transition-transform cursor-pointer"
          title="Bookmark"
        >
          <Bookmark size={22} strokeWidth={1.8} className={isBookmarked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#200E32]'} />
        </button>
      </div>

      {/* ─── 5. Add Comment Bar (Group 48095423: 518px x 42px) ─── */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2.5 pt-1">
        {/* Commenter Avatar: Rectangle 24, 26x26, radius 18px */}
        <img 
          src={userAvatar} 
          alt={user?.name || 'You'} 
          className="w-[26px] h-[26px] rounded-[18px] object-cover shrink-0 border border-gray-100"
        />

        {/* Input Container: Rectangle 23, height 42px, background #F6F6F6, radius 18px */}
        <div className="flex-1 h-[42px] bg-[#F6F6F6] rounded-[18px] px-4 flex items-center justify-between border border-transparent focus-within:border-[#D4AF37]/50 transition-all">
          <input 
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment"
            className="flex-1 bg-transparent text-[11px] font-['DM_Sans',sans-serif] text-black placeholder:text-black/35 outline-none leading-[14px]"
          />

          {/* Right Action Icons: Mic/Voice (16x16) & Image Attachment (16x16) */}
          <div className="flex items-center gap-2.5 text-black/45 shrink-0">
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
