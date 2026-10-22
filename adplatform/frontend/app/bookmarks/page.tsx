'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookmarksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/audience?view=bookmarks');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center font-['DM_Sans',sans-serif]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-gray-500 font-medium">Opening your saved bookmarks...</p>
      </div>
    </div>
  );
}
