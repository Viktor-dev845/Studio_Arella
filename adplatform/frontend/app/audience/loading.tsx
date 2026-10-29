import React from 'react';

export default function AudienceLoading() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] font-quicksand flex flex-col">
      {/* ─── Top Navbar Skeleton ─── */}
      <header className="sticky top-0 z-50 w-full h-[76px] bg-white border-b border-[#F0F0F0] flex items-center justify-between px-6 lg:px-14 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          </div>
          <div className="h-5 w-28 bg-neutral-200 rounded-md animate-pulse hidden sm:block" />
        </div>

        {/* Center Icons Skeleton */}
        <div className="flex items-center gap-8 md:gap-12">
          <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
        </div>

        {/* Right Toggle Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 rounded-full bg-neutral-100 border border-neutral-200/60 animate-pulse" />
        </div>
      </header>

      {/* ─── Center Hero Spinner & Skeleton ─── */}
      <main className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-md w-full">
          {/* Glowing Branded Gold Spinner */}
          <div className="relative w-16 h-16 flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/25 animate-ping opacity-40" />
            <div className="w-14 h-14 rounded-full border-3 border-[#D4AF37]/20 border-t-[#D4AF37] border-r-[#D4AF37] animate-spin" />
            <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF2B2] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex items-center justify-center">
              <span className="text-[10px] font-black text-black">SA</span>
            </div>
          </div>

          <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight">
            Switching to Creator Space
          </h3>
          <p className="text-[13px] text-neutral-500 mt-1">
            Loading fresh creator podcasts, trending stories & community feed...
          </p>

          {/* Skeleton Feed Cards Preview */}
          <div className="w-full mt-8 space-y-4 max-w-lg opacity-60">
            <div className="h-32 bg-white rounded-2xl border border-neutral-200/60 p-4 flex gap-4 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-neutral-100 shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-4 bg-neutral-100 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
                <div className="h-3 bg-neutral-100 rounded w-5/6" />
              </div>
            </div>
            <div className="h-28 bg-white rounded-2xl border border-neutral-200/60 p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-neutral-100 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-neutral-100 rounded w-2/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
