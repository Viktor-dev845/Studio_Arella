'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, ClipboardList, User, Megaphone, Film, Users, Wallet, FileText, X, Mic, LayoutDashboard, Shield, CalendarCheck, Paintbrush, Monitor, DollarSign } from 'lucide-react';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/lib/theme';

const F = theme.font.body;

const DASHBOARDS = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/bookings', label: 'My Bookings', icon: ClipboardList },
];

const PAGES = [
  { href: '/settings', label: 'User Profile', icon: User },
  { href: '/podcast', label: 'Podcasts', icon: Mic },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/ads', label: 'Ads', icon: Film },
  { href: '/analytics', label: 'Followers', icon: Users },
  { href: '/finances', label: 'Wallet', icon: Wallet },
  { href: '/blog', label: 'Blog', icon: FileText },
];

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

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href + '/'));

  const linkStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 8,
    textDecoration: 'none', fontSize: 13, fontWeight: active ? 500 : 400,
    color: active ? '#000000' : '#000000ff',
    background: active ? '#F1F5F9' : 'transparent',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 20, backdropFilter: 'blur(2px)' }}
          onClick={onClose} />
      )}
      <aside className={`mobile-sidebar ${!mobileOpen ? 'closed' : ''}`} style={{ width: 260, background: '#FFFFFF', height: '100%', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', fontFamily: F, position: 'fixed', top: 0, left: 0, zIndex: 30 }}>

        {/* Logo */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="Studio Arella Logo" style={{ height: 42, objectFit: 'contain' }} />
          </Link>
          {mobileOpen && (
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#000000ff', padding: 6, borderRadius: '50%' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 16px 24px', overflowY: 'auto' }}>

          {isAdmin ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#000000ff', padding: '0 14px', marginBottom: 12, letterSpacing: '0.05em' }}>Admin Panel</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {adminNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onClose} style={linkStyle(active)}>
                        <item.icon size={18} strokeWidth={1.5} style={{ color: active ? '#000000' : '#000000ff' }} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <>
              {/* Favorites / Recently */}
              <div style={{ display: 'flex', gap: 16, padding: '0 14px', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#000000ff' }}>Favorites</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>Recently</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 32px', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
                  <Link href="/dashboard" style={{ fontSize: 13, color: '#000000', textDecoration: 'none', fontWeight: 400 }}>Overview</Link>
                </li>
                <li style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
                  <Link href="/podcast" style={{ fontSize: 13, color: '#000000', textDecoration: 'none', fontWeight: 400 }}>Podcast</Link>
                </li>
              </ul>

              {/* Dashboards */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#000000ff', padding: '0 14px', marginBottom: 12, letterSpacing: '0.02em' }}>Dashboards</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {DASHBOARDS.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={onClose} style={linkStyle(active)}>
                          <item.icon size={18} strokeWidth={1.5} style={{ color: active ? '#000000' : '#000000ff' }} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pages */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#000000ff', padding: '0 14px', marginBottom: 12, letterSpacing: '0.02em' }}>Pages</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {PAGES.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={onClose} style={linkStyle(active)}>
                          <item.icon size={18} strokeWidth={1.5} style={{ color: active ? '#000000' : '#000000ff' }} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '24px', display: 'flex' }}>
          <button onClick={() => { logout(); window.location.href = '/auth/login'; }} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontSize: 13, fontWeight: 500, fontFamily: F }}>
            <FaArrowRightFromBracket size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
