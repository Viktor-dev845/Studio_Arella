export const SUPPORTED_TIMEZONES = [
  'Africa/Lagos', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Nairobi',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'UTC',
] as const;

export const TIMEZONE_LABELS: Record<string, string> = {
  'Africa/Lagos': 'West Africa Time (Lagos)',
  'Africa/Cairo': 'Cairo',
  'Africa/Johannesburg': 'Johannesburg',
  'Africa/Nairobi': 'Nairobi',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'America/New_York': 'New York (Eastern)',
  'America/Chicago': 'Chicago (Central)',
  'America/Los_Angeles': 'Los Angeles (Pacific)',
  'America/Toronto': 'Toronto',
  'Asia/Dubai': 'Dubai',
  'Asia/Kolkata': 'Mumbai / Kolkata',
  'Asia/Shanghai': 'Shanghai',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Singapore': 'Singapore',
  'Australia/Sydney': 'Sydney',
  'UTC': 'UTC',
};

/** Formats a real UTC timestamp in the user's chosen IANA timezone. */
export function formatDateInTz(date: string | Date, timezone: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tz = timezone || 'Africa/Lagos';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      day: '2-digit', month: 'short', year: 'numeric',
      ...options,
    }).format(d);
  } catch {
    return d.toLocaleDateString('en-GB');
  }
}

export function formatTimeInTz(date: string | Date, timezone: string | undefined): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tz = timezone || 'Africa/Lagos';
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return d.toLocaleTimeString('en-GB');
  }
}
