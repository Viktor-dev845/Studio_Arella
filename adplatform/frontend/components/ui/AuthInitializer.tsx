'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthInitializer() {
  const { loadFromStorage, checkAuth } = useAuthStore();

  useEffect(() => {
    // 1. Immediately hydrate token and user from localStorage into Zustand state
    loadFromStorage();

    // 2. If an auth token is present, quietly verify and refresh profile from /auth/me
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      checkAuth();
    }
  }, [loadFromStorage, checkAuth]);

  return null;
}
