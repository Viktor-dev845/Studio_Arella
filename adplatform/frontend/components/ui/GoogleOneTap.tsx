'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Routes where the prompt should never appear
const SUPPRESSED_PREFIXES = ['/auth', '/admin'];

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function GoogleOneTap() {
  const pathname = usePathname();
  const router = useRouter();
  const { loadFromStorage, updateUser } = useAuthStore();

  useEffect(() => {
    // Don't show on auth or admin pages
    if (SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p))) return;

    // Don't show if user already has a valid token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) return;

    // CLIENT_ID not yet configured — silently skip
    if (!CLIENT_ID) return;

    const initOneTap = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            const res = await fetch(`${API}/auth/google/one-tap`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            });

            if (!res.ok) {
              console.error('One Tap sign-in failed:', await res.text());
              return;
            }

            const { token, user, isNew } = await res.json();

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            loadFromStorage();
            updateUser(user);

            router.replace(isNew ? '/onboarding' : user.role === 'admin' ? '/admin' : '/dashboard');
          } catch (err) {
            console.error('One Tap error:', err);
          }
        },
        // Use FedCM when available; fall back to the classic overlay widget
        use_fedcm_for_prompt: true,
        // Auto-select if only one account matches and user previously signed in
        auto_select: false,
        // Cancel One Tap if the user clicks outside the widget
        cancel_on_tap_outside: true,
        context: 'signin',
        itp_support: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Browser suppressed the prompt (e.g. user previously dismissed it
          // multiple times, or the browser blocks third-party cookies).
          // Nothing to do — the regular sign-in button is still available.
        }
      });
    };

    // If the GSI script is already loaded, init immediately
    if (window.google?.accounts?.id) {
      initOneTap();
      return;
    }

    // Otherwise inject the script and init once it loads
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initOneTap;
    document.head.appendChild(script);

    return () => {
      // Dismiss the prompt when the route changes so it doesn't linger
      window.google?.accounts?.id?.cancel();
    };
  }, [pathname, router, loadFromStorage, updateUser]);

  // This component renders nothing — the widget is injected by Google's script
  return null;
}
