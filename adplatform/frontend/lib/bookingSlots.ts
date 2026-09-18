export type DurationUnit = 'hourly' | 'weekly' | 'monthly';
export type CampaignType = 'one_time' | 'recurring';

const OPEN_HOUR = 7;
const CLOSE_HOUR = 20;

// Turns a form's fields into a real list of {start, end} slots for
// POST /bookings/reserve. "Hourly" books one continuous block on the chosen
// day. "Weekly"/"Monthly" book a fixed 1-hour slot at the same time each day
// — for "One time booking" that's just the first day; for "Recurring" it
// repeats daily across the full period (7 or 30 days per unit).
export function buildSlots(dateStr: string, timeStr: string, unit: DurationUnit, count: number, campaignType: CampaignType) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  const baseDate = new Date(`${dateStr}T00:00:00`);
  const startHour = Math.min(Math.max(h, OPEN_HOUR), CLOSE_HOUR - 1);

  const slots: { start: string; end: string; mins: number }[] = [];

  if (unit === 'hourly') {
    const hours = Math.min(Math.max(count, 1), CLOSE_HOUR - startHour);
    const start = new Date(baseDate);
    start.setHours(startHour, m || 0, 0, 0);
    const end = new Date(start.getTime() + hours * 60 * 60000);
    slots.push({ start: start.toISOString(), end: end.toISOString(), mins: hours * 60 });
    return slots;
  }

  const totalDays = campaignType === 'recurring' ? count * (unit === 'weekly' ? 7 : 30) : 1;
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(baseDate);
    day.setDate(day.getDate() + i);
    const start = new Date(day);
    start.setHours(startHour, m || 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60000);
    slots.push({ start: start.toISOString(), end: end.toISOString(), mins: 60 });
  }
  return slots;
}
