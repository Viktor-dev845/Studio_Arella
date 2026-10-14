'use client';

import { useState } from 'react';
import { Edit3, Video, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AudiencePostComposerProps {
  onPostSubmit?: (content: string) => void;
  onLiveExperienceClick?: () => void;
}

export default function AudiencePostComposer({
  onPostSubmit,
  onLiveExperienceClick,
}: AudiencePostComposerProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const userAvatar = user?.avatar || '/audience/adam-udochi.png';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    if (onPostSubmit) onPostSubmit(content);
    setContent('');
  };

  return (
    <div className="w-full max-w-[570px] h-[168px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col justify-between font-['DM_Sans',sans-serif]">
      {/* ─── Top Input Row (height ~98px) ─── */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-4 flex-1">
        {/* User Avatar: 40x40, border-radius 18px */}
        <img 
          src={userAvatar} 
          alt={user?.name || 'User'} 
          className="w-[40px] h-[40px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm"
        />

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
        {/* Left: Video Icon + "Live experiences" */}
        <button
          type="button"
          onClick={onLiveExperienceClick}
          className="flex-1 flex items-center gap-3.5 px-6 hover:bg-black/5 transition-colors text-left"
        >
          <Video size={22} strokeWidth={2} className="text-[#000000] shrink-0" />
          <span className="text-[16px] font-normal text-[#000000] leading-[21px]">
            Live experiences
          </span>
        </button>

        {/* Right: Send Button (77px x 70px, background rgba(212, 175, 55, 0.49)) */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-[77px] h-[70px] bg-[rgba(212,175,55,0.49)] hover:bg-[#D4AF37] transition-all flex items-center justify-center text-[#000000] active:scale-95"
          title="Send Post"
        >
          <Send size={22} strokeWidth={2.2} className="text-[#000000]" />
        </button>
      </div>
    </div>
  );
}
