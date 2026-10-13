'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  followed?: boolean;
}

const INITIAL_CREATORS: Creator[] = [
  {
    id: '1',
    name: 'Steve Jobs',
    role: 'CEO of Apple',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    followed: false,
  },
  {
    id: '2',
    name: 'Ryan Roslansky',
    role: 'CEO of Linkedin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    followed: false,
  },
  {
    id: '3',
    name: 'Dylan Field',
    role: 'CEO of Figma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    followed: false,
  },
];

export default function AudienceRightSidebar() {
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [messagesOpen, setMessagesOpen] = useState(false);

  const toggleFollow = (id: string) => {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, followed: !c.followed } : c));
  };

  return (
    <aside className="w-full lg:w-[278px] flex flex-col gap-6 shrink-0 relative">
      {/* ─── 1. Try Premium for Free Card ─── */}
      <div 
        className="w-full rounded-[18px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-amber-100/50 relative overflow-hidden flex flex-col justify-between min-h-[178px]"
        style={{
          background: 'linear-gradient(250.16deg, #FFFFFF 2.51%, #FFFAEA 96.8%)',
        }}
      >
        {/* Background 3D Illustration */}
        <div className="absolute right-0 bottom-0 w-[140px] h-full pointer-events-none opacity-90 overflow-hidden flex items-end justify-end">
          <img 
            src="/audience/try-premium.png" 
            alt="Premium Illustration" 
            className="w-full h-auto object-contain max-h-[140px]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Text Content */}
        <div className="relative z-10 max-w-[155px]">
          <h3 className="text-[22px] font-bold text-[#000000] leading-[1.25] tracking-tight">
            Try Premium <br />
            <span className="font-medium">for free</span>
          </h3>
          <p className="text-[12px] text-black/50 mt-1">
            --One month free
          </p>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mt-4">
          <button
            type="button"
            className="px-5 h-[38px] bg-[#D4AF37] hover:bg-[#c29f31] text-[#000000] rounded-[6px] text-[13px] font-semibold transition-all shadow-sm active:scale-95"
          >
            Try Free
          </button>
        </div>
      </div>

      {/* ─── 2. Creators You May Like Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60">
        <h4 className="text-[16px] font-semibold text-[#212121] mb-4">
          Creators you may like
        </h4>

        {/* Creator List */}
        <div className="flex flex-col gap-4">
          {creators.map((creator) => (
            <div key={creator.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={creator.avatar} 
                  alt={creator.name} 
                  className="w-[38px] h-[38px] rounded-full object-cover shrink-0 border border-gray-100"
                />
                <div className="min-w-0">
                  <h5 className="text-[13px] font-semibold text-[#212121] truncate">
                    {creator.name}
                  </h5>
                  <p className="text-[11px] text-gray-500 truncate font-light">
                    {creator.role}
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={() => toggleFollow(creator.id)}
                className={`w-[66px] h-[30px] rounded-[8px] text-[12px] font-medium transition-all shrink-0 flex items-center justify-center ${
                  creator.followed
                    ? 'bg-[#15411F] text-white border border-[#15411F]'
                    : 'bg-white text-[#15411F] border border-[#15411F] hover:bg-[#15411F]/5'
                }`}
              >
                {creator.followed ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#DFDFDF] my-4" />

        {/* See All */}
        <div className="text-center">
          <button 
            type="button" 
            className="text-[12px] font-semibold text-[#15411F] hover:underline transition-all"
          >
            See All
          </button>
        </div>
      </div>

      {/* ─── 3. Memberships / Pages Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col gap-4">
        {/* Design podcast membership */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[10px] text-white font-bold">F</span>
          </div>
          <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal truncate">
            Design podcast membership
          </span>
        </div>

        {/* UI Design membership */}
        <div className="flex items-center justify-between gap-2 cursor-pointer group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[10px] text-white font-bold">UI</span>
            </div>
            <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal truncate">
              UI Design membership
            </span>
          </div>
          <span className="min-w-[28px] h-[16px] px-1 bg-[#FF1930] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shrink-0">
            +99
          </span>
        </div>

        {/* Join memberships */}
        <div className="flex items-center gap-3 cursor-pointer group pt-1">
          <div className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center shrink-0 group-hover:border-black transition-colors">
            <Plus size={14} className="text-gray-500 group-hover:text-black" />
          </div>
          <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal">
            Join memberships
          </span>
        </div>
      </div>

      {/* ─── 4. Docked Messages Floating Widget ─── */}
      <div className="w-full bg-white rounded-t-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-b-0 border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setMessagesOpen(!messagesOpen)}
          className="w-full h-[56px] px-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare size={20} strokeWidth={1.8} className="text-[#666666]" />
            <span className="text-[15px] text-[#666666] font-medium">Messages</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 bg-[#FF1930] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              6
            </span>
            {messagesOpen ? (
              <ChevronDown size={18} className="text-gray-500" />
            ) : (
              <ChevronUp size={18} className="text-gray-500" />
            )}
          </div>
        </button>

        {messagesOpen && (
          <div className="p-4 border-t border-gray-100 flex flex-col gap-3 max-h-[220px] overflow-y-auto bg-[#FCFDFD]">
            <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100/60 cursor-pointer transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" 
                alt="Chat User" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-black truncate">Studio Arella Team</p>
                <p className="text-[11px] text-gray-500 truncate">Hey! Your ad session was confirmed.</p>
              </div>
              <span className="text-[10px] text-gray-400">2m</span>
            </div>
            <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100/60 cursor-pointer transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" 
                alt="Chat User" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-black truncate">Ryan Roslansky</p>
                <p className="text-[11px] text-gray-500 truncate">Loved the new episode preview!</p>
              </div>
              <span className="text-[10px] text-gray-400">1h</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
