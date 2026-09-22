'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronLeft, Clock, Loader2, Mic, Wallet, CreditCard, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

const PACKAGES = [
  { id: 'Audio Only', label: 'Audio Only', desc: 'Professional mics & soundproofing', ratePerHour: 10000 },
  { id: 'Audio + Video', label: 'Audio + Video', desc: 'Multi-cam setup with professional lighting', ratePerHour: 20000 },
] as const;

const DURATIONS_HOURS = [1, 2, 3, 4];

function naira(n: number) {
  return `₦${Number(n || 0).toLocaleString('en-NG')}`;
}

function todayISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatRange(startIso: string, endIso: string) {
  const s = new Date(startIso), e = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  return `${s.toLocaleTimeString('en-GB', opts)} – ${e.toLocaleTimeString('en-GB', opts)}`;
}

interface BookedSlot { start_time: string; end_time: string; status: string; }

export default function BookPodcastSessionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [packageId, setPackageId] = useState<typeof PACKAGES[number]['id']>('Audio Only');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayISODate());
  const [startTime, setStartTime] = useState('');
  const [durationText, setDurationText] = useState('');
  const durationHours = parseInt(durationText.replace(/[^0-9]/g, '')) || 1;
  const [bookingType, setBookingType] = useState('How would you run your studio session?');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [dayBookings, setDayBookings] = useState<BookedSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [reserving, setReserving] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedPackage = PACKAGES.find(p => p.id === packageId)!;
  const estimatedCost = selectedPackage.ratePerHour * durationHours;

  const { startIso, endIso } = useMemo(() => {
    const start = new Date(`${date}T${startTime || '10:00'}:00`);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return { startIso: start.toISOString(), endIso: end.toISOString() };
  }, [date, startTime, durationHours]);

  // Fetch real balance
  useEffect(() => {
    api.get('/finances/balance')
      .then(res => setWalletBalance(Number(res.data?.credits) || 0))
      .catch(() => setWalletBalance(null));
  }, []);

  // Fetch real bookings for the selected day so the user can see what's taken
  useEffect(() => {
    setLoadingAvailability(true);
    const dayStart = new Date(`${date}T00:00:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59`).toISOString();
    api.get(`/podcasts/availability?start_date=${dayStart}&end_date=${dayEnd}`)
      .then(res => setDayBookings(res.data?.slots || []))
      .catch(() => setDayBookings([]))
      .finally(() => setLoadingAvailability(false));
  }, [date]);

  const hasConflict = useMemo(() => {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    return dayBookings.some(b => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      return start < bEnd && end > bStart;
    });
  }, [dayBookings, startIso, endIso]);

  const isPastStart = new Date(startIso).getTime() < Date.now();

  const handleReserve = async () => {
    if (isPastStart) {
      toast('Please choose a time in the future', 'error');
      return;
    }
    if (hasConflict) {
      toast('That time overlaps an existing booking. Please pick another slot.', 'error');
      return;
    }
    setReserving(true);
    try {
      const res = await api.post('/podcasts/reserve', {
        package_type: packageId,
        start_time: startIso,
        end_time: endIso,
        duration_minutes: durationHours * 60,
        notes: notes.trim() || undefined,
      });
      setBookingId(res.data.booking_id);
      setTotalCost(res.data.total_cost ?? estimatedCost);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not reserve this slot. Please try again.', 'error');
    } finally {
      setReserving(false);
    }
  };

  const handlePay = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      if (paymentMethod === 'wallet') {
        await api.post('/payments/wallet', { booking_id: bookingId, booking_type: 'podcast' });
        setShowSuccess(true);
      } else {
        const res = await api.post('/payments/initialize', { booking_id: bookingId, booking_type: 'podcast' });
        const checkoutUrl = res.data?.checkout_url || res.data?.authorization_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast('Could not start payment. Please try again.', 'error');
        }
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const hasSufficientBalance = walletBalance !== null && totalCost !== null && walletBalance >= totalCost;

  const cardStyle = (active: boolean): React.CSSProperties => ({
    border: `1.5px solid ${active ? theme.color.gold : theme.color.border}`,
    background: active ? theme.color.goldLight : theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex flex-col font-body w-full max-w-[1200px] mt-2 px-[24px]">
          {/* Header row */}
          <div className="flex items-center gap-[4px] text-[12px] text-[rgba(0,0,0,0.4)] dark:text-[rgba(255,255,255,0.4)] mb-[40px]">
            <Link href="/bookings" className="flex items-center gap-[4px] hover:text-[#000] dark:hover:text-white transition-colors">
              <ChevronLeft size={16} />
              <span>Back</span>
            </Link>
            <span className="text-[12px] text-[#000] dark:text-white font-medium ml-[16px]">Book podcast slot</span>
          </div>

          {!bookingId ? (
            <div className="flex flex-col lg:flex-row gap-[100px]">
              {/* Form side */}
              <div className="flex-1 max-w-[850px] flex flex-col gap-[24px]">
                {/* Textarea */}
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe your session"
                  className="w-full h-[131px] p-[16px] border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] dark:text-white placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] bg-transparent resize-none"
                />

                {/* Row 2: Duration & Type */}
                <div className="flex flex-col sm:flex-row gap-[20px]">
                  <input
                    type="text"
                    value={durationText}
                    onChange={e => setDurationText(e.target.value)}
                    placeholder="Enter studio duration (e.g 2 hours)"
                    className="w-full h-[56px] p-[16px] border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] dark:text-white placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] bg-transparent"
                  />

                  <div className="relative w-full">
                    <div
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full h-[56px] p-[16px] border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[rgba(162,161,168,0.8)] bg-transparent flex items-center justify-between cursor-pointer select-none"
                    >
                      <span className={bookingType !== 'How would you run your studio session?' ? 'text-[#16151C] dark:text-white' : ''}>
                        {bookingType}
                      </span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {showTypeDropdown && (
                      <div className="absolute top-[64px] right-0 w-[200px] bg-white shadow-[-4.75px_30px_30px_rgba(184,184,184,0.25)] rounded-[10px] p-[23px_14px_5px_13px] z-10 flex flex-col gap-[11px]">
                        <div 
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => { setBookingType('One time booking'); setShowTypeDropdown(false); }}
                        >
                          <span className="font-body text-[15px] text-[#000] group-hover:text-[#D4AF37] transition-colors">One time booking</span>
                          {bookingType === 'One time booking' && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-[20px]" />}
                        </div>
                        <div 
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => { setBookingType('Recurring booking'); setShowTypeDropdown(false); }}
                        >
                          <span className="font-body text-[15px] text-[#000] group-hover:text-[#D4AF37] transition-colors">Recurring booking</span>
                          {bookingType === 'Recurring booking' && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-[20px]" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Date & Time */}
                <div className="flex flex-col sm:flex-row gap-[20px]">
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={date}
                      min={todayISODate()}
                      onChange={e => setDate(e.target.value)}
                      className="w-full h-[56px] p-[16px] border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] dark:text-white placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <svg className="absolute right-[16px] top-[16px] pointer-events-none text-[#16151C] dark:text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
                      <circle cx="8" cy="18" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <div className="relative w-full">
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full h-[56px] p-[16px] border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] dark:text-white placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <svg className="absolute right-[16px] top-[16px] pointer-events-none text-[#16151C] dark:text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Conflict Warning */}
                {hasConflict && (
                  <div className="flex items-center gap-2 text-red-500 text-[13px] font-medium mt-[-10px]">
                    <AlertTriangle size={14} /> This overlaps an existing booking. Please pick a different time.
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-[20px] mt-[16px]">
                  <button
                    type="button"
                    onClick={() => router.push('/bookings')}
                    className="w-[91px] h-[40px] flex items-center justify-center border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[16px] font-light text-[#16151C] dark:text-white font-body hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReserve}
                    disabled={reserving || hasConflict || isPastStart || !startTime}
                    className="w-[116px] h-[40px] flex items-center justify-center bg-[#D4AF37] rounded-[6px] text-[14px] text-black opacity-80 capitalize font-body hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reserving ? 'Wait...' : 'Book Slot'}
                  </button>
                </div>
              </div>

              {/* Promo Card side */}
              <div className="w-[245px] h-[162px] bg-[#232121] rounded-[15px] p-[31px_16px] relative shrink-0">
                <p className="text-[12.6px] leading-[16px] text-white m-0 font-body">
                  we are running Ad space promo, get a discount for more than 3months booking
                </p>
                <button 
                  type="button"
                  className="mt-[27px] w-[148px] h-[23.5px] bg-[#FBFF79] shadow-[0px_0px_7.08px_rgba(251,255,121,0.32)] rounded-[6px] flex items-center justify-center text-[9.4px] font-semibold text-[#051235] uppercase font-body hover:opacity-90 transition-opacity mx-auto"
                >
                  Book podcast session
                </button>
              </div>
            </div>
          ) : (
            /* Payment step — real, matches the pattern used at /cart */
            <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.xl, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: theme.color.text3, fontWeight: 700 }}>
                  {selectedPackage.label} · {durationHours} hour{durationHours > 1 ? 's' : ''}
                </p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: theme.color.text1 }}>{naira(totalCost || 0)}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: theme.color.text3 }}>Slot held for 5 minutes — complete payment to confirm.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div onClick={() => setPaymentMethod('wallet')} style={cardStyle(paymentMethod === 'wallet')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>
                      <Wallet size={16} color={theme.color.gold} /> Pay from wallet
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.color.text3 }}>
                      {walletBalance !== null ? naira(walletBalance) : '—'}
                    </span>
                  </div>
                </div>
                <div onClick={() => setPaymentMethod('card')} style={cardStyle(paymentMethod === 'card')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>
                    <CreditCard size={16} color={theme.color.gold} /> Card / Bank Transfer
                  </span>
                </div>
              </div>

              {paymentMethod === 'wallet' && !hasSufficientBalance && (
                <div style={{ background: theme.color.errorLight, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: theme.color.error, fontWeight: 700 }}>
                  Insufficient wallet balance. <Link href="/finances" style={{ color: theme.color.error, textDecoration: 'underline' }}>Fund your wallet</Link> or pay by card instead.
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying || (paymentMethod === 'wallet' && !hasSufficientBalance)}
                style={{
                  padding: '14px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 800, fontFamily: F,
                  background: (paymentMethod === 'wallet' && !hasSufficientBalance) ? theme.color.surface2 : theme.color.gold,
                  color: (paymentMethod === 'wallet' && !hasSufficientBalance) ? theme.color.text3 : '#fff',
                  cursor: (paying || (paymentMethod === 'wallet' && !hasSufficientBalance)) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {paying ? <Loader2 size={16} className="animate-spin" /> : null}
                Pay {naira(totalCost || 0)}
              </button>
            </div>
          )}
        </div>

        {showSuccess && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: theme.color.surface, borderRadius: 24, padding: '36px 28px', textAlign: 'center', maxWidth: 380, width: '100%', margin: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.color.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Check size={28} color="#fff" strokeWidth={3} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: '0 0 24px' }}>Studio session booked</h3>
              <button
                onClick={() => router.push('/bookings')}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: theme.color.gold, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
                View my bookings
              </button>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
