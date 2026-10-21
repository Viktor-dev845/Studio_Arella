'use client';

import { Suspense } from 'react';
import AudienceNavbar from '@/components/audience/AudienceNavbar';
import AudienceLeftSidebar from '@/components/audience/AudienceLeftSidebar';
import AudienceProfilePageView from '@/components/audience/AudienceProfilePageView';
import { PageTransition } from '@/components/ui/Animations';
import { useRouter, useSearchParams } from 'next/navigation';

function FanUserProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'following';

  const handleMenuChange = (menuId: string) => {
    if (menuId === 'profile') {
      router.push('/user-profile');
    } else if (menuId === 'settings' || menuId === 'edit-profile') {
      router.push('/user-profile/overview');
    } else {
      router.push(`/audience?view=${menuId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-['DM_Sans',sans-serif]">
      {/* ─── Top Navbar (1440px x 76px) ─── */}
      <AudienceNavbar 
        activeNav="profile"
        onNavChange={(nav) => {
          if (nav === 'profile') router.push('/user-profile');
          else if (nav === 'home') router.push('/audience?view=podcast');
          else if (nav === 'video') router.push('/audience?view=live');
          else if (nav === 'notifications') router.push('/audience?view=notifications');
          else if (nav === 'messages') router.push('/audience?view=chats');
        }}
      />

      {/* ─── Main Fan User Profile Layout (1440px container) ─── */}
      <PageTransition>
        <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
            {/* Left Sidebar (278px: User Mini Profile + Menu + Followed Hashtags) */}
            <AudienceLeftSidebar 
              activeMenu="profile"
              onMenuSelect={handleMenuChange}
            />

            {/* Profile Content Column (850px: Hero Banner + Tabs + People You Follow) */}
            <AudienceProfilePageView 
              initialTab={tab as 'profile' | 'followers' | 'following'}
              onEditProfileClick={() => router.push('/user-profile/overview')}
            />
          </div>
        </main>
      </PageTransition>
    </div>
  );
}

export default function FanUserProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <FanUserProfileContent />
    </Suspense>
  );
}
