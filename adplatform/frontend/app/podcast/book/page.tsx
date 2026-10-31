'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronLeft, Clock, Loader2, Mic, Video, Wallet, CreditCard, AlertTriangle, Sparkles } from 'lucide-react';
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
  const [showWalletConfirm, setShowWalletConfirm] = useState(false);

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
          setShowWalletConfirm(false);
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

  const handleContinue = () => {
    if (paymentMethod === 'wallet') {
      setShowWalletConfirm(true);
    } else {
      handlePay();
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

  const labelClasses = "block text-[13px] sm:text-[14px] font-semibold text-slate-800 dark:text-slate-200 mb-2 font-body";
  const inputClasses = "w-full px-4 py-3.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-[12px] text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-body shadow-xs";

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 h-full relative font-body bg-white dark:bg-[#111111] rounded-2xl sm:rounded-[24px] border border-slate-100 dark:border-white/10 shadow-xs mt-2 mb-12">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => router.push('/bookings?tab=podcast')}
              className="flex items-center gap-1.5 text-[16px] sm:text-[18px] font-medium text-slate-700 dark:text-slate-200 hover:text-[#D4AF37] transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
              <span>Back to Bookings</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/20 mx-1" />
            <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-slate-50">
              Book Podcast Studio Session
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Form side */}
            <div className="flex-1 w-full flex flex-col gap-6">

              {/* Package Selection */}
              <div>
                <label className={labelClasses}>Select Studio Package</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PACKAGES.map((pkg) => {
                    const isSelected = packageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setPackageId(pkg.id)}
                        className={`p-4 rounded-[14px] border-2 cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-xs'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                            {pkg.id === 'Audio Only' ? <Mic size={20} /> : <Video size={20} />}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">{pkg.label}</h4>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{pkg.desc}</p>
                            <span className="inline-block mt-2 text-[13px] font-bold text-[#C69A2C]">
                              {naira(pkg.ratePerHour)} / hour
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0 ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300'}`}>
                          {isSelected && <Check size={12} className="text-black stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className={labelClasses}>Describe your Session</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tell us about your show, guest names, or special equipment needed..."
                  className={`${inputClasses} h-[115px] resize-none`}
                />
              </div>

              {/* Row 2: Duration & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Studio Duration (Hours)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={durationHours}
                      onChange={e => setDurationText(`${Math.max(1, parseInt(e.target.value) || 1)} hours`)}
                      placeholder="e.g. 2"
                      className={`${inputClasses} pr-16`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-[13px] font-semibold pointer-events-none">
                      {durationHours === 1 ? 'Hour' : 'Hours'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Booking Type</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className={`${inputClasses} flex items-center justify-between text-left`}
                    >
                      <span className={bookingType !== 'How would you run your studio session?' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}>
                        {bookingType === 'How would you run your studio session?' ? 'One time booking' : bookingType}
                      </span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-600 dark:text-slate-300">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-[56px] left-0 right-0 bg-white dark:bg-[#1E1E1E] shadow-xl rounded-[12px] p-2 z-20 border border-slate-200 dark:border-white/10 flex flex-col gap-1">
                        {['One time booking', 'Recurring booking'].map((bt) => (
                          <button
                            key={bt}
                            type="button"
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[14px] font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            onClick={() => { setBookingType(bt); setShowTypeDropdown(false); }}
                          >
                            <span>{bt}</span>
                            {(bookingType === bt || (bookingType === 'How would you run your studio session?' && bt === 'One time booking')) && (
                              <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Session Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      min={todayISODate()}
                      onChange={e => setDate(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={labelClasses}>Start Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Conflict Warning */}
              {hasConflict && (
                <div className="flex items-center gap-2.5 text-amber-800 bg-amber-50 border border-amber-200 p-3.5 rounded-[12px] text-[13px] font-medium">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                  <span>That time slot overlaps an existing booking. Please pick another time or date.</span>
                </div>
              )}

              {/* Buttons on mobile */}
              <div className="flex items-center justify-end gap-3 pt-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => router.push('/bookings?tab=podcast')}
                  className="px-5 py-3 border border-slate-300 dark:border-white/15 rounded-[10px] text-[14px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={reserving || hasConflict || isPastStart || !startTime}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-bold rounded-[10px] text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  {reserving ? 'Reserving...' : 'Book Slot'}
                </button>
              </div>
            </div>

            {/* Right Summary Side */}
            <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[18px] p-6 flex flex-col gap-4 shadow-xs">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">Session Summary</h3>
                
                <div className="flex flex-col gap-3 text-[13px] border-b border-slate-200 dark:border-white/10 pb-4">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Package:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedPackage.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{naira(selectedPackage.ratePerHour)}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{durationHours} hour{durationHours > 1 ? 's' : ''}</span>
                  </div>
                  {startTime ? (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Schedule:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatRange(startIso, endIso)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-amber-600 text-[12px] font-medium bg-amber-50 px-2.5 py-1 rounded-md">
                      <span>* Choose start time to confirm slot</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">Estimated Total:</span>
                  <span className="text-[22px] font-extrabold text-[#C69A2C]">{naira(estimatedCost)}</span>
                </div>

                {walletBalance !== null && (
                  <div className="flex items-center justify-between text-[12px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2.5 rounded-[10px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium"><Wallet size={14} className="text-emerald-600" /> Wallet Balance:</span>
                    <span className="font-bold text-emerald-600">{naira(walletBalance)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={reserving || hasConflict || isPastStart || !startTime}
                  className="w-full h-[48px] flex items-center justify-center bg-[#D4AF37] hover:bg-[#b58b24] text-black font-bold rounded-[10px] text-[15px] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {reserving ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Reserving...</span>
                  ) : !startTime ? (
                    'Select a Start Time'
                  ) : (
                    'Proceed to Billing'
                  )}
                </button>
              </div>

              {/* Promo Banner */}
              <div className="bg-[#18181B] text-white rounded-[18px] p-5 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-amber-400 text-[12px] font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Studio Arella Promo
                </div>
                <p className="text-[12.5px] text-zinc-300 leading-relaxed m-0 font-light">
                  Recording an ongoing podcast series? Enjoy studio soundproofing, 4K multi-cam setup, and audio mastering at discount rates.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Billing Modal Overlay */}
        {bookingId && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#16151C]/40 backdrop-blur-[10px] font-body">
             <div className="w-[625px] bg-white rounded-[32px] pt-[32px] pb-[70px] relative flex flex-col items-center shadow-[0px_4px_40px_rgba(0,0,0,0.08)]">
               
               {/* Header */}
               <div className="w-full flex items-center justify-center relative px-[32px]">
                 <button type="button" onClick={() => setBookingId(null)} className="absolute left-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M19 12H5M12 19l-7-7 7-7"/>
                   </svg>
                 </button>
                 <h2 className="text-[20px] font-medium text-[#101828] tracking-[-0.01em]">Billing</h2>
                 <button type="button" onClick={() => setBookingId(null)} className="absolute right-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#344053" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 6L6 18M6 6l12 12"/>
                   </svg>
                 </button>
               </div>

               {/* Subtitle */}
               <p className="text-[16px] font-bold text-[#101828] text-center max-w-[202px] leading-[21px] mt-[83px]">
                 {durationHours} hour{durationHours > 1 ? 's' : ''} studio session at {naira(totalCost || 0)}
               </p>

               {/* Options container */}
               <div className="flex flex-col gap-[16px] w-[468px] mt-[84px]">
                 
                 {/* Pay with card option */}
                 <div 
                   onClick={() => setPaymentMethod('card')}
                   className={`w-full h-[127px] rounded-[16px] p-[24px_25px] cursor-pointer flex items-start gap-[14px] bg-white transition-colors ${paymentMethod === 'card' ? 'border-[#D4AF37] border-[2px]' : 'border-[#D7D7D7] border'}`}
                 >
                   <div className={`w-[16px] h-[16px] rounded-full shrink-0 mt-[2px] flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#D4AF37] border-[2px]' : 'border-[#D7D7D7] border'}`}>
                     {paymentMethod === 'card' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                   </div>
                   <div className="flex flex-col gap-[12px] w-full">
                      <span className="text-[16px] font-medium text-[#101828] leading-[21px]">Pay with card</span>
                   </div>
                 </div>

                 {/* Pay from wallet option */}
                 <div 
                   onClick={() => setPaymentMethod('wallet')}
                   className={`w-full h-[127px] rounded-[16px] p-[24px_25px] cursor-pointer flex items-start gap-[14px] bg-white transition-colors ${paymentMethod === 'wallet' ? 'border-[#D4AF37] border-[2px]' : 'border-[#D7D7D7] border'}`}
                 >
                   <div className={`w-[16px] h-[16px] rounded-full shrink-0 mt-[2px] flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#D4AF37] border-[2px]' : 'border-[#D7D7D7] border'}`}>
                     {paymentMethod === 'wallet' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                   </div>
                   <div className="flex flex-col w-full relative h-full">
                      <div className="flex items-center justify-between w-full h-[21px]">
                        <span className="text-[16px] font-medium text-[#101828]">Pay from wallet</span>
                        <Link href="/finances" className="flex items-center justify-center px-[10px] py-[3px] bg-[#FFFCF2] rounded-[8px] text-[14px] text-[#D4AF37] hover:opacity-80 transition-opacity">
                          Fund wallet
                        </Link>
                      </div>
                      
                      <span className="text-[13px] font-medium text-[#101828] tracking-[0.02em] mt-[8px]">Wallet ID: 23cvo_23759ryi</span>
                      
                      <div className="flex items-center justify-between w-full mt-auto">
                        <button type="button" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText('23cvo_23759ryi'); toast('Copied Wallet ID!', 'success'); }} className="flex items-center gap-[4px] hover:opacity-70 text-[#D4AF37]">
                           <span className="text-[12px] font-normal tracking-[0.03em]">Copy</span>
                           <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                             <path d="M12.6666 0H5.99998C4.52722 0 3.33331 1.19391 3.33331 2.66667V3.33333H2.66665C1.19389 3.33333 0 4.52724 0 6V13.3333C0 14.8061 1.19389 16 2.66665 16H9.33331C10.8061 16 12 14.8061 12 13.3333V12.6667H12.6666C14.1394 12.6667 15.3333 11.4728 15.3333 10V2.66667C15.3333 1.19391 14.1394 0 12.6666 0ZM10.6666 13.3333C10.6666 14.0697 10.0697 14.6667 9.33331 14.6667H2.66665C1.93027 14.6667 1.33331 14.0697 1.33331 13.3333V6C1.33331 5.26362 1.93027 4.66667 2.66665 4.66667H3.33331V10C3.33331 11.4728 4.52722 12.6667 5.99998 12.6667H10.6666V13.3333ZM14 10C14 10.7364 13.403 11.3333 12.6666 11.3333H5.99998C5.2636 11.3333 4.66665 10.7364 4.66665 10V2.66667C4.66665 1.93029 5.2636 1.33333 5.99998 1.33333H12.6666C13.403 1.33333 14 1.93029 14 2.66667V10Z" />
                           </svg>
                        </button>
                        <span className="text-[14px] font-medium text-[#101828]">NGN {walletBalance !== null ? walletBalance.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</span>
                      </div>
                   </div>
                 </div>

               </div>

               {paymentMethod === 'wallet' && !hasSufficientBalance && (
                 <div className="w-[468px] mt-[-6px] mb-[10px] bg-red-50 text-red-500 p-2 rounded text-[13px] font-medium text-center">
                   Insufficient wallet balance.
                 </div>
               )}

               {/* Continue Button */}
               <button 
                 type="button"
                 onClick={handleContinue}
                 disabled={paying || (paymentMethod === 'wallet' && !hasSufficientBalance)}
                 className="w-[468px] h-[56px] bg-[#D4AF37] rounded-[6px] text-[16px] font-medium text-[#000000] flex items-center justify-center mt-[32px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {paying ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
                 Continue
               </button>
             </div>
          </div>
        )}
        {/* Pay from Wallet Confirm Modal Overlay */}
        {showWalletConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#16151C]/40 backdrop-blur-[10px] font-body">
             <div className="w-[625px] h-[565px] bg-white rounded-[32px] pt-[32px] relative flex flex-col items-center shadow-[0px_4px_40px_rgba(0,0,0,0.08)]">
               
               {/* Header */}
               <div className="w-full flex items-center justify-center relative px-[32px]">
                 <button type="button" onClick={() => setShowWalletConfirm(false)} className="absolute left-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M19 12H5M12 19l-7-7 7-7"/>
                   </svg>
                 </button>
                 <h2 className="text-[20px] font-medium text-[#101828] tracking-[-0.01em]">Pay from wallet</h2>
                 <button type="button" onClick={() => setShowWalletConfirm(false)} className="absolute right-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#344053" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 6L6 18M6 6l12 12"/>
                   </svg>
                 </button>
               </div>

               <div className="flex flex-col gap-[32px] w-[468px] mt-[130px]">
                 
                 {/* Card */}
                 <div className="w-full h-[127px] rounded-[16px] px-[44px] flex items-center justify-between border-[2px] border-[#D4AF37]">
                    <span className="text-[16px] font-medium text-[#101828]">Total amount</span>
                    <span className="text-[14px] font-medium text-[#101828]">NGN {totalCost !== null ? totalCost.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}</span>
                 </div>

                 {/* Pay Button */}
                 <button 
                   type="button"
                   onClick={handlePay}
                   disabled={paying}
                   className="w-full h-[56px] bg-[#D4AF37] rounded-[6px] text-[16px] font-medium text-[#000000] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {paying ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
                   Pay
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Success Modal Overlay */
        showSuccess && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#16151C]/40 backdrop-blur-[10px] font-body">
             <div className="w-[625px] h-[565px] bg-white rounded-[32px] pt-[32px] relative flex flex-col items-center shadow-[0px_4px_40px_rgba(0,0,0,0.08)]">
               
               {/* Header */}
               <div className="w-full flex items-center justify-center relative px-[32px]">
                 <button type="button" onClick={() => setShowSuccess(false)} className="absolute left-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M19 12H5M12 19l-7-7 7-7"/>
                   </svg>
                 </button>
                 <h2 className="text-[20px] font-medium text-[#101828] tracking-[-0.01em]">Pay from wallet</h2>
                 <button type="button" onClick={() => setShowSuccess(false)} className="absolute right-[32px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#344053" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 6L6 18M6 6l12 12"/>
                   </svg>
                 </button>
               </div>

               <div className="flex flex-col items-center w-full mt-[132px]">
                 
                 {/* Glowing Checkmark */}
                 <div className="relative flex items-center justify-center w-[70px] h-[70px] mb-[60px]">
                   <div className="absolute inset-[-20px] bg-[#D4AF37] opacity-15 blur-[10px] rounded-full"></div>
                   <div className="absolute inset-[-10px] bg-[#D4AF37] opacity-30 blur-[5px] rounded-full"></div>
                   <div className="relative w-[70px] h-[70px] bg-gradient-to-br from-[#443A18] to-[#D4AF37] rounded-full flex items-center justify-center z-10">
                     <Check size={32} color="#fff" strokeWidth={3} />
                   </div>
                 </div>

                 {/* Success Text */}
                 <h3 className="text-[20px] font-semibold text-[#16151C] mb-[81px]">
                   Payment successful and podcast booked
                 </h3>

                 {/* Finish Button */}
                 <button 
                   type="button"
                   onClick={() => router.push('/bookings')}
                   className="w-[468px] h-[56px] bg-[#D4AF37] rounded-[6px] text-[16px] font-medium text-[#000000] flex items-center justify-center hover:opacity-90 transition-opacity"
                 >
                   Finish
                 </button>
               </div>
             </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
