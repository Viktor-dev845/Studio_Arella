'use client';

import { useState } from 'react';
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
  activeNav?: 'home' | 'video' | 'notifications' | 'messages' | 'profile';
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
  const [currentNav, setCurrentNav] = useState(activeNav);
  const [searchQuery, setSearchQuery] = useState('');

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
    <header className="sticky top-0 z-50 w-full h-[76px] bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-14 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left: Studio Arella Logo */}
      <div className="flex items-center gap-3">
        <Link href="/audience" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="Studio Arella" 
            className="h-[46px] w-auto object-contain"
          />
        </Link>
      </div>

      {/* Center: Main Navigation Icons */}
      <nav className="flex items-center gap-8 sm:gap-12 md:gap-14 lg:gap-[67px] relative h-full">
        {/* Home */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('home')}
            className={`p-2 transition-colors ${
              currentNav === 'home' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Home"
          >
            <Home size={26} strokeWidth={currentNav === 'home' ? 2.5 : 1.8} fill={currentNav === 'home' ? '#D4AF37' : 'none'} />
          </button>
          {currentNav === 'home' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* Video / Live Experiences */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('video')}
            className={`p-2 transition-colors ${
              currentNav === 'video' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Live Experiences / Videos"
          >
            <Video size={26} strokeWidth={1.8} />
          </button>
          {currentNav === 'video' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* Notifications with Badge */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('notifications')}
            className={`relative p-2 transition-colors ${
              currentNav === 'notifications' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Notifications"
          >
            <Bell size={26} strokeWidth={1.8} />
            <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-[#FF0000] text-white text-[10px] font-semibold rounded-full flex items-center justify-center border border-white">
              9+
            </span>
          </button>
          {currentNav === 'notifications' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* Chat / Messages with Badge */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('messages')}
            className={`relative p-2 transition-colors ${
              currentNav === 'messages' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
            }`}
            title="Messages"
          >
            <MessageSquare size={26} strokeWidth={1.8} />
            <span className="absolute top-1 right-0 w-[16px] h-[16px] bg-[#FF0000] text-white text-[10px] font-semibold rounded-full flex items-center justify-center border border-white">
              6
            </span>
          </button>
          {currentNav === 'messages' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>

        {/* Profile */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <button 
            type="button"
            onClick={() => handleNavClick('profile')}
            className={`p-2 transition-colors ${
              currentNav === 'profile' ? 'text-[#D4AF37]' : 'text-black/60 hover:text-black'
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
              <UserIcon size={26} strokeWidth={1.8} />
            )}
          </button>
          {currentNav === 'profile' && (
            <div className="absolute bottom-0 w-[43px] h-[3px] bg-[#D4AF37] rounded-full" />
          )}
        </div>
      </nav>

      {/* Right: Search Box */}
      <div className="hidden md:flex items-center">
        <form 
          onSubmit={handleSearchSubmit}
          className="flex items-center w-[267px] h-[44px] bg-[#F6F6F6] rounded-[18px] overflow-hidden border border-transparent focus-within:border-[#D4AF37]/50 transition-all"
        >
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 px-4 bg-transparent text-[13px] text-gray-800 placeholder:text-black/40 outline-none"
          />
          <button 
            type="submit"
            className="w-[61px] h-full bg-[#D4AF37]/85 hover:bg-[#D4AF37] transition-colors flex items-center justify-center text-black"
            title="Search"
          >
            <Search size={18} strokeWidth={2.2} />
          </button>
        </form>
      </div>
    </header>
  );
}
