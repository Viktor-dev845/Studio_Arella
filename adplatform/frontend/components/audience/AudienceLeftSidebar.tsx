'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  BarChart2, 
  Users, 
  Bookmark, 
  Gamepad2, 
  Settings, 
  Plus,
  LayoutDashboard 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface AudienceLeftSidebarProps {
  activeMenu?: string;
  onMenuSelect?: (menuId: string) => void;
  onTagSelect?: (tag: string) => void;
}

const HASHTAGS_ROW_1 = ['#podcasts', '#billboards'];
const HASHTAGS_ROW_2 = ['#umuahia', '#creators'];
const HASHTAGS_ROW_3 = ['#music', '#events'];
const HASHTAGS_ROW_4 = ['#business', '#entertainment'];

export default function AudienceLeftSidebar({
  activeMenu = 'podcast',
  onMenuSelect,
  onTagSelect,
}: AudienceLeftSidebarProps) {
  const router = useRouter();
  const { user, loadFromStorage } = useAuthStore();
  const [currentMenu, setCurrentMenu] = useState(activeMenu);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    setCurrentMenu(activeMenu);
  }, [activeMenu]);

  const [bookmarkCount, setBookmarkCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arella_bookmark_count');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    const fetchBookmarkCount = async () => {
      try {
        const res = await api.get('/content/bookmarks');
        const count = res.data?.posts?.length || 0;
        setBookmarkCount(count);
        if (typeof window !== 'undefined') {
          localStorage.setItem('arella_bookmark_count', String(count));
        }
      } catch {
        // keep current
      }
    };
    if (user?.id) {
      fetchBookmarkCount();
    }

    const onBookmarksChanged = (e: any) => {
      const isBookmarked = e.detail?.bookmarked;
      setBookmarkCount((prev) => {
        const next = isBookmarked ? prev + 1 : Math.max(0, prev - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem('arella_bookmark_count', String(next));
        }
        return next;
      });
    };

    window.addEventListener('bookmarks-changed', onBookmarksChanged);
    return () => window.removeEventListener('bookmarks-changed', onBookmarksChanged);
  }, [user?.id]);

  const userName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'Guest Fan';
  const userTitle = user?.role === 'screen_owner' 
    ? 'Media Partner' 
    : user?.role === 'admin' 
    ? 'Administrator' 
    : user?.role === 'creator'
    ? (user.creator_niche || 'Creator')
    : user ? 'Studio Insider' : 'Studio Arella Fan';
  const userAvatar = user?.avatar;

  const handleMenuClick = (menuId: string) => {
    setCurrentMenu(menuId);
    if (onMenuSelect) onMenuSelect(menuId);
  };

  const handleProfileCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      handleMenuClick('profile');
    } else {
      router.push('/auth/login?redirect=/audience');
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(prev => prev === tag ? null : tag);
    if (onTagSelect) onTagSelect(tag);
  };

  return (
    <aside className="w-full lg:w-[290px] xl:w-[320px] flex flex-col gap-6 shrink-0 lg:sticky lg:top-[92px] lg:self-start lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto no-scrollbar font-quicksand pb-6">
      {/* ─── 1. User Mini Profile Card (dynamic width) ─── */}
      <div 
        onClick={handleProfileCardClick}
        className={`w-full min-h-[168px] bg-gradient-to-br from-white via-[#FCFDFD] to-[#FBF8EF] rounded-[18px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_2px_10px_rgba(0,0,0,0.04)] border overflow-hidden relative transition-all cursor-pointer group flex flex-col justify-between ${
          currentMenu === 'profile' ? 'border-[#D9BA54] ring-1 ring-[#D9BA54]/50' : 'border-gray-200/60 hover:border-[#D9BA54]/50'
        }`}
        title={user ? "View profile" : "Sign in to Studio Arella"}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-[16px] overflow-hidden border border-[#D9BA54]/30 bg-[#FAF3DE] shrink-0 shadow-sm flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-[#D4AF37] text-xl">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-[#181818] truncate leading-tight group-hover:text-[#8B7322] transition-colors">
              {userName}
            </h3>
            <p className="text-[12px] font-medium text-gray-500 truncate mt-1">
              {userTitle}
            </p>
          </div>
        </div>

        {/* Profile Status & Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#8B7322] bg-[#FAF5E6] px-2.5 py-1 rounded-full border border-[#D9BA54]/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            {user ? 'Active Fan' : 'Community'}
          </span>
          <span className="text-[12px] font-semibold text-[#8B7322] group-hover:translate-x-0.5 transition-transform">
            {user ? 'My Profile →' : 'Sign in →'}
          </span>
        </div>
      </div>

      {/* ─── 2. Navigation Menu Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-4">
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
          <span className="text-[16px] leading-[21px]">Podcast</span>
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
        <div
          onClick={() => handleMenuClick('bookmarks')}
          className={`flex items-center justify-between py-2 px-3.5 rounded-full cursor-pointer transition-all ${
            currentMenu === 'bookmarks'
              ? 'bg-[#F6F6F6] text-[#666666] font-medium'
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Bookmark size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
            <span className="text-[16px] leading-[21px]">Bookmarks</span>
          </div>

          {bookmarkCount > 0 && (
            <div className="w-[32px] h-[16px] bg-[#D4AF37] border-2 border-white rounded-[8px] flex items-center justify-center text-white text-[11px] font-normal leading-[14px] shadow-sm shrink-0">
              {bookmarkCount}
            </div>
          )}
        </div>

        {/* Item 5: Subscriptions (Frame 8: active pill with Gold Pill Counter Badge "2") */}
        <div
          onClick={() => handleMenuClick('subscriptions')}
          className={`flex items-center justify-between py-2 px-3.5 rounded-full cursor-pointer transition-all ${
            currentMenu === 'subscriptions'
              ? 'bg-[#F6F6F6] text-[#666666] font-medium'
              : 'text-[#666666] hover:text-black'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Gamepad2 size={20} strokeWidth={1.8} className="shrink-0 text-[#666666]" />
            <span className="text-[16px] leading-[21px]">Subscriptions</span>
          </div>
          
          {/* Badge: 32px x 16px, background #D4AF37, border 2px solid white, radius 8px, text "2" */}
          <div className="w-[32px] h-[16px] bg-[#D4AF37] border-2 border-white rounded-[8px] flex items-center justify-center text-white text-[11px] font-normal leading-[14px] shadow-sm shrink-0">
            2
          </div>
        </div>

        {/* Item 6: Settings */}
        <button
          type="button"
          onClick={() => handleMenuClick('settings')}
          className={`flex items-center gap-3.5 py-1.5 text-left transition-colors ${
            currentMenu === 'settings' || currentMenu === 'edit-profile' ? 'text-black font-semibold' : 'text-[#666666] hover:text-black'
          }`}
        >
          <Settings size={20} strokeWidth={1.8} className={`shrink-0 ${currentMenu === 'settings' || currentMenu === 'edit-profile' ? 'text-black' : 'text-[#666666]'}`} />
          <span className="text-[16px] leading-[21px]">Settings</span>
        </button>

        {/* Return to Advertiser Portal / Dashboard */}
        <div className="pt-2 mt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/70 text-[#8c711a] text-left transition-all cursor-pointer group shadow-2xs"
            title="Return to Advertiser Dashboard"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-bold">
                {user?.role === 'creator' ? 'Creator Dashboard' : 'Advertiser Portal'}
              </span>
            </div>
            <span className="text-[13px] font-bold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>

      {/* ─── 3. Followed Hashtags Card ─── */}
      <div className="w-full bg-[#FCFDFD] rounded-[18px] p-4 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-3 font-quicksand">
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
