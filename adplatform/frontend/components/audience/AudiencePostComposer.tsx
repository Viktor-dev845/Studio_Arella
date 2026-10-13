'use client';

import { useState } from 'react';
import { Edit3, Video, Send, Sparkles } from 'lucide-react';
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
  const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    if (onPostSubmit) onPostSubmit(content);
    setContent('');
  };

  return (
    <div className="w-full bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/50 overflow-hidden">
      {/* Top Input Area */}
      <div className="p-4 sm:p-5 flex items-center gap-4">
        {/* User Avatar */}
        <img 
          src={userAvatar} 
          alt={user?.name || 'User'} 
          className="w-[40px] h-[40px] rounded-[18px] object-cover shrink-0 shadow-sm border border-gray-100"
        />

        {/* Input Field */}
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
            className="w-full text-[16px] text-[#16151C] placeholder:text-[#666666] font-normal bg-transparent outline-none"
          />
          <Edit3 size={18} className="text-[#666666] shrink-0" strokeWidth={1.8} />
        </div>
      </div>

      {/* Golden Action Footer */}
      <div className="w-full h-[60px] sm:h-[70px] bg-[rgba(212,175,55,0.69)] flex items-stretch justify-between rounded-b-[16px] overflow-hidden">
        {/* Left: Live Experiences Button */}
        <button
          type="button"
          onClick={onLiveExperienceClick}
          className="flex-1 flex items-center gap-3 px-5 sm:px-6 hover:bg-black/5 transition-colors text-left"
        >
          <Video size={22} strokeWidth={2} className="text-[#000000]" />
          <span className="text-[15px] sm:text-[16px] font-medium text-[#000000]">
            Live experiences
          </span>
        </button>

        {/* Right: Send Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-[70px] sm:w-[77px] bg-[rgba(212,175,55,0.49)] hover:bg-[#D4AF37] transition-all flex items-center justify-center text-[#000000] border-l border-white/20 active:scale-95"
          title="Send Post"
        >
          <Send size={20} strokeWidth={2.2} className="text-[#000000]" />
        </button>
      </div>
    </div>
  );
}
