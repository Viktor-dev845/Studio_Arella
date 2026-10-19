'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AudienceProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/audience?view=profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9BA54] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
