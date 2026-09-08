'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import api from '@/lib/api';

// Loads the user's real saved currency/timezone/sound preference and fetches
// live exchange rates once per mount — mirrors ThemeProvider's pattern.
export default function PreferencesProvider() {
  const { user } = useAuthStore();
  const { hydrateFromUser, setRates } = usePreferencesStore();

  useEffect(() => {
    if (user) hydrateFromUser(user);
  }, [user, hydrateFromUser]);

  useEffect(() => {
    api.get('/exchange-rates').then((res) => {
      if (res.data?.rates) setRates(res.data.rates);
    }).catch(() => {});
  }, [setRates]);

  return null;
}
