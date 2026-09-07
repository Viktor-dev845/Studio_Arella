// Tracks the pages a user has actually visited, per-account, in localStorage.
// Backs the navbar's history (clock) dropdown and the sidebar's "Recently"
// tab — both were previously either dead or showed hardcoded fake entries.

export interface RecentPage {
  path: string;
  label: string;
  visitedAt: number;
}

const MAX_RECENT = 8;

const KNOWN_LABELS: Record<string, string> = {
  '/dashboard': 'Overview',
  '/podcast': 'Podcast',
  '/bookings': 'My Bookings',
  '/cart': 'Cart',
  '/finances': 'Wallet',
  '/settings': 'User Profile',
  '/analytics': 'Analytics',
  '/creative': 'Creative Studio',
  '/ads': 'Ads',
  '/my-ads': 'My Ads',
  '/campaigns': 'Campaigns',
  '/calendar': 'Calendar',
  '/chat': 'Arella AI Chat',
  '/audience': 'Audience Preview',
};

export function pathToLabel(pathname: string): string {
  if (KNOWN_LABELS[pathname]) return KNOWN_LABELS[pathname];
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  if (KNOWN_LABELS[base]) return KNOWN_LABELS[base];
  const last = pathname.split('/').filter(Boolean).pop() || 'Overview';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Pages that are just noise in a "recently visited" list (detail views with
// IDs still get tracked since revisiting a specific booking/podcast is useful).
const EXCLUDED_PREFIXES = ['/auth', '/admin'];

function storageKey(userId?: string) {
  return `recent_pages_${userId || 'anon'}`;
}

export function trackRecentPage(pathname: string, userId?: string) {
  if (typeof window === 'undefined') return;
  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;
  try {
    const key = storageKey(userId);
    const existing: RecentPage[] = JSON.parse(localStorage.getItem(key) || '[]');
    const withoutCurrent = existing.filter((p) => p.path !== pathname);
    const updated = [{ path: pathname, label: pathToLabel(pathname), visitedAt: Date.now() }, ...withoutCurrent].slice(0, MAX_RECENT);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // localStorage can throw in private browsing / blocked storage — safe to ignore
  }
}

export function getRecentPages(userId?: string): RecentPage[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
  } catch {
    return [];
  }
}
