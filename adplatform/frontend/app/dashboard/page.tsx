'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdvertiserDashboard from '@/components/dashboard/AdvertiserDashboard';

export default function DashboardPage() {
  const { user, loadFromStorage, checkAuth } = useAuthStore();
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!localStorage.getItem('token')) { router.push('/auth/login'); return; }
    // A token can exist without a cached user (partial storage clear, a
    // token set without the matching user record) — fetch it for real
    // instead of spinning forever waiting for a value that will never arrive.
    if (!user) { checkAuth(); return; }
    if (user.role === 'admin') { router.push('/admin'); }
  }, [ready, user, router, checkAuth]);

  if (!ready || !user) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #E3C762', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  // All regular users are advertisers.
  // Admins are redirected to /admin on login — they don't use this page.
  return (
    <DashboardLayout>
      <AdvertiserDashboard />
    </DashboardLayout>
  );
}
