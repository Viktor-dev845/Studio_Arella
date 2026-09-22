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
