'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Video, 
  Bell, 
  MessageSquare, 
  User as UserIcon, 
  Search 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AudienceNavbarProps {
  activeNav?: 'home' | 'video' | 'notifications' | 'messages' | 'profile' | null;
  onNavChange?: (nav: 'home' | 'video' | 'notifications' | 'messages' | 'profile') => void;
  onSearch?: (query: string) => void;
}

export default function AudienceNavbar({
  activeNav = 'home',
  onNavChange,
  onSearch,
}: AudienceNavbarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentNav, setCurrentNav] = useState<'home' | 'video' | 'notifications' | 'messages' | 'profile' | null>(activeNav);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentNav(activeNav);
  }, [activeNav]);

  const handleNavClick = (nav: 'home' | 'video' | 'notifications' | 'messages' | 'profile') => {
    setCurrentNav(nav);
    if (onNavChange) onNavChange(nav);
    if (nav === 'profile') {
      router.push('/user-profile/overview');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[76px] bg-white border-b border-[#F0F0F0] flex items-center justify-between px-6 lg:px-14 shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-['DM_Sans',sans-serif]">
      {/* ─── Left: Studio Arella Logo ─── */}
      <div className="flex items-center">
        <Link href="/audience" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Studio Arella" 
            className="h-[44px] w-auto object-contain"
          />
        </Link>
      </div>

      {/* ─── Center: Main Navigation Icons (Frame 2121459682, gap: 67px) ─── */}
      <nav className="flex items-center gap-7 sm:gap-11 md:gap-14 lg:gap-[67px] relative h-full">
        {/* 1. Home */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('home')}
            className={`p-1.5 transition-colors ${
              currentNav === 'home' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Home"
          >
            <Home size={28} strokeWidth={currentNav === 'home' ? 2.2 : 1.7} fill={currentNav === 'home' ? '#D4AF37' : 'none'} />
          </button>
          {currentNav === 'home' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* 2. Video / Live Experiences */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('video')}
            className={`p-1.5 transition-colors ${
              currentNav === 'video' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Live Experiences / Videos"
          >
            <Video size={28} strokeWidth={currentNav === 'video' ? 2.2 : 1.7} fill={currentNav === 'video' ? '#D4AF37' : 'none'} />
          </button>
          {currentNav === 'video' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* 3. Notifications with Red Badge (9+) */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('notifications')}
            className={`relative p-1.5 transition-colors ${
              currentNav === 'notifications' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Notifications"
          >
            <Bell 
              size={28} 
              strokeWidth={currentNav === 'notifications' ? 2.2 : 1.7} 
              fill={currentNav === 'notifications' ? '#D4AF37' : 'none'}
            />
            <span className="absolute top-0 right-[-4px] w-[18px] h-[18px] bg-[#FF0000] text-white text-[11px] font-['Roboto',sans-serif] font-normal rounded-full flex items-center justify-center border border-white shadow-sm">
              9+
            </span>
          </button>
          {currentNav === 'notifications' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* 4. Chat / Messages with Red Badge (6) */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('messages')}
            className={`relative p-1.5 transition-colors ${
              currentNav === 'messages' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Messages"
          >
            <MessageSquare 
              size={28} 
              strokeWidth={currentNav === 'messages' ? 2.2 : 1.7} 
              fill={currentNav === 'messages' ? '#D4AF37' : 'none'}
            />
            <span className="absolute top-0 right-[-3px] w-[16px] h-[16px] bg-[#FF0000] text-white text-[11px] font-['Roboto',sans-serif] font-normal rounded-full flex items-center justify-center border border-white shadow-sm">
              6
            </span>
          </button>
          {currentNav === 'messages' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* 5. Profile */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('profile')}
            className={`p-1.5 transition-colors ${
              currentNav === 'profile' ? 'text-black' : 'text-black/60 hover:text-black'
            }`}
            title="User Profile"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <UserIcon size={28} strokeWidth={currentNav === 'profile' ? 2.2 : 1.7} />
            )}
          </button>
          {currentNav === 'profile' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>
      </nav>

      {/* ─── Right: Search Box (Group 48095436) ─── */}
      <div className="hidden md:flex items-center gap-4">
        {/* Subtle vertical separator from Figma */}
        <div className="h-[28px] w-[1px] bg-black/15" />

        <form 
          onSubmit={handleSearchSubmit}
          className="flex items-center w-[267px] h-[44px] bg-[#F6F6F6] rounded-[18px] overflow-hidden border border-transparent focus-within:border-[#D4AF37]/60 transition-all"
        >
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 px-4 bg-transparent text-[12px] font-['DM_Sans',sans-serif] text-black placeholder:text-black/55 outline-none"
          />
          <button 
            type="submit"
            className="w-[61px] h-full bg-[rgba(212,175,55,0.85)] hover:bg-[#D4AF37] transition-colors flex items-center justify-center text-black"
            title="Search"
          >
            <Search size={19} strokeWidth={2.2} className="text-black" />
          </button>
        </form>
      </div>
    </header>
  );
}
