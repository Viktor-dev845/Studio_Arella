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
  const [startTime, setStartTime] = useState('10:00');
  const [durationHours, setDurationHours] = useState(1);

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
    const start = new Date(`${date}T${startTime}:00`);
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
        <div style={{ fontFamily: F, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.text3, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <ChevronLeft size={16} /> Back
            </Link>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mic size={20} color={theme.color.gold} /> Book a podcast studio session
            </h1>
          </div>

          {!bookingId ? (
            <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.xl, padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Package */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: theme.color.text2, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>
                  Package
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {PACKAGES.map(p => (
                    <div key={p.id} onClick={() => setPackageId(p.id)} style={cardStyle(packageId === p.id)}>
                      <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 800, color: theme.color.text1 }}>{p.label}</p>
                      <p style={{ margin: '0 0 6px', fontSize: 11, color: theme.color.text3 }}>{p.desc}</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.color.gold }}>{naira(p.ratePerHour)}/hour</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session notes */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6, display: 'block' }}>
                  Describe your session <span style={{ fontWeight: 500, color: theme.color.text3, textTransform: 'none' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What are you recording? Anything our studio team should know ahead of time?"
                  rows={3}
                  style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontFamily: F, boxSizing: 'border-box', resize: 'vertical' as const }}
                />
              </div>

              {/* Date / time / duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6, display: 'block' }}>Date</label>
                  <input type="date" value={date} min={todayISODate()} onChange={e => setDate(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontFamily: F, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6, display: 'block' }}>Start time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontFamily: F, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 8, display: 'block' }}>Duration</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DURATIONS_HOURS.map(h => (
                    <button key={h} type="button" onClick={() => setDurationHours(h)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                        border: `1.5px solid ${durationHours === h ? theme.color.gold : theme.color.border}`,
                        background: durationHours === h ? theme.color.gold : theme.color.surface,
                        color: durationHours === h ? '#fff' : theme.color.text2,
                      }}>
                      {h} hour{h > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability for the day */}
              <div style={{ background: theme.color.surface2, borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: theme.color.text3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Already booked this day
                </p>
                {loadingAvailability ? (
                  <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>Checking availability…</p>
                ) : dayBookings.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>Nothing booked yet — the whole day is open.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dayBookings.map((b, i) => (
                      <p key={i} style={{ margin: 0, fontSize: 12, color: theme.color.text2, fontWeight: 600 }}>
                        {formatRange(b.start_time, b.end_time)}
                      </p>
                    ))}
                  </div>
                )}
                {hasConflict && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: theme.color.error, fontSize: 12, fontWeight: 700 }}>
                    <AlertTriangle size={13} /> This overlaps a booking above — pick a different time.
                  </div>
                )}
              </div>

              {/* Price + reserve */}
              <div style={{ borderTop: `1px dashed ${theme.color.border}`, paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase' }}>Estimated total</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: theme.color.gold }}>{naira(estimatedCost)}</p>
                </div>
                <button
                  onClick={handleReserve}
                  disabled={reserving || hasConflict || isPastStart}
                  style={{
                    padding: '13px 28px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 800, fontFamily: F,
                    background: (hasConflict || isPastStart) ? theme.color.surface2 : theme.color.gold,
                    color: (hasConflict || isPastStart) ? theme.color.text3 : '#fff',
                    cursor: (reserving || hasConflict || isPastStart) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                  {reserving ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                  Reserve slot
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
