'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Upload, ChevronDown, Check, X, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { useCartStore } from '@/store/cartStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';
import { buildSlots, DurationUnit, CampaignType } from '@/lib/bookingSlots';

const F = theme.font.body;

type Step = 'form' | 'billing' | 'card' | 'wallet' | 'success';

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

  const [scheduleDate, setScheduleDate] = useState(searchParams.get('date') || '');
  const [scheduleTime, setScheduleTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [adDesignRequested, setAdDesignRequested] = useState(false);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showCancelCreativeModal, setShowCancelCreativeModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'wallet'>('card');

  useEffect(() => {
    api.get('/finances/balance').then((res) => setWalletBalance(Number(res.data?.credits ?? 0))).catch(() => {});
    api.get('/screens?limit=100').then((res) => {
      const list = (res.data?.screens || []).filter((s: any) => s.status === 'active');
      setScreens(list);
      if (list.length > 0) setSelectedScreenId((prev) => prev || list[0].id);
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

  const durationLabel = { hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[durationUnit];
  const campaignLabel = { one_time: 'One time booking', recurring: 'Recurring booking' }[campaignType];

  // Shared by both "Book Slot" and "Add to Cart" — uploads the creative for
  // real (same AI moderation / Cloudinary pipeline as the Ads page) and
  // returns its real id and ppm_rate, or throws.
  const uploadCreative = async () => {
    const formData = new FormData();
    formData.append('file', file as File);
    formData.append('title', description.slice(0, 60) || `Ad booked ${new Date().toLocaleDateString()}`);
    formData.append('description', description);
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
      const reserveRes = await api.post('/bookings/reserve', { screen_id: selectedScreenId, ad_id: ad.id, slots });
      setBookingId(reserveRes.data.booking_id);
      setTotalCost(Number(reserveRes.data.total_cost || 0));
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
      setStep('success');
    } catch (error) {
      toast('Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };



  const inputClasses = "w-full px-5 py-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-gray-800 placeholder:text-[rgba(162,161,168,0.8)] focus:outline-none focus:border-[#D4AF37] transition-colors font-body";
  const dropdownMenuClasses = "absolute top-full left-0 right-0 mt-2 bg-white rounded-[10px] shadow-[0px_30px_30px_rgba(184,184,184,0.25)] z-50 overflow-hidden py-4 px-3 border border-gray-100";
  const dropdownItemClasses = "w-full text-left px-4 py-3 text-[15px] font-karla text-black hover:bg-gray-50 transition-colors rounded-lg flex justify-between items-center";

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-[1200px] mx-auto px-8 py-8 h-full relative font-body bg-white rounded-[24px]">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-10 mt-2">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[24px] font-normal text-[#16151C] hover:opacity-70 transition-opacity">
              <ChevronDown className="rotate-90" size={24} strokeWidth={2.5} /> <span className="ml-1 text-[24px] font-body">Back</span>
            </button>
            <h1 className="text-[20px] font-bold text-[#16151C] ml-6 mt-1 font-body">Book Ad</h1>
          </div>

          <div className="flex flex-col xl:flex-row gap-20 items-start">
            
            {/* Form Column */}
            <div className="flex-1 min-w-0 w-full max-w-[850px]">
              <div className="space-y-6">
                
                {/* Describe Ad */}
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your Ad"
                    className={`${inputClasses} h-[131px] resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Duration dropdown */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowDurationDropdown((o) => !o); setShowCampaignDropdown(false); }}
                      className={`${inputClasses} flex items-center justify-between h-[56px]`}>
                      <span className={durationUnit === 'hourly' ? 'text-[rgba(162,161,168,0.8)]' : ''}>{durationLabel === 'Hourly' ? 'Duration' : durationLabel}</span>
                      <ChevronDown size={24} className={`text-[#16151C] transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showDurationDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['hourly', 'weekly', 'monthly'] as DurationUnit[]).map((u) => (
                          <button key={u} type="button" onClick={() => { setDurationUnit(u); setShowDurationDropdown(false); }} className={dropdownItemClasses}>
                            <span>{{ hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[u]}</span>
                            {durationUnit === u && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign type dropdown */}
                  <div className="relative">
                    <button type="button" onClick={() => { setShowCampaignDropdown((o) => !o); setShowDurationDropdown(false); }}
                      className={`${inputClasses} flex items-center justify-between h-[56px]`}>
                      <span className={campaignType === 'one_time' ? 'text-[rgba(162,161,168,0.8)]' : ''}>{campaignLabel === 'One time booking' ? 'How would you run your Ad campaign?' : campaignLabel}</span>
                      <ChevronDown size={24} className={`text-[#16151C] transition-transform ${showCampaignDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCampaignDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['one_time', 'recurring'] as CampaignType[]).map((c) => (
                          <button key={c} type="button" onClick={() => { setCampaignType(c); setShowCampaignDropdown(false); }} className={dropdownItemClasses}>
                            <span>{{ one_time: 'One time booking', recurring: 'Recurring booking' }[c]}</span>
                            {campaignType === c && <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-full" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(durationUnit !== 'hourly' || campaignType === 'recurring') && (
                  <div>
                    <input type="number" min={1} value={durationCount} onChange={(e) => setDurationCount(e.target.value)} placeholder={`Enter number of ${durationUnit === 'monthly' ? 'months' : durationUnit === 'weekly' ? 'weeks' : 'hours'}`} className={`${inputClasses} h-[56px]`} />
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-[16px] text-[#16151C] font-light mb-4 font-body">Upload Ad materials (You can upload multiple files at once)</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] || null); }}
                    className={`relative overflow-hidden border border-dashed rounded-[10px] transition-all cursor-pointer h-[133px] flex flex-col items-center justify-center ${
                      dragging ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#D4AF37] bg-transparent hover:bg-gray-50'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                    {file && filePreview ? (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-[12px] shadow-sm border border-gray-100 relative z-10 w-full max-w-[90%] mx-auto">
                        {file.type.startsWith('video') ? (
                          <video src={filePreview} className="w-12 h-12 object-cover rounded-[8px]" muted />
                        ) : (
                          <img src={filePreview} alt="preview" className="w-12 h-12 object-cover rounded-[8px]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#D4AF37] flex items-center justify-center mb-3">
                          <Upload size={20} className="text-white" />
                        </div>
                        <p className="text-[14px] font-light text-[#16151C] mb-1 font-body">
                          Drag & Drop or <span className="text-[#3E8B7C]">choose file</span> to upload
                        </p>
                        <p className="text-[11px] font-light text-[#A2A1A8] font-body mt-1">Supported formats : jpeg, png, pf</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex items-center">
                    {adDesignRequested ? (
                      <div className="flex items-center gap-2">
                        <p className="text-[16px] font-light text-[#16151C] font-body">Ad banner design on request?</p>
                        <button type="button" onClick={() => setShowCreativeModal(true)} className="text-[#D4AF37] text-[16px] font-light hover:underline transition-all font-body">Change</button>
                        <button type="button" onClick={() => setShowCancelCreativeModal(true)} className="text-red-500 text-[16px] font-light hover:underline transition-all ml-1 font-body">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-[16px] font-light text-[#16151C] font-body">
                        Don’t have Ad materials yet?{' '}
                        <button type="button" onClick={() => setShowCreativeModal(true)} className="text-[#D4AF37] hover:underline transition-colors font-body">Request Ad creative services</button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="relative">
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} 
                      className={`${inputClasses} h-[58px] pr-12`} placeholder="Schedule service delivery timeline" 
                      style={{ color: scheduleDate ? 'inherit' : 'transparent' }} />
                    {!scheduleDate && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(162,161,168,0.8)] text-[17px] font-light pointer-events-none bg-white pr-2 font-body">Schedule service delivery timeline</span>}
                    <Calendar size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] pointer-events-none" />
                  </div>
                  <div className="relative">
                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} 
                      className={`${inputClasses} h-[58px] pr-12`} placeholder="Set timer (optional)" 
                      style={{ color: scheduleTime ? 'inherit' : 'transparent' }} />
                    {!scheduleTime && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgba(162,161,168,0.8)] text-[17px] font-light pointer-events-none bg-white pr-2 font-body">Set timer (optional)</span>}
                    <Clock size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] pointer-events-none" />
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-5">
                  <button type="button" onClick={() => router.push('/dashboard')} className="w-[91px] h-[40px] bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[16px] font-light text-[#16151C] hover:bg-gray-50 transition-colors font-lexend">
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
          
          {/* Chat with Arella floating button */}
          <div className="absolute bottom-8 right-8 z-[100]">
            <button className="h-[98px] px-8 bg-white rounded-[24px] shadow-[0px_0px_168px_rgba(0,0,0,0.15)] flex items-center gap-3 hover:scale-105 transition-transform">
              <span className="text-[18px] font-semibold text-[#1A1A1A] font-body">Chat with Arella</span>
              <div className="w-[27px] h-[27px] rounded-full overflow-hidden bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 animate-pulse" />
            </button>
          </div>
        </div>

        {/* ─── Billing / payment modals ─── */}
        {step !== 'form' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[32px] w-full max-w-[625px] min-h-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col font-body pt-8 pb-10">
              
              <div className="flex items-center justify-between px-10 pb-2 absolute top-8 left-0 right-0">
                {step !== 'billing' && step !== 'success' ? (
                  <button onClick={() => setStep('billing')} className="hover:opacity-70 transition-opacity text-[#101828]"><ArrowLeft size={28} strokeWidth={2.5} /></button>
                ) : (
                  <button onClick={() => setStep('form')} className="hover:opacity-70 transition-opacity text-[#101828]"><ArrowLeft size={28} strokeWidth={2.5} /></button>
                )}
                
                <span className="text-[20px] font-medium text-[#101828] text-center flex-1">
                  {step === 'billing' ? 'Billing' : step === 'card' || (step === 'success' && selectedPaymentMethod === 'card') ? 'Pay with card' : step === 'wallet' || (step === 'success' && selectedPaymentMethod === 'wallet') ? 'Pay from wallet' : ''}
                </span>
                
                <button onClick={() => { if(step === 'success') { router.push('/bookings'); } else { setStep('form'); } }} className="hover:opacity-70 transition-opacity text-[#101828]">
                  <X size={28} strokeWidth={2.5} />
                </button>
              </div>

              <div className="px-10 flex-1 flex flex-col items-center pt-24">
                {step === 'billing' && (
                  <div className="w-full max-w-[468px] flex flex-col items-center h-full">
                    <p className="text-center text-[16px] font-bold text-[#101828] mb-12">
                      {durationCount} {durationUnit === 'hourly' ? 'hours' : durationUnit === 'weekly' ? 'weeks' : 'months'} Ad space at<br/>
                      {formatCurrency(totalCost, currency, rates)}
                    </p>
                    
                    <div className="w-full space-y-6">
                      {/* Card Option */}
                      <div 
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`w-full h-[127px] rounded-[16px] border cursor-pointer transition-all flex flex-col justify-center px-6 relative ${selectedPaymentMethod === 'card' ? 'border-2 border-[#D4AF37]' : 'border border-[#D7D7D7]'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'card' ? 'border-[#D4AF37]' : 'border-[#D7D7D7]'}`}>
                            {selectedPaymentMethod === 'card' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                          </div>
                          <span className="text-[16px] font-medium text-[#101828]">Pay with card</span>
                        </div>
                      </div>
                      
                      {/* Wallet Option */}
                      <div 
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`w-full h-[127px] rounded-[16px] border cursor-pointer transition-all flex flex-col justify-center px-6 relative ${selectedPaymentMethod === 'wallet' ? 'border-2 border-[#D4AF37]' : 'border border-[#D7D7D7]'}`}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'wallet' ? 'border-[#D4AF37]' : 'border-[#D7D7D7]'}`}>
                            {selectedPaymentMethod === 'wallet' && <div className="w-[8px] h-[8px] rounded-full bg-[#DF4308]" />}
                          </div>
                          <span className="text-[16px] font-medium text-[#101828]">Pay from wallet</span>
                          <div className="ml-auto bg-[#FFFCF2] text-[#D4AF37] px-3 py-1 rounded-[8px] text-[14px] font-normal">Fund wallet</div>
                        </div>
                        <div className="ml-[32px] flex items-end justify-between">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[13px] font-medium text-[#101828] tracking-[0.02em]">Wallet ID: 23cvo_23759ryi</span>
                            <button type="button" className="flex items-center gap-1.5 text-[#D4AF37] text-[12px] font-normal tracking-[0.03em]">
                              Copy
                              <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 0H2C0.9 0 0 0.9 0 2V12H2V2H9V0ZM11 4H5C3.9 4 3 4.9 3 6V14C3 15.1 3.9 16 5 16H11C12.1 16 13 15.1 13 14V6C13 4.9 12.1 4 11 4ZM11 14H5V6H11V14Z" fill="#D4AF37"/>
                              </svg>
                            </button>
                          </div>
                          <span className="text-[14px] font-medium text-[#101828]">{formatCurrency(totalCost, currency, rates)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 w-full flex-1 flex flex-col justify-end">
                      <button 
                        onClick={() => setStep(selectedPaymentMethod)} 
                        className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[16px] font-medium transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === 'card' && (
                  <div className="space-y-4">
                    <p className="text-center text-[14px] font-bold text-gray-900 dark:text-slate-50 mb-6">
                      Total: <span className="text-[#C69A2C]">{formatCurrency(totalCost, currency, rates)}</span>
                    </p>
                    <div className="space-y-3 mb-8">
                      <input placeholder="Card holder's name" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} className={inputClasses} />
                      <input placeholder="Card number" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} className={inputClasses} />
                      <div className="flex gap-3">
                        <input placeholder="Expiry (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} className={inputClasses} />
                        <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} className={inputClasses} />
                      </div>
                    </div>
                    <button onClick={handlePayCard} disabled={paying} className="w-full py-4 bg-[#1A1A1A] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1A1A1A] rounded-[14px] text-[14px] font-bold transition-all disabled:opacity-60 shadow-sm flex items-center justify-center gap-2">
                      {paying && <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
                      {paying ? 'Redirecting…' : 'Proceed to Checkout'}
                    </button>
                    <p className="text-[11px] font-medium text-gray-400 text-center mt-4">You'll be redirected to a secure gateway to complete payment.</p>
                  </div>
                )}

                {step === 'wallet' && (
                  <div className="w-full max-w-[468px] flex flex-col items-center h-full pt-10">
                    <div className="w-full h-[127px] rounded-[16px] border-2 border-[#D4AF37] px-[44px] flex justify-between items-center bg-white mb-8">
                      <span className="text-[16px] font-medium text-[#101828]">Total amount</span>
                      <span className="text-[14px] font-medium text-[#101828]">{formatCurrency(totalCost, currency, rates)}</span>
                    </div>
                    
                    <div className="mt-8 w-full flex-1 flex flex-col justify-end">
                      <button 
                        onClick={handlePayWallet} 
                        disabled={paying || walletBalance < totalCost} 
                        className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[16px] font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {paying && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        {paying ? 'Processing…' : walletBalance < totalCost ? 'Insufficient balance' : 'Pay'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="w-full max-w-[468px] flex flex-col items-center h-full pt-20">
                    <div className="relative flex items-center justify-center w-[70px] h-[70px] mb-12">
                      <div className="absolute w-[142px] h-[142px] rounded-full blur-[5px] opacity-10" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }} />
                      <div className="absolute w-[110px] h-[110px] rounded-full blur-[5px] opacity-15" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }} />
                      <div className="relative w-full h-full rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }}>
                        <Check size={30} className="text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    
                    <h3 className="text-[20px] font-semibold text-[#16151C]">Payment successful and Ad booked</h3>
                    
                    <div className="mt-12 w-full flex-1 flex flex-col justify-end">
                      <button 
                        onClick={() => router.push('/bookings')} 
                        className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[16px] font-medium transition-colors flex items-center justify-center"
                      >
                        Finish
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[640px] shadow-2xl relative flex flex-col p-8 md:p-10 max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setShowCreativeModal(false)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <ArrowLeft size={22} strokeWidth={2} />
                </button>
                <h2 className="text-[18px] font-medium text-gray-900 dark:text-slate-50">Ad creative services</h2>
                <button onClick={() => setShowCreativeModal(false)} className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex flex-col overflow-y-auto pr-2 -mr-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="relative mb-6">
                  <select 
                    className="w-full h-[56px] px-4 rounded-[12px] border border-gray-200 dark:border-white/10 bg-transparent text-[15px] text-gray-800 dark:text-slate-200 appearance-none focus:outline-none focus:border-[#C69A2C]"
                  >
                    <option value="" disabled selected>Select creative services</option>
                    <option value="banner">Ad Banner design</option>
                    <option value="storytelling">Ad storytelling</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="mb-8">
                  <textarea
                    placeholder="Describe your Ad creative brief"
                    className="w-full h-[120px] p-4 rounded-[12px] border border-gray-200 dark:border-white/10 bg-transparent text-[15px] text-gray-800 dark:text-slate-200 resize-none focus:outline-none focus:border-[#C69A2C]"
                  ></textarea>
                </div>

                <p className="text-[14px] text-gray-900 dark:text-slate-50 mb-4">Or upload Ad creative brief</p>
                
                <div className="w-full rounded-[16px] border border-dashed border-[#D3B04A] bg-transparent flex flex-col items-center justify-center py-8 mb-6">
                  <div className="w-12 h-12 rounded-[12px] bg-[#CCAB46] flex items-center justify-center mb-4">
                    <Upload size={20} className="text-white" />
                  </div>
                  <p className="text-[14px] font-medium text-gray-800 dark:text-slate-200 mb-1">
                    Drag & Drop or <span className="text-[#4E8B7C]">choose file</span> to upload
                  </p>
                  <p className="text-[12px] text-gray-400">Supported formats : jpeg, png, pf</p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setAdDesignRequested(true);
                      setShowCreativeModal(false);
                      toast('Creative service added to your request.', 'success');
                    }}
                    className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-black rounded-[12px] text-[15px] font-medium transition-colors shadow-sm"
                  >
                    Add service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Creative Request Modal */}
        {showCancelCreativeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[480px] shadow-2xl relative flex flex-col p-10 py-12 text-center">
              <h3 className="text-[28px] font-bold text-gray-900 dark:text-slate-50 leading-[1.3] mb-12">
                Are you sure you want to cancel<br/>your Ad creative request?
              </h3>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowCancelCreativeModal(false)}
                  className="flex-1 py-4 bg-transparent border border-gray-200 dark:border-white/10 rounded-[12px] text-[16px] font-medium text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    setAdDesignRequested(false);
                    setShowCancelCreativeModal(false);
                    toast('Ad creative request cancelled.', 'info');
                  }}
                  className="flex-1 py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-black rounded-[12px] text-[16px] font-medium transition-colors shadow-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
