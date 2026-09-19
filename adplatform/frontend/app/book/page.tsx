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

  const inputClasses = "w-full px-4 py-3.5 bg-[#F9FAFB] dark:bg-[#111111] border border-transparent rounded-[12px] text-[13px] font-medium text-gray-900 dark:text-slate-50 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10 transition-all shadow-sm";
  const labelClasses = "block text-[13px] font-bold text-gray-900 dark:text-slate-50 mb-2.5";
  const dropdownMenuClasses = "absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] z-50 overflow-hidden py-1.5";
  const dropdownItemClasses = "w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors";

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="font-body max-w-[1100px] mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            
            {/* Form Column */}
            <div className="flex-1 min-w-0 w-full">
              <div className="mb-8">
                <h1 className="text-[20px] font-bold text-gray-900 dark:text-slate-50">Book Ad</h1>
                <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-1.5">Fill in the details to schedule your screen ad campaign.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClasses}>Describe your Ad</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. Summer sale promotional billboard..."
                    rows={4}
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <div className="relative">
                  <label className={labelClasses}>Screen</label>
                  <button type="button" onClick={() => { setShowScreenDropdown((o) => !o); setShowDurationDropdown(false); setShowCampaignDropdown(false); }}
                    className={`${inputClasses} flex items-center justify-between`}>
                    <span className="truncate">
                      {screens.length === 0
                        ? 'No screens available'
                        : (() => {
                            const s = screens.find((sc) => sc.id === selectedScreenId);
                            return s ? `${s.name} — ${s.location}` : 'Select a screen';
                          })()}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showScreenDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showScreenDropdown && screens.length > 0 && (
                    <div className={`${dropdownMenuClasses} max-h-[260px] overflow-y-auto`}>
                      {screens.map((s) => (
                        <div key={s.id} onClick={() => { setSelectedScreenId(s.id); setShowScreenDropdown(false); }}
                          className={`${dropdownItemClasses} flex flex-col gap-0.5 cursor-pointer`}>
                          <span>{s.name}</span>
                          <span className="text-[11.5px] font-medium text-gray-400">{s.location} · {formatCurrency(Number(s.price_per_sec), currency, rates)}/sec</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration dropdown */}
                  <div className="relative">
                    <label className={labelClasses}>Duration</label>
                    <button type="button" onClick={() => { setShowDurationDropdown((o) => !o); setShowCampaignDropdown(false); setShowScreenDropdown(false); }}
                      className={`${inputClasses} flex items-center justify-between`}>
                      <span>{durationLabel}</span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showDurationDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['hourly', 'weekly', 'monthly'] as DurationUnit[]).map((u) => (
                          <button key={u} type="button" onClick={() => { setDurationUnit(u); setShowDurationDropdown(false); }} className={dropdownItemClasses}>
                            {{ hourly: 'Hourly', weekly: 'Weekly', monthly: 'Monthly' }[u]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign type dropdown */}
                  <div className="relative">
                    <label className={labelClasses}>How would you run your Ad campaign?</label>
                    <button type="button" onClick={() => { setShowCampaignDropdown((o) => !o); setShowDurationDropdown(false); setShowScreenDropdown(false); }}
                      className={`${inputClasses} flex items-center justify-between`}>
                      <span>{campaignLabel}</span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCampaignDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCampaignDropdown && (
                      <div className={dropdownMenuClasses}>
                        {(['one_time', 'recurring'] as CampaignType[]).map((c) => (
                          <button key={c} type="button" onClick={() => { setCampaignType(c); setShowCampaignDropdown(false); }} className={dropdownItemClasses}>
                            {{ one_time: 'One time booking', recurring: 'Recurring booking' }[c]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(durationUnit !== 'hourly' || campaignType === 'recurring') && (
                  <div>
                    <label className={labelClasses}>Enter number of {durationUnit === 'monthly' ? 'months' : durationUnit === 'weekly' ? 'weeks' : 'hours'}</label>
                    <input type="number" min={1} value={durationCount} onChange={(e) => setDurationCount(e.target.value)} className={inputClasses} />
                  </div>
                )}

                <div>
                  <label className={labelClasses}>Upload Ad materials <span className="text-gray-400 font-medium ml-1">(You can upload multiple files at once)</span></label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] || null); }}
                    className={`relative overflow-hidden border-2 border-dashed rounded-[16px] transition-all cursor-pointer ${
                      dragging ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                    } ${file ? 'p-4' : 'p-10'}`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                    {file && filePreview ? (
                      <div className="flex items-center gap-4 bg-white dark:bg-[#111111] p-3 rounded-[12px] shadow-sm border border-gray-100 dark:border-white/5 relative z-10">
                        {file.type.startsWith('video') ? (
                          <video src={filePreview} className="w-16 h-16 object-cover rounded-[8px]" muted />
                        ) : (
                          <img src={filePreview} alt="preview" className="w-16 h-16 object-cover rounded-[8px]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 dark:text-slate-50 truncate">{file.name}</p>
                          <p className="text-[11.5px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#1A1A1A] dark:bg-white flex items-center justify-center mb-4 shadow-sm">
                          <Upload size={18} className="text-white dark:text-[#1A1A1A]" />
                        </div>
                        <p className="text-[14px] font-bold text-gray-900 dark:text-slate-50 mb-1">Drag &amp; Drop or choose file to upload</p>
                        <p className="text-[12px] font-medium text-gray-400">Supported formats: jpeg, png, gif, mp4</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[12.5px] font-medium text-gray-500 dark:text-slate-400 mt-3">
                    Don&apos;t have Ad materials yet?{' '}
                    <Link href="/creative" className="text-[#C69A2C] font-bold hover:underline underline-offset-2 transition-all">Request Ad creative services</Link>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Schedule service delivery timeline</label>
                    <div className="relative">
                      <input type="date" min={new Date().toISOString().slice(0, 10)} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className={`${inputClasses} pr-12`} />
                      <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Set timer <span className="text-gray-400 font-medium ml-1">(optional)</span></label>
                    <div className="relative">
                      <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={`${inputClasses} pr-12`} />
                      <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {cart.length > 0 ? (
                    <Link href="/cart" className="flex items-center gap-2 text-[13.5px] font-bold text-[#C69A2C] hover:text-[#b58b24] transition-colors bg-[#C69A2C]/10 px-4 py-2 rounded-full">
                      <ShoppingCart size={15} /> {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                    </Link>
                  ) : <div />}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => router.push('/dashboard')} className="flex-1 sm:flex-none px-6 py-3.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[12px] text-[13px] font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center shadow-sm">
                      Cancel
                    </button>
                    <button type="button" onClick={handleAddToCart} disabled={addingToCart || submitting} className="flex-1 sm:flex-none px-6 py-3.5 bg-white dark:bg-[#111111] border-2 border-[#C69A2C] rounded-[12px] text-[13px] font-bold text-[#C69A2C] hover:bg-[#C69A2C]/5 transition-colors disabled:opacity-50 text-center shadow-sm">
                      {addingToCart ? 'Adding…' : 'Add to Cart'}
                    </button>
                    <button type="button" onClick={handleBookSlot} disabled={submitting || addingToCart} className="flex-1 sm:flex-none px-8 py-3.5 bg-[#1A1A1A] dark:bg-white hover:bg-black dark:hover:bg-gray-100 border-2 border-[#1A1A1A] dark:border-white text-white dark:text-[#1A1A1A] rounded-[12px] text-[13px] font-bold transition-all disabled:opacity-60 text-center shadow-sm">
                      {submitting ? 'Booking…' : 'Book Slot'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column / Sidebar Promo */}
            <div className="w-full lg:w-[280px] shrink-0 sticky top-[100px]">
              <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden relative group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C69A2C]/10 rounded-full blur-2xl group-hover:bg-[#C69A2C]/20 transition-all duration-700" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#C69A2C]/10 rounded-full blur-2xl group-hover:bg-[#C69A2C]/20 transition-all duration-700" />
                
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-slate-50 mb-3 relative z-10 leading-snug">
                  Special Ad Space <span className="text-[#C69A2C]">Promo</span>
                </h3>
                <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mb-6 leading-relaxed relative z-10">
                  We are running an Ad space promo! Get a massive discount for any booking longer than 3 months.
                </p>
                <button type="button" onClick={() => router.push('/podcast/book')} className="w-full py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 rounded-[12px] text-[12px] font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider transition-colors relative z-10">
                  Book Podcast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Billing / payment modals ─── */}
        {step !== 'form' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[420px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-white/5">
                {step !== 'billing' && step !== 'success' ? (
                  <button onClick={() => setStep('billing')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50"><ArrowLeft size={18} /></button>
                ) : <div className="w-[30px]" />}
                
                <span className="text-[15px] font-bold text-gray-900 dark:text-slate-50">
                  {step === 'billing' ? 'Billing' : step === 'card' ? 'Pay with card' : step === 'wallet' ? 'Pay from wallet' : ''}
                </span>
                
                {step !== 'success' ? (
                  <button onClick={() => setStep('form')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50"><X size={18} /></button>
                ) : <div className="w-[30px]" />}
              </div>

              <div className="px-8 pb-10 pt-6">
                {step === 'billing' && (
                  <div className="space-y-4">
                    <p className="text-center text-[14px] font-bold text-gray-900 dark:text-slate-50 mb-6">
                      {durationLabel} Ad space at <span className="text-[#C69A2C]">{formatCurrency(totalCost, currency, rates)}</span>
                    </p>
                    
                    <button onClick={() => setStep('card')} className="w-full text-left px-5 py-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-[#C69A2C] dark:hover:border-[#C69A2C] rounded-[14px] transition-all group">
                      <span className="text-[14px] font-bold text-gray-800 dark:text-slate-200 group-hover:text-[#C69A2C] transition-colors">Pay with card</span>
                    </button>
                    
                    <button onClick={() => setStep('wallet')} className="w-full text-left px-5 py-4 bg-white dark:bg-[#111111] border-2 border-[#C69A2C] rounded-[14px] flex items-center justify-between transition-all hover:bg-[#C69A2C]/5 shadow-[0_4px_14px_rgba(198,154,44,0.1)]">
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 dark:text-slate-50">Pay from wallet</p>
                        <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">Balance: {formatCurrency(walletBalance, currency, rates)}</p>
                      </div>
                      {walletBalance >= totalCost && <Check size={18} className="text-[#C69A2C]" />}
                    </button>
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
                  <div className="space-y-6">
                    <div className="bg-[#F9FAFB] dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[16px] p-5 flex justify-between items-center">
                      <span className="text-[13px] font-bold text-gray-500 dark:text-slate-400">Total amount</span>
                      <strong className="text-[15px] font-bold text-gray-900 dark:text-slate-50">NGN {totalCost.toLocaleString()}</strong>
                    </div>
                    <button onClick={handlePayWallet} disabled={paying || walletBalance < totalCost} className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white rounded-[14px] text-[14px] font-bold transition-all disabled:opacity-60 shadow-[0_4px_14px_rgba(198,154,44,0.3)] flex items-center justify-center gap-2">
                      {paying && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {paying ? 'Processing…' : walletBalance < totalCost ? 'Insufficient balance' : 'Pay Now'}
                    </button>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-[#C69A2C]/20 blur-xl rounded-full" />
                      <div className="relative w-16 h-16 bg-[#C69A2C] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(198,154,44,0.4)]">
                        <Check size={28} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <h3 className="text-[18px] font-bold text-gray-900 dark:text-slate-50 mb-2">Booking Confirmed!</h3>
                    <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mb-8">Your ad space has been successfully secured.</p>
                    <button onClick={() => router.push('/bookings')} className="w-[160px] py-3 bg-[#1A1A1A] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1A1A1A] rounded-[12px] text-[13px] font-bold transition-all shadow-sm">
                      View Bookings
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
