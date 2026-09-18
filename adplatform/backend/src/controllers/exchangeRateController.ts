import { RequestHandler } from 'express';

// Real, free, no-key exchange rate feed (open.er-api.com, backed by
// exchangerate-api.com's free tier) — NGN as base since that's the only
// currency real money ever moves in on this platform; everything else here
// is presentation-only conversion of that real NGN amount.
const RATE_SOURCE = 'https://open.er-api.com/v6/latest/NGN';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — real rates don't move fast enough to justify fetching more often, and this is a free public API worth being a polite consumer of.

// A conservative fallback only used if the live feed is ever unreachable —
// approximate, clearly not live, but keeps the feature from breaking outright.
const FALLBACK_RATES: Record<string, number> = { NGN: 1, USD: 0.00065, GBP: 0.00051, EUR: 0.0006 };

let cachedRates: Record<string, number> = FALLBACK_RATES;
let cachedAt = 0;
let isLive = false;

async function refreshRates(): Promise<void> {
  try {
    const res = await fetch(RATE_SOURCE);
    if (!res.ok) throw new Error(`Rate feed returned ${res.status}`);
    const data = await res.json() as any;
    if (data?.result !== 'success' || !data?.rates) throw new Error('Unexpected rate feed shape');
    cachedRates = { NGN: 1, USD: data.rates.USD, GBP: data.rates.GBP, EUR: data.rates.EUR };
    cachedAt = Date.now();
    isLive = true;
  } catch (err) {
    console.error('Exchange rate refresh failed, using last known/fallback rates:', err);
    // Keep serving whatever we last had (live or fallback) rather than fail the request.
  }
}

export const getExchangeRates: RequestHandler = async (_req, res) => {
  if (Date.now() - cachedAt > CACHE_TTL_MS) {
    await refreshRates();
  }
  res.json({ base: 'NGN', rates: cachedRates, live: isLive, updated_at: cachedAt ? new Date(cachedAt).toISOString() : null });
};
