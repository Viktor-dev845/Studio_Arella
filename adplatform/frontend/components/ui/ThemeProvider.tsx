'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider() {
  const { setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);

    // The theme toggle only exists inside the authenticated dashboard/admin
    // shell (this component is only mounted there) — the public landing
    // page and logged-out auth pages were never built with dark-mode
    // support (hardcoded light colors mixed with reactive ones), so without
    // this cleanup, a dark-mode session's .dark class stays stuck on
    // <html> after a client-side navigation away from the shell, e.g.
    // clicking the sidebar logo, making that page's text unreadable.
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [setTheme]);

  if (!mounted) return null;
  return null;
}
