'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function startRouteTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('route-transition-start'));
  }
}

export function stopRouteTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('route-transition-stop'));
  }
}

export default function RouteTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or query params change, finish progress and fade out
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    const handleStart = () => {
      setLoading(true);
      setProgress(20);

      t1 = setTimeout(() => setProgress(55), 80);
      t2 = setTimeout(() => setProgress(80), 300);
      t3 = setTimeout(() => setProgress(92), 700);
    };

    const handleStop = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    window.addEventListener('route-transition-start', handleStart);
    window.addEventListener('route-transition-stop', handleStop);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('route-transition-start', handleStart);
      window.removeEventListener('route-transition-stop', handleStop);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-black/5 dark:bg-white/5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.9)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 200ms ease-out, opacity 300ms ease-out' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
