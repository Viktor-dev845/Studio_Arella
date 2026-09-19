import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { getRecentPages, RecentPage } from '@/lib/recentPages';
import {
  PieChart,
  ShoppingBag,
  Folder,
  IdCard,
  Wallet,
  BookOpen,
  LogOut,
  Mic,
  ChevronRight,
  Shield,
  LayoutDashboard,
  Film,
  Paintbrush,
  Megaphone,
  CalendarCheck,
  Monitor,
  DollarSign,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { theme } from '@/lib/theme';

const F = theme.font.body;

const adminNav = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/users', label: 'All Users', icon: LayoutDashboard },
  { href: '/admin/review', label: 'Review Queue', icon: Film },
  { href: '/admin/requests', label: 'Creative Req.', icon: Paintbrush },
  { href: '/admin/campaigns', label: 'All Campaigns', icon: Megaphone },
  { href: '/admin/bookings', label: 'All Bookings', icon: CalendarCheck },
  { href: '/admin/podcasts', label: 'All Podcasts', icon: Mic },
  { href: '/admin/screens', label: 'Screen Settings', icon: Monitor },
  { href: '/admin/finances', label: 'Revenue', icon: DollarSign },
];

/**
 * Sidebar nav item — leaf link (no children, no expand arrow).
 */
function SidebarLink({ icon: Icon, label, active = false, dot = false, href, onClick }: any) {
  const content = (
    <>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />}
      {Icon && <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.75} />}
      <span className="truncate">{label}</span>
    </>
  );
  const className = `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
    active
      ? "bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-bold"
      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 font-semibold"
  }`;
  
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/**
 * Sidebar nav item that expands to reveal a chevron affordance
 */
function SidebarExpandable({ icon: Icon, label, active = false, href, onClick }: any) {
  const content = (
    <>
      <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" strokeWidth={2} />
      {Icon && <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 shrink-0" strokeWidth={1.75} />}
      <span className="truncate">{label}</span>
    </>
  );
  const className = `flex w-full items-center gap-1.5 rounded-lg px-1 py-2 text-sm transition-colors ${
    active
      ? "bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white font-bold"
      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 font-semibold"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function SidebarSubLink({ label, href, onClick, active = false }: any) {
  const className = `block w-full truncate rounded-lg py-2 pl-9 pr-2.5 text-left text-sm transition-colors ${
    active
      ? "text-neutral-900 dark:text-white font-bold bg-neutral-100 dark:bg-white/10"
      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white font-semibold"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

function SidebarSectionLabel({ children }: any) {
  return (
    <div className="px-2.5 pb-2 pt-5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
      {children}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme: colorMode } = useThemeStore();
  
  const isAdmin = user?.role === 'admin';
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href + '/'));

  const [favTab, setFavTab] = useState<'favorites' | 'recently'>('favorites');
  const [favorites, setFavorites] = useState<{ path: string; label: string }[]>([]);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  const loadFavorites = () => {
    if (!user?.id) return;
    api.get('/favorites')
      .then((res) => setFavorites(res.data.favorites || []))
      .catch(() => setFavorites([]));
  };

  useEffect(() => {
    loadFavorites();
    window.addEventListener('favorites-changed', loadFavorites);
    return () => window.removeEventListener('favorites-changed', loadFavorites);
  }, [user?.id]);

  useEffect(() => {
    setRecentPages(getRecentPages(user?.id));
  }, [pathname, user?.id]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-[220px] shrink-0 flex-col border-r border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111111] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ fontFamily: F }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 pb-6 pt-6">
          <Link href="/" className="flex-1" style={{ textDecoration: 'none' }}>
            <img src={colorMode === 'dark' ? '/logo-white.png' : '/logo.png'} alt="Studio Arella Logo" className="h-10 object-contain" />
          </Link>
          {mobileOpen && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 lg:hidden text-neutral-500 dark:text-neutral-400">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {isAdmin ? (
            <>
              <SidebarSectionLabel>Admin Panel</SidebarSectionLabel>
              <div className="space-y-0.5">
                {adminNav.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    icon={item.icon}
                    label={item.label}
                    active={isActive(item.href)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Favorites / Recently tabs */}
              <div className="mb-3 flex gap-4 px-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFavTab('favorites')}
                  className={`${favTab === 'favorites' ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}
                >
                  Favorites
                </button>
                <button
                  type="button"
                  onClick={() => setFavTab('recently')}
                  className={`${favTab === 'recently' ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}
                >
                  Recently
                </button>
              </div>

              <div className="space-y-0.5">
                {favTab === 'favorites' ? (
                  favorites.length === 0 ? (
                    <div className="px-2.5 py-2 text-[12px] text-neutral-400">No favorites yet.</div>
                  ) : favorites.map((f) => (
                    <SidebarLink key={f.path} href={f.path} onClick={onClose} label={f.label} dot />
                  ))
                ) : (
                  recentPages.length === 0 ? (
                    <div className="px-2.5 py-2 text-[12px] text-neutral-400">No recent pages.</div>
                  ) : recentPages.map((p) => (
                    <SidebarLink key={p.path} href={p.path} onClick={onClose} label={p.label} dot />
                  ))
                )}
              </div>

              <SidebarSectionLabel>Dashboards</SidebarSectionLabel>
              <div className="space-y-0.5">
                <SidebarLink href="/dashboard" onClick={onClose} icon={PieChart} label="Overview" active={pathname === '/dashboard'} />
                <SidebarExpandable href="/cart" onClick={onClose} icon={ShoppingBag} label="Cart" active={pathname === '/cart'} />
                <SidebarExpandable href="/bookings" onClick={onClose} icon={Folder} label="My Bookings" active={pathname.startsWith('/bookings')} />
              </div>

              <SidebarSectionLabel>Pages</SidebarSectionLabel>
              <div className="space-y-0.5">
                <SidebarExpandable href="/settings" onClick={onClose} icon={IdCard} label="User Profile" active={pathname.startsWith('/settings') || pathname.startsWith('/podcast') || pathname === '/campaigns' || pathname === '/ads' || pathname === '/followers'} />
                <SidebarSubLink href="/dashboard" onClick={onClose} label="Overview" active={false} />
                <SidebarSubLink href="/podcast" onClick={onClose} label="Podcasts" active={pathname.startsWith('/podcast')} />
                <SidebarSubLink href="/campaigns" onClick={onClose} label="Campaigns" active={pathname === '/campaigns'} />
                <SidebarSubLink href="/ads" onClick={onClose} label="Ads" active={pathname === '/ads'} />
                <SidebarSubLink href="/followers" onClick={onClose} label="Followers" active={pathname === '/followers'} />
                
                <SidebarExpandable href="/finances" onClick={onClose} icon={Wallet} label="Wallet" active={pathname === '/finances'} />
                <SidebarExpandable href="/blog" onClick={onClose} icon={BookOpen} label="Blog" active={pathname === '/blog'} />
              </div>
            </>
          )}
        </div>

        <div className="border-t border-neutral-200 dark:border-white/10 px-3 py-4">
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/auth/login';
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
