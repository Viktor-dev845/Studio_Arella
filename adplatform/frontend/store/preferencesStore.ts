import { create } from 'zustand';

interface PreferencesState {
  currency: string;
  timezone: string;
  soundEnabled: boolean;
  rates: Record<string, number> | null;
  ratesLoaded: boolean;
  setCurrency: (c: string) => void;
  setTimezone: (tz: string) => void;
  setSoundEnabled: (v: boolean) => void;
  setRates: (rates: Record<string, number>) => void;
  hydrateFromUser: (u: { display_currency?: string; display_timezone?: string; sound_enabled?: boolean }) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  soundEnabled: true,
  rates: null,
  ratesLoaded: false,
  setCurrency: (currency) => set({ currency }),
  setTimezone: (timezone) => set({ timezone }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setRates: (rates) => set({ rates, ratesLoaded: true }),
  hydrateFromUser: (u) => set({
    currency: u.display_currency || 'NGN',
    timezone: u.display_timezone || 'Africa/Lagos',
    soundEnabled: u.sound_enabled ?? true,
  }),
}));
