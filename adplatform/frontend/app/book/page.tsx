'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Upload, ChevronDown, Check, X, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const SCREEN_ID = '00000000-0000-0000-0000-000000000001';
const OPEN_HOUR = 7;
const CLOSE_HOUR = 20;

type DurationUnit = 'hourly' | 'weekly' | 'monthly';
type CampaignType = 'one_time' | 'recurring';
type Step = 'form' | 'billing' | 'card' | 'wallet' | 'success';

// Turns the form's fields into a real list of {start, end} slots for
// POST /bookings/reserve. "Hourly" books one continuous block on the chosen
// day. "Weekly"/"Monthly" book a fixed 1-hour slot at the same time each day
// — for "One time booking" that's just the first day; for "Recurring" it
// repeats daily across the full period (7 or 30 days per unit).
function buildSlots(dateStr: string, timeStr: string, unit: DurationUnit, count: number, campaignType: CampaignType) {
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

export default function BookAdPage() {
  return (
    <Suspense fallback={null}>
      <BookAdForm />
    </Suspense>
  );
}

function BookAdForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [description, setDescription] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('hourly');
  const [campaignType, setCampaignType] = useState<CampaignType>('one_time');
  const [durationCount, setDurationCount] = useState('1');
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scheduleDate, setScheduleDate] = useState(searchParams.get('date') || '');
  const [scheduleTime, setScheduleTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });

  useEffect(() => {
    api.get('/finances/balance').then((res) => setWalletBalance(Number(res.data?.credits ?? 0))).catch(() => {});
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'].includes(f.type)) {
      toast('Please choose a JPG, PNG, GIF, or MP4/MOV file', 'error');
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const durationLabel = { hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[durationUnit];
  const campaignLabel = { one_time: 'One time booking', recurring: 'Recurring booking' }[campaignType];

  const handleBookSlot = async () => {
    if (!file) { toast('Please upload your ad materials', 'error'); return; }
    if (!scheduleDate) { toast('Please choose a delivery date', 'error'); return; }
    const count = parseInt(durationCount) || 1;

    setSubmitting(true);
    try {
      // 1. Upload the creative for real (goes through the same AI moderation /
      // Cloudinary pipeline as the Ads page).
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', description.slice(0, 60) || `Ad booked ${new Date().toLocaleDateString()}`);
      formData.append('description', description);
      formData.append('media_type', file.type.startsWith('video') ? 'video' : 'image');
      const adRes = await api.post('/ads', formData, { headers: { 'Content-Type': undefined } });
      const adId = adRes.data?.ad?.id;
      if (!adId) throw new Error('Could not create ad creative');

      // 2. Reserve the real slot(s) computed from the form.
      const slots = buildSlots(scheduleDate, scheduleTime, durationUnit, count, campaignType);
      const reserveRes = await api.post('/bookings/reserve', { screen_id: SCREEN_ID, ad_id: adId, slots });
      setBookingId(reserveRes.data.booking_id);
      setTotalCost(Number(reserveRes.data.total_cost || 0));
      setStep('billing');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not book this slot. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayWallet = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      await api.post('/payments/wallet', { booking_id: bookingId });
      setStep('success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handlePayCard = async () => {
    if (!bookingId) return;
    if (!cardForm.name || !cardForm.number || !cardForm.expiry || !cardForm.cvv) {
      toast('Please fill in your card details', 'error');
      return;
    }
    setPaying(true);
    try {
      const res = await api.post('/payments/initialize', { booking_id: bookingId });
      const checkoutUrl = res.data?.checkout_url || res.data?.authorization_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast('Could not start payment. Please try again.', 'error');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not start payment. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: theme.color.surface,
    border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 14,
    fontFamily: F, color: theme.color.text1, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: theme.color.text2, marginBottom: 8, display: 'block' };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, padding: '24px 32px 48px', display: 'flex', gap: 28, alignItems: 'flex-start', maxWidth: 1100 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Book Ad</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Describe your Ad</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your Ad"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: F }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Duration dropdown */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Duration</label>
                  <button type="button" onClick={() => { setShowDurationDropdown((o) => !o); setShowCampaignDropdown(false); }}
                    style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
                    <span>{durationLabel}</span>
                    <ChevronDown size={15} color={theme.color.text4} />
                  </button>
                  {showDurationDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 10, width: '100%', overflow: 'hidden' }}>
                      {(['hourly', 'weekly', 'monthly'] as DurationUnit[]).map((u) => (
                        <div key={u} onClick={() => { setDurationUnit(u); setShowDurationDropdown(false); }}
                          style={{ padding: '10px 16px', fontSize: 14, color: theme.color.text1, cursor: 'pointer' }}
                          onMouseOver={(e) => (e.currentTarget.style.background = theme.color.surface2)}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
                          {{ hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[u]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaign type dropdown */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>How would you run your Ad campaign?</label>
                  <button type="button" onClick={() => { setShowCampaignDropdown((o) => !o); setShowDurationDropdown(false); }}
                    style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
                    <span>{campaignLabel}</span>
                    <ChevronDown size={15} color={theme.color.text4} />
                  </button>
                  {showCampaignDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 10, width: '100%', overflow: 'hidden' }}>
                      {(['one_time', 'recurring'] as CampaignType[]).map((c) => (
                        <div key={c} onClick={() => { setCampaignType(c); setShowCampaignDropdown(false); }}
                          style={{ padding: '10px 16px', fontSize: 14, color: theme.color.text1, cursor: 'pointer' }}
                          onMouseOver={(e) => (e.currentTarget.style.background = theme.color.surface2)}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
                          {{ one_time: 'One time booking', recurring: 'Recurring booking' }[c]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {(durationUnit !== 'hourly' || campaignType === 'recurring') && (
                <div>
                  <label style={labelStyle}>Enter number of {durationUnit === 'monthly' ? 'months' : durationUnit === 'weekly' ? 'weeks' : 'hours'}</label>
                  <input type="number" min={1} value={durationCount} onChange={(e) => setDurationCount(e.target.value)} style={inputStyle} />
                </div>
              )}

              <div>
                <label style={labelStyle}>Upload Ad materials (You can upload multiple files at once)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] || null); }}
                  style={{
                    border: `2px dashed ${dragging ? theme.color.gold : theme.color.border}`,
                    borderRadius: 12, padding: file ? 16 : 40, textAlign: 'center', cursor: 'pointer',
                    background: dragging ? theme.color.goldLight : theme.color.surface2,
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                  {file && filePreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {file.type.startsWith('video') ? (
                        <video src={filePreview} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} muted />
                      ) : (
                        <img src={filePreview} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      )}
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>{file.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: theme.color.text3 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3 }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.color.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Upload size={18} color="#fff" />
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.color.text2 }}>Drag &amp; Drop or choose file to upload</p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: theme.color.text4 }}>Supported formats: jpeg, png, gif, mp4</p>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 12, color: theme.color.text3, margin: '10px 0 0' }}>
                  Don&apos;t have Ad materials yet?{' '}
                  <a href="/creative" style={{ color: theme.color.gold, fontWeight: 700, textDecoration: 'none' }}>Request Ad creative services</a>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Schedule service delivery timeline</label>
                  <div style={{ position: 'relative' }}>
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ ...inputStyle, paddingRight: 38 }} />
                    <Calendar size={16} color={theme.color.text4} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Set timer (optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ ...inputStyle, paddingRight: 38 }} />
                    <Clock size={16} color={theme.color.text4} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => router.push('/dashboard')} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: theme.color.text2, cursor: 'pointer', fontFamily: F }}>
                  Cancel
                </button>
                <button type="button" onClick={handleBookSlot} disabled={submitting} style={{ padding: '12px 28px', background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, color: theme.color.charcoal900, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: F }}>
                  {submitting ? 'Booking…' : 'Book Slot'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column — promo banner, matching the previous /book layout */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: theme.color.charcoal900, borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -24, right: -24, width: 100, height: 100, background: 'rgba(224,165,38,0.12)', borderRadius: '50%', pointerEvents: 'none' }} />
              <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.5, position: 'relative' }}>
                we are running Ad space promo, get a discount for more than 3months booking
              </p>
              <button type="button" onClick={() => router.push('/podcast/book')} style={{ background: theme.color.gold, color: theme.color.charcoal900, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer', position: 'relative' }}>
                Book Podcast Session
              </button>
            </div>
          </div>
        </div>

        {/* ─── Billing / payment modals ─── */}
        {step !== 'form' && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 400, background: theme.color.surface, borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontFamily: F }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${theme.color.surface2}` }}>
                {step !== 'billing' && step !== 'success' ? (
                  <button onClick={() => setStep('billing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text2, display: 'flex' }}><ArrowLeft size={18} /></button>
                ) : <span />}
                <span style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1 }}>
                  {step === 'billing' ? 'Billing' : step === 'card' ? 'Pay with card' : step === 'wallet' ? 'Pay from wallet' : ''}
                </span>
                {step !== 'success' ? (
                  <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex' }}><X size={18} /></button>
                ) : <span />}
              </div>

              <div style={{ padding: '24px 24px 26px' }}>
                {step === 'billing' && (
                  <>
                    <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 20px' }}>
                      {durationLabel} Ad space at ₦{totalCost.toLocaleString()}
                    </p>
                    <div onClick={() => setStep('card')} style={{ padding: '14px 16px', border: `1px solid ${theme.color.border}`, borderRadius: 12, marginBottom: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: theme.color.text1 }}>
                      Pay with card
                    </div>
                    <div onClick={() => setStep('wallet')} style={{ padding: '14px 16px', border: `1px solid ${theme.color.gold}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.color.text1 }}>Pay from wallet</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.color.text3 }}>Balance: ₦{walletBalance.toLocaleString()}</p>
                      </div>
                      {walletBalance >= totalCost && <Check size={16} color={theme.color.success} />}
                    </div>
                  </>
                )}

                {step === 'card' && (
                  <>
                    <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 20px' }}>
                      {durationLabel} Ad space at ₦{totalCost.toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <input placeholder="Card holder's name" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} style={inputStyle} />
                      <input placeholder="Card number" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} style={inputStyle} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input placeholder="Expiry date (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} style={inputStyle} />
                        <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <button onClick={handlePayCard} disabled={paying} style={{ width: '100%', padding: 14, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, color: theme.color.charcoal900, cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                      {paying ? 'Redirecting…' : 'Pay'}
                    </button>
                    <p style={{ fontSize: 11, color: theme.color.text4, textAlign: 'center', margin: '10px 0 0' }}>You&apos;ll be redirected to a secure checkout to complete payment.</p>
                  </>
                )}

                {step === 'wallet' && (
                  <>
                    <div style={{ background: theme.color.bg, border: `1px solid ${theme.color.border}`, borderRadius: 12, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                      <span style={{ fontSize: 13, color: theme.color.text3, fontWeight: 600 }}>Total amount</span>
                      <strong style={{ fontSize: 13, color: theme.color.text1 }}>NGN {totalCost.toLocaleString()}</strong>
                    </div>
                    <button onClick={handlePayWallet} disabled={paying || walletBalance < totalCost} style={{ width: '100%', padding: 14, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, color: theme.color.charcoal900, cursor: (paying || walletBalance < totalCost) ? 'not-allowed' : 'pointer', opacity: (paying || walletBalance < totalCost) ? 0.7 : 1 }}>
                      {paying ? 'Paying…' : walletBalance < totalCost ? 'Insufficient balance' : 'Pay'}
                    </button>
                  </>
                )}

                {step === 'success' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.color.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Check size={28} color="#fff" />
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: '0 0 24px' }}>Payment successful</p>
                    <button onClick={() => router.push('/bookings')} style={{ width: '100%', padding: 14, background: theme.color.gold, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, color: theme.color.charcoal900, cursor: 'pointer' }}>
                      Finish
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
