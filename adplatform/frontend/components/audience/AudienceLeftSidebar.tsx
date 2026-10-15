'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  BarChart2, 
  Users, 
  Bookmark, 
  Gamepad2, 
  Settings, 
  Plus 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AudienceLeftSidebarProps {
  activeMenu?: string;
  onMenuSelect?: (menuId: string) => void;
  onTagSelect?: (tag: string) => void;
}

const HASHTAGS_ROW_1 = ['#work', '#business', '#hr'];
const HASHTAGS_ROW_2 = ['#userinterface', '#digital'];
const HASHTAGS_ROW_3 = ['#userexperience', '#ux'];
const HASHTAGS_ROW_4 = ['#ui', '#freelance'];

export default function AudienceLeftSidebar({
  activeMenu = 'trending',
  onMenuSelect,
  onTagSelect,
}: AudienceLeftSidebarProps) {
  const { user } = useAuthStore();
  const [currentMenu, setCurrentMenu] = useState(activeMenu);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    setCurrentMenu(activeMenu);
  }, [activeMenu]);

  const userName = user?.name || 'Adam Udochi';
  const userTitle = user?.role === 'screen_owner' ? 'Screen Owner' : user?.role === 'admin' ? 'Administrator' : 'UI/UX Designer';
  const userAvatar = user?.avatar || '/audience/adam-udochi.png';

  const handleMenuClick = (menuId: string) => {
    setCurrentMenu(menuId);
    if (onMenuSelect) onMenuSelect(menuId);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(prev => prev === tag ? null : tag);
    if (onTagSelect) onTagSelect(tag);
  };

  return (
    <aside className="w-full lg:w-[278px] flex flex-col gap-6 shrink-0 font-['DM_Sans',sans-serif]">
      {/* ─── 1. User Mini Profile Card (Group 48095422) ─── */}
      <div className="w-[278px] h-[168px] bg-white rounded-[18px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/60 overflow-hidden flex flex-col justify-between">
        {/* Banner + Avatar Row */}
        <div>
          {/* Top Banner (Rectangle 19: 278px x 82px) */}
          <div className="w-[278px] h-[82px] relative bg-gradient-to-r from-gray-50 via-gray-100 to-amber-50/50 overflow-hidden">
            <img 
              src="/audience/user-card.png" 
              alt="Banner" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* User Info with overlapping Avatar */}
          <div className="px-3.5 pt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Avatar (Rectangle 16: 44x44, radius 18px) overlapping banner */}
              <div className="-mt-6 shrink-0">
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-[44px] h-[44px] rounded-[18px] object-cover border-2 border-white shadow-sm"
                />
              </div>

              {/* Name & Title */}
              <div className="flex flex-col">
                <span className="text-[12px] font-normal text-[#000000] leading-[16px] truncate max-w-[85px]">
                  {userName}
                </span>
                <span className="text-[10px] font-normal text-black/45 leading-[13px] truncate max-w-[85px]">
                  {userTitle}
                </span>
              </div>
            </div>

            {/* Profile Progress (90% + Bar) */}
            <div className="flex items-center gap-1.5 shrink-0 -mt-2">
              <div className="w-[61px] h-[4px] bg-[#F6F6F6] rounded-full overflow-hidden relative">
                <div className="w-[43px] h-full bg-[#15411F] rounded-full" />
              </div>
              <span className="text-[10px] font-normal text-[#15411F] leading-[13px]">
                90%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Divider + Add another account */}
        <div>
          <div className="w-full h-[1px] bg-[#F6F6F6]" />
          <div className="px-3.5 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50/80 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center text-[#666666]">
              <Plus size={14} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-normal text-black/45 leading-[13px]">
              Add another account
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. Navigation Menu Card (Menu: 278px x 312px) ─── */}
      <div className="w-[278px] bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-4">
        {/* Item 1: Podcast Feed */}
        <button
          type="button"
          onClick={() => handleMenuClick('podcast')}
          className={`flex items-center gap-3.5 py-2 px-3.5 rounded-full transition-all text-left cursor-pointer ${
            currentMenu === 'podcast'
              ? 'bg-[#F6F6F6] text-[#666666] font-medium w-fit pr-6'
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <Play size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
          <span className="text-[16px] leading-[21px]">Podcast Feed</span>
        </button>

        {/* Item 2: Trending (Frame 2: Active in Figma with #F6F6F6 pill, rounded-full) */}
        <button
          type="button"
          onClick={() => handleMenuClick('trending')}
          className={`flex items-center gap-3.5 py-2 px-3.5 rounded-full transition-all text-left cursor-pointer ${
            currentMenu === 'trending' 
              ? 'bg-[#F6F6F6] text-[#666666] font-medium w-fit pr-6' 
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <BarChart2 size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
          <span className="text-[16px] leading-[21px]">Trending</span>
        </button>

        {/* Item 3: Memberships */}
        <button
          type="button"
          onClick={() => handleMenuClick('memberships')}
          className={`flex items-center gap-3.5 py-2 px-3.5 rounded-full transition-all text-left cursor-pointer ${
            currentMenu === 'memberships'
              ? 'bg-[#F6F6F6] text-[#666666] font-medium w-fit pr-6'
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <Users size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
          <span className="text-[16px] leading-[21px]">Memberships</span>
        </button>

        {/* Item 4: Bookmarks */}
        <button
          type="button"
          onClick={() => handleMenuClick('bookmarks')}
          className={`flex items-center gap-3.5 py-2 px-3.5 rounded-full transition-all text-left cursor-pointer ${
            currentMenu === 'bookmarks'
              ? 'bg-[#F6F6F6] text-[#666666] font-medium w-fit pr-6'
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <Bookmark size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
          <span className="text-[16px] leading-[21px]">Bookmarks</span>
        </button>

        {/* Item 5: Subscriptions (With Gold Pill Counter Badge "2") */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleMenuClick('subscriptions')}
            className={`flex items-center gap-3.5 py-1.5 text-left transition-colors ${
              currentMenu === 'subscriptions' ? 'text-black font-medium' : 'text-[#666666] hover:text-black'
            }`}
          >
            <Gamepad2 size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
            <span className="text-[16px] leading-[21px]">Subscriptions</span>
          </button>
          
          {/* Badge: 32px x 16px, background #D4AF37, border 2px solid white, radius 8px, text "2" */}
          <div className="w-[32px] h-[16px] bg-[#D4AF37] border-2 border-white rounded-[8px] flex items-center justify-center text-white text-[11px] font-normal leading-[14px] shadow-sm">
            2
          </div>
        </div>

        {/* Item 6: Settings */}
        <button
          type="button"
          onClick={() => handleMenuClick('settings')}
          className={`flex items-center gap-3.5 py-1.5 text-left transition-colors ${
            currentMenu === 'settings' ? 'text-black font-medium' : 'text-[#666666] hover:text-black'
          }`}
        >
          <Settings size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
          <span className="text-[16px] leading-[21px]">Settings</span>
        </button>
      </div>

      {/* ─── 3. Followed Hashtags Card (Hashtags: 278px x 188px) ─── */}
      <div className="w-[278px] bg-[#FCFDFD] rounded-[18px] p-4 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-3 font-['Roboto',sans-serif]">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-normal tracking-wider text-[#181818] uppercase">
            FOLLOWED HASHTAGS
          </span>
          <button 
            type="button"
            className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center text-[#666666] transition-colors"
            title="Add hashtag"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#F4F4F4]" />

        {/* Hashtags Chips Rows matching exact Figma layout */}
        <div className="flex flex-col gap-2">
          {/* Row 1: #work, #business, #hr */}
          <div className="flex items-center gap-2 flex-wrap">
            {HASHTAGS_ROW_1.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`h-[23px] px-2.5 rounded-[4px] text-[12px] font-normal transition-all ${
                  selectedTag === tag 
                    ? 'bg-[#E0A526] text-white font-medium' 
                    : 'bg-[#FFFBEE] text-[#181818] hover:bg-[#ffefc6]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Row 2: #userinterface, #digital */}
          <div className="flex items-center gap-2 flex-wrap">
            {HASHTAGS_ROW_2.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`h-[23px] px-2.5 rounded-[4px] text-[12px] font-normal transition-all ${
                  selectedTag === tag 
                    ? 'bg-[#E0A526] text-white font-medium' 
                    : 'bg-[#FFFBEE] text-[#181818] hover:bg-[#ffefc6]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Row 3: #userexperience, #ux */}
          <div className="flex items-center gap-2 flex-wrap">
            {HASHTAGS_ROW_3.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`h-[23px] px-2.5 rounded-[4px] text-[12px] font-normal transition-all ${
                  selectedTag === tag 
                    ? 'bg-[#E0A526] text-white font-medium' 
                    : 'bg-[#FFFBEE] text-[#181818] hover:bg-[#ffefc6]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Row 4: #ui, #freelance */}
          <div className="flex items-center gap-2 flex-wrap">
            {HASHTAGS_ROW_4.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`h-[23px] px-2.5 rounded-[4px] text-[12px] font-normal transition-all ${
                  selectedTag === tag 
                    ? 'bg-[#E0A526] text-white font-medium' 
                    : 'bg-[#FFFBEE] text-[#181818] hover:bg-[#ffefc6]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
