'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ThemeProvider from '@/components/ui/ThemeProvider';
import TermsModal from '@/components/ui/TermsModal';
import { theme } from '@/lib/theme';

const F = theme.font.body;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  }, [mounted, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleOpen = () => setMobileOpen(true);
    const handleClose = () => setMobileOpen(false);
    window.addEventListener('openSidebar', handleOpen);
    window.addEventListener('closeSidebar', handleClose);
    return () => {
      window.removeEventListener('openSidebar', handleOpen);
      window.removeEventListener('closeSidebar', handleClose);
    };
  }, []);

  useEffect(() => {
    if (mounted && user && user.terms_accepted === false) {
      setShowTerms(true);
    }
  }, [mounted, user]);

  if (!mounted) return null;

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#FFFFFF', // Clean white background as per Figma
      fontFamily: F, 
      overflow: 'hidden' 
    }}>
      {showTerms && <TermsModal onAccept={() => {
        setShowTerms(false);
        // refresh user from API or manually update state
        useAuthStore.getState().checkAuth();
      }} />}
      <ThemeProvider />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      {/* We need margin-left on desktop to account for the fixed sidebar width (260px) */}
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: mobileOpen ? 0 : 260, transition: 'margin-left 0.2s ease' }}>
        <Navbar onMenuClick={() => setMobileOpen(o => !o)} />
        {/* Adjusted padding for the light mode interface */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#FAFAFA' }}>
          {children}
        </main>
      </div>
      
      {/* Media query for mobile to override margin-left */}
      <style>{`
        @media (max-width: 1024px) {
          .main-wrapper {
            margin-left: 0 !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .show-on-mobile {
            display: none !important;
          }
          .show-on-mobile-flex {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
