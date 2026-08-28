'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import NotificationBell from '@/components/ui/NotificationBell';
import { Menu, Search, Settings, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const F = "'Quicksand', sans-serif";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const getBreadcrumb = () => {
    if (!mounted) return 'Dashboards / Overview';
    if (pathname.includes('/bookings')) return 'Dashboards / My Bookings';
    if (pathname.includes('/dashboard')) return 'Dashboards / Overview';
    if (pathname.includes('/campaigns')) return 'Pages / Campaigns';
    return 'Dashboards / ' + (pathname.split('/')[1] || 'Overview').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        
        {/* Creator / Audience Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: isCreator ? 800 : 600, color: isCreator ? '#1E293B' : '#94A3B8' }}>Creator</span>
          <button 
            onClick={() => setIsCreator(!isCreator)}
            style={{ width: 36, height: 20, borderRadius: 20, background: '#E2E8F0', position: 'relative', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isCreator ? 3 : 19, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: !isCreator ? 800 : 600, color: !isCreator ? '#1E293B' : '#94A3B8' }}>Audience</span>
        </div>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
          {getBreadcrumb()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: 200 }} className="hidden sm:block">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search /" 
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#1E293B', outline: 'none' }}
          />
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
          <Settings size={18} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
          <RotateCcw size={18} />
        </button>

        <NotificationBell />

        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: F }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>
              {user?.name?.[0]?.toUpperCase() || 'K'}
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
