'use client';

import { useState } from 'react';
import { Edit3, Video, Calendar, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AudiencePostComposerProps {
  onPostSubmit?: (content: string) => void;
  onLiveExperienceClick?: () => void;
  onFanEventClick?: () => void;
}

export default function AudiencePostComposer({
  onPostSubmit,
  onLiveExperienceClick,
  onFanEventClick,
}: AudiencePostComposerProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');

  const userAvatar = user?.avatar;
  const userName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'Fan';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    if (onPostSubmit) onPostSubmit(content);
    setContent('');
  };

  return (
    <div className="w-full h-[168px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col justify-between font-['DM_Sans',sans-serif]">
      {/* ─── Top Input Row (height ~98px) ─── */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-4 flex-1">
        {/* User Avatar: 40x40, border-radius 18px */}
        {userAvatar ? (
          <img 
            src={userAvatar} 
            alt={userName} 
            className="w-[40px] h-[40px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm"
          />
        ) : (
          <div className="w-[40px] h-[40px] rounded-[18px] bg-[#FAF5E6] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[#D4AF37] text-sm shrink-0 shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Text Input + Edit/Pencil Icon */}
        <div className="flex-1 flex items-center justify-between gap-3">
          <input 
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write something ..."
            className="w-full text-[16px] text-black placeholder:text-[#666666] font-normal bg-transparent outline-none leading-[21px]"
          />
          <Edit3 size={20} strokeWidth={1.8} className="text-[#666666] shrink-0 cursor-pointer hover:text-black transition-colors" />
        </div>
      </div>

      {/* ─── Bottom Bar: height 70px, background rgba(212, 175, 55, 0.69) ─── */}
      <div className="w-full h-[70px] bg-[rgba(212,175,55,0.69)] rounded-b-[16px] flex items-stretch justify-between overflow-hidden">
        {/* Left Action Buttons: Live experiences + Fan Event */}
        <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-6 flex-1 min-w-0">
          {/* 1. Live experiences */}
          <button
            type="button"
            onClick={onLiveExperienceClick}
            className="flex items-center gap-2 sm:gap-2.5 py-2 px-2 hover:bg-black/5 rounded-md transition-colors text-left shrink-0 cursor-pointer"
          >
            <Video size={20} strokeWidth={2} className="text-[#000000] shrink-0" />
            <span className="text-[14px] sm:text-[16px] font-normal text-[#000000] leading-[21px] whitespace-nowrap">
              Live experiences
            </span>
          </button>

          {/* 2. Fan Event (Calendar icon + Fan Event) */}
          <button
            type="button"
            onClick={onFanEventClick || (() => alert('Opening Fan Events calendar...'))}
            className="flex items-center gap-2 sm:gap-2.5 py-2 px-2 hover:bg-black/5 rounded-md transition-colors text-left shrink-0 cursor-pointer"
          >
            <Calendar size={20} strokeWidth={2} className="text-[#000000] shrink-0" />
            <span className="text-[14px] sm:text-[16px] font-normal text-[#000000] leading-[21px] whitespace-nowrap">
              Fan Event
            </span>
          </button>
        </div>

        {/* Right: Send Button (77px x 70px, background rgba(212, 175, 55, 0.49)) */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-[65px] sm:w-[77px] h-[70px] bg-[rgba(212,175,55,0.49)] hover:bg-[#D4AF37] transition-all flex items-center justify-center text-[#000000] active:scale-95 shrink-0 cursor-pointer"
          title="Send Post"
        >
          <Send size={22} strokeWidth={2.2} className="text-[#000000]" />
        </button>
      </div>
    </div>
  );
}
