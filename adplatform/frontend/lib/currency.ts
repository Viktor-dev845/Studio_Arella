export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'] as const;
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€',
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  NGN: 'Nigerian Naira (₦)', USD: 'US Dollar ($)', GBP: 'British Pound (£)', EUR: 'Euro (€)',
};

/**
 * Every real amount in this app is stored and charged in NGN — this only
 * converts what's *displayed*, using live exchange rates, never the actual
 * transaction. `rates` is the {NGN, USD, GBP, EUR} map from GET
 * /exchange-rates (NGN-based, so amountNGN * rates[currency] = converted).
 */
export function formatCurrency(amountNGN: number, currency: string, rates: Record<string, number> | null): string {
  const code = (SUPPORTED_CURRENCIES as readonly string[]).includes(currency) ? (currency as CurrencyCode) : 'NGN';
  if (code === 'NGN' || !rates || !rates[code]) {
    return `₦${Number(amountNGN || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const converted = Number(amountNGN || 0) * rates[code];
  return `${CURRENCY_SYMBOLS[code]}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
