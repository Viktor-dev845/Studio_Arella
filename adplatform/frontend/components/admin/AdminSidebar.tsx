'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutGrid, 
  Users, 
  Ticket, 
  FileText, 
  Calendar, 
  Activity, 
  Mic, 
  Sliders, 
  DollarSign, 
  LogOut,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutGrid, exact: true },
    { label: 'All users', href: '/admin/users', icon: Users },
    { label: 'Review Queue', href: '/admin/review', icon: Ticket },
    { label: 'Creative Request', href: '/admin/requests', icon: FileText },
    { label: 'All Campaigns', href: '/admin/campaigns', icon: Calendar },
    { label: 'All Bookings', href: '/admin/bookings', icon: Activity, badge: '49' },
    { label: 'All Podcast', href: '/admin/podcasts', icon: Mic },
    { label: 'Screen Settings', href: '/admin/screens', icon: Sliders },
    { label: 'Revenue', href: '/admin/finances', icon: DollarSign },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white w-[218px] select-none text-[#788B9A]">
      {/* Top Section: Logo & Nav */}
      <div>
        {/* Studio Arella Logo */}
        <div className="pt-6 pb-4 px-6 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Studio Arella" 
              width={100} 
              height={48} 
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          {onClose && (
            <button 
              onClick={onClose} 
              className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-all ${
                  isActive
                    ? 'text-[#D4AF37] font-semibold bg-[#D4AF37]/10'
                    : 'text-[#788B9A] hover:text-[#06152B] hover:bg-slate-50'
                }`}
              >
                {/* Active Indicator Bar on the far left */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#D4AF37] rounded-r-md" />
                )}

                <Icon 
                  size={19} 
                  className={`shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#788B9A]'}`} 
                />
                
                <span className="truncate flex-1 text-[14.5px] tracking-tight">{item.label}</span>

                {item.badge && (
                  <span className="shrink-0 bg-[#FED757]/20 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Upgrade Card & User Profile */}
      <div className="p-4 pt-2 space-y-4">
        {/* Upgrade Card with Warm Lamp Illustration */}
        <div className="relative overflow-hidden rounded-[20px] bg-[#FED757]/10 p-3.5 text-center flex flex-col items-center border border-[#FED757]/25 shadow-sm">
          {/* Lamp Illustration */}
          <div className="relative w-28 h-24 mb-1 flex items-center justify-center">
            <Image 
              src="/admin/upgrade-card.png" 
              alt="Upgrade" 
              width={120} 
              height={100}
              className="object-contain max-h-24"
              onError={(e) => {
                // Graceful fallback if image is not loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <button 
            onClick={() => router.push('/admin/finances')}
            className="w-full py-2 px-3 bg-[#FED757] hover:bg-[#fecb2e] text-[#000000] text-xs font-semibold rounded-[10px] transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <Image 
                src="/admin/admin-avatar.png" 
                alt={user?.name || 'Admin'} 
                fill 
                className="object-cover"
                onError={(e) => {
                  // Fallback avatar
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                {user?.name ? user.name[0] : 'A'}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-[#06152B] truncate leading-tight">
                {user?.name || 'Easin Arafat'}
              </p>
              <p className="text-[11.5px] text-[#788B9A] font-medium leading-tight">
                Admin
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-[#788B9A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed left, 218px) */}
      <aside className="hidden md:block w-[218px] shrink-0 border-r border-[#E8ECF4] bg-white h-screen sticky top-0 overflow-y-auto z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar Slider */}
      <div className={`fixed top-0 bottom-0 left-0 w-[218px] bg-white z-50 md:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
}
