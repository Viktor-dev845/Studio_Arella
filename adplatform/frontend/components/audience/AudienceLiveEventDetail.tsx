'use client';

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  X, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Paperclip, 
  Send 
} from 'lucide-react';

interface AudienceLiveEventDetailProps {
  onClose?: () => void;
}

interface CommentItem {
  id: string;
  author: string;
  role?: string;
  avatarBg: string;
  text: string;
  likes: number;
  hasLiked?: boolean;
  replies?: CommentItem[];
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'c1',
    author: 'JOHN DOE',
    avatarBg: 'bg-amber-100 text-amber-800',
    text: 'Nice event. Leaning more about the autonft ultra project is an eye opener for community members looking forward to massive reward like this',
    likes: 8,
    replies: [
      {
        id: 'c1-r1',
        author: 'Hamilton',
        avatarBg: 'bg-emerald-100 text-emerald-800',
        text: 'Nice event. Leaning more about the autonft ultra project is an eye opener for community members looking forward to massive reward like this',
        likes: 8,
      },
    ],
  },
  {
    id: 'c2',
    author: 'JOHN DOE',
    avatarBg: 'bg-amber-100 text-amber-800',
    text: 'Nice event. Leaning more about the autonft ultra project is an eye opener for community members looking forward to massive reward like this',
    likes: 8,
    replies: [],
  },
];

