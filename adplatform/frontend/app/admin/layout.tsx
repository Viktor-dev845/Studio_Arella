'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ShieldCheck, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } catch (e) {
        router.push('/auth/login');
        return;
      }
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F1F4FA] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
          <ShieldCheck size={24} />
        </div>
        <div className="w-7 h-7 border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#788B9A]">Verifying admin privileges...</p>
      </div>
    );
  }

  if (user && user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-[#F1F4FA] text-[#06152B] font-sans antialiased">
      {/* Admin Sidebar */}
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm tracking-tight text-[#06152B]">Studio Arella Admin</span>
          <div className="w-6" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
