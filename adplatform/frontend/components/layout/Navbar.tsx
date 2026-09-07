'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import NotificationBell from '@/components/ui/NotificationBell';
import { Search, Star, Sun, Moon, Clock, PanelLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { trackRecentPage, getRecentPages, pathToLabel, RecentPage } from '@/lib/recentPages';

const F = "'Quicksand', sans-serif";

interface SearchResult { type: string; label: string; path: string; }

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const { theme: colorMode, toggleTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dropOpen, setDropOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTitle, setShowTitle] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState<string | null>(null);

  // Favorites
  const [favoritePaths, setFavoritePaths] = useState<Set<string>>(new Set());
  const isAudience = pathname.startsWith('/audience');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recently visited
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load real favorites once we know who the user is.
  useEffect(() => {
    if (!user?.id) return;
    api.get('/favorites')
      .then((res) => setFavoritePaths(new Set((res.data.favorites || []).map((f: any) => f.path))))
      .catch(() => setFavoritePaths(new Set()));
  }, [user?.id]);

  // Track this page visit and refresh the recent-pages list every navigation.
  useEffect(() => {
    if (!mounted || !pathname) return;
    trackRecentPage(pathname, user?.id);
    setRecentPages(getRecentPages(user?.id));
  }, [pathname, mounted, user?.id]);

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
    if (pathname.startsWith('/audience')) return 'Audience Preview / ' + (pathname === '/audience' ? 'Default' : (showTitle || '…'));
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

  const isFavorited = favoritePaths.has(pathname);
  const toggleFavorite = async () => {
    if (isFavorited) {
      setFavoritePaths((prev) => { const next = new Set(prev); next.delete(pathname); return next; });
      try {
        await api.delete('/favorites', { params: { path: pathname } });
      } catch {
        setFavoritePaths((prev) => new Set(prev).add(pathname));
      }
    } else {
      setFavoritePaths((prev) => new Set(prev).add(pathname));
      try {
        await api.post('/favorites', { path: pathname, label: pathToLabel(pathname) });
      } catch {
        setFavoritePaths((prev) => { const next = new Set(prev); next.delete(pathname); return next; });
      }
    }
    // Lets the sidebar's Favorites tab (a separate component) refresh
    // immediately instead of only on next navigation.
    window.dispatchEvent(new Event('favorites-changed'));
  };

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (searchQuery.trim().length < 2) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    searchDebounce.current = setTimeout(() => {
      api.get('/search', { params: { q: searchQuery.trim() } })
        .then((res) => setSearchResults(res.data.results || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery]);

  return (
    <header style={{ height: 64, background: theme.color.surface, borderBottom: `1px solid ${theme.color.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>

        {/* Favorite this page */}
        <button
          onClick={toggleFavorite}
          className="hide-on-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={15} fill={isFavorited ? theme.color.gold : 'none'} color={isFavorited ? theme.color.gold : theme.color.text4} style={{ transition: 'all 0.15s' }} />
        </button>

        {/* Creator / Audience Toggle */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: !isAudience ? 700 : 500, color: !isAudience ? theme.color.text1 : theme.color.text4 }}>Creator</span>
          <button
            onClick={() => router.push(isAudience ? '/dashboard' : '/audience')}
            style={{ width: 34, height: 18, borderRadius: 20, background: theme.color.charcoal900, position: 'relative', border: 'none', cursor: 'pointer', padding: 0 }}
            title={isAudience ? 'Switch back to Creator dashboard' : 'Preview as a listener would see it'}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.color.surface, position: 'absolute', top: 3, left: isAudience ? 19 : 3, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: isAudience ? 700 : 500, color: isAudience ? theme.color.text1 : theme.color.text4 }}>Audience</span>
        </div>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.color.text3, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getBreadcrumb()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>

        {/* Search */}
        <div style={{ position: 'relative', width: 200 }} className="hidden sm:block">
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: theme.color.text4 }} />
          <input
            type="text"
            placeholder="Search bookings, ads, podcasts…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            style={{ width: '100%', padding: '6px 28px 6px 30px', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, borderRadius: 8, fontSize: 12, fontWeight: 500, color: theme.color.text1, outline: 'none' }}
          />
          {searching && <Loader2 size={12} className="animate-spin" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: theme.color.text4 }} />}

          <AnimatePresence>
            {searchOpen && searchQuery.trim().length >= 2 && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setSearchOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 14, padding: 6, minWidth: 280, maxHeight: 320, overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 10 }}>
                  {searchResults.length === 0 ? (
                    <p style={{ padding: '12px', fontSize: 12, color: theme.color.text3, margin: 0, textAlign: 'center' }}>
                      {searching ? 'Searching…' : 'No matches found'}
                    </p>
                  ) : searchResults.map((r, i) => (
                    <Link key={i} href={r.path} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 10px', borderRadius: 10, textDecoration: 'none' }}
                      onMouseOver={e => (e.currentTarget.style.background = theme.color.surface2)}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: theme.color.gold, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.type}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.color.text1 }}>{r.label}</span>
                    </Link>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          className="hide-on-mobile"
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex', padding: 4 }}
          title={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {colorMode === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Recently visited */}
        <div style={{ position: 'relative' }} className="hide-on-mobile">
          <button onClick={() => setHistoryOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex', padding: 4 }} title="Recently visited">
            <Clock size={17} />
          </button>
          <AnimatePresence>
            {historyOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setHistoryOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 14, padding: 6, minWidth: 220, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: theme.color.text3, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '4px 8px 6px' }}>Recently Visited</p>
                  {recentPages.length === 0 ? (
                    <p style={{ padding: '10px', fontSize: 12, color: theme.color.text3, margin: 0, textAlign: 'center' }}>No pages visited yet</p>
                  ) : recentPages.map((p) => (
                    <Link key={p.path} href={p.path} onClick={() => setHistoryOpen(false)}
                      style={{ display: 'block', padding: '8px 10px', fontSize: 13, fontWeight: 600, color: theme.color.text1, textDecoration: 'none', borderRadius: 10 }}
                      onMouseOver={e => (e.currentTarget.style.background = theme.color.surface2)}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                      {p.label}
                    </Link>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Sidebar Toggle Icon */}
        <button onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex', padding: 4 }} title="Toggle Sidebar">
          <PanelLeft size={17} />
        </button>

        {/* User Avatar */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: F }}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Profile'}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.color.charcoal900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </button>

          <AnimatePresence>
            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setDropOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 16, padding: 8, minWidth: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 10 }}>
                  <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.color.surface2}`, marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: '0 0 2px' }}>{user?.name || 'Creator'}</p>
                    <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 500 }}>{user?.email || 'creator@example.com'}</p>
                  </div>
                  {[{ label: 'My Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }, { label: 'Support', href: '/support' }].map(({ label, href }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)}
                      style={{ display: 'block', padding: '9px 12px', fontSize: 13, fontWeight: 700, color: theme.color.text2, textDecoration: 'none', borderRadius: 10, transition: 'background 0.1s' }}
                      onMouseOver={e => (e.currentTarget.style.background = theme.color.surface2)}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: `1px solid ${theme.color.surface2}`, marginTop: 6, paddingTop: 6 }}>
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', fontSize: 13, fontWeight: 800, color: theme.color.error, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 10, fontFamily: F, textAlign: 'left' }}
                      onMouseOver={e => (e.currentTarget.style.background = theme.color.errorLight)}
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