export default function AudienceLiveEventDetail({ onClose }: AudienceLiveEventDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  const [mainLikes, setMainLikes] = useState(8);
  const [hasLikedMain, setHasLikedMain] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [commentInput, setCommentInput] = useState('');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

  const handleMainLike = () => {
    if (hasLikedMain) {
      setMainLikes((prev) => prev - 1);
      setHasLikedMain(false);
    } else {
      setMainLikes((prev) => prev + 1);
      setHasLikedMain(true);
    }
  };

  const handleCommentLike = (commentId: string, isReply = false, parentId?: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          const liked = c.hasLiked;
          return {
            ...c,
            hasLiked: !liked,
            likes: liked ? c.likes - 1 : c.likes + 1,
          };
        }
        if (isReply && c.id === parentId && c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    hasLiked: !r.hasLiked,
                    likes: r.hasLiked ? r.likes - 1 : r.likes + 1,
                  }
                : r
            ),
          };
        }
        return c;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'JOHN DOE',
      avatarBg: 'bg-amber-100 text-amber-800',
      text: commentInput.trim(),
      likes: 0,
      replies: [],
    };

    setComments([...comments, newComment]);
    setCommentInput('');
  };

  return (
    <section className="w-full max-w-[958px] flex flex-col gap-6 font-['DM_Sans',sans-serif]">
      {/* ─── 1. Header Bar (width: 958px, height: 75px, rounded-full) ─── */}
      <div className="w-full bg-white rounded-full px-6 py-4 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        {/* Title & Stats */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <h1 className="text-[20px] sm:text-[21px] font-bold text-black leading-[27px] shrink-0">
            1View Event
          </h1>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

          <span className="text-[13px] sm:text-[14px] font-normal text-[#00B96B] leading-[18px] truncate">
            2 moderators | Participant 18
          </span>
        </div>

        {/* Prize Banner & Red Close Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[#F2BD27] bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200/40">
            <Trophy size={20} className="text-[#F2BD27] shrink-0" />
            <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-[23px] truncate max-w-[280px] md:max-w-none">
              Free community membership for non-members attendees
            </span>
          </div>

          {/* Close Button: 36px x 36px, #E0282E, radius 24px */}
          <button
            type="button"
            onClick={onClose}
            className="w-[36px] h-[36px] bg-[#E0282E] hover:bg-[#c92026] text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shrink-0 shadow-sm cursor-pointer"
            title="Close event"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ─── 2. Slide: Video Player (700px) + Right Info Panel (250px) ─── */}
      <div className="w-full flex flex-col md:flex-row gap-2 items-stretch">
        {/* ─── Left Panel: 700px Player & Thumbnails ─── */}
        <div className="flex-1 max-w-[700px] flex flex-col gap-2">
          {/* Main Video View: 700px x 393.75px (16:9) */}
          <div className="relative w-full aspect-video rounded-[4px] overflow-hidden bg-[#0047AB] flex items-center justify-center group shadow-md">
            {/* Background Gradient / Pattern */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#002f75] via-[#0047AB] to-[#005cd9] opacity-90" />

            {/* Live Indicator Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </div>

            {/* Big Center Play Circle (180px x 180px outline) */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] rounded-full flex items-center justify-center text-white/85 hover:text-white hover:scale-105 transition-all cursor-pointer"
              title={isPlaying ? 'Pause stream' : 'Play stream'}
            >
              <div className="w-full h-full rounded-full border-[5px] sm:border-[7px] border-white/80 flex items-center justify-center bg-black/10 backdrop-blur-xs shadow-2xl">
                {isPlaying ? (
                  <Pause size={64} className="text-white fill-white" />
                ) : (
                  <Play size={64} className="text-white fill-white ml-2" />
                )}
              </div>
            </button>
          </div>

          {/* Carousel / Pages Thumbnails: 700px x 116px */}
          <div className="relative w-full h-[116px] py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* Left Chevron Nav Button */}
            <button
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[64px] bg-[rgba(135,138,153,0.3)] hover:bg-[rgba(135,138,153,0.5)] text-white/80 flex items-center justify-center transition-colors rounded-r-md cursor-pointer"
              title="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            {/* 4 Thumbnails (177.78px x 100px) */}
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                onClick={() => setActiveThumbnailIndex(idx)}
                className={`relative w-[177.78px] h-[100px] shrink-0 rounded-[4px] overflow-hidden cursor-pointer transition-all ${
                  activeThumbnailIndex === idx ? 'ring-2 ring-[#D4AF37]' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="w-full h-full bg-[#0047AB] flex items-center justify-center">
                  <div className="w-[50px] h-[50px] rounded-full border-2 border-white/80 flex items-center justify-center">
                    <Play size={20} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Panel: 250px Description & Actions ─── */}
        <div className="w-full md:w-[250px] bg-white rounded-[4px] p-4 shadow-[0px_0px_2px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            {/* Header: INTRO */}
            <h3 className="text-[18px] font-bold text-black leading-[23px]">
              INTRO
            </h3>

            {/* Line 6 Divider */}
            <div className="w-full h-[1px] bg-[#D6D6D6]" />

            {/* Description Text */}
            <p className="text-[15px] sm:text-[16px] font-normal text-black leading-[21px]">
              Make your Dream View in monday to manage, update and track everything at one single place.
            </p>
          </div>

          {/* Bottom Engagement Row: Like, Comment, Share, Bookmark */}
          <div className="w-full flex items-center justify-between pt-6 border-t border-gray-100 text-[#707070]">
            {/* Like */}
            <button
              type="button"
              onClick={handleMainLike}
              className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
              title="Like"
            >
              <Heart
                size={18}
                className={hasLikedMain ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}
              />
              <span className="text-[14px] font-bold text-[#707070]">
                {mainLikes}
              </span>
            </button>

            {/* Comments Counter */}
            <div className="flex items-center gap-1.5">
              <MessageSquare size={18} />
              <span className="text-[14px] font-bold text-[#707070]">
                {comments.length + 1}
              </span>
            </div>

            {/* Share */}
            <button
              type="button"
              onClick={() => alert('Link copied to clipboard!')}
              className="hover:text-black transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 size={18} />
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:text-black transition-colors cursor-pointer"
              title="Bookmark"
            >
              <Bookmark
                size={18}
                className={isBookmarked ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. Overview / Comments Tabs (width: 958px, height: 71px) ─── */}
      <div className="w-full bg-white rounded-[4px] px-6 py-4 shadow-[0px_0px_2px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`text-[18px] leading-[23px] transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'font-bold text-[#0F051D] border-b-2 border-black pb-1'
              : 'font-normal text-[#0F051D]/70 hover:text-black'
          }`}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`text-[18px] leading-[23px] transition-colors cursor-pointer ${
            activeTab === 'comments'
              ? 'font-bold text-[#0F051D] border-b-2 border-black pb-1'
              : 'font-normal text-[#0F051D]/70 hover:text-black'
          }`}
        >
          Comments
        </button>
      </div>

      {/* ─── 4. Team Header & Team Members Row ─── */}
      <div className="w-full flex flex-col gap-3">
        <div className="border-b border-[#CED4DA] pb-2">
          <h4 className="text-[18px] font-bold text-[#878A99] leading-[22px]">
            Team
          </h4>
        </div>

        {/* Members Cards Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Member 1: JOHN DOE (Creator) */}
          <div className="w-[200px] h-[74px] bg-white rounded-[4px] p-3 shadow-xs border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-black leading-[18px] truncate">
                JOHN DOE
              </span>
              <span className="text-[12px] font-normal text-[#707070] leading-[16px]">
                Creator
              </span>
            </div>
          </div>

          {/* Member 2: LAVERNE AUDET (Co-creator) */}
          <div className="w-[200px] h-[74px] bg-white rounded-[4px] p-3 shadow-xs border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-sm shrink-0">
              LA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-black uppercase leading-[18px] truncate">
                Laverne Audet
              </span>
              <span className="text-[12px] font-normal text-[#707070] leading-[16px]">
                Co-creator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. Live Chat Section ─── */}
      <div className="w-full flex flex-col gap-6 pt-2">
        {/* Header: Live Chat */}
        <div className="border-b border-[#CED4DA] pb-2">
          <h4 className="text-[18px] font-bold text-black leading-[23px]">
            Live Chat
          </h4>
        </div>

        {/* Comment Thread List */}
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2">
              {/* Main Comment */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${comment.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                >
                  {comment.author.slice(0, 2)}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[14px] font-bold text-black leading-[17px]">
                    {comment.author}
                  </span>
                  <p className="text-[12px] font-normal text-[#707070] leading-[16px] max-w-[620px]">
                    {comment.text}
                  </p>

                  {/* Actions: Likes & Replies */}
                  <div className="flex items-center gap-5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCommentLike(comment.id)}
                      className="flex items-center gap-1.5 text-[#707070] hover:text-black transition-colors cursor-pointer"
                    >
                      <Heart
                        size={14}
                        className={comment.hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}
                      />
                      <span className="text-[12px] font-bold">{comment.likes}</span>
                    </button>

                    {comment.replies && comment.replies.length > 0 && (
                      <span className="text-[13px] font-normal text-[#FF3A15] cursor-pointer hover:underline">
                        Replies ({comment.replies.length})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nested Replies (e.g. Hamilton) */}
              {comment.replies &&
                comment.replies.map((reply) => (
                  <div key={reply.id} className="ml-10 flex items-start gap-2.5 pt-2">
                    <div
                      className={`w-7 h-7 rounded-full ${reply.avatarBg} flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs`}
                    >
                      {reply.author.slice(0, 2)}
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-black leading-[16px]">
                        {reply.author}
                      </span>
                      <p className="text-[10px] font-normal text-[#707070] leading-[13px] max-w-[500px]">
                        {reply.text}
                      </p>

                      <div className="flex items-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCommentLike(reply.id, true, comment.id)}
                          className="flex items-center gap-1.5 text-[#707070] hover:text-black transition-colors cursor-pointer"
                        >
                          <Heart
                            size={12}
                            className={reply.hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}
                          />
                          <span className="text-[11px] font-bold">{reply.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* ─── 6. Write Your Comment Input Bar (Group 4) ─── */}
        <form
          onSubmit={handleAddComment}
          className="w-full pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-3"
        >
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write your comment"
            className="flex-1 bg-transparent text-[16px] sm:text-[18px] text-black placeholder:text-[rgba(24,24,24,0.3)] outline-none leading-[23px] py-1"
          />

          <div className="flex items-center gap-3 shrink-0">
            {/* Paperclip */}
            <button
              type="button"
              className="text-black/30 hover:text-black transition-colors p-1"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>

            {/* Send Button (32px x 32px, background #D4AF37, radius 4px) */}
            <button
              type="submit"
              className="w-[32px] h-[32px] bg-[#D4AF37] hover:bg-[#c49f30] text-black rounded-[4px] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Send comment"
            >
              <Send size={15} strokeWidth={2} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
