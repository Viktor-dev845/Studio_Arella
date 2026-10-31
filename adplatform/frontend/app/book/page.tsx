'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Upload, ChevronDown, Check, X, ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { useCartStore } from '@/store/cartStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/currency';
import { buildSlots, DurationUnit, CampaignType } from '@/lib/bookingSlots';

const F = theme.font.body;

type Step = 'form' | 'billing' | 'card' | 'wallet' | 'otp' | 'success';

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
  const { user } = useAuthStore();
  const { cart, addToCart } = useCartStore();
  const { currency, rates } = usePreferencesStore();

  const [description, setDescription] = useState('');
  const [screens, setScreens] = useState<{ id: string; name: string; location: string; price_per_sec: number }[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [showScreenDropdown, setShowScreenDropdown] = useState(false);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('hourly');
  const [campaignType, setCampaignType] = useState<CampaignType>('one_time');
  const [durationCount, setDurationCount] = useState('1');
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const [scheduleDate, setScheduleDate] = useState(searchParams.get('date') || '');
  const [scheduleTime, setScheduleTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '', amount: '' });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [adDesignRequested, setAdDesignRequested] = useState(false);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showCancelCreativeModal, setShowCancelCreativeModal] = useState(false);
  const [showCreativeCancelSuccessModal, setShowCreativeCancelSuccessModal] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'saved_card' | 'card' | 'wallet'>('wallet');

  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(searchParams.get('campaign_id') || null);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  const [campaignCovered, setCampaignCovered] = useState(0);
  const [walletAmountToDeduct, setWalletAmountToDeduct] = useState(0);

  useEffect(() => {
    api.get('/finances/balance').then((res) => setWalletBalance(Number(res.data?.credits ?? 0))).catch(() => {});
    api.get('/payments/cards').then((res) => {
      const cards = res.data?.cards || [];
      setSavedCards(cards);
      if (cards.length > 0) setSelectedPaymentMethod('saved_card');
    }).catch(() => {});
    api.get('/screens?limit=100').then((res) => {
      const list = (res.data?.screens || []).filter((s: any) => s.status === 'active');
      setScreens(list);
      if (list.length > 0) setSelectedScreenId((prev) => prev || list[0].id);
    }).catch(() => {});
    api.get('/campaigns?limit=100').then((res) => {
      const list = res.data?.campaigns || [];
      setCampaigns(list);
      const urlCampId = searchParams.get('campaign_id');
      if (urlCampId && list.some((c: any) => c.id === urlCampId)) {
        setSelectedCampaignId(urlCampId);
      }
    }).catch(() => {});
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

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const durationLabel = { '30_mins': '30 Minutes', hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[durationUnit];
  const campaignLabel = { one_time: 'One time booking', recurring: 'Recurring booking' }[campaignType];

  // Shared by both "Book Slot" and "Add to Cart" — uploads the creative for
  // real (same AI moderation / Cloudinary pipeline as the Ads page) and
  // returns its real id and ppm_rate, or throws.
  const uploadCreative = async () => {
    const formData = new FormData();
    formData.append('file', file as File);
    formData.append('title', description.slice(0, 60) || `Ad booked ${new Date().toLocaleDateString()}`);
    formData.append('description', description);
    if (selectedCampaignId) formData.append('campaign_id', selectedCampaignId);
    formData.append('media_type', (file as File).type.startsWith('video') ? 'video' : 'image');
    const adRes = await api.post('/ads', formData, { headers: { 'Content-Type': undefined } });
    const ad = adRes.data?.ad;
    if (!ad?.id) throw new Error('Could not create ad creative');
    return ad;
  };

  const validateForm = () => {
    if (!selectedScreenId) { toast('Please choose a screen to book', 'error'); return false; }
    if (!file) { toast('Please upload your ad materials', 'error'); return false; }
    if (!scheduleDate) { toast('Please choose a delivery date', 'error'); return false; }
    return true;
  };

  const handleBookSlot = async () => {
    if (!validateForm()) return;
    const count = parseInt(durationCount) || 1;

    setSubmitting(true);
    try {
      const ad = await uploadCreative();

      // Reserve the real slot(s) computed from the form.
      const slots = buildSlots(scheduleDate, scheduleTime, durationUnit, count, campaignType);
      const reserveRes = await api.post('/bookings/reserve', { 
        screen_id: selectedScreenId, 
        ad_id: ad.id, 
        slots, 
        campaign_id: selectedCampaignId || undefined 
      });
      const cost = Number(reserveRes.data.total_cost || 0);
      const covered = Number(reserveRes.data.campaign_covered_amount || 0);
      const netToPay = Number(reserveRes.data.wallet_amount_to_deduct ?? (cost - covered));

      setBookingId(reserveRes.data.booking_id);
      setTotalCost(cost);
      setCampaignCovered(covered);
      setWalletAmountToDeduct(netToPay);
      setStep('billing');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not book this slot. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stages this ad + these slots as a real cart item — no reservation yet
  // (that happens at actual checkout, so items don't tie up a 5-minute slot
  // lock while the user keeps adding more). Lets an advertiser build up
  // several different ad/screen bookings before paying for all of them
  // together in one visit to /cart.
  const handleAddToCart = async () => {
    if (!validateForm()) return;
    const count = parseInt(durationCount) || 1;

    setAddingToCart(true);
    try {
      const ad = await uploadCreative();
      const slots = buildSlots(scheduleDate, scheduleTime, durationUnit, count, campaignType);
      const ppmRate = Number(ad.ppm_rate) || 1000;
      const estimatedCost = slots.reduce((sum, s) => sum + Math.ceil(s.mins) * ppmRate, 0);
      const screen = screens.find((s) => s.id === selectedScreenId);

      addToCart({
        id: crypto.randomUUID(),
        adId: ad.id,
        adTitle: ad.title || description.slice(0, 60) || 'Ad creative',
        adPreviewUrl: filePreview || undefined,
        screenId: selectedScreenId,
        screenName: screen ? `${screen.name} — ${screen.location}` : 'Selected screen',
        slots,
        estimatedCost,
      });

      toast('Added to cart! You can add another ad or check out.', 'success');
      // Reset the creative + schedule so the form is ready for another item;
      // keep the chosen screen/duration settings since those often repeat.
      // The file input is uncontrolled — clearing React state alone leaves
      // its DOM value pointing at the old file, so re-selecting the exact
      // same file for a second item wouldn't register as a change.
      setFile(null);
      setFilePreview(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not add this to your cart. Please try again.', 'error');
    } finally {
      setAddingToCart(false);
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
    setPaying(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setStep('otp');
    } catch (error) {
      toast('Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpDigits.join('').length < 4) {
      toast('Please enter the complete OTP', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setStep('success');
    } catch (error) {
      toast('Invalid OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };



  const inputClasses = "w-full px-5 py-4 bg-white dark:bg-[#161618] border border-[rgba(162,161,168,0.2)] dark:border-white/10 rounded-[10px] text-[17px] font-light text-gray-800 dark:text-white placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] transition-colors font-body";
  const dropdownMenuClasses = "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161618] rounded-[10px] shadow-[0px_30px_30px_rgba(0,0,0,0.3)] z-50 overflow-hidden py-4 px-3 border border-gray-100 dark:border-white/10";
  const dropdownItemClasses = "w-full text-left px-4 py-3 text-[15px] font-body text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-lg flex justify-between items-center";

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 h-full relative font-body bg-white dark:bg-[#111111] dark:border dark:border-white/10 rounded-2xl sm:rounded-[24px]">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-10 mt-1 sm:mt-2">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[20px] sm:text-[24px] font-normal text-[#16151C] dark:text-white hover:opacity-70 transition-opacity">
              <ChevronDown className="rotate-90" size={20} strokeWidth={2.5} /> <span className="ml-1 text-[18px] sm:text-[24px] font-body">Back</span>
            </button>
            <h1 className="text-[18px] sm:text-[20px] font-bold text-[#16151C] dark:text-white ml-4 sm:ml-6 mt-0.5 sm:mt-1 font-body">Book Ad</h1>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 xl:gap-20 items-start">
            
            {/* Form Column */}
            <div className="flex-1 min-w-0 w-full max-w-[850px]">
              <div className="space-y-6">
                
                {/* Link to Campaign (Optional) */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[14px] font-medium text-gray-700 dark:text-neutral-300 font-body">
                      Link to Campaign (Optional)
                    </label>
                    {selectedCampaign && (
                      <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Pre-paid Budget Available: ₦{Math.max(0, Number(selectedCampaign.paid_budget || selectedCampaign.budget || 0) - Number(selectedCampaign.spent || 0)).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setShowCampaignPicker(o => !o); setShowDurationDropdown(false); setShowCampaignDropdown(false); }}
                    className={`${inputClasses} flex items-center justify-between h-[56px] text-left`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-[#D4AF37] text-base">🎯</span>
                      {selectedCampaign ? (
                        <div className="truncate">
                          <span className="font-semibold text-gray-900 dark:text-white">{selectedCampaign.name}</span>
                          <span className="ml-2 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
                            (₦{Math.max(0, Number(selectedCampaign.paid_budget || selectedCampaign.budget || 0) - Number(selectedCampaign.spent || 0)).toLocaleString()} budget)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-neutral-400 font-light">Standalone booking (No campaign linked)</span>
                      )}
                    </div>
                    <ChevronDown size={22} className={`text-gray-600 dark:text-neutral-400 transition-transform ${showCampaignPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showCampaignPicker && (
                    <div className={dropdownMenuClasses}>
                      <button
                        type="button"
                        onClick={() => { setSelectedCampaignId(null); setShowCampaignPicker(false); }}
                        className={dropdownItemClasses}
                      >
                        <span className={!selectedCampaignId ? 'font-semibold text-[#D4AF37]' : ''}>
                          Standalone booking (No campaign linked)
                        </span>
                        {!selectedCampaignId && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                      </button>

                      {campaigns.map((c) => {
                        const remaining = Math.max(0, Number(c.paid_budget || c.budget || 0) - Number(c.spent || 0));
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setSelectedCampaignId(c.id); setShowCampaignPicker(false); }}
                            className={`${dropdownItemClasses} border-t border-gray-100/60 dark:border-white/10`}
                          >
                            <div className="flex flex-col text-left">
                              <span className={`text-[14px] ${selectedCampaignId === c.id ? 'font-bold text-[#D4AF37]' : 'font-medium text-gray-800 dark:text-neutral-200'}`}>
                                {c.name}
                              </span>
                              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                                ₦{remaining.toLocaleString()} pre-paid budget remaining
                              </span>
                            </div>
                            {selectedCampaignId === c.id && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Describe Ad */}
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your Ad"
                    className={`${inputClasses} h-[131px] resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Duration dropdown */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowDurationDropdown((o) => !o); setShowCampaignDropdown(false); setShowCampaignPicker(false); }}
                      className={`${inputClasses} flex items-center justify-between h-[56px]`}>
                      <span className="text-[#16151C] dark:text-white font-normal">{durationLabel}</span>
                      <ChevronDown size={24} className={`text-[#16151C] dark:text-white transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showDurationDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['30_mins', 'hourly', 'weekly', 'monthly'] as DurationUnit[]).map((u) => (
                          <button key={u} type="button" onClick={() => { 
                            setDurationUnit(u); 
                            if (u === '30_mins') setDurationCount('1');
                            setShowDurationDropdown(false); 
                          }} className={dropdownItemClasses}>
                            <span className={durationUnit === u ? 'font-semibold text-[#D4AF37]' : ''}>
                              {{ '30_mins': '30 Minutes', hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[u]}
                            </span>
                            {durationUnit === u && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duration Count (hours/weeks/months) */}
                  <div>
                    <input 
                      type="number" 
                      min={1} 
                      max={durationUnit === 'hourly' ? 12 : durationUnit === '30_mins' ? 1 : 52}
                      value={durationCount} 
                      disabled={durationUnit === '30_mins'}
                      onChange={(e) => setDurationCount(e.target.value)} 
                      placeholder={durationUnit === '30_mins' ? '30 Minutes (Fixed)' : `Number of ${durationUnit === 'monthly' ? 'months' : durationUnit === 'weekly' ? 'weeks' : 'hours'}`} 
                      className={`${inputClasses} h-[56px] disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-500`} 
                    />
                  </div>

                  {/* Campaign type dropdown */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowCampaignDropdown((o) => !o); setShowDurationDropdown(false); setShowCampaignPicker(false); }}
                      className={`${inputClasses} flex items-center justify-between h-[56px]`}>
                      <span className="text-[#16151C] dark:text-white font-normal">{campaignLabel}</span>
                      <ChevronDown size={24} className={`text-[#16151C] dark:text-white transition-transform ${showCampaignDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCampaignDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['one_time', 'recurring'] as CampaignType[]).map((c) => (
                          <button key={c} type="button" onClick={() => { setCampaignType(c); setShowCampaignDropdown(false); }} className={dropdownItemClasses}>
                            <span className={campaignType === c ? 'font-semibold text-[#D4AF37]' : ''}>{{ one_time: 'One time booking', recurring: 'Recurring booking' }[c]}</span>
                            {campaignType === c && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[16px] text-[#16151C] dark:text-white font-light mb-4 font-body">Upload Ad materials (You can upload multiple files at once)</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] || null); }}
                    className={`relative overflow-hidden border border-dashed rounded-[10px] transition-all cursor-pointer h-[133px] flex flex-col items-center justify-center ${
                      dragging ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#D4AF37] bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                    {file && filePreview ? (
                      <div className="flex items-center gap-4 bg-white dark:bg-[#161618] p-3 rounded-[12px] shadow-sm border border-gray-100 dark:border-white/10 relative z-10 w-full max-w-[90%] mx-auto">
                        {file.type.startsWith('video') ? (
                          <video src={filePreview} className="w-12 h-12 object-cover rounded-[8px]" muted />
                        ) : (
                          <img src={filePreview} alt="preview" className="w-12 h-12 object-cover rounded-[8px]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#D4AF37] flex items-center justify-center mb-3">
                          <Upload size={20} className="text-white" />
                        </div>
                        <p className="text-[14px] font-light text-[#16151C] dark:text-white mb-1 font-body">
                          Drag & Drop or <span className="text-[#3E8B7C]">choose file</span> to upload
                        </p>
                        <p className="text-[11px] font-light text-[#A2A1A8] font-body mt-1">Supported formats : JPEG, PNG, GIF, MP4, MOV</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex items-center">
                    {adDesignRequested ? (
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-light text-[#16151C] dark:text-white font-body">Ad banner design on request?</p>
                        <button type="button" onClick={() => setShowCreativeModal(true)} className="text-[#D4AF37] text-[16px] font-light hover:underline transition-all font-body">Change</button>
                        <button type="button" onClick={() => setShowCancelCreativeModal(true)} className="text-red-500 text-[16px] font-light hover:underline transition-all ml-1 font-body">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-[16px] font-light text-[#16151C] dark:text-white font-body">
                        Don’t have Ad materials yet?{' '}
                        <button type="button" onClick={() => setShowCreativeModal(true)} className="text-[#D4AF37] hover:underline transition-colors font-body">Request Ad creative services</button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="relative cursor-pointer" onClick={() => { try { (dateInputRef.current as any)?.showPicker(); } catch {} }}>
                    <input 
                      ref={dateInputRef}
                      type="date" 
                      min={new Date().toISOString().slice(0, 10)} 
                      value={scheduleDate} 
                      onChange={(e) => setScheduleDate(e.target.value)} 
                      onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch {} }}
                      className={`${inputClasses} h-[58px] pr-12 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`} 
                      placeholder="Schedule service delivery timeline" 
                      style={{ color: scheduleDate ? 'inherit' : 'transparent' }} 
                    />
                    {!scheduleDate && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(162,161,168,0.8)] text-[17px] font-light pointer-events-none bg-white dark:bg-[#161618] pr-2 font-body">Schedule service delivery timeline</span>}
                    <Calendar size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] dark:text-white pointer-events-none" />
                  </div>
                  <div className="relative cursor-pointer" onClick={() => { try { (timeInputRef.current as any)?.showPicker(); } catch {} }}>
                    <input 
                      ref={timeInputRef}
                      type="time" 
                      value={scheduleTime} 
                      onChange={(e) => setScheduleTime(e.target.value)} 
                      onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch {} }}
                      className={`${inputClasses} h-[58px] pr-12 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`} 
                      placeholder="Set timer (optional)" 
                      style={{ color: scheduleTime ? 'inherit' : 'transparent' }} 
                    />
                    {!scheduleTime && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(162,161,168,0.8)] text-[17px] font-light pointer-events-none bg-white dark:bg-[#161618] pr-2 font-body">Set timer (optional)</span>}
                    <Clock size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] dark:text-white pointer-events-none" />
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-5">
                  <button type="button" onClick={() => router.push('/dashboard')} className="w-[91px] h-[40px] bg-white dark:bg-white/5 border border-[rgba(162,161,168,0.2)] dark:border-white/10 rounded-[10px] text-[16px] font-light text-[#16151C] dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-lexend">
                    Cancel
                  </button>
                  <button type="button" onClick={handleBookSlot} disabled={submitting || addingToCart} className="w-[116px] h-[40px] bg-[#D4AF37] hover:bg-[#b89839] text-black rounded-[6px] text-[14px] font-normal transition-all disabled:opacity-60 font-jost">
                    {submitting ? 'Booking…' : 'Book Slot'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column / Sidebar Promo */}
            <div className="w-full xl:w-[245px] shrink-0 mt-8 xl:mt-3">
              <div className="bg-[#232121] rounded-[15px] p-4 pt-8 pb-6 relative flex flex-col h-[162px] justify-between">
                <p className="text-[12.6px] text-white leading-[16px] font-normal font-body pr-4">
                  we are running Ad space promo, get a discount for more than 3months booking
                </p>
                <div className="flex justify-center w-full">
                  <button 
                    type="button" 
                    onClick={() => router.push('/podcast/book')} 
                    className="w-[148px] h-[23.5px] bg-[#FBFF79] hover:bg-[#eaf04f] text-[#051235] rounded-[6px] text-[9.4px] font-semibold uppercase transition-all flex items-center justify-center font-body"
                    style={{ boxShadow: '0px 0px 7px rgba(251, 255, 121, 0.32)' }}
                  >
                    BOOK PODCAST SESSION
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Billing / payment modals ─── */}
        {step !== 'form' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(162,161,168,0.2)] dark:bg-black/60 backdrop-blur-[10px] p-4 sm:p-6">
            <div className="bg-white dark:bg-[#161618] border border-transparent dark:border-white/10 rounded-[24px] sm:rounded-[32px] w-full max-w-[560px] max-h-[90vh] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col font-body overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-white/10 shrink-0">
                {step !== 'billing' && step !== 'success' && step !== 'otp' ? (
                  <button onClick={() => setStep('billing')} className="p-1 hover:opacity-70 transition-opacity text-[#101828] dark:text-white">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                  </button>
                ) : step === 'otp' ? (
                  <button onClick={() => setStep('card')} className="p-1 hover:opacity-70 transition-opacity text-[#101828] dark:text-white">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                  </button>
                ) : step === 'success' ? (
                  <div className="w-6" />
                ) : (
                  <button onClick={() => setStep('form')} className="p-1 hover:opacity-70 transition-opacity text-[#101828] dark:text-white">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                  </button>
                )}
                
                <span className="text-[18px] sm:text-[20px] font-semibold text-[#101828] dark:text-white text-center flex-1">
                  {step === 'billing' ? 'Billing' : 
                   step === 'success' && selectedPaymentMethod !== 'wallet' ? 'Pay with card' : 
                   step === 'card' || step === 'otp' ? (selectedPaymentMethod === 'card' ? 'Pay with a new card' : 'Pay with card') : 
                   step === 'wallet' || (step === 'success' && selectedPaymentMethod === 'wallet') ? 'Pay from wallet' : ''}
                </span>
                
                <button onClick={() => { if(step === 'success') { router.push('/bookings'); } else { setStep('form'); } }} className="p-1 hover:opacity-70 transition-opacity text-[#101828] dark:text-white">
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 sm:px-8 py-6 flex-1 overflow-y-auto flex flex-col items-center">
                {step === 'billing' && (
                  <div className="w-full max-w-[468px] flex flex-col items-center my-auto">
                    <p className="text-center text-[15px] sm:text-[16px] font-bold text-[#101828] dark:text-white mb-4">
                      {durationUnit === '30_mins' ? '30 Minutes' : `${durationCount} ${durationUnit === 'hourly' ? 'hours' : durationUnit === 'weekly' ? 'weeks' : 'months'}`} Ad space at<br/>
                      <span className="text-[18px] font-extrabold text-[#D4AF37]">{formatCurrency(totalCost, currency, rates)}</span>
                    </p>

                    {campaignCovered > 0 && (
                      <div className="w-full rounded-[14px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 mb-4 text-[13px] text-emerald-800 dark:text-emerald-300 flex justify-between items-center font-medium shadow-xs">
                        <span>Paid from Campaign ({selectedCampaign?.name || 'Campaign'}):</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">-{formatCurrency(campaignCovered, currency, rates)}</span>
                      </div>
                    )}
                    
                    <div className="w-full space-y-3.5 mb-6">
                      {/* Wallet Option */}
                      <div 
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`w-full min-h-[84px] rounded-[16px] cursor-pointer transition-all flex flex-col justify-center px-5 py-3 relative ${selectedPaymentMethod === 'wallet' ? 'border-2 border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10' : 'border border-[#D7D7D7] dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'wallet' ? 'border-[#D4AF37]' : 'border-[#D7D7D7] dark:border-neutral-500'}`}>
                            {selectedPaymentMethod === 'wallet' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                          </div>
                          <span className="text-[15px] font-medium text-[#101828] dark:text-white">Pay with Studio Arella Wallet</span>
                        </div>
                        <div className="ml-[28px] flex items-center justify-between text-[#101828] dark:text-white">
                          <span className="text-[13px] text-gray-500 dark:text-neutral-400">
                            {campaignCovered > 0 ? (walletAmountToDeduct === 0 ? 'No extra payment required' : 'Net charge from wallet') : 'Available balance'}
                          </span>
                          <span className="text-[14px] font-bold text-[#D4AF37]">
                            {campaignCovered > 0 ? (walletAmountToDeduct === 0 ? '₦0.00' : formatCurrency(walletAmountToDeduct, currency, rates)) : formatCurrency(walletBalance, currency, rates)}
                          </span>
                        </div>
                      </div>

                      {/* Saved Cards */}
                      {savedCards.map((c: any) => (
                        <div 
                          key={c.id}
                          onClick={() => setSelectedPaymentMethod('saved_card')}
                          className={`w-full min-h-[84px] rounded-[16px] cursor-pointer transition-all flex flex-col justify-center px-5 py-3 relative ${selectedPaymentMethod === 'saved_card' ? 'border-2 border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10' : 'border border-[#D7D7D7] dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20'}`}
                        >
                          <div className="flex items-center gap-3 mb-1.5">
                            <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'saved_card' ? 'border-[#D4AF37]' : 'border-[#D7D7D7] dark:border-neutral-500'}`}>
                              {selectedPaymentMethod === 'saved_card' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                            </div>
                            <span className="text-[15px] font-medium text-[#101828] dark:text-white">Pay with {c.bank || c.brand || 'Saved Card'}</span>
                          </div>
                          <div className="ml-[28px] flex items-center justify-between text-[#101828] dark:text-white">
                            <span className="text-[13px] text-gray-500 dark:text-neutral-400 tracking-[0.05em]">•••• •••• •••• {c.last4 || '****'}</span>
                            <span className="text-[13px] font-medium">{c.account_name || user?.name || 'Cardholder'}</span>
                          </div>
                        </div>
                      ))}

                      {/* New Card Option */}
                      <div 
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`w-full h-[52px] rounded-[14px] border border-dashed cursor-pointer transition-all flex items-center justify-center gap-2 ${selectedPaymentMethod === 'card' ? 'border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10' : 'border-[rgba(162,161,168,0.5)] dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30'}`}
                      >
                        <div className="w-5 h-5 rounded-full border border-[#101828] dark:border-white flex items-center justify-center">
                          <Plus size={13} className="text-[#101828] dark:text-white" />
                        </div>
                        <span className="text-[14px] font-medium text-[#101828] dark:text-white">Pay with a new bank card</span>
                      </div>
                    </div>

                    <div className="w-full pt-2">
                      <button 
                        onClick={() => {
                          if (selectedPaymentMethod === 'saved_card') {
                            handlePayCard();
                          } else {
                            setStep(selectedPaymentMethod);
                          }
                        }}
                        className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[8px] text-[16px] font-semibold transition-colors shadow-sm"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === 'card' && (
                  <div className="w-full max-w-[420px] flex flex-col items-center my-auto">
                    <p className="text-center text-[15px] font-bold text-[#101828] dark:text-white mb-6">
                      {durationCount} {durationUnit === 'hourly' ? 'hours' : durationUnit === 'weekly' ? 'weeks' : 'months'} Ad space at<br/>
                      <span className="text-[18px] font-extrabold text-[#D4AF37]">{formatCurrency(totalCost, currency, rates)}</span>
                    </p>
                    
                    {selectedPaymentMethod === 'card' ? (
                      <div className="w-full space-y-3.5 mb-5">
                        {/* Select bank */}
                        <div className="relative w-full">
                          <select className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-[16px] text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] appearance-none cursor-pointer">
                            <option value="" disabled selected>--- Select bank ---</option>
                            <option value="gtb" className="dark:bg-[#161618]">GTB</option>
                            <option value="wema" className="dark:bg-[#161618]">Wema</option>
                            <option value="access" className="dark:bg-[#161618]">Access</option>
                          </select>
                          <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] dark:text-white pointer-events-none" />
                        </div>

                        {/* Enter card name */}
                        <div className="w-full">
                          <input placeholder="Enter card name" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-[16px] text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>

                        {/* Enter card number */}
                        <div className="relative w-full">
                          <input placeholder="Enter card number" value={cardForm.number} onChange={(e) => setCardForm({...cardForm, number: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-[16px] text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-[20px] h-[16px] relative flex items-center justify-center border border-[#C5CDD0] rounded-[2px] bg-[#FFFFFF] overflow-hidden">
                              <div className="w-[9px] h-[9px] rounded-full bg-[#EB001B] absolute left-[0.5px] mix-blend-multiply opacity-90" />
                              <div className="w-[9px] h-[9px] rounded-full bg-[#F79E1B] absolute right-[0.5px] mix-blend-multiply opacity-90" />
                            </div>
                          </div>
                        </div>

                        {/* Expiry and CVV */}
                        <div className="flex gap-3">
                          <input placeholder="Expiry date (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-[16px] text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-[16px] text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-3.5 mb-5">
                        <input placeholder="Enter amount" className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-4 text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        <input placeholder="Cardholder Name" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-4 text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        <div className="relative w-full">
                          <input placeholder="•••• •••• •••• ••••" value={cardForm.number} onChange={(e) => setCardForm({...cardForm, number: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-4 text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-[30px] h-[20px] relative flex items-center justify-center border rounded-[2px] bg-white overflow-hidden p-0.5">
                              <div className="w-[12px] h-[12px] rounded-full bg-[#EA001B] absolute left-1 mix-blend-multiply opacity-90" />
                              <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-1 mix-blend-multiply opacity-90" />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <input placeholder="Expiry date (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-4 text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})} className="w-full h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111111] px-4 text-[15px] text-[#16151C] dark:text-white font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === 'card' && (
                      <div className="w-full flex items-center gap-2 mb-5">
                        <div className="w-[18px] h-[18px] relative rounded-[4px] flex items-center justify-center bg-[#D4AF37] border border-[#D4AF37] cursor-pointer">
                           <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                        </div>
                        <span className="text-[14px] font-normal text-[#696F79] dark:text-neutral-400">Add this card for future payments</span>
                      </div>
                    )}

                    <div className="w-full">
                      <button onClick={handlePayCard} disabled={paying} className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[8px] text-[16px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                        {paying && <div className="w-4 h-4 border-2 border-[rgba(0,0,0,0.3)] border-t-black rounded-full animate-spin" />}
                        {paying ? 'Processing...' : 'Pay'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'otp' && (
                  <div className="w-full max-w-[420px] flex flex-col items-center my-auto">
                    <p className="text-center text-[16px] font-bold text-[#101828] dark:text-white mb-5">
                      Enter verification code
                    </p>
                    
                    <div className="flex gap-3 justify-center mb-5 w-full">
                      {[0, 1, 2, 3].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={otpDigits[index]}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-[60px] h-[58px] rounded-[10px] border bg-white dark:bg-[#111111] text-center text-[22px] font-semibold text-[#101828] dark:text-white focus:outline-none transition-colors ${
                            otpDigits[index] || document.activeElement?.id === `otp-${index}` 
                              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' 
                              : 'border-[rgba(134,146,166,0.5)] dark:border-white/20'
                          }`}
                          maxLength={1}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 mb-5 text-[14px]">
                      <span className="text-[#8692A6] dark:text-neutral-400">Didn&apos;t get code?</span>
                      <button className="text-[#D4AF37] font-semibold hover:underline">Resend</button>
                    </div>

                    <p className="text-center text-[13px] leading-[1.6] text-gray-500 dark:text-neutral-400 mb-6 px-2">
                      To authorize this payment, enter the OTP sent to your registered email <span className="text-[#101828] dark:text-white font-medium">{user?.email || 'your account email'}</span>
                    </p>

                    <div className="w-full">
                      <button onClick={handleVerifyOtp} disabled={verifyingOtp} className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[8px] text-[16px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                        {verifyingOtp && <div className="w-4 h-4 border-2 border-[rgba(0,0,0,0.3)] border-t-black rounded-full animate-spin" />}
                        {verifyingOtp ? 'Processing...' : 'Verify & Pay'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'wallet' && (
                  <div className="w-full max-w-[460px] flex flex-col items-center my-auto">
                    {/* Wallet summary card */}
                    <div className="w-full rounded-[18px] border-2 border-[#D4AF37] p-5 sm:p-6 bg-gradient-to-br from-[#FAF7F0] to-[#FFFFFF] dark:from-[#1b1a16] dark:to-[#111111] space-y-3 mb-6 shadow-sm">
                      <div className="flex justify-between items-center text-[#101828] dark:text-white">
                        <span className="text-[14px] sm:text-[15px] font-medium text-gray-600 dark:text-neutral-400">Total billboard cost</span>
                        <span className="text-[17px] sm:text-[18px] font-extrabold text-[#101828] dark:text-white">{formatCurrency(totalCost, currency, rates)}</span>
                      </div>

                      {campaignCovered > 0 && (
                        <div className="flex justify-between items-center py-2 px-3 text-[13px] sm:text-[14px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <span className="font-medium">Paid from Campaign Budget:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">-{formatCurrency(campaignCovered, currency, rates)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-[#E8DFCC] dark:border-white/10">
                        <span className="text-[13px] sm:text-[14px] text-gray-600 dark:text-neutral-400">Net charge to wallet</span>
                        <span className="text-[16px] font-bold text-[#D4AF37]">{formatCurrency(walletAmountToDeduct, currency, rates)}</span>
                      </div>

                      <div className="flex justify-between items-center text-[13px] sm:text-[14px] text-gray-500 dark:text-neutral-400">
                        <span>Available wallet balance</span>
                        <span className="font-semibold text-gray-800 dark:text-neutral-200">{formatCurrency(walletBalance, currency, rates)}</span>
                      </div>

                      {walletAmountToDeduct === 0 ? (
                        <div className="p-2.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[13px] font-medium text-center">
                          🎉 100% covered by your pre-paid campaign budget!
                        </div>
                      ) : walletBalance >= walletAmountToDeduct ? (
                        <div className="flex justify-between items-center text-[13px] sm:text-[14px]">
                          <span className="text-gray-600 dark:text-neutral-400">Balance after payment</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(walletBalance - walletAmountToDeduct, currency, rates)}</span>
                        </div>
                      ) : (
                        <p className="text-red-500 text-[13px] font-medium pt-1">
                          Insufficient wallet balance for remaining amount. Please top up your wallet.
                        </p>
                      )}
                    </div>
                    
                    <div className="w-full">
                      <button 
                        onClick={handlePayWallet} 
                        disabled={paying || (walletAmountToDeduct > 0 && walletBalance < walletAmountToDeduct)} 
                        className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[8px] text-[16px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                      >
                        {paying && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        {paying ? 'Processing…' : walletAmountToDeduct === 0 ? 'Confirm Booking (₦0 Extra)' : walletBalance < walletAmountToDeduct ? 'Insufficient balance' : `Pay ${formatCurrency(walletAmountToDeduct, currency, rates)}`}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="w-full max-w-[440px] flex flex-col items-center my-auto py-4 text-center">
                    <div className="relative flex items-center justify-center w-[80px] h-[80px] mb-5">
                      <div className="absolute w-[110px] h-[110px] rounded-full bg-[#D4AF37] opacity-20 blur-[15px]" />
                      <div className="relative w-[80px] h-[80px] rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(180deg, #A47B2E 0%, #D4AF37 100%)' }}>
                        <svg width="30" height="22" viewBox="0 0 34 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 13L12.5 23L31.5 2.5" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[#16151C] dark:text-white mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-[14px] text-gray-500 dark:text-neutral-400 mb-6 max-w-[320px]">
                      Your billboard slot for <span className="font-semibold text-gray-800 dark:text-neutral-200">{description || 'your campaign'}</span> has been successfully booked and scheduled.
                    </p>
                    
                    <div className="w-full">
                      <button 
                        onClick={() => router.push('/bookings')} 
                        className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[8px] text-[16px] font-semibold transition-colors flex items-center justify-center shadow-sm"
                      >
                        View My Bookings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Creative Services Modal */}
        {showCreativeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(162,161,168,0.2)] dark:bg-black/60 backdrop-blur-[10px] p-4 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] dark:bg-[#161618] border border-transparent dark:border-white/10 rounded-[24px] w-full max-w-[625px] shadow-2xl relative flex flex-col pt-8 pb-10 px-10 max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setShowCreativeModal(false)} className="p-2 -ml-2 text-[#16151C] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <h2 className="text-[20px] font-medium text-[#16151C] dark:text-white">Ad creative services</h2>
                <button onClick={() => setShowCreativeModal(false)} className="p-2 -mr-2 text-[#16151C] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                
                {/* Select */}
                <div className="relative mb-[24px]">
                  <select 
                    className="w-full h-[56px] px-4 rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-transparent text-[17px] font-light text-[rgba(162,161,168,0.8)] dark:text-white appearance-none focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
                    <option value="" disabled selected>Select creative services</option>
                    <option value="banner" className="text-black dark:text-white dark:bg-[#161618]">Ad Banner design</option>
                    <option value="storytelling" className="text-black dark:text-white dark:bg-[#161618]">Ad storytelling</option>
                  </select>
                  <ChevronDown size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] dark:text-white pointer-events-none" />
                </div>

                {/* Textarea */}
                <div className="mb-[40px]">
                  <textarea
                    placeholder="Describe your Ad creative brief"
                    className="w-full h-[131px] p-4 rounded-[10px] border border-[rgba(162,161,168,0.2)] dark:border-white/10 bg-transparent text-[17px] font-light text-[rgba(162,161,168,0.8)] dark:text-white resize-none focus:outline-none focus:border-[#D4AF37]"
                  ></textarea>
                </div>

                <p className="text-[16px] font-light text-[#16151C] dark:text-white mb-[16px]">Or upload Ad creative brief</p>
                
                {/* File Dropzone */}
                <div className="w-full h-[133px] rounded-[10px] border border-dashed border-[#D4AF37] bg-transparent flex flex-col items-center justify-center p-[20px] mb-[40px]">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[#D4AF37] flex items-center justify-center mb-[10px]">
                    <Upload size={20} className="text-[#FFFFFF]" />
                  </div>
                  <p className="text-[14px] font-light text-[#16151C] dark:text-white mb-[5px] text-center">
                    Drag & Drop or <span className="text-[#1F593E] dark:text-emerald-400">choose file</span> to upload
                  </p>
                  <p className="text-[11px] font-light text-[#A2A1A8] text-center">Supported formats : jpeg, png, pf</p>
                </div>

                <button 
                  onClick={() => {
                    setAdDesignRequested(true);
                    setShowCreativeModal(false);
                    toast('Creative service added to your request.', 'success');
                  }}
                  className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[16px] font-normal transition-colors flex items-center justify-center"
                >
                  Add service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Creative Request Modal */}
        {showCancelCreativeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-[383px] py-8 px-5 shadow-2xl relative flex flex-col items-center">
              <h3 className="w-full max-w-[343px] text-center text-[18px] sm:text-[20px] font-semibold text-[#16151C] leading-[28px] sm:leading-[30px] my-6">
                Are you sure you want to cancel your Ad creative request?
              </h3>
              
              <div className="mt-4 flex items-center justify-center gap-3 w-full max-w-[343px]">
                <button 
                  onClick={() => setShowCancelCreativeModal(false)}
                  className="flex-1 h-[48px] flex items-center justify-center bg-transparent border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[15px] font-normal text-[#16151C] hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    setAdDesignRequested(false);
                    setShowCancelCreativeModal(false);
                    setShowCreativeCancelSuccessModal(true);
                  }}
                  className="flex-1 h-[48px] flex items-center justify-center bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[15px] font-normal transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Creative Cancel Success Modal */}
        {showCreativeCancelSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-[383px] h-[433px] shadow-2xl relative animate-in zoom-in-95 duration-150">
              
              {/* Top Line */}
              <div className="absolute top-[66px] left-[20px] right-[20px] h-0 border-t border-[rgba(162,161,168,0.1)]"></div>
              
              {/* Alert Icon */}
              <div className="absolute top-[94px] left-1/2 -translate-x-1/2 w-[70px] h-[70px] flex items-center justify-center">
                <div className="absolute inset-[-51.43%] bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,_#443A18_4.69%,_#D4AF37_98.31%)] opacity-10 blur-[5px] rounded-full"></div>
                <div className="absolute inset-[-28.57%] bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,_#443A18_4.69%,_#D4AF37_98.31%)] opacity-[0.15] blur-[5px] rounded-full"></div>
                <div className="absolute inset-0 bg-[radial-gradient(116.28%_116.28%_at_0%_-16.28%,_#443A18_4.69%,_#D4AF37_98.31%)] rounded-full flex items-center justify-center">
                  <X size={28} className="text-[#FFFFFF]" strokeWidth={1.5} />
                </div>
              </div>

              {/* Title */}
              <h3 className="absolute top-[224px] w-full text-center text-[20px] font-semibold leading-[30px] text-[#16151C]">
                Creative request cancelled
              </h3>

              {/* Finish Button */}
              <button
                type="button"
                onClick={() => setShowCreativeCancelSuccessModal(false)}
                className="absolute top-[307px] left-1/2 -translate-x-1/2 w-[166px] h-[50px] rounded-[6px] bg-[#D4AF37] text-[16px] font-normal text-[#000000] hover:bg-[#b58b24] transition-colors flex items-center justify-center"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
