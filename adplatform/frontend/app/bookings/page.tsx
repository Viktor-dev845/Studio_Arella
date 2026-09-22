'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Monitor, Mic, X, Calendar, Loader2, Download, Star, ArrowLeft, Check, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import BookingCalendar from '@/components/calendar/BookingCalendar';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateInTz } from '@/lib/timezone';

interface BookingRow {
  id: string;
  booking_number: string;
  info: string;
  start_time: string;
  end_time: string;
  billing: number;
  duration: string;
  status: string;
}

function formatSchedule(iso: string, timezone?: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${formatDateInTz(d, timezone)}, ${new Intl.DateTimeFormat('en-GB', { timeZone: timezone || 'Africa/Lagos', hour: 'numeric', minute: '2-digit' }).format(d)}`;
}

function formatDuration(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!start || !end || end <= start) return '—';
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = mins / 60;
  return `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)} hour${hrs !== 1 ? 's' : ''}`;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active:          { label: 'Active',    className: 'text-green-600 dark:text-green-400' },
  confirmed:       { label: 'Confirmed', className: 'text-green-600 dark:text-green-400' },
  pending_payment: { label: 'Pending',   className: 'text-gray-400 dark:text-slate-500' },
  pending:         { label: 'Pending',   className: 'text-gray-400 dark:text-slate-500' },
  completed:       { label: 'Ended',     className: 'text-gray-400 dark:text-slate-500' },
  ended:           { label: 'Ended',     className: 'text-gray-400 dark:text-slate-500' },
  cancelled:       { label: 'Cancelled', className: 'text-red-400' },
  failed:          { label: 'Failed',    className: 'text-red-400' },
};

const CANCELLABLE_STATUSES: Record<'screen' | 'podcast', Set<string>> = {
  screen: new Set(['active', 'pending_payment']),
  podcast: new Set(['confirmed', 'pending']),
};
const EXTENDABLE_STATUSES: Record<'screen' | 'podcast', Set<string>> = {
  screen: new Set(['active']),
  podcast: new Set(['confirmed']),
};

type ExtendUnit = 'minutes' | 'hours' | 'days';
const UNIT_MINUTES: Record<ExtendUnit, number> = { minutes: 1, hours: 60, days: 60 * 24 };

const TAB_VALUES = ['screen', 'podcast', 'calendar'] as const;

export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageContent() {
  const { toast } = useToast();
  const { currency, timezone, rates } = usePreferencesStore();
  const naira = (n: number) => formatCurrency(n, currency, rates);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState<'screen' | 'podcast' | 'calendar'>(
    (TAB_VALUES as readonly string[]).includes(tabParam || '') ? (tabParam as any) : 'screen'
  );
  // Keeps the URL in sync with the active tab so breadcrumbs, bookmarks, and
  // back/forward navigation reflect which booking type is actually showing.
  const setActiveTab = (tab: 'screen' | 'podcast' | 'calendar') => {
    setActiveTabState(tab);
    router.replace(`/bookings?tab=${tab}`, { scroll: false });
  };
  const [search, setSearch] = useState('');

  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [adBookings, setAdBookings] = useState<BookingRow[]>([]);
  const [podcastBookings, setPodcastBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [cancelTarget, setCancelTarget] = useState<{ id: string; info: string; type: 'ad' | 'podcast' } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessInfo, setCancelSuccessInfo] = useState<string | null>(null);

  // Extend
  const [extendTarget, setExtendTarget] = useState<{ id: string; info: string; type: 'ad' | 'podcast' } | null>(null);
  const [extendAmount, setExtendAmount] = useState('1');
  const [extendUnit, setExtendUnit] = useState<ExtendUnit>('hours');
  const [extending, setExtending] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState<{ info: string; cost: number } | null>(null);

  // Review
  const [reviewTarget, setReviewTarget] = useState<{ id: string; info: string; type: 'ad' | 'podcast' } | null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewRating, setReviewRating] = useState(4);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [adsRes, podcastRes] = await Promise.all([
        api.get('/bookings?limit=100').catch(() => ({ data: { bookings: [] } })),
        api.get('/podcasts/my-bookings').catch(() => ({ data: { bookings: [] } })),
      ]);

      setAdBookings((adsRes.data.bookings || []).map((b: any): BookingRow => ({
        id: b.id,
        booking_number: b.booking_number,
        info: b.creative_title || b.screen_name || 'Screen Ad Booking',
        start_time: b.start_time,
        end_time: b.end_time,
        billing: Number(b.total_cost) || 0,
        duration: formatDuration(b.start_time, b.end_time),
        status: b.status,
      })));

      setPodcastBookings((podcastRes.data.bookings || []).map((b: any): BookingRow => ({
        id: b.id,
        booking_number: b.booking_number,
        info: b.package_type ? `${b.package_type} podcast session` : 'Podcast studio session',
        start_time: b.start_time,
        end_time: b.end_time,
        billing: Number(b.total_cost) || 0,
        duration: b.duration_minutes ? `${b.duration_minutes} min` : formatDuration(b.start_time, b.end_time),
        status: b.status,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const rows = activeTab === 'podcast' ? podcastBookings : adBookings;
  const filteredRows = useMemo(() => {
    let result = rows;

    if (filterStatus !== 'all') {
      result = result.filter(r => {
        if (filterStatus === 'active') return r.status === 'active' || r.status === 'confirmed';
        if (filterStatus === 'pending') return r.status === 'pending' || r.status === 'pending_payment';
        if (filterStatus === 'completed') return r.status === 'completed' || r.status === 'ended';
        if (filterStatus === 'cancelled') return r.status === 'cancelled' || r.status === 'failed';
        return r.status === filterStatus;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(r =>
        r.info.toLowerCase().includes(q) ||
        (r.booking_number || '').toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [rows, search, filterStatus]);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const canReview = (b: BookingRow) => b.status !== 'cancelled' && new Date(b.end_time).getTime() <= Date.now();

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const url = cancelTarget.type === 'ad'
        ? `/bookings/${cancelTarget.id}/cancel`
        : `/podcasts/${cancelTarget.id}/cancel`;
      const res = await api.put(url, {});
      // Show the real refund outcome the backend actually computed
      // (whether the 48h window applied, exact amount credited) instead of
      // a generic "cancelled" message that leaves the user to go check
      // their wallet separately to find out what really happened.
      setCancelSuccessInfo(res.data?.message || cancelTarget.info);
      setCancelTarget(null);
      fetchBookings();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not cancel this booking. Please try again.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleExtend = async () => {
    if (!extendTarget) return;
    const amount = Number(extendAmount);
    if (!amount || amount <= 0) {
      toast('Please enter a valid amount of time', 'error');
      return;
    }
    const additionalMinutes = Math.round(amount * UNIT_MINUTES[extendUnit]);
    const url = extendTarget.type === 'ad'
      ? `/bookings/${extendTarget.id}/extend`
      : `/podcasts/${extendTarget.id}/extend`;

    setExtending(true);
    try {
      const res = await api.put(url, { additional_minutes: additionalMinutes });
      setExtendSuccess({ info: extendTarget.info, cost: res.data.additional_cost });
      setExtendTarget(null);
      fetchBookings();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not extend this booking. Please try again.', 'error');
    } finally {
      setExtending(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) return;
    if (!reviewBody.trim()) {
      toast('Please write a few words about your experience', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        booking_type: reviewTarget.type,
        booking_id: reviewTarget.id,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim(),
        rating: reviewRating,
      });
      setReviewTarget(null);
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(4);
      setReviewSuccess(true);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not submit your review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast('Nothing to export', 'error');
      return;
    }
    const header = ['Booking Number', 'Info', 'Start', 'End', 'Billing (NGN)', 'Duration', 'Status'];
    const csvRows = filteredRows.map(r => [
      r.booking_number, r.info, r.start_time, r.end_time, r.billing,
      r.duration, STATUS_LABEL[r.status]?.label || r.status,
    ]);
    const csv = [header, ...csvRows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab === 'podcast' ? 'podcast' : 'ad'}-bookings.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="font-body max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[16px] font-bold text-gray-900 dark:text-slate-50">My bookings</h1>
          </div>

          {/* Header & Tabs */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-[rgba(162,161,168,0.2)] dark:border-white/10 mb-8">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setActiveTab('screen')}
                  className={`flex items-center gap-2 pb-3 text-[17px] font-body transition-colors relative ${
                    activeTab === 'screen' ? 'text-[#D4AF37] font-semibold' : 'text-[#16151C] dark:text-slate-500 font-light'
                  }`}
                >
                  <Monitor size={20} />
                  Screen Ads
                  {activeTab === 'screen' && (
                    <div className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-[#D4AF37]" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('podcast')}
                  className={`flex items-center gap-2 pb-3 text-[17px] font-body transition-colors relative ${
                    activeTab === 'podcast' ? 'text-[#D4AF37] font-semibold' : 'text-[#16151C] dark:text-slate-500 font-light'
                  }`}
                >
                  <Mic size={20} />
                  Podcast studio
                  {activeTab === 'podcast' && (
                    <div className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-[#D4AF37]" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex items-center gap-2 pb-3 text-[17px] font-body transition-colors relative ${
                    activeTab === 'calendar' ? 'text-[#D4AF37] font-semibold' : 'text-[#16151C] dark:text-slate-500 font-light'
                  }`}
                >
                  <Calendar size={20} />
                  Calendar
                  {activeTab === 'calendar' && (
                    <div className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-[#D4AF37]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'calendar' ? (
            <BookingCalendar />
          ) : (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="font-body text-[21px] font-medium leading-[27px] tracking-[0.01em] text-[#2B2E48] dark:text-slate-50">
                  {activeTab === 'podcast' ? 'All podcast bookings' : 'All Ad bookings'}
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-[261px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 h-[50px] bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] font-light font-body text-gray-900 dark:text-slate-50 placeholder:text-[rgba(22,21,28,0.3)] focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative" ref={filterRef}>
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="flex items-center justify-center gap-2 px-[20px] h-[50px] bg-transparent border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[#16151C] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <Filter size={20} className="text-[#16151C] dark:text-slate-300" />
                      <span className="font-body font-light text-[16px]">Filter</span>
                    </button>

                    {showFilter && (
                      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#16151C]/20 backdrop-blur-[4px]">
                        <div className="bg-white rounded-[20px] p-[32px] flex flex-col w-[420px] shadow-2xl relative font-body animate-in fade-in zoom-in-95 duration-200">
                          
                          <h3 className="text-[20px] font-bold text-[#16151C] mb-[32px]">Filter</h3>
                          
                          {/* Search Input */}
                          <div className="relative mb-[32px]">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                             <input 
                               type="text" 
                               placeholder="Search Employee" 
                               className="w-full h-[50px] pl-11 pr-4 bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] text-gray-900 focus:outline-none focus:border-[#D4AF37] font-body font-light placeholder:text-[rgba(22,21,28,0.3)]" 
                             />
                          </div>

                          <h4 className="font-semibold text-[#16151C] mb-[20px] text-[16px]">
                            {activeTab === 'podcast' ? 'All podcast studio session bookings' : 'All Ad bookings'}
                          </h4>
                          
                          <div className="flex items-center gap-[40px] mb-[40px]">
                             <label className="flex items-center gap-[12px] cursor-pointer">
                                <div className="w-[20px] h-[20px] rounded-[4px] bg-[#D4AF37] flex items-center justify-center">
                                   <Check size={14} className="text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[#16151C] text-[16px] font-light">Status</span>
                             </label>
                             <label className="flex items-center gap-[12px] cursor-pointer">
                                <div className="w-[20px] h-[20px] rounded-[4px] border border-[rgba(162,161,168,0.5)] flex items-center justify-center bg-transparent">
                                </div>
                                <span className="text-[#16151C] text-[16px] font-light">By duration</span>
                             </label>
                          </div>

                          <div className="flex gap-[20px]">
                             <button 
                               onClick={() => setShowFilter(false)} 
                               className="flex-1 h-[48px] bg-transparent border-[1.5px] border-[#D4AF37] rounded-[6px] text-[#D4AF37] font-medium hover:bg-gray-50 transition-colors text-[14px]"
                             >
                                Cancel
                             </button>
                             <button 
                               onClick={() => setShowFilter(false)} 
                               className="flex-1 h-[48px] bg-[#D4AF37] rounded-[6px] text-[#16151C] font-medium hover:opacity-90 transition-opacity text-[14px]"
                             >
                                Apply
                             </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Export */}
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center w-[116px] h-[40px] bg-transparent border-[1.5px] border-[#D4AF37] rounded-[6px] text-[14px] font-normal text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                  >
                    Export
                  </button>

                  {/* Book Slot */}
                  <Link
                    href={activeTab === 'podcast' ? "/podcast/book" : "/book"}
                    className="flex items-center justify-center w-[139px] h-[40px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[14px] font-normal transition-colors"
                  >
                    {activeTab === 'podcast' ? 'Book Podcast Slot' : 'Book Ad Slot'}
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-[#111111] rounded-b-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-[#F1F3F4] dark:bg-white/5 h-[50px]">
                        {(activeTab === 'podcast'
                          ? ['Session info', 'Schedule', 'Billing (NGN)', 'Duration', 'Status', 'Action']
                          : ['Campaign info', 'Schedule', 'Billing (NGN)', 'Duration', 'Status', 'Action']
                        ).map((h) => (
                          <th key={h} className="text-left px-[14px] py-[8px] text-[14px] font-normal text-[#7D7D7D] dark:text-slate-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-[14px] py-16 text-center text-gray-400 dark:text-slate-500">
                            <Loader2 size={20} className="animate-spin inline-block mr-2" />
                            Loading bookings…
                          </td>
                        </tr>
                      ) : paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-[14px] py-16 text-center text-gray-400 dark:text-slate-500 text-[13px] font-medium">
                            {search
                              ? 'No bookings match your search.'
                              : activeTab === 'podcast'
                                ? "You haven't booked a podcast studio session yet."
                                : "You haven't booked any ad slots yet."}
                          </td>
                        </tr>
                      ) : paginatedRows.map((b) => {
                        const statusInfo = STATUS_LABEL[b.status] || { label: b.status, className: 'text-gray-500 dark:text-slate-400' };
                        const bookingType = activeTab === 'podcast' ? 'podcast' : 'ad';
                        const showCancel = CANCELLABLE_STATUSES[bookingType === 'podcast' ? 'podcast' : 'screen'].has(b.status);
                        const showExtend = EXTENDABLE_STATUSES[bookingType === 'podcast' ? 'podcast' : 'screen'].has(b.status)
                          && new Date(b.end_time).getTime() > Date.now();
                        const showReview = canReview(b);
                        return (
                          <tr key={b.id} className="h-[50px] border-b border-[#DCDCDD] dark:border-white/10 bg-white dark:bg-[#111111] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-[14px] text-[16px] font-normal text-[#2B2E48] dark:text-slate-50 tracking-[0.01em]">{b.info}</td>
                            <td className="px-[14px] text-[16px] font-normal text-[#2B2E48] dark:text-slate-50 tracking-[0.01em]">
                              <div className="flex items-center gap-3 whitespace-nowrap">
                                <span>{formatSchedule(b.start_time, timezone)}</span>
                                {(b.status === 'pending' || b.status === 'pending_payment') && (
                                  <button className="text-[14px] text-[#D4AF37] underline decoration-[#D4AF37] hover:opacity-80 transition-opacity">
                                    Reschedule
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-[14px] text-[16px] font-normal text-[#2B2E48] dark:text-slate-50 tracking-[0.01em]">{naira(b.billing)}</td>
                            <td className="px-[14px] text-[16px] font-normal text-[#2B2E48] dark:text-slate-50 tracking-[0.01em] whitespace-nowrap">{b.duration}</td>
                            <td className="px-[14px] text-[16px] font-normal text-[#2B2E48] dark:text-slate-50 tracking-[0.01em]">
                              {statusInfo.label}
                            </td>
                            <td className="px-[14px] text-[16px] font-normal tracking-[0.01em] whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                {showExtend && (
                                  <button
                                    onClick={() => { setExtendTarget({ id: b.id, info: b.info, type: bookingType }); setExtendAmount('1'); setExtendUnit('hours'); }}
                                    className="text-[#D4AF37] hover:opacity-80 transition-colors"
                                  >
                                    Extend
                                  </button>
                                )}
                                {showCancel && (
                                  <button
                                    onClick={() => setCancelTarget({ id: b.id, info: b.info, type: bookingType })}
                                    className="text-[#FF4E2B] hover:opacity-80 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                )}
                                {showReview && (
                                  <button
                                    onClick={() => { setReviewTarget({ id: b.id, info: b.info, type: bookingType }); setReviewTitle(''); setReviewBody(''); setReviewRating(4); }}
                                    className="text-[#7F77FF] hover:opacity-80 transition-colors"
                                  >
                                    Send a review
                                  </button>
                                )}
                                {b.status === 'cancelled' && (
                                  <Link
                                    href={activeTab === 'podcast' ? "/podcast/book" : "/book"}
                                    className="text-[#91C600] hover:opacity-80 transition-colors"
                                  >
                                    Book a slot
                                  </Link>
                                )}
                                {!showExtend && !showCancel && !showReview && b.status !== 'cancelled' && (
                                  <span className="text-gray-300 dark:text-slate-600">
                                    <MoreHorizontal size={18} />
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {!loading && (
                <div className="w-full mt-[20px] flex items-center justify-between">
                  <div className="flex items-center gap-[20px]">
                    <span className="text-[14px] font-light text-[#A2A1A8]">Showing</span>
                    <div className="relative">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {}}
                        className="appearance-none bg-white dark:bg-[#111111] w-[76px] h-[46px] border border-[rgba(162,161,168,0.2)] rounded-[10px] pl-[16px] pr-[32px] text-[14px] font-light text-[#16151C] dark:text-slate-50 focus:outline-none"
                      >
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#16151C] dark:text-slate-50 pointer-events-none">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-[14px] font-light text-[#A2A1A8]">
                    Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRows.length)} out of {filteredRows.length} records
                  </div>
                  
                  <div className="flex items-center gap-[5px]">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-[35px] h-[36px] flex items-center justify-center border border-[#D4AF37] rounded-[8px] text-[#D4AF37] disabled:opacity-40 transition-opacity"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-[35px] h-[36px] flex items-center justify-center rounded-[8px] text-[15px] font-light transition-colors ${
                              currentPage === page 
                                ? 'bg-[#D4AF37] text-white' 
                                : 'bg-transparent text-[#16151C] dark:text-slate-50 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      if (
                        (page === 2 && currentPage > 3) || 
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return <span key={page} className="px-1 text-gray-400">...</span>;
                      }
                      
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="w-[35px] h-[36px] flex items-center justify-center border border-[#D4AF37] rounded-[8px] text-[#D4AF37] disabled:opacity-40 transition-opacity"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cancel confirm modal */}
        {cancelTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px]">
            <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-[383px] h-[320px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <h3 className="absolute top-[36px] left-[20px] right-[20px] text-center text-[20px] font-semibold leading-[30px] text-[#16151C]">
                Are you sure you want to cancel this {cancelTarget.type === 'ad' ? 'Ad screen' : 'podcast session'}? Ad cancelled is non-refundable after 72hrs of booking. Read Studio Arella <span className="text-[#D4AF37]">terms & condition</span>
              </h3>
              
              <div className="absolute top-[221px] left-[20px] right-[20px] flex items-center justify-between">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelTarget(null)}
                  className="w-[166px] h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-transparent text-[#16151C] text-[16px] font-normal flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="w-[166px] h-[50px] rounded-[6px] bg-[#D4AF37] text-[#000000] text-[16px] font-normal flex items-center justify-center gap-2 transition-colors hover:bg-[#b58b24] disabled:opacity-60"
                >
                  {cancelling && <Loader2 size={16} className="animate-spin text-black" />}
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel success modal */}
        {cancelSuccessInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px]">
            <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-[383px] h-[433px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              
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
                Ads cancelled
              </h3>

              {/* Finish Button */}
              <button
                type="button"
                onClick={() => setCancelSuccessInfo(null)}
                className="absolute top-[307px] left-1/2 -translate-x-1/2 w-[166px] h-[50px] rounded-[6px] bg-[#D4AF37] text-[16px] font-normal text-[#000000] hover:bg-[#b58b24] transition-colors flex items-center justify-center"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* Extend modal */}
        {extendTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[440px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 pb-2">
                <button onClick={() => setExtendTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900 dark:text-slate-50">Extend booking</h2>
                <button onClick={() => setExtendTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8 pt-4 space-y-5">
                <p className="text-[12.5px] text-gray-500 dark:text-slate-400">{extendTarget.info}</p>

                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    value={extendAmount}
                    onChange={(e) => setExtendAmount(e.target.value)}
                    className="w-24 px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[12px] text-[14px] font-bold text-gray-900 dark:text-slate-50 text-center focus:outline-none focus:border-[#C69A2C]"
                  />
                  <select
                    value={extendUnit}
                    onChange={(e) => setExtendUnit(e.target.value as ExtendUnit)}
                    className="flex-1 px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[12px] text-[13px] font-bold text-gray-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>

                <p className="text-[11.5px] text-gray-400 dark:text-slate-500 leading-relaxed">
                  This adds time immediately after your current booking ends. You'll be charged from your wallet for the extra time — the exact cost is confirmed when you extend, based on your booking's real rate.
                </p>

                <button
                  onClick={handleExtend}
                  disabled={extending}
                  className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {extending && <Loader2 size={15} className="animate-spin" />}
                  {extending ? 'Extending…' : 'Extend & pay from wallet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extend success modal */}
        {extendSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px]">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-slate-50 mb-2">Booking extended</h3>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 mb-8">
                {extendSuccess.info} — {naira(extendSuccess.cost)} charged from your wallet.
              </p>
              <button
                type="button"
                onClick={() => setExtendSuccess(null)}
                className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* Review modal */}
        {reviewTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[420px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 pb-2">
                <button onClick={() => setReviewTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900 dark:text-slate-50">Send a review</h2>
                <button onClick={() => setReviewTarget(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-full transition-colors text-gray-900 dark:text-slate-50">
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-10 pt-4 space-y-5">
                <p className="text-[12.5px] text-gray-500 dark:text-slate-400">{reviewTarget.info}</p>

                <input
                  type="text"
                  placeholder="Title of your review (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[12px] text-[13px] font-medium text-gray-900 dark:text-slate-50 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors"
                />

                <textarea
                  placeholder="Type your review"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[12px] text-[13px] font-medium text-gray-900 dark:text-slate-50 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors resize-none"
                />

                <div>
                  <p className="text-[12px] font-semibold text-gray-800 dark:text-slate-200 mb-2.5 text-left">Rate your experience</p>
                  <div className="w-full border border-dashed border-gray-300 dark:border-white/20 rounded-[12px] py-6 flex flex-col items-center justify-center bg-white dark:bg-[#111111] transition-colors">
                    <div className="flex gap-2.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={22}
                            className={star <= reviewRating ? "fill-[#C69A2C] text-[#C69A2C]" : "text-[#C69A2C]/30"}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[12px] font-medium text-gray-700 dark:text-slate-200">
                      {['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][reviewRating - 1]}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[12px] transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submittingReview && <Loader2 size={14} className="animate-spin" />}
                    {submittingReview ? 'Sending…' : 'Send review'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review success modal */}
        {reviewSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
            <div className="bg-white dark:bg-[#111111] rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-slate-50 mb-8">We received your feedback</h3>
              <button
                onClick={() => setReviewSuccess(false)}
                className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
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
