'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PieChart,
  ShoppingCart,
  ClipboardList,
  User,
  Wallet,
  FileText,
  X,
  ChevronRight,
  Shield,
  LayoutDashboard,
  Film,
  Paintbrush,
  Megaphone,
  CalendarCheck,
  Mic,
  Monitor,
  DollarSign,
} from 'lucide-react';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { useAuthStore } from '@/store/authStore';
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

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href + '/'));

  return (
    <>
      <style>{`
        .sidebar-item {
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .sidebar-item:hover {
          background-color: #F1F5F9 !important;
        }
      `}</style>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 20, backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}
      <aside
        className={`mobile-sidebar ${!mobileOpen ? 'closed' : ''}`}
        style={{
          width: 260,
          background: '#FFFFFF',
          height: '100%',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: F,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="Studio Arella Logo" style={{ height: 44, objectFit: 'contain' }} />
          </Link>
          {mobileOpen && (
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#0F172A', padding: 6, borderRadius: '50%' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 16px 24px', overflowY: 'auto' }}>
          {isAdmin ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#64748B', padding: '0 14px', marginBottom: 12 }}>Admin Panel</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {adminNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          borderRadius: 8,
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: active ? 700 : 600,
                          color: '#0F172A',
                          background: active ? '#F1F5F9' : 'transparent',
                        }}
                        className="sidebar-item"
                      >
                        <item.icon size={17} strokeWidth={2} style={{ color: '#0F172A' }} />
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
              <div style={{ display: 'flex', gap: 16, padding: '0 14px', marginBottom: 12, marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Favorites</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Recently</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#64748B' }} />
                  <Link href="/dashboard" style={{ fontSize: 14, color: '#0F172A', textDecoration: 'none', fontWeight: 600, flex: 1 }}>
                    Overview
                  </Link>
                </li>
                <li style={{ padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#64748B' }} />
                  <Link href="/podcast" style={{ fontSize: 14, color: '#0F172A', textDecoration: 'none', fontWeight: 600, flex: 1 }}>
                    Podcast
                  </Link>
                </li>
              </ul>

              {/* Dashboards Category */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', padding: '0 14px', marginBottom: 8, letterSpacing: '0.02em' }}>
                  Dashboards
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Overview - active pill */}
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname === '/dashboard' ? 700 : 600,
                        color: '#0F172A',
                        background: pathname === '/dashboard' ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <PieChart size={17} strokeWidth={2.2} style={{ color: '#0F172A' }} />
                      <span>Overview</span>
                    </Link>
                  </li>

                  {/* Cart */}
                  <li>
                    <Link
                      href="/cart"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname === '/cart' ? 700 : 500,
                        color: '#0F172A',
                        background: pathname === '/cart' ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <ChevronRight size={13} color="#94A3B8" />
                      <ShoppingCart size={16} strokeWidth={2} style={{ color: '#0F172A' }} />
                      <span>Cart</span>
                    </Link>
                  </li>

                  {/* My Bookings */}
                  <li>
                    <Link
                      href="/bookings"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname.startsWith('/bookings') ? 700 : 500,
                        color: '#0F172A',
                        background: pathname.startsWith('/bookings') ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <ChevronRight size={13} color="#94A3B8" />
                      <ClipboardList size={16} strokeWidth={2} style={{ color: '#0F172A' }} />
                      <span>My Bookings</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Pages Category */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', padding: '0 14px', marginBottom: 8, letterSpacing: '0.02em' }}>
                  Pages
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* User Profile item */}
                  <li>
                    <Link
                      href="/settings"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname === '/settings' ? 700 : 500,
                        color: '#0F172A',
                        background: pathname === '/settings' ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <ChevronRight size={13} color="#94A3B8" />
                      <User size={16} strokeWidth={2} style={{ color: '#0F172A' }} />
                      <span>User Profile</span>
                    </Link>

                    {/* Submenu under User Profile matching screenshot */}
                    <ul style={{ listStyle: 'none', margin: '4px 0 6px 36px', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <li>
                        <Link href="/dashboard" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', fontWeight: 500, padding: '4px 8px', display: 'block', borderRadius: 6 }} className="sidebar-item">
                          Overview
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/podcast" 
                          style={{ 
                            fontSize: 13, 
                            color: pathname.startsWith('/podcast') ? '#0F172A' : '#475569', 
                            textDecoration: 'none', 
                            fontWeight: pathname.startsWith('/podcast') ? 700 : 500, 
                            padding: '6px 10px', 
                            display: 'block', 
                            borderRadius: 8,
                            background: pathname.startsWith('/podcast') ? '#F1F5F9' : 'transparent',
                          }} 
                          className="sidebar-item"
                        >
                          Podcasts
                        </Link>
                      </li>
                      <li>
                        <Link href="/campaigns" style={{ fontSize: 13, color: pathname === '/campaigns' ? '#0F172A' : '#475569', textDecoration: 'none', fontWeight: pathname === '/campaigns' ? 700 : 500, padding: '4px 8px', display: 'block', borderRadius: 6 }} className="sidebar-item">
                          Campaigns
                        </Link>
                      </li>
                      <li>
                        <Link href="/ads" style={{ fontSize: 13, color: pathname === '/ads' ? '#0F172A' : '#475569', textDecoration: 'none', fontWeight: pathname === '/ads' ? 700 : 500, padding: '4px 8px', display: 'block', borderRadius: 6 }} className="sidebar-item">
                          Ads
                        </Link>
                      </li>
                      <li>
                        <Link href="/my-ads" style={{ fontSize: 13, color: pathname.startsWith('/my-ads') ? '#0F172A' : '#475569', textDecoration: 'none', fontWeight: pathname.startsWith('/my-ads') ? 700 : 500, padding: '4px 8px', display: 'block', borderRadius: 6 }} className="sidebar-item">
                          My Ads
                        </Link>
                      </li>
                      <li>
                        <Link href="/analytics" style={{ fontSize: 13, color: pathname === '/analytics' ? '#0F172A' : '#475569', textDecoration: 'none', fontWeight: pathname === '/analytics' ? 700 : 500, padding: '4px 8px', display: 'block', borderRadius: 6 }} className="sidebar-item">
                          Followers
                        </Link>
                      </li>
                    </ul>
                  </li>

                  {/* Wallet */}
                  <li>
                    <Link
                      href="/finances"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname === '/finances' ? 700 : 500,
                        color: '#0F172A',
                        background: pathname === '/finances' ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <ChevronRight size={13} color="#94A3B8" />
                      <Wallet size={16} strokeWidth={2} style={{ color: '#0F172A' }} />
                      <span>Wallet</span>
                    </Link>
                  </li>

                  {/* Blog */}
                  <li>
                    <Link
                      href="/blog"
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: pathname === '/blog' ? 700 : 500,
                        color: '#0F172A',
                        background: pathname === '/blog' ? '#F1F5F9' : 'transparent',
                      }}
                      className="sidebar-item"
                    >
                      <ChevronRight size={13} color="#94A3B8" />
                      <FileText size={16} strokeWidth={2} style={{ color: '#0F172A' }} />
                      <span>Blog</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </nav>

        {/* User footer / Logout */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={() => {
              logout();
              window.location.href = '/auth/login';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: F,
            }}
          >
            <FaArrowRightFromBracket size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
