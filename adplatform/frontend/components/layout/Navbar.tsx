'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import NotificationBell from '@/components/ui/NotificationBell';
import { Menu, Search, Settings, RotateCcw, Star, Sun, Clock, PanelLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const F = "'Quicksand', sans-serif";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dropOpen, setDropOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showTitle, setShowTitle] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve the real podcast title for /podcast/:id and /podcast/:id/episode/new
  // breadcrumbs — this used to be hardcoded to a fixed placeholder name.
  useEffect(() => {
    const id = pathname.match(/^\/podcast\/([^/]+)/)?.[1];
    if (id && id !== 'new' && id !== 'book') {
      api.get(`/shows/${id}`)
        .then((res) => setShowTitle(res.data.podcast?.title || null))
        .catch(() => setShowTitle(null));
    } else {
      setShowTitle(null);
    }
  }, [pathname]);

  // Same for /my-ads/:id — resolve the real ad's creative title.
  useEffect(() => {
    const id = pathname.match(/^\/my-ads\/([^/]+)/)?.[1];
    if (id) {
      api.get('/bookings?limit=100')
        .then((res) => {
          const match = (res.data.bookings || []).find((b: any) => b.id === id);
          setAdTitle(match?.creative_title || null);
        })
        .catch(() => setAdTitle(null));
    } else {
      setAdTitle(null);
    }
  }, [pathname]);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const getBreadcrumb = () => {
    if (!mounted) return 'My bookings / Screen Ads';
    if (pathname.startsWith('/admin')) {
      const ADMIN_LABELS: Record<string, string> = {
        '/admin': 'Admin / Overview',
        '/admin/bookings': 'Admin / All Bookings',
        '/admin/podcasts': 'Admin / Podcast Bookings',
        '/admin/campaigns': 'Admin / Campaigns',
        '/admin/finances': 'Admin / Finances',
        '/admin/users': 'Admin / Users',
        '/admin/screens': 'Admin / Screens',
        '/admin/review': 'Admin / Ad Review Queue',
        '/admin/requests': 'Admin / Creative Requests',
      };
      return ADMIN_LABELS[pathname] || 'Admin / Overview';
    }
    if (pathname.includes('/chat')) return 'Dashboards / Default';
    if (pathname.includes('/episode/new')) return `Podcasts / ${showTitle || '…'} / Add new episode`;
    if (pathname === '/podcast/new') return 'Podcasts / Add podcast';
    if (pathname.startsWith('/podcast/') && pathname !== '/podcast') return `Podcasts / ${showTitle || '…'}`;
    if (pathname === '/podcast') return 'Podcasts / Default';
    if (pathname.includes('/bookings')) return `My bookings / ${searchParams.get('tab') === 'podcast' ? 'Podcast Studio' : 'Screen Ads'}`;
    if (pathname === '/my-ads') return 'Ads / Default';
    if (pathname.startsWith('/my-ads/')) return `Ads / ${adTitle || '…'}`;
    if (pathname.includes('/dashboard')) return 'Dashboards / Default';
    if (pathname.includes('/campaigns')) return 'Pages / Campaigns';
    if (pathname.includes('/finances')) return 'Pages / Wallet';
    if (pathname.includes('/cart')) return 'Dashboards / Cart';
    if (pathname.includes('/settings')) return 'Pages / User Profile';
    if (pathname.includes('/analytics')) return 'Pages / Analytics';
    if (pathname.includes('/creative')) return 'Pages / Creative Studio';
    if (pathname.includes('/ads')) return 'Pages / Ads';
    return 'Dashboards / ' + (pathname.split('/')[1] || 'Overview').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        
        {/* Star Icon */}
        <Star size={15} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />

        {/* Creator / Audience Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: isCreator ? 700 : 500, color: isCreator ? '#0F172A' : '#94A3B8' }}>Creator</span>
          <button 
            onClick={() => setIsCreator(!isCreator)}
            style={{ width: 34, height: 18, borderRadius: 20, background: '#1E293B', position: 'relative', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isCreator ? 3 : 19, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: !isCreator ? 700 : 500, color: !isCreator ? '#0F172A' : '#94A3B8' }}>Audience</span>
        </div>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, fontWeight: 500, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{getBreadcrumb()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: 180 }} className="hidden sm:block">
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search" 
            style={{ width: '100%', padding: '6px 28px 6px 30px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#1E293B', outline: 'none' }}
          />
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>/</span>
        </div>

        {/* Sun / Theme */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4 }} title="Theme">
          <Sun size={17} />
        </button>

        {/* Clock / History */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4 }} title="History">
          <Clock size={17} />
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Sidebar Toggle Icon */}
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4 }} title="Toggle Sidebar">
          <PanelLeft size={17} />
        </button>

        {/* User Avatar */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: F }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </button>

          <AnimatePresence>
            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setDropOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 8, minWidth: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 10 }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', margin: '0 0 2px' }}>{user?.name || 'Creator'}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>{user?.email || 'creator@example.com'}</p>
                  </div>
                  {[{ label: 'My Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }, { label: 'Support', href: '/support' }].map(({ label, href }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)}
                      style={{ display: 'block', padding: '9px 12px', fontSize: 13, fontWeight: 700, color: '#475569', textDecoration: 'none', borderRadius: 10, transition: 'background 0.1s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 6, paddingTop: 6 }}>
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', fontSize: 13, fontWeight: 800, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 10, fontFamily: F, textAlign: 'left' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#FEF2F2')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                      <FaArrowRightFromBracket size={13} /> Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
