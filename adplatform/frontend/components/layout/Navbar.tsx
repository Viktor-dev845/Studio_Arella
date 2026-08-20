'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { FaUser, FaSun, FaMoon } from 'react-icons/fa6';
import { Menu, Search, Star, Sidebar as SidebarIcon, RotateCcw, Bell, PanelRight } from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuthStore();
  const { theme: appTheme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname() || '';
  
  // Fake toggle state for Creator/Audience
  const [isAudience, setIsAudience] = useState(false);

  // Determine dynamic breadcrumbs
  let breadcrumbs: { label: string; active: boolean }[] = [];

  if (pathname.includes('/podcast')) {
    breadcrumbs = [
      { label: 'Podcasts', active: !pathname.includes('/1') && !pathname.includes('/new') }
    ];
    if (pathname.includes('/new') && !pathname.includes('episode')) {
      breadcrumbs.push({ label: 'Add podcast', active: true });
    } else if (pathname.includes('/1') || pathname.match(/\/podcast\/\d+/)) {
      breadcrumbs.push({ label: 'Undressed', active: !pathname.includes('episode') });
      if (pathname.includes('/episode/new')) {
        breadcrumbs.push({ label: 'Add new episode', active: true });
      }
    }
  } else if (pathname === '/dashboard' || pathname === '/') {
    breadcrumbs = [{ label: 'Dashboards', active: false }, { label: 'Overview', active: true }];
  } else if (pathname === '/cart') {
    breadcrumbs = [{ label: 'Dashboards', active: false }, { label: 'Cart', active: true }];
  } else if (pathname === '/bookings') {
    breadcrumbs = [{ label: 'Dashboards', active: false }, { label: 'My Bookings', active: true }];
  } else {
    // Generic fallback for other routes
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      breadcrumbs = segments.map((s, i) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        active: i === segments.length - 1
      }));
    }
  }

  return (
    <header style={{ height: 72, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontFamily: F }}>
      
      {/* Left side (Icons, Toggle, Breadcrumbs) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button className="show-on-mobile-flex" onClick={onMenuClick} style={{ background: 'transparent', border: 'none', color: '#0F172A', cursor: 'pointer', padding: 0 }}>
          <Menu size={20} />
        </button>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SidebarIcon size={18} color="#0F172A" />
          <Star size={18} color="#0F172A" />
        </div>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: isAudience ? 500 : 700, color: isAudience ? '#94A3B8' : '#0F172A' }}>Creator</span>
          
          <button onClick={() => setIsAudience(!isAudience)} style={{ width: 40, height: 22, borderRadius: 20, background: '#E2E8F0', position: 'relative', border: 'none', cursor: 'pointer', padding: 2 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'absolute', top: 2, left: isAudience ? 20 : 2, transition: 'all 0.2s' }} />
          </button>
          
          <span style={{ fontSize: 13, fontWeight: isAudience ? 700 : 500, color: isAudience ? '#0F172A' : '#94A3B8' }}>Audience</span>
        </div>

        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              <span style={{ color: b.active ? '#0F172A' : '#94A3B8', fontWeight: b.active ? 600 : 500 }}>
                {b.label}
              </span>
              {i < breadcrumbs.length - 1 && <span style={{ color: '#CBD5E1' }}>/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Middle side (Search) */}
      <div className="hide-on-mobile" style={{ position: 'relative', width: 240 }}>
        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          placeholder="Search" 
          style={{ width: '100%', background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '8px 36px 8px 36px', fontSize: 13, color: '#0F172A', outline: 'none', fontFamily: F }}
        />
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
          /
        </div>
      </div>

      {/* Right side (Icons & Avatar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', display: 'flex' }}>
          {appTheme === 'dark' ? <FaSun size={18} /> : <FaSun size={18} />} {/* The mockup shows a sun outline always for light mode, we will just use FaSun */}
        </button>
        
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', display: 'flex' }}>
          <RotateCcw size={18} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', display: 'flex' }}>
          <Bell size={18} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0F172A', display: 'flex' }}>
          <PanelRight size={18} />
        </button>

        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.color.gold}, #e8a825)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1A1A', overflow: 'hidden' }}>
          {/* We would use user profile pic, fallback to first letter */}
          {user?.name?.[0]?.toUpperCase() || <FaUser size={12} />}
        </div>
      </div>
    </header>
  );
}
