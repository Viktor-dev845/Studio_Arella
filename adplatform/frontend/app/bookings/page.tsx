'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Monitor, Mic, X, Calendar, Loader2, Download, Star, ArrowLeft, Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import BookingCalendar from '@/components/calendar/BookingCalendar';

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

const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

function formatSchedule(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
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
  active:          { label: 'Active',    className: 'text-green-600' },
  confirmed:       { label: 'Confirmed', className: 'text-green-600' },
  pending_payment: { label: 'Pending',   className: 'text-gray-400' },
  pending:         { label: 'Pending',   className: 'text-gray-400' },
  completed:       { label: 'Ended',     className: 'text-gray-400' },
  ended:           { label: 'Ended',     className: 'text-gray-400' },
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
  const { toast } = useToast();
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

  const [adBookings, setAdBookings] = useState<BookingRow[]>([]);
  const [podcastBookings, setPodcastBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

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
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.info.toLowerCase().includes(q) ||
      (r.booking_number || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const canReview = (b: BookingRow) => b.status !== 'cancelled' && new Date(b.end_time).getTime() <= Date.now();

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const url = cancelTarget.type === 'ad'
        ? `/bookings/${cancelTarget.id}/cancel`
        : `/podcasts/${cancelTarget.id}/cancel`;
      await api.put(url, {});
      setCancelSuccessInfo(cancelTarget.info);
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
            <h1 className="text-[16px] font-bold text-gray-900">My bookings</h1>
          </div>

          {/* Header & Tabs */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 mb-8">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setActiveTab('screen')}
                  className={`flex items-center gap-2 pb-3 text-[13px] font-bold transition-colors relative ${
                    activeTab === 'screen' ? 'text-[#C69A2C]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Monitor size={16} />
                  Screen Ads
                  {activeTab === 'screen' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C69A2C] rounded-t-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('podcast')}
                  className={`flex items-center gap-2 pb-3 text-[13px] font-bold transition-colors relative ${
                    activeTab === 'podcast' ? 'text-[#C69A2C]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Mic size={16} />
                  Podcast studio
                  {activeTab === 'podcast' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C69A2C] rounded-t-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex items-center gap-2 pb-3 text-[13px] font-bold transition-colors relative ${
                    activeTab === 'calendar' ? 'text-[#C69A2C]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Calendar size={16} />
                  Calendar
                  {activeTab === 'calendar' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C69A2C] rounded-t-full" />
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
                <h2 className="text-sm font-bold text-gray-900">
                  {activeTab === 'podcast' ? 'All podcast bookings' : 'All Ad bookings'}
                </h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-colors"
                    />
                  </div>

                  {/* Export */}
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-[#C69A2C] rounded-lg text-xs font-bold text-[#C69A2C] hover:bg-[#C69A2C]/5 transition-colors"
                  >
                    <Download size={13} />
                    Export
                  </button>

                  {/* Book Ad Slot */}
                  <Link
                    href={activeTab === 'podcast' ? "/podcast/book" : "/book"}
                    className="flex items-center justify-center px-6 py-2.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                  >
                    {activeTab === 'podcast' ? 'Book Podcast Slot' : 'Book Ad Slot'}
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-white">
                        {(activeTab === 'podcast'
                          ? ['SESSION INFO', 'SCHEDULE', 'BILLING (NGN)', 'DURATION', 'STATUS', 'ACTION']
                          : ['CAMPAIGN INFO', 'SCHEDULE', 'BILLING (NGN)', 'DURATION', 'STATUS', 'ACTION']
                        ).map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                            <Loader2 size={20} className="animate-spin inline-block mr-2" />
                            Loading bookings…
                          </td>
                        </tr>
                      ) : filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                            {search
                              ? 'No bookings match your search.'
                              : activeTab === 'podcast'
                                ? "You haven't booked a podcast studio session yet."
                                : "You haven't booked any ad slots yet."}
                          </td>
                        </tr>
                      ) : filteredRows.map((b) => {
                        const statusInfo = STATUS_LABEL[b.status] || { label: b.status, className: 'text-gray-500' };
                        const bookingType = activeTab === 'podcast' ? 'podcast' : 'ad';
                        const showCancel = CANCELLABLE_STATUSES[bookingType === 'podcast' ? 'podcast' : 'screen'].has(b.status);
                        const showExtend = EXTENDABLE_STATUSES[bookingType === 'podcast' ? 'podcast' : 'screen'].has(b.status);
                        const showReview = canReview(b);
                        return (
                          <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{b.info}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-gray-500">{formatSchedule(b.start_time)}</td>
                            <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{naira(b.billing)}</td>
                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-500">{b.duration}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold ${statusInfo.className}`}>{statusInfo.label}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {showExtend && (
                                  <button
                                    onClick={() => { setExtendTarget({ id: b.id, info: b.info, type: bookingType }); setExtendAmount('1'); setExtendUnit('hours'); }}
                                    className="text-xs font-bold text-[#C69A2C] hover:text-[#b58b24] transition-colors"
                                  >
                                    Extend
                                  </button>
                                )}
                                {showCancel && (
                                  <button
                                    onClick={() => setCancelTarget({ id: b.id, info: b.info, type: bookingType })}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                )}
                                {showReview && (
                                  <button
                                    onClick={() => { setReviewTarget({ id: b.id, info: b.info, type: bookingType }); setReviewTitle(''); setReviewBody(''); setReviewRating(4); }}
                                    className="text-xs font-bold text-[#7C5DFA] hover:text-[#6a4de0] transition-colors"
                                  >
                                    Send a review
                                  </button>
                                )}
                                {!showExtend && !showCancel && !showReview && (
                                  <span className="text-xs text-gray-300">—</span>
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

              {/* Real count line (no fake pagination) */}
              {!loading && filteredRows.length > 0 && (
                <div className="mt-6 text-xs text-gray-500 font-medium">
                  Showing {filteredRows.length} of {rows.length} booking{rows.length === 1 ? '' : 's'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Cancel confirm modal */}
        {cancelTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                Cancel this booking?
              </h3>
              <p className="text-[12px] text-gray-500 mb-8">{cancelTarget.info}</p>
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 py-2.5 rounded-[12px] border border-gray-200 bg-white text-[13px] font-bold text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  No, keep it
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 size={14} className="animate-spin" /> : null}
                  Yes, cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel success modal */}
        {cancelSuccessInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <X size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Booking cancelled</h3>
              <p className="text-[12px] text-gray-500 mb-8">{cancelSuccessInfo}</p>
              <button
                type="button"
                onClick={() => setCancelSuccessInfo(null)}
                className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* Extend modal */}
        {extendTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[440px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 pb-2">
                <button onClick={() => setExtendTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">Extend booking</h2>
                <button onClick={() => setExtendTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8 pt-4 space-y-5">
                <p className="text-[12.5px] text-gray-500">{extendTarget.info}</p>

                <div className="flex gap-3">
                  <input
                    type="number"
                    min={1}
                    value={extendAmount}
                    onChange={(e) => setExtendAmount(e.target.value)}
                    className="w-24 px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[14px] font-bold text-gray-900 text-center focus:outline-none focus:border-[#C69A2C]"
                  />
                  <select
                    value={extendUnit}
                    onChange={(e) => setExtendUnit(e.target.value as ExtendUnit)}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#C69A2C]"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>

                <p className="text-[11.5px] text-gray-400 leading-relaxed">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">Booking extended</h3>
              <p className="text-[12px] text-gray-500 mb-8">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 pb-2">
                <button onClick={() => setReviewTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">Send a review</h2>
                <button onClick={() => setReviewTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900">
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-10 pt-4 space-y-5">
                <p className="text-[12.5px] text-gray-500">{reviewTarget.info}</p>

                <input
                  type="text"
                  placeholder="Title of your review (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-[12px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors"
                />

                <textarea
                  placeholder="Type your review"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-[12px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors resize-none"
                />

                <div>
                  <p className="text-[12px] font-semibold text-gray-800 mb-2.5 text-left">Rate your experience</p>
                  <div className="w-full border border-dashed border-gray-300 rounded-[12px] py-6 flex flex-col items-center justify-center bg-white transition-colors">
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
                    <p className="text-[12px] font-medium text-gray-700">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-8">We received your feedback</h3>
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
