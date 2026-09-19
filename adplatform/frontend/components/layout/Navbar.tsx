'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import NotificationBell from '@/components/ui/NotificationBell';
import { Search, Star, Sun, Moon, History, PanelLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { trackRecentPage, getRecentPages, pathToLabel, RecentPage } from '@/lib/recentPages';

const F = theme.font.body;

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
    <header className="flex h-[65px] shrink-0 items-center justify-between border-b border-neutral-200 dark:border-white/10 px-6 bg-white dark:bg-[#111111]" style={{ fontFamily: F }}>
      <div className="flex items-center gap-4 text-sm min-w-0">
        
        {/* Favorite */}
        <button
          onClick={toggleFavorite}
          className="hide-on-mobile flex items-center justify-center hover:opacity-80 transition-opacity"
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className="h-4 w-4 transition-colors" strokeWidth={1.75} fill={isFavorited ? theme.color.gold : 'none'} color={isFavorited ? theme.color.gold : '#9ca3af'} />
        </button>

        {/* Creator / Audience Toggle */}
        <div className="hide-on-mobile flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
          <span className={!isAudience ? "text-neutral-900 dark:text-white font-medium" : ""}>Creator</span>
          <button
            onClick={() => router.push(isAudience ? '/dashboard' : '/audience')}
            className="relative inline-flex h-4 w-7 items-center rounded-full bg-neutral-900 dark:bg-neutral-100 transition-colors"
            title={isAudience ? 'Switch back to Creator dashboard' : 'Preview as a listener would see it'}
          >
            <span className={`h-3 w-3 rounded-full bg-white dark:bg-black transition-all ${isAudience ? 'ml-[14px]' : 'ml-0.5'}`} />
          </button>
          <span className={isAudience ? "text-neutral-900 dark:text-white font-medium" : ""}>Audience</span>
        </div>

        <span className="hide-on-mobile text-neutral-300 dark:text-neutral-600">/</span>

        {/* Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {getBreadcrumb().split(' / ').map((part, i, arr) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
              <span className={`truncate ${i === arr.length - 1 ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Search */}
        <div className="hidden sm:flex relative items-center gap-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-3 py-1.5 text-sm text-neutral-400 dark:text-neutral-500 min-w-[200px]">
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="bg-transparent border-none outline-none w-full text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium"
          />
          {!searchQuery && (
            <kbd className="ml-2 rounded border border-neutral-200 dark:border-white/10 px-1 text-xs text-neutral-300 dark:text-neutral-600">
              /
            </kbd>
          )}
          {searching && <Loader2 size={12} className="animate-spin text-neutral-400" />}

          {/* Search Dropdown logic */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim().length >= 2 && (
              <>
                <div className="fixed inset-0 z-[9]" onClick={() => setSearchOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-xl p-1.5 min-w-[280px] max-h-[320px] overflow-y-auto shadow-lg z-10">
                  {searchResults.length === 0 ? (
                    <p className="p-3 text-xs text-neutral-500 text-center">
                      {searching ? 'Searching…' : 'No matches found'}
                    </p>
                  ) : searchResults.map((r, i) => (
                    <Link key={i} href={r.path} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex flex-col gap-0.5 px-2.5 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{r.type}</span>
                      <span className="text-[13px] font-semibold text-neutral-900 dark:text-white">{r.label}</span>
                    </Link>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
          <button onClick={toggleTheme} className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" title="Toggle Theme">
            {colorMode === 'dark' ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          </button>
          
          <div className="relative hide-on-mobile flex items-center justify-center">
            <button onClick={() => setHistoryOpen(o => !o)} className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" title="Recently visited">
              <History className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            <AnimatePresence>
              {historyOpen && (
                <>
                  <div className="fixed inset-0 z-[9]" onClick={() => setHistoryOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-xl p-1.5 min-w-[220px] shadow-lg z-10 text-left">
                    <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mx-2 my-1.5">Recently Visited</p>
                    {recentPages.length === 0 ? (
                      <p className="p-2.5 text-xs text-neutral-500 text-center">No pages visited yet</p>
                    ) : recentPages.map((p) => (
                      <Link key={p.path} href={p.path} onClick={() => setHistoryOpen(false)}
                        className="block px-2.5 py-2 text-[13px] font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                        {p.label}
                      </Link>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <NotificationBell />

          <button onClick={onMenuClick} className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors lg:hidden" title="Toggle Sidebar">
            <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* User Avatar */}
        <div className="relative">
          <button onClick={() => setDropOpen(o => !o)} className="flex items-center justify-center hover:opacity-80 transition-opacity">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'Profile'} className="flex h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[13px]">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </button>

          <AnimatePresence>
            {dropOpen && (
              <>
                <div className="fixed inset-0 z-[9]" onClick={() => setDropOpen(false)} />
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 rounded-xl p-2 min-w-[200px] shadow-lg z-10 text-left">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-white/10 mb-1.5">
                    <p className="text-[13px] font-bold text-neutral-900 dark:text-white m-0 leading-tight">{user?.name || 'Creator'}</p>
                    <p className="text-[11px] font-medium text-neutral-500 m-0 mt-0.5">{user?.email || 'creator@example.com'}</p>
                  </div>
                  {[{ label: 'My Dashboard', href: '/dashboard' }, { label: 'Settings', href: '/settings' }, { label: 'Support', href: '/support' }].map(({ label, href }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)}
                      className="block px-3 py-2 text-[13px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-neutral-100 dark:border-white/10 mt-1.5 pt-1.5">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
