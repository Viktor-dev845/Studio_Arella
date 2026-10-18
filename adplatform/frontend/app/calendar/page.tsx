import { redirect } from 'next/navigation';

export default function CalendarPage() {
  redirect('/bookings?tab=calendar');
}
