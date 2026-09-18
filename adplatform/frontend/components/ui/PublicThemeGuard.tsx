'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Routes outside the authenticated dashboard/admin shell — the only place
// the dark-mode toggle exists and the only pages actually built with
// dark-mode support. Next.js App Router keeps a previous layout's component
// instance alive in its client-side cache after a client-side navigation
// away from it, so ThemeProvider's own unmount cleanup fires too late (only
// on true teardown) to reliably strip a leftover .dark class here — this
// runs on every route change instead, driven by the current pathname.
const PUBLIC_PREFIXES = ['/auth', '/privacy', '/terms', '/player'];

function isPublicRoute(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function PublicThemeGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (isPublicRoute(pathname)) {
      document.documentElement.classList.remove('dark');
    }
  }, [pathname]);

  return null;
}
