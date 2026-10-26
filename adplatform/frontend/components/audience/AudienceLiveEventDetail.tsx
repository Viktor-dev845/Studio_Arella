'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { 
  X, 
  Trophy, 
  ChevronLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Paperclip, 
  Send 
} from 'lucide-react';

interface AudienceLiveEventDetailProps {
  onClose?: () => void;
  eventId?: string;
}

interface CommentItem {
  id: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  avatarBg?: string;
  text: string;
  likes: number;
  hasLiked?: boolean;
  replies?: CommentItem[];
}

const DEFAULT_LIVE_COMMENTS: CommentItem[] = [
  {
    id: 'c-1',
    author: 'Sarah Jenkins',
    role: 'Brand Producer',
    avatarUrl: '/audience/theresa-steward.png',
    text: 'Fantastic live experience! Seeing how Studio Arella links interactive creator audio directly to Umuahia billboard displays gives brand sponsors an unprecedented multi-touchpoint advantage.',
    likes: 14,
    hasLiked: false,
    replies: [
      {
        id: 'c-1-1',
        author: 'Hamilton Eze',
        avatarUrl: '/audience/chukuemeka-azor.png',
        text: 'Agreed Sarah! The real-time synchronized audio stream alongside the central city screens completely redefines DOOH advertising.',
        likes: 8,
        hasLiked: false,
      },
    ],
  },
  {
    id: 'c-2',
    author: 'Marcus Thorne',
    role: 'Audio Engineer',
    avatarUrl: '/audience/kyle-fisher.png',
    text: 'The low-latency stream audio fidelity during live audience interactions is super crisp. Great work on the sound stage setup!',
    likes: 11,
    hasLiked: false,
    replies: [],
  },
];

