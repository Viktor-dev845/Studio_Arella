import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#111111] flex flex-col">
      {/* ─── Top Navbar Skeleton ─── */}
      <header className="h-[65px] border-b border-neutral-200 dark:border-white/10 px-6 bg-white dark:bg-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-5 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-8 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse hidden sm:block" />
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      </header>

      {/* ─── Main Content Skeleton with Glowing Spinner ─── */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
        <div className="py-12 flex flex-col items-center justify-center text-center max-w-md">
          {/* Glowing Branded Gold Spinner */}
          <div className="relative w-16 h-16 flex items-center justify-center mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/25 animate-ping opacity-40" />
            <div className="w-14 h-14 rounded-full border-3 border-[#D4AF37]/20 border-t-[#D4AF37] border-r-[#D4AF37] animate-spin" />
            <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFF2B2] shadow-[0_0_12px_rgba(212,175,55,0.7)] flex items-center justify-center">
              <span className="text-[10px] font-black text-black">SA</span>
            </div>
          </div>

          <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white tracking-tight">
            Loading Advertiser Dashboard
          </h3>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
            Preparing screen schedules, active campaigns & analytics...
          </p>

          {/* Skeletons for Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-8 opacity-60">
            <div className="h-24 bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-white/10 p-4 animate-pulse flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-24 bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-white/10 p-4 animate-pulse flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-24 bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-white/10 p-4 animate-pulse flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-24 bg-white dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-white/10 p-4 animate-pulse flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
