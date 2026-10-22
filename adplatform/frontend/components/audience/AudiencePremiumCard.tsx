'use client';

import { useRouter } from 'next/navigation';

export default function AudiencePremiumCard({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <div 
      className={`w-[278px] h-[168px] rounded-[18px] relative overflow-hidden shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] shrink-0 cursor-pointer group font-['DM_Sans',sans-serif] ${className}`}
      onClick={() => router.push('/audience?view=get-verified')}
      title="Try Premium for free"
    >
      <img 
        src="/audience/try-premium.png" 
        alt="Try Premium for free" 
        className="w-full h-full object-cover rounded-[18px] transition-transform duration-300 group-hover:scale-[1.02]"
      />
      {/* Clickable button area over the "Try Free" button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          router.push('/audience?view=get-verified');
        }}
        className="absolute left-[30px] bottom-[25px] w-[110px] h-[40px] opacity-0 cursor-pointer"
        title="Try Free"
      />
    </div>
  );
}