export default function AudienceLiveEventDetail({ onClose, eventId }: AudienceLiveEventDetailProps) {
  const { user } = useAuthStore();
  const [activeEventId, setActiveEventId] = useState<string | null>(eventId || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  const [mainLikes, setMainLikes] = useState(8);
  const [hasLikedMain, setHasLikedMain] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(DEFAULT_LIVE_COMMENTS);
  const [commentInput, setCommentInput] = useState('');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

  const THUMBNAILS = [
    { img: '/audience/covers/media.jpg', label: 'Main Stream' },
    { img: '/audience/covers/creative.jpg', label: 'UI Concept' },
    { img: '/audience/covers/wealth.jpg', label: 'Soundstage' },
    { img: '/audience/covers/culture.jpg', label: 'Audience Q&A' },
  ];

  // Optional: load dynamic messages from backend if available
  useEffect(() => {
    async function loadEventData() {
      try {
        let currentId = eventId;
        if (!currentId) {
          const res = await api.get('/live-experiences');
          const first = res.data?.events?.[0];
          if (first) {
            currentId = first.id;
            setActiveEventId(first.id);
          }
        }
        if (currentId) {
          const msgRes = await api.get(`/live-experiences/${currentId}/messages`);
          if (msgRes.data?.messages && msgRes.data.messages.length > 0) {
            setComments(msgRes.data.messages);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic live experience messages:', err);
      }
    }
    loadEventData();
  }, [eventId]);

  const handleMainLike = () => {
    if (hasLikedMain) {
      setMainLikes((prev) => prev - 1);
      setHasLikedMain(false);
    } else {
      setMainLikes((prev) => prev + 1);
      setHasLikedMain(true);
    }
  };

  const handleCommentLike = async (commentId: string, isReply = false, parentId?: string) => {
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

    try {
      await api.post(`/live-experiences/messages/${commentId}/like`);
    } catch (err) {
      console.warn('Like live message API error:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const text = commentInput.trim();
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: user?.name || 'Adam Udochi',
      avatarUrl: user?.avatar || '/audience/adam-udochi.png',
      text,
      likes: 0,
      replies: [],
    };

    setComments((prev) => [...prev, newComment]);
    setCommentInput('');

    if (activeEventId) {
      try {
        await api.post(`/live-experiences/${activeEventId}/messages`, { message: text });
      } catch (err) {
        console.warn('Send live message API error:', err);
      }
    }
  };

  return (
    <section className="w-full flex flex-col gap-6 font-quicksand">
      {/* ─── 1. Header Bar: 958px x 75px, rounded-full (#FFFFFF) ─── */}
      <div className="w-full bg-white rounded-full px-6 py-4 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        {/* Title & Stats */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <h1 className="text-[20px] sm:text-[21px] font-bold text-black leading-[27px] shrink-0 m-0">
            1View Event
          </h1>

          <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

          <span className="text-[13px] sm:text-[14px] font-normal text-[#00B96B] leading-[18px] truncate">
            2 moderators | Participant 18
          </span>
        </div>

        {/* Prize Banner & Red Close Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[#F2BD27]">
            <Trophy size={24} className="text-[#F2BD27] shrink-0" />
            <span className="text-[15px] sm:text-[18px] font-semibold text-[#F2BD27] leading-[23px] truncate max-w-[320px] sm:max-w-none">
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
        {/* ─── Left Panel: 700px Player & Thumbnails (height: 509.75px) ─── */}
        <div className="flex-1 max-w-[700px] flex flex-col gap-2">
          {/* Main Video View: 700px x 393.75px with Real Studio Live Broadcast Media */}
          <div className="relative w-full aspect-video rounded-[4px] overflow-hidden bg-gray-950 flex items-center justify-center group shadow-sm">
            <img 
              src={THUMBNAILS[activeThumbnailIndex]?.img || '/audience/podcast-video-thumb.png'} 
              alt="Live Stream" 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
            
            {/* Live Indicator Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE BROADCAST
            </div>

            {/* Big Center Play Circle Outline: 180px x 180px (Figma Spec) */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] flex items-center justify-center text-white/90 hover:text-white hover:scale-105 transition-all cursor-pointer"
              title={isPlaying ? 'Pause stream' : 'Play stream'}
            >
              <svg 
                viewBox="0 0 180 180" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-lg"
              >
                <circle cx="90" cy="90" r="82" stroke="white" strokeWidth="15" strokeOpacity="0.85" />
                {isPlaying ? (
                  <>
                    <rect x="68" y="60" width="16" height="60" rx="4" fill="white" fillOpacity="0.9" />
                    <rect x="96" y="60" width="16" height="60" rx="4" fill="white" fillOpacity="0.9" />
                  </>
                ) : (
                  <path d="M72 58L126 90L72 122V58Z" fill="white" fillOpacity="0.9" />
                )}
              </svg>
            </button>
          </div>

          {/* Carousel / Pages Thumbnails: 700px x 116px */}
          <div className="relative w-full h-[116px] py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* Left Chevron Nav Button (32px x 64px, rgba(135,138,153,0.2)) */}
            <button
              type="button"
              onClick={() => setActiveThumbnailIndex((prev) => (prev > 0 ? prev - 1 : THUMBNAILS.length - 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[64px] bg-[rgba(135,138,153,0.4)] hover:bg-[rgba(135,138,153,0.6)] text-white flex items-center justify-center transition-colors rounded-r-sm cursor-pointer"
              title="Previous"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>

            {/* 4 Thumbnails with real images */}
            {THUMBNAILS.map((thumb, idx) => (
              <div
                key={idx}
                onClick={() => setActiveThumbnailIndex(idx)}
                className={`relative w-[177.78px] h-[100px] shrink-0 rounded-[4px] overflow-hidden cursor-pointer transition-all ${
                  activeThumbnailIndex === idx ? 'ring-2 ring-[#D4AF37] scale-[1.02]' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <img src={thumb.img} alt={thumb.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                  <span className="text-[11px] font-medium text-white truncate shadow-xs">
                    {thumb.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Panel: 250px Description & Actions (509.75px height) ─── */}
        <div className="w-full md:w-[250px] bg-white rounded-[4px] p-4 shadow-[0px_0px_2px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            {/* Header: INTRO */}
            <h3 className="text-[18px] font-bold text-black leading-[23px] m-0 font-quicksand">
              INTRO
            </h3>

            {/* Line 6 Divider */}
            <div className="w-full h-[1px] bg-[#D6D6D6] my-1" />

            {/* Description Text */}
            <p className="text-[16px] font-normal text-black leading-[21px] font-quicksand m-0">
              Make your Dream View in monday to manage, update and track everything at one single place.
            </p>
          </div>

          {/* Bottom Engagement Row: Like, Comment, Share, Bookmark (width: 234px, height: 64px) */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-gray-100 text-[#707070]">
            {/* Likes */}
            <button
              type="button"
              onClick={handleMainLike}
              className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
              title="Like"
            >
              <Heart
                size={19}
                className={hasLikedMain ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#707070]'}
              />
              <span className="text-[14px] font-bold text-[#707070] font-quicksand">
                {mainLikes}
              </span>
            </button>

            {/* Comments Counter */}
            <div className="flex items-center gap-1.5">
              <MessageSquare size={19} className="text-[#707070]" />
              <span className="text-[14px] font-bold text-[#707070] font-quicksand">
                6
              </span>
            </div>

            {/* Share */}
            <button
              type="button"
              onClick={() => alert('Link copied to clipboard!')}
              className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-[#707070]"
              title="Share"
            >
              <Share2 size={20} />
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-[#707070]"
              title="Bookmark"
            >
              <Bookmark
                size={20}
                className={isBookmarked ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. Overview / Comments Tabs: 958px x 71px, background #FFFFFF, radius 4px ─── */}
      <div className="w-full bg-white rounded-[4px] px-6 py-4 shadow-[0px_0px_2px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`text-[18px] leading-[23px] font-quicksand transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeTab === 'overview'
              ? 'font-bold text-[#0F051D]'
              : 'font-normal text-[#0F051D] hover:text-black'
          }`}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`text-[18px] leading-[23px] font-quicksand transition-colors cursor-pointer bg-transparent border-none p-0 ${
            activeTab === 'comments'
              ? 'font-bold text-[#0F051D]'
              : 'font-normal text-[#0F051D] hover:text-black'
          }`}
        >
          Comments
        </button>
      </div>

      {/* ─── 4. Team Header & Team Members Row: 958px wide ─── */}
      <div className="w-full flex flex-col gap-3">
        {/* Team Header: width 1200px / 958px, border-bottom 1px solid #CED4DA */}
        <div className="border-b border-[#CED4DA] pb-2">
          <h4 className="text-[18px] font-bold text-[#878A99] leading-[22px] font-quicksand m-0">
            Team
          </h4>
        </div>

        {/* Members Cards Row (Figma: User 200px x 74px, radius 4px, background #FFFFFF) */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Member 1: JOHN DOE (Creator) */}
          <div className="w-[200px] h-[74px] bg-white rounded-[4px] px-4 py-3 shadow-xs border border-gray-100 flex items-center gap-3">
            <img 
              src="/audience/live-avatar-john-doe.png" 
              alt="JOHN DOE"
              className="w-[36px] h-[36px] rounded-full object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-black leading-[18px] font-quicksand truncate">
                JOHN DOE
              </span>
              <span className="text-[12px] font-normal text-[#707070] leading-[16px] font-quicksand">
                Creator
              </span>
            </div>
          </div>

          {/* Member 2: LAVERNE AUDET (Co-creator) */}
          <div className="w-[200px] h-[74px] bg-white rounded-[4px] px-4 py-3 shadow-xs border border-gray-100 flex items-center gap-3">
            <img 
              src="/audience/live-avatar-laverne.png" 
              alt="LAVERNE AUDET"
              className="w-[36px] h-[36px] rounded-full object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-black uppercase leading-[18px] font-quicksand truncate">
                Laverne Audet
              </span>
              <span className="text-[12px] font-normal text-[#707070] leading-[16px] font-quicksand">
                Co-creator
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. Live Chat Section ─── */}
      <div className="w-full flex flex-col gap-6 pt-2">
        {/* Header: Live Chat (border-bottom 1px solid #CED4DA) */}
        <div className="border-b border-[#CED4DA] pb-2">
          <h4 className="text-[18px] font-bold text-black leading-[23px] font-quicksand m-0">
            Live Chat
          </h4>
        </div>

        {/* Comment Thread List */}
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              {/* Main Comment (Group 12956 / Group 12957) */}
              <div className="flex items-start gap-3">
                <img 
                  src={comment.avatarUrl || '/audience/live-avatar-john-doe.png'} 
                  alt={comment.author}
                  className="w-[36px] h-[36px] rounded-full object-cover shrink-0"
                />

                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[14px] font-bold text-black leading-[17px] font-quicksand">
                    {comment.author}
                  </span>
                  <p className="text-[12px] font-normal text-[#707070] leading-[16px] font-quicksand m-0 max-w-[555px]">
                    {comment.text}
                  </p>

                  {/* Actions: Likes & Replies */}
                  <div className="flex items-center gap-5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCommentLike(comment.id)}
                      className="flex items-center gap-1.5 text-[#707070] hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      <Heart
                        size={15}
                        className={comment.hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#707070]'}
                      />
                      <span className="text-[14px] font-bold font-quicksand text-[#707070]">
                        {comment.likes}
                      </span>
                    </button>

                    <span className="text-[16px] font-normal text-[#FF3A15] font-quicksand cursor-pointer hover:underline">
                      Replies ({comment.replies && comment.replies.length > 0 ? comment.replies.length : 1})
                    </span>
                  </div>
                </div>
              </div>

              {/* Nested Reply (Group 12958: Hamilton) */}
              {comment.replies && comment.replies.map((reply) => (
                <div key={reply.id} className="ml-12 flex items-start gap-3 pt-1">
                  <img 
                    src={reply.avatarUrl || '/audience/live-avatar-john-doe.png'} 
                    alt={reply.author}
                    className="w-[30px] h-[30px] rounded-full object-cover shrink-0"
                  />

                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-black leading-[18px] font-quicksand">
                      {reply.author}
                    </span>
                    <p className="text-[10px] font-normal text-[#707070] leading-[12px] font-quicksand m-0 max-w-[320px]">
                      {reply.text}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCommentLike(reply.id, true, comment.id)}
                        className="flex items-center gap-1 text-[#707070] hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                      >
                        <Heart
                          size={13}
                          className={reply.hasLiked ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#707070]'}
                        />
                        <span className="text-[12px] font-bold font-quicksand text-[#707070]">
                          {reply.likes}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ─── 6. Write Your Comment Input Bar (Group 4: 850px wide, border-top #EEEEEE) ─── */}
        <form
          onSubmit={handleAddComment}
          className="w-full max-w-[850px] pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-3 mt-4"
        >
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write your comment"
            className="flex-1 bg-transparent text-[18px] text-black placeholder:text-[rgba(24,24,24,0.2)] font-quicksand outline-none leading-[23px] py-1 border-none"
          />

          <div className="flex items-center gap-4 shrink-0">
            {/* Paperclip */}
            <button
              type="button"
              className="text-[#707070] opacity-30 hover:opacity-100 transition-opacity bg-transparent border-none p-1 cursor-pointer"
              title="Attach file"
            >
              <Paperclip size={22} />
            </button>

            {/* Send Button: 32px x 32px, background #D4AF37, border 1px solid #EEEEEE, radius 4px */}
            <button
              type="submit"
              className="w-[32px] h-[32px] bg-[#D4AF37] hover:bg-[#c49f30] text-black border border-[#EEEEEE] rounded-[4px] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              title="Send comment"
            >
              <Send size={15} strokeWidth={2.2} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
