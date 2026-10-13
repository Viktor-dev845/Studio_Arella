'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  BarChart2, 
  Users, 
  Bookmark, 
  Gamepad2, 
  Settings, 
  Plus, 
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AudienceLeftSidebarProps {
  activeMenu?: string;
  onMenuSelect?: (menuId: string) => void;
  onTagSelect?: (tag: string) => void;
}

const HASHTAGS = [
  '#work',
  '#business',
  '#hr',
  '#userinterface',
  '#digital',
  '#userexperience',
  '#ux',
  '#ui',
  '#freelance',
];

export default function AudienceLeftSidebar({
  activeMenu = 'podcast',
  onMenuSelect,
  onTagSelect,
}: AudienceLeftSidebarProps) {
  const { user } = useAuthStore();
  const [currentMenu, setCurrentMenu] = useState(activeMenu);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const userName = user?.name || 'Adam Udochi';
  const userTitle = user?.role === 'screen_owner' ? 'Screen Owner' : user?.role === 'admin' ? 'Administrator' : 'UI/UX Designer';
  const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop';

  const handleMenuClick = (menuId: string) => {
    setCurrentMenu(menuId);
    if (onMenuSelect) onMenuSelect(menuId);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(prev => prev === tag ? null : tag);
    if (onTagSelect) onTagSelect(tag);
  };

  return (
    <aside className="w-full lg:w-[278px] flex flex-col gap-6 shrink-0">
      {/* ─── 1. User Mini Profile Card ─── */}
      <div className="w-full bg-white rounded-[18px] overflow-hidden shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/50">
        {/* Cover Banner */}
        <div className="w-full h-[82px] relative bg-gradient-to-r from-gray-50 via-gray-100 to-amber-50/60 overflow-hidden">
          <img 
            src="/audience/user-card.png" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              // Graceful fallback to styled pattern
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* User Info Row */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-3">
            {/* Avatar overlapping banner */}
            <div className="-mt-8 relative shrink-0">
              <img 
                src={userAvatar} 
                alt={userName}
                className="w-[44px] h-[44px] rounded-[18px] object-cover border-2 border-white shadow-sm"
              />
            </div>

            {/* Name & Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[12px] font-semibold text-[#000000] truncate">
                {userName}
              </h3>
              <p className="text-[10px] text-black/50 truncate">
                {userTitle}
              </p>
            </div>

            {/* Profile Completion Bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-[48px] h-[4px] bg-[#F6F6F6] rounded-full overflow-hidden">
                <div className="w-[90%] h-full bg-[#15411F] rounded-full" />
              </div>
              <span className="text-[10px] font-medium text-[#15411F]">
                90%
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#F6F6F6]" />

        {/* Add Another Account */}
        <div className="px-4 py-2.5">
          <button 
            type="button"
            className="flex items-center gap-2 text-black/50 hover:text-black transition-colors text-[10px]"
          >
            <div className="w-4 h-4 rounded-md border border-black/30 flex items-center justify-center">
              <Plus size={10} strokeWidth={2.5} className="text-black/60" />
            </div>
            <span>Add another account</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Navigation Menu Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60">
        <div className="flex flex-col gap-4">
          {/* Podcast (Active Pill) */}
          <button
            type="button"
            onClick={() => handleMenuClick('podcast')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-left ${
              currentMenu === 'podcast'
                ? 'bg-[#F6F6F6] text-[#16151C] font-semibold'
                : 'text-[#666666] hover:bg-gray-50'
            }`}
          >
            <Play size={18} strokeWidth={2} className="text-[#666666]" fill={currentMenu === 'podcast' ? '#666666' : 'none'} />
            <span className="text-[15px]">Podcast</span>
          </button>

          {/* Trending */}
          <button
            type="button"
            onClick={() => handleMenuClick('trending')}
            className={`w-full flex items-center gap-3 px-4 py-2 transition-all text-left ${
              currentMenu === 'trending'
                ? 'text-[#16151C] font-semibold'
                : 'text-[#666666] hover:text-[#16151C]'
            }`}
          >
            <BarChart2 size={18} strokeWidth={2} className="text-[#666666]" />
            <span className="text-[15px]">Trending</span>
          </button>

          {/* Memberships */}
          <button
            type="button"
            onClick={() => handleMenuClick('memberships')}
            className={`w-full flex items-center gap-3 px-4 py-2 transition-all text-left ${
              currentMenu === 'memberships'
                ? 'text-[#16151C] font-semibold'
                : 'text-[#666666] hover:text-[#16151C]'
            }`}
          >
            <Users size={18} strokeWidth={2} className="text-[#666666]" />
            <span className="text-[15px]">Memberships</span>
          </button>

          {/* Bookmarks */}
          <button
            type="button"
            onClick={() => handleMenuClick('bookmarks')}
            className={`w-full flex items-center gap-3 px-4 py-2 transition-all text-left ${
              currentMenu === 'bookmarks'
                ? 'text-[#16151C] font-semibold'
                : 'text-[#666666] hover:text-[#16151C]'
            }`}
          >
            <Bookmark size={18} strokeWidth={2} className="text-[#666666]" />
            <span className="text-[15px]">Bookmarks</span>
          </button>

          {/* Subscriptions with Golden Badge */}
          <button
            type="button"
            onClick={() => handleMenuClick('subscriptions')}
            className={`w-full flex items-center justify-between px-4 py-2 transition-all text-left ${
              currentMenu === 'subscriptions'
                ? 'text-[#16151C] font-semibold'
                : 'text-[#666666] hover:text-[#16151C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Gamepad2 size={18} strokeWidth={2} className="text-[#666666]" />
              <span className="text-[15px]">Subscriptions</span>
            </div>
            <span className="min-w-[24px] h-[18px] px-1.5 bg-[#D4AF37] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              2
            </span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleMenuClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2 transition-all text-left ${
              currentMenu === 'settings'
                ? 'text-[#16151C] font-semibold'
                : 'text-[#666666] hover:text-[#16151C]'
            }`}
          >
            <Settings size={18} strokeWidth={2} className="text-[#666666]" />
            <span className="text-[15px]">Settings</span>
          </button>
        </div>
      </div>

      {/* ─── 3. Followed Hashtags Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[18px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F4]">
          <span className="text-[12px] font-medium tracking-wide text-[#181818] uppercase">
            Followed hashtags
          </span>
          <button 
            type="button"
            className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            title="Add hashtag"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Tag Cloud */}
        <div className="flex flex-wrap gap-2 pt-3">
          {HASHTAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-2.5 py-1 rounded-[4px] text-[12px] transition-all font-normal ${
                  isSelected
                    ? 'bg-[#D4AF37] text-black font-medium shadow-sm'
                    : 'bg-[#FFFBEE] text-[#181818] hover:bg-[#fff3cc]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
