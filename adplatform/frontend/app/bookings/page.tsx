'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Monitor, Mic, X, ArrowLeft, UploadCloud, Copy, Check, Star, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

// Mock data based on the screenshot provided
const mockBookings = [
  { id: 1, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Active', action: 'Extend' },
  { id: 2, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Cancel' },
  { id: 3, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '2 hours', status: 'Ended', action: 'Send a review' },
  { id: 4, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Cancelled', action: 'Book a slot' },
  { id: 5, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 6, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 7, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 8, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 9, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 10, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
];

const mockPodcastBookings = [
  { id: 101, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 hour', status: 'Active', action: 'Extend' },
  { id: 102, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Cancel' },
  { id: 103, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '2 hours', status: 'Ended', action: 'Send a review' },
  { id: 104, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 hour', status: 'Cancelled', action: 'Book a slot' },
  { id: 105, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
  { id: 106, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
  { id: 107, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
  { id: 108, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
  { id: 109, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
  { id: 110, info: 'Pop podcast studio session', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 hour', status: 'Pending', action: 'Extend' },
];

// ─── Calendar constants & mock data ───────────────────────────────────────────
const HOUR_HEIGHT = 88;
const CAL_START_HOUR = 6;
const CAL_END_HOUR = 12;
const CAL_HOURS = [6, 7, 8, 9, 10, 11];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_TASKS = [0, 1, 0, 1, 1, 2, 0];

interface CalendarEvent {
  id: string;
  timeDisplay: string;
  title: string;
  dateIndex: number; // 0 = Sun … 6 = Sat
  startHour: number;
  endHour: number;
  bgColor: string;
  type: 'ad' | 'podcast';
}

const mockCalendarEvents: CalendarEvent[] = [
  // Monday (dateIndex 1)
  { id: 'ce1', timeDisplay: '06:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 1, startHour: 6, endHour: 7, bgColor: '#46B6E6', type: 'podcast' },
  { id: 'ce2', timeDisplay: '12:00 PM', title: 'Ad campaign', dateIndex: 1, startHour: 9, endHour: 10, bgColor: '#CD4FE6', type: 'ad' },
  { id: 'ce3', timeDisplay: '06:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 1, startHour: 10, endHour: 11, bgColor: '#A92B2B', type: 'podcast' },

  // Tuesday (dateIndex 2)
  { id: 'ce4', timeDisplay: '01:00 PM', title: 'Ad campaign', dateIndex: 2, startHour: 8, endHour: 9, bgColor: '#89CFF0', type: 'ad' },
  { id: 'ce5', timeDisplay: '06:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 2, startHour: 11, endHour: 12, bgColor: '#F39C12', type: 'podcast' },

  // Wednesday (dateIndex 3)
  { id: 'ce6', timeDisplay: '01:00 PM', title: 'Ad campaign', dateIndex: 3, startHour: 7, endHour: 8, bgColor: '#CD4FE6', type: 'ad' },
  { id: 'ce7', timeDisplay: '12:00 PM', title: 'Ad campaign', dateIndex: 3, startHour: 10, endHour: 11, bgColor: '#EF6666', type: 'ad' },

  // Thursday (dateIndex 4)
  { id: 'ce8', timeDisplay: '12:00 PM', title: 'Ad campaign', dateIndex: 4, startHour: 6, endHour: 7, bgColor: '#A92B2B', type: 'ad' },
  { id: 'ce9', timeDisplay: '05:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 4, startHour: 8, endHour: 9, bgColor: '#13C78B', type: 'podcast' },

  // Friday (dateIndex 5)
  { id: 'ce10', timeDisplay: '06:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 5, startHour: 6, endHour: 7, bgColor: '#3475D6', type: 'podcast' },
  { id: 'ce11', timeDisplay: '06:00 AM - 07:00 PM', title: 'Pack & Move podcast\nstudio session', dateIndex: 5, startHour: 9, endHour: 10, bgColor: '#3475D6', type: 'podcast' },
  { id: 'ce12', timeDisplay: '12:00 PM', title: 'Ad campaign', dateIndex: 5, startHour: 11, endHour: 12, bgColor: '#46B6E6', type: 'ad' },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('screen');
  const [search, setSearch] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelSuccessOpen, setCancelSuccessOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendBy, setExtendBy] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [extendBillingModalOpen, setExtendBillingModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'billing' | 'pay_from_wallet' | 'pay_with_card' | 'success'>('billing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewSuccessOpen, setReviewSuccessOpen] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(4); // default to 4

  // Book Slot Modal State
  const [bookSlotModalOpen, setBookSlotModalOpen] = useState(false);
  const [bookDate, setBookDate] = useState('');
  const [bookFrom, setBookFrom] = useState('');
  const [bookTo, setBookTo] = useState('');
  const [bookSlots, setBookSlots] = useState('');

  // Filter Modal State
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(true);
  const [filterDuration, setFilterDuration] = useState(false);
  const [filterByAds, setFilterByAds] = useState(true);
  const [filterByPodcast, setFilterByPodcast] = useState(false);

  // ─── Calendar state ───────────────────────────────────────────────────────
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 10)); // Aug 10 2026

  // Calendar helpers
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // snap to Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const formatWeekRange = (date: Date) => {
    const dates = getWeekDates(date);
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const s = dates[0], e = dates[6];
    return `${s.getDate()} ${m[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${m[e.getMonth()]} ${e.getFullYear()}`;
  };

  const fmtHour = (h: number) => {
    if (h === 0) return '12:00 AM';
    if (h === 12) return '12:00 PM';
    return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
  };

  const weekDates = getWeekDates(currentDate);
  const eventsForDay = (dayIdx: number) => {
    return mockCalendarEvents.filter(e => {
      if (e.dateIndex !== dayIdx) return false;
      if (filterByAds && !filterByPodcast) return true; // default in screenshot
      if (!filterByAds && filterByPodcast) return e.type === 'podcast';
      return true;
    });
  };
  const goToToday  = () => setCurrentDate(new Date());
  const goToPrev   = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const goToNext   = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="font-body max-w-7xl mx-auto">
          {/* Page Title & Date Filter */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[16px] font-bold text-gray-900">My bookings</h1>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              <span>Today</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
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

              {/* Filter Button for Calendar tab */}
              {activeTab === 'calendar' && (
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors mb-3"
                >
                  <Filter size={14} />
                  Filter
                </button>
              )}
            </div>
          </div>

          {activeTab === 'calendar' ? (
            <>
              {/* ── Calendar toolbar ─────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                {/* Navigation */}
                <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={goToToday}
                    className="px-6 py-2.5 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToPrev}
                    className="px-6 py-2.5 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={goToNext}
                    className="px-6 py-2.5 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>

                {/* Date range */}
                <span className="text-[14px] font-bold text-gray-900">{formatWeekRange(currentDate)}</span>

                {/* View toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {(['Month', 'Week', 'Day'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v.toLowerCase() as 'month' | 'week' | 'day')}
                      className={`px-6 py-2.5 text-[13px] font-bold transition-colors ${
                        calendarView === v.toLowerCase()
                          ? 'bg-[#C69A2C] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } ${v !== 'Day' ? 'border-r border-gray-200' : ''}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Calendar grid (week view) ─────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Day column headers */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}>
                  <div className="py-4 border-r border-gray-100" />
                  {weekDates.map((date, i) => {
                    return (
                      <div key={i} className="py-4 px-2 text-center border-r border-gray-100 last:border-r-0">
                        <p className="text-[12px] font-semibold text-gray-900 mb-0.5">
                          {DAY_NAMES[i]} {String(date.getMonth()+1).padStart(2,'0')}/{String(date.getDate()).padStart(2,'0')}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">{DAY_TASKS[i]} Task(s)</p>
                      </div>
                    );
                  })}
                </div>

                {/* Scrollable time grid */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  <div className="grid" style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}>

                    {/* Time labels */}
                    <div>
                      {CAL_HOURS.map(h => (
                        <div
                          key={h}
                          style={{ height: HOUR_HEIGHT }}
                          className="border-b border-gray-100 border-r border-gray-100 flex items-center justify-center px-2"
                        >
                          <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
                            {fmtHour(h)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* One column per day */}
                    {weekDates.map((_, dayIdx) => (
                      <div key={dayIdx} className="relative border-r border-gray-100 last:border-r-0">
                        {/* Hour row backgrounds */}
                        {CAL_HOURS.map(h => (
                          <div
                            key={h}
                            style={{ height: HOUR_HEIGHT }}
                            className="border-b border-gray-100"
                          />
                        ))}

                        {/* Booking event blocks */}
                        {eventsForDay(dayIdx).map(evt => (
                          <div
                            key={evt.id}
                            style={{
                              position: 'absolute',
                              top: (evt.startHour - CAL_START_HOUR) * HOUR_HEIGHT + 4,
                              height: HOUR_HEIGHT - 8,
                              left: 4,
                              right: 4,
                              backgroundColor: evt.bgColor,
                              borderRadius: 4,
                            }}
                            className="px-2 py-2 flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                          >
                            <p className="text-[10px] font-bold text-white leading-tight">
                              {evt.timeDisplay}
                            </p>
                            <p className="text-[10px] font-medium text-white leading-tight mt-1 whitespace-pre-line">
                              {evt.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
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

                  {/* Filter */}
                  <button 
                    onClick={() => setFilterModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Filter size={14} className="text-gray-600" />
                    Filter
                  </button>

                  {/* Export */}
                  <button className="px-5 py-2.5 bg-white border border-[#C69A2C] rounded-lg text-xs font-bold text-[#C69A2C] hover:bg-[#C69A2C]/5 transition-colors">
                    Export
                  </button>

                  {/* Book Ad Slot */}
                  <Link
                    href={activeTab === 'podcast' ? "/podcast/new" : "/bookings/screen-ad"}
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
                      {(activeTab === 'podcast' ? mockPodcastBookings : mockBookings).map((b, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{b.info}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                            <div className="flex items-center gap-2">
                              {b.date}
                              {b.reschedule && <span className="text-[10px] text-[#C69A2C] font-bold italic">Reschedule</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{b.billing}</td>
                          <td className="px-6 py-4 text-[13px] font-semibold text-gray-500">{b.duration}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold ${
                              b.status === 'Active'    ? 'text-green-600' :
                              b.status === 'Pending'   ? 'text-gray-400'  :
                              b.status === 'Ended'     ? 'text-gray-400'  :
                              b.status === 'Cancelled' ? 'text-gray-400'  : 'text-gray-500'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                if (b.action === 'Cancel') {
                                   setSelectedAdId(b.id); setCancelModalOpen(true);
                                } else if (b.action === 'Extend') {
                                   setSelectedAdId(b.id); setExtendModalOpen(true);
                                } else if (b.action === 'Send a review') {
                                   setSelectedAdId(b.id); setReviewModalOpen(true);
                                } else if (b.action === 'Book a slot') {
                                   setSelectedAdId(b.id); setBookSlotModalOpen(true);
                                }
                              }}
                              className={`text-xs font-bold transition-colors ${
                                b.action === 'Extend'        ? 'text-[#C69A2C] hover:text-[#b58b24]' :
                                b.action === 'Cancel'        ? 'text-red-500 hover:text-red-600'    :
                                b.action === 'Send a review' ? 'text-[#7C5DFA] hover:text-[#6a4de0]' :
                                b.action === 'Book a slot'   ? 'text-green-600 hover:text-green-700': 'text-gray-600'
                              }`}
                            >
                              {b.action}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table Pagination Bar (Screenshot 4) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-gray-500 font-semibold">
                {/* Left: Showing 10 */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Showing</span>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                    <span>10</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>

                {/* Center: Record counts */}
                <div className="text-gray-500 text-xs font-medium">
                  Showing 1 to 10 out of 60 records
                </div>

                {/* Right: Pages */}
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="w-7 h-7 rounded border border-[#C69A2C] bg-white text-[#C69A2C] font-bold flex items-center justify-center text-xs shadow-sm">
                    1
                  </button>
                  <button className="w-7 h-7 rounded text-gray-600 hover:bg-gray-100 font-semibold flex items-center justify-center text-xs transition-colors">
                    2
                  </button>
                  <button className="w-7 h-7 rounded text-gray-600 hover:bg-gray-100 font-semibold flex items-center justify-center text-xs transition-colors">
                    3
                  </button>
                  <button className="w-7 h-7 rounded text-gray-600 hover:bg-gray-100 font-semibold flex items-center justify-center text-xs transition-colors">
                    4
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter Modal */}
        {filterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-[15px] font-bold text-gray-900">
                  Filter
                </h2>
                <button 
                  onClick={() => setFilterModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-8">
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Employee"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 transition-colors"
                  />
                </div>

                {activeTab === 'calendar' ? (
                  <div className="mb-8">
                    <p className="text-[12px] font-bold text-gray-900 mb-4">All Calendar bookings</p>
                    <div className="flex items-center gap-6">
                      {/* By Ads bookings */}
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filterByAds ? 'bg-[#C69A2C] border-[#C69A2C]' : 'bg-white border-gray-300 group-hover:border-[#C69A2C]'}`}>
                          {filterByAds && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <input type="checkbox" checked={filterByAds} onChange={() => setFilterByAds(!filterByAds)} className="hidden" />
                        <span className="text-[12px] font-semibold text-gray-700">By Ads bookings</span>
                      </label>

                      {/* By podcast studio session */}
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filterByPodcast ? 'bg-[#C69A2C] border-[#C69A2C]' : 'bg-white border-gray-300 group-hover:border-[#C69A2C]'}`}>
                          {filterByPodcast && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <input type="checkbox" checked={filterByPodcast} onChange={() => setFilterByPodcast(!filterByPodcast)} className="hidden" />
                        <span className="text-[12px] font-semibold text-gray-700">By podcast studio session</span>
                      </label>
                    </div>

                    {/* Centered Apply button (Screenshot 4) */}
                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={() => setFilterModalOpen(false)}
                        className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <p className="text-[12px] font-bold text-gray-900 mb-4">
                        {activeTab === 'podcast' ? 'All podcast studio session bookings' : 'All Ad bookings'}
                      </p>
                      <div className="flex items-center gap-8">
                        {/* Status Checkbox */}
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filterStatus ? 'bg-[#C69A2C] border-[#C69A2C]' : 'bg-white border-gray-300 group-hover:border-[#C69A2C]'}`}>
                            {filterStatus && <Check size={12} className="text-white" strokeWidth={4} />}
                          </div>
                          <input type="checkbox" checked={filterStatus} onChange={() => setFilterStatus(!filterStatus)} className="hidden" />
                          <span className="text-[12px] font-semibold text-gray-700">Status</span>
                        </label>

                        {/* Duration Checkbox */}
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filterDuration ? 'bg-[#C69A2C] border-[#C69A2C]' : 'bg-white border-gray-300 group-hover:border-[#C69A2C]'}`}>
                            {filterDuration && <Check size={12} className="text-white" strokeWidth={4} />}
                          </div>
                          <input type="checkbox" checked={filterDuration} onChange={() => setFilterDuration(!filterDuration)} className="hidden" />
                          <span className="text-[12px] font-semibold text-gray-700">By duration</span>
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFilterModalOpen(false)}
                        className="flex-1 py-3.5 rounded-[12px] border border-gray-200 bg-white text-[13px] font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setFilterModalOpen(false)}
                        className="flex-1 py-3.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal (Screenshot 3 for podcast, Screen Ads for ad) */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-[15px] font-bold text-gray-900 mb-8 leading-snug">
                {activeTab === 'podcast' 
                  ? 'Are you sure you want to cancel this studio session?' 
                  : 'Are you sure you want to cancel this Ad?'}
              </h3>
              <div className="flex items-center justify-center gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-[12px] border border-gray-200 bg-white text-[13px] font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelSuccessOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Success Modal (Screenshot 2 for podcast, Screenshot 5 for screen ads) */}
        {cancelSuccessOpen && (() => {
          const isPodcast = activeTab === 'podcast';
          const selectedBooking = (isPodcast ? mockPodcastBookings : mockBookings).find(b => b.id === selectedAdId);
          const cancelledName = selectedBooking ? selectedBooking.info.split(' ')[0] : 'Monnify';
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
              <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
                <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                  <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                  <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                    {isPodcast ? (
                      <X size={28} className="text-white" strokeWidth={3} />
                    ) : (
                      <Check size={28} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-8">
                  {isPodcast ? 'Studio session cancelled' : `${cancelledName} Ad cancelled`}
                </h3>
                <button 
                  type="button"
                  onClick={() => setCancelSuccessOpen(false)}
                  className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
                >
                  Finish
                </button>
              </div>
            </div>
          );
        })()}

        {/* Extend Ad Booking Modal */}
        {extendModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-2">
                <button 
                  onClick={() => setExtendModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  Extend Ad Booking
                </h2>
                <button 
                  onClick={() => setExtendModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-10 pt-6 space-y-6">
                {/* Extend By Input */}
                <input
                  type="text"
                  placeholder="Extend by? (e.g 2 hours, 2 weeks, 2 months)"
                  value={extendBy}
                  onChange={(e) => setExtendBy(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                />

                {/* Additional Info Textarea */}
                <textarea
                  placeholder="Add any additional info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-5 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors resize-none"
                />

                {/* Upload section */}
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 mb-3 text-left">Or upload additional Ads materials</p>
                  <div className="w-full border-2 border-dashed border-[#C69A2C]/30 bg-[#FFFDF0] rounded-[16px] py-10 px-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FFF9E6] transition-colors">
                    <div className="w-12 h-12 bg-[#C69A2C]/15 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <UploadCloud size={20} className="text-[#C69A2C]" />
                    </div>
                    <p className="text-[13px] font-bold text-gray-800 mb-1.5">Drag & Drop or choose file to upload</p>
                    <p className="text-[11px] font-semibold text-gray-400">Supported formats : jpeg, png, pdf</p>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setExtendModalOpen(false);
                      setExtendBillingModalOpen(true);
                      setModalStep('billing');
                      setPaymentMethod('wallet');
                    }}
                    className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Extend Ad space
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extend Billing Modal */}
        {extendBillingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[460px] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
                <button 
                  onClick={() => {
                    if (modalStep === 'pay_from_wallet' || modalStep === 'pay_with_card' || modalStep === 'success') {
                      setModalStep('billing');
                    } else {
                      setExtendBillingModalOpen(false);
                      setModalStep('billing');
                    }
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  {modalStep === 'billing' ? 'Billing' : paymentMethod === 'card' ? 'Pay with card' : 'Pay from wallet'}
                </h2>
                <button 
                  onClick={() => {
                    setExtendBillingModalOpen(false);
                    setModalStep('billing');
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              {modalStep === 'billing' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="text-center mb-10">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">{extendBy || '3 months'} Ad space</h3>
                    <p className="text-[14px] font-bold text-gray-900">extension at #300,000</p>
                  </div>

                  <div className="space-y-6">
                    {/* Pay with card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center gap-4 px-6 py-7 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'card' ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#C69A2C]' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#C69A2C]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">Pay with card</span>
                    </div>

                    {/* Pay from wallet */}
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col gap-2 px-6 py-6 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'wallet' ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#C69A2C]' : 'border-gray-300'}`}>
                            {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-[#C69A2C]" />}
                          </div>
                          <span className="text-[13px] font-bold text-gray-900">Pay from wallet</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#C69A2C] hover:underline">Fund wallet</span>
                      </div>
                      
                      <div className="flex items-center justify-between pl-8 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-gray-500">Wallet ID: 23cvo_23759ryi</span>
                          <button className="flex items-center gap-1 text-[10px] font-bold text-[#C69A2C] hover:underline">
                            Copy <Copy size={10} />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900">NGN 5,215,005.25</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-10">
                    <button 
                      onClick={() => {
                        if (paymentMethod === 'wallet') {
                          setModalStep('pay_from_wallet');
                        } else if (paymentMethod === 'card') {
                          setModalStep('pay_with_card');
                        }
                      }}
                      className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_with_card' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="text-center mb-10">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">{extendBy || '3 months'} Ad space</h3>
                    <p className="text-[14px] font-bold text-gray-900">extension at #300,000</p>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="Card holder's name" className="w-full px-5 py-5 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#C69A2C] placeholder-gray-400" />
                    <div className="relative">
                      <input type="text" placeholder="Card number" className="w-full px-5 py-5 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#C69A2C] placeholder-gray-400" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <div className="w-[24px] h-[14px] bg-[#1434CB] rounded-[2px] text-[7px] font-bold flex items-center justify-center text-white italic tracking-tighter">VISA</div>
                        <div className="w-[24px] h-[14px] flex items-center justify-center relative">
                          <div className="w-[12px] h-[12px] rounded-full bg-[#EB001B] absolute left-0 mix-blend-multiply opacity-90"></div>
                          <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-0 mix-blend-multiply opacity-90"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Expiry date (MM/YY)" className="w-1/2 px-5 py-5 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#C69A2C] placeholder-gray-400" />
                      <input type="text" placeholder="CVV" className="w-1/2 px-5 py-5 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#C69A2C] placeholder-gray-400" />
                    </div>
                  </div>
                  <div className="mt-10">
                    <button 
                      onClick={() => setModalStep('success')}
                      className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_from_wallet' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="flex items-center justify-between px-6 py-10 rounded-[16px] border-[1.5px] border-[#C69A2C] bg-white shadow-sm mb-8">
                    <span className="text-[13px] font-bold text-gray-900">Total amount</span>
                    <span className="text-[13px] font-bold text-gray-900">NGN 300,000.25</span>
                  </div>
                  <button 
                    onClick={() => setModalStep('success')}
                    className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Pay
                  </button>
                </div>
              ) : (
                <div className="px-10 pb-12 pt-14 flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                    <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                    <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                      <Check size={28} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-8">Payment successful</h3>
                  <button 
                    onClick={() => {
                      setExtendBillingModalOpen(false);
                      setModalStep('billing');
                      setExtendBy('');
                      setAdditionalInfo('');
                    }}
                    className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Modal (Screenshot 1) */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[420px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-2">
                <button 
                  onClick={() => setReviewModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  Send a review
                </h2>
                <button 
                  onClick={() => setReviewModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-10 pt-4 space-y-5">
                <input
                  type="text"
                  placeholder="Title of your review"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-[12px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors"
                />

                <textarea
                  placeholder="Type your review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-[12px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors resize-none"
                />

                <div>
                  <p className="text-[12px] font-semibold text-gray-800 mb-2.5 text-left">Rate our service</p>
                  <div className="w-full border border-dashed border-gray-300 rounded-[12px] py-6 flex flex-col items-center justify-center bg-white transition-colors">
                    <div className="flex gap-2.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star 
                            size={22} 
                            className={star <= rating ? "fill-[#C69A2C] text-[#C69A2C]" : "text-[#C69A2C]/30"} 
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-[12px] font-medium text-gray-700">
                      {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setReviewModalOpen(false);
                      setReviewTitle('');
                      setReviewText('');
                      setRating(4);
                      setReviewSuccessOpen(true);
                    }}
                    className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
                  >
                    Send review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Success Modal (Screenshot 3) */}
        {reviewSuccessOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[24px] pt-10 pb-8 px-8 max-w-[360px] w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="relative flex items-center justify-center w-36 h-36 mb-3">
                <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-8">
                We received your feedback
              </h3>
              <button 
                onClick={() => setReviewSuccessOpen(false)}
                className="w-[140px] py-2.5 rounded-[12px] bg-[#C69A2C] hover:bg-[#b58b24] text-[13px] font-bold text-white transition-colors shadow-sm"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* Book a Slot Modal */}
        {bookSlotModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-2">
                <button 
                  onClick={() => setBookSlotModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  Book a slot
                </h2>
                <button 
                  onClick={() => setBookSlotModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-10 pb-12 pt-6 space-y-6">
                <p className="text-[13px] font-bold text-gray-900">
                  Please provide the details below
                </p>

                {/* Info Card */}
                <div className="bg-[#F8FAFC] rounded-[16px] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-gray-500">Location</span>
                    <span className="text-[13px] font-bold text-gray-900">Lekki toll gate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-gray-500">Size</span>
                    <span className="text-[13px] font-bold text-gray-900">20m by 10m</span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select Dates"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-[#C69A2C] focus:ring-0 transition-colors"
                  />
                  <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-900">From</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={bookFrom}
                      onChange={(e) => setBookFrom(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-[#C69A2C] focus:ring-0 transition-colors"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-900">To</label>
                    <input
                      type="text"
                      placeholder="05:00 PM"
                      value={bookTo}
                      onChange={(e) => setBookTo(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-[#C69A2C] focus:ring-0 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Number of slots"
                      value={bookSlots}
                      onChange={(e) => setBookSlots(e.target.value)}
                      className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-[#C69A2C] focus:ring-0 transition-colors"
                    />
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-[11px] font-medium text-gray-500 leading-tight pr-4">
                    Number of slots are the number of intervals you'd like your ads to be displayed per loop.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setBookSlotModalOpen(false);
                    }}
                    className="w-full py-4 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Proceed to add creative
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
