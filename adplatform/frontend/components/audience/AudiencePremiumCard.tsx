'use client';

import { useRouter } from 'next/navigation';

export default function AudiencePremiumCard({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <div 
      className={`w-full min-h-[168px] rounded-[18px] p-5 relative overflow-hidden bg-gradient-to-br from-[#1E1E1E] to-[#121212] text-white shadow-md border border-white/10 shrink-0 cursor-pointer group flex flex-col justify-between font-quicksand ${className}`}
      onClick={() => router.push('/audience?view=get-verified')}
      title="Try Premium for free"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20 uppercase">
          VIP PASS
        </span>
        <span className="text-[11px] text-gray-400 font-normal">1 month free</span>
      </div>
      
      <div className="my-1">
        <h3 className="text-[15px] font-bold text-white leading-tight">
          Studio Arella Premium
        </h3>
        <p className="text-[11px] text-gray-300 mt-1 leading-snug">
          Ad-free podcast streaming & exclusive creator live experiences.
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          router.push('/audience?view=get-verified');
        }}
        className="w-full py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-[10px] transition-colors shadow-sm"
      >
        Try Free
      </button>
    </div>
  );
}

