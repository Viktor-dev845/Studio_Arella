'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, ChevronRight, Settings2, Search, Check, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import api from '@/lib/api';
import RequestCreativeServiceModal from '@/components/ui/RequestCreativeServiceModal';

const F = 'var(--font-dm-sans)';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api').replace('/api', '');

function fullUrl(url: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function formatRelative(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}hr${hrs !== 1 ? 's' : ''}`;
  const days = Math.round(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function slotStatus(b: any): { label: string; status: 'Live' | 'In review' | 'Ended' | 'Cancelled'; statusColor: string } {
  const now = Date.now();
  const start = new Date(b.start_time).getTime();
  const end = new Date(b.end_time).getTime();

  if (b.status === 'cancelled') return { label: 'Cancelled', status: 'Cancelled', statusColor: 'text-gray-400' };
  if (b.status === 'pending_payment' || b.status === 'pending') return { label: 'Goes live in 24hrs', status: 'In review', statusColor: 'text-[#D4AF37]' };
  if (end <= now) return { label: 'Ended', status: 'Ended', statusColor: 'text-gray-400' };
  if (start > now) return { label: `Goes live in ${formatRelative(start - now)}`, status: 'In review', statusColor: 'text-[#D4AF37]' };
  return { label: `Ends in ${formatRelative(end - now)}`, status: 'Live', statusColor: 'text-[#88D437]' };
}

export default function AdsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ live: true, inReview: true, ended: true });
  const [showCreativeModal, setShowCreativeModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get('/bookings?limit=100')
      .then(res => {
        if (isMounted) setBookings(res.data.bookings || []);
      })
      .catch(() => {
        if (isMounted) setBookings([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Compute real KPIs from database
  const kpis = useMemo(() => {
    const totalCreatives = bookings.filter(b => b.creative_url || b.creative_title).length;
    const liveAds = bookings.filter(b => {
      const s = slotStatus(b);
      return s.status === 'Live';
    }).length;
    const inReview = bookings.filter(b => {
      const s = slotStatus(b);
      return s.status === 'In review';
    }).length;
    const ended = bookings.filter(b => {
      const s = slotStatus(b);
      return s.status === 'Ended';
    }).length;

    return [
      { title: "Total Creatives", count: totalCreatives, sub: "Video & Image asset", bg: "bg-[#FBFFF0]" },
      { title: "Live Ads", count: liveAds, bg: "bg-[#FFFAEA]" },
      { title: "In Review", count: inReview, bg: "bg-[#FBFFF0]" },
      { title: "Verified / Completed", count: ended, bg: "bg-[#FFFAEA]" }
    ];
  }, [bookings]);

  // Filter bookings
  const filteredAds = useMemo(() => {
    return bookings.filter(b => {
      const { status } = slotStatus(b);
      if (status === 'Live' && !filters.live) return false;
      if (status === 'In review' && !filters.inReview) return false;
      if (status === 'Ended' && !filters.ended) return false;
      if (status === 'Cancelled' && !filters.ended) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (b.creative_title || '').toLowerCase().includes(q);
        const numMatch = (b.booking_number || '').toLowerCase().includes(q);
        if (!titleMatch && !numMatch) return false;
      }
      return true;
    });
  }, [bookings, filters, searchQuery]);

  // Upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter(b => b.status === 'active' || new Date(b.end_time).getTime() > now)
      .slice(0, 3)
      .map(b => {
        const d = new Date(b.start_time);
        const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '14:00';
        const s = slotStatus(b);
        const border = s.status === 'Live' ? '#50C099' : s.status === 'In review' ? '#FFC565' : '#5DAAEE';
        return {
          title: b.creative_title || 'Screen Ad',
          time: timeStr,
          border,
        };
      });
  }, [bookings]);

  const todayStr = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', weekday: 'short' }).format(new Date());

  return (
    <DashboardLayout>
      <div className="flex h-full w-full bg-[#FFFFFF]" style={{ fontFamily: F }}>
        {/* Left Column (Main Content) */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto pt-[32px]">
          
          {/* KPI Row */}
          <div className="flex gap-[28px] px-8 mb-12 flex-wrap sm:flex-nowrap">
            {kpis.map((kpi, idx) => (
              <div key={idx} className={`flex-1 min-w-[180px] h-[112px] rounded-[20px] p-[24px] flex flex-col justify-center ${kpi.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[24px] font-semibold text-[#1C1C1C] leading-[36px]">
                    {loading ? '—' : kpi.count}
                  </span>
                  {kpi.sub && (
                    <span className="text-[12px] text-black leading-[16px] max-w-[50px]">{kpi.sub}</span>
                  )}
                </div>
                <p className="text-[14px] text-black leading-[20px]">{kpi.title}</p>
              </div>
            ))}
          </div>

          {/* Actions Row */}
          <div className="flex justify-between items-center px-8 mb-6">
            <h2 className="text-[18px] font-bold text-black">My Ads</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowFilter(true)} 
                className="h-[40px] px-4 flex items-center gap-2 border border-[rgba(162,161,168,0.2)] rounded-[8px] text-[14px] text-[#16151C] hover:bg-slate-50 transition-colors font-medium cursor-pointer"
              >
                <Settings2 size={16} strokeWidth={1.5} />
                Filter
              </button>
              <Link 
                href="/bookings?tab=screen"
                className="h-[40px] px-6 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-semibold rounded-[6px] text-[14px] transition-colors flex items-center justify-center text-decoration-none"
              >
                Book Ad Slot
              </Link>
            </div>
          </div>

          {/* Ads Grid */}
          <div className="px-8 pb-12 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span>Loading your ads...</span>
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-[16px] p-12 text-center flex flex-col items-center justify-center max-w-[600px] mx-auto my-8">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                  <Film size={26} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#1C1C1C] mb-1">No ads found</h3>
                <p className="text-[13px] text-gray-500 mb-5 max-w-[380px]">
                  {bookings.length === 0 
                    ? "You haven't booked any screen ads yet. Choose a prime screen location and book your first slot today."
                    : "No ads match your current filter criteria."}
                </p>
                <Link
                  href="/bookings?tab=screen"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-semibold text-[13px] rounded-[8px] text-decoration-none transition-colors"
                >
                  Book Ad Slot
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-[28px]">
                {filteredAds.map((b) => {
                  const s = slotStatus(b);
                  const isVideo = b.file_type?.startsWith('video') || b.creative_url?.endsWith('.mp4');
                  const mediaUrl = fullUrl(b.creative_url);

                  return (
                    <Link href={`/my-ads/${b.id}`} key={b.id} className="flex flex-col w-[154px] cursor-pointer hover:opacity-90 transition-opacity text-decoration-none">
                      <div className="w-[154px] h-[154px] bg-slate-100 rounded-[8px] mb-3 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                        {mediaUrl ? (
                          isVideo ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={mediaUrl} alt={b.creative_title || 'Ad'} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.background = '#F1F3F4'; }} />
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                            <ImageIcon size={28} />
                            <span className="text-[10px]">No Creative</span>
                          </div>
                        )}
                        <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          {b.booking_number || 'AD'}
                        </span>
                      </div>
                      <h3 className="text-[15px] text-[#000000] font-semibold leading-[20px] mb-1 truncate">{b.creative_title || 'Screen Ad'}</h3>
                      <p className="text-[12px] text-black/50 leading-[16px] mb-1 truncate">{s.label}</p>
                      <span className={`text-[12px] ${s.statusColor} font-semibold leading-[16px]`}>{s.status}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] shrink-0 border-l border-[rgba(0,0,0,0.1)] pt-2 pb-6 px-4 relative flex flex-col bg-[#FFFFFF] hidden xl:flex overflow-x-hidden">
          
          {/* Request Creative Service Button */}
          <button 
            onClick={() => setShowCreativeModal(true)}
            className="w-full h-[37px] bg-[#F5F1E8] hover:bg-[#ebe5d5] rounded-[6px] flex items-center justify-center text-[15px] font-semibold text-[#121212] mb-4 mt-[7px] transition-colors cursor-pointer"
          >
            Request creative service
          </button>

          {/* Promo Banner */}
          <div className="w-full h-[181px] bg-[#524007] rounded-[15px] p-[16px] relative overflow-hidden mb-6">
            <p className="text-[#FFFFFF] text-[12.5px] leading-[16px] w-[184px] z-10 relative font-medium">
              You got a billboard discount on your next billboard Ad patronage
            </p>
            <p className="text-[#D5E0ED] text-[8px] leading-[12px] font-normal w-[130px] mt-[10px] z-10 relative">
              Get 10% off our standard Ad rate when you book a digital screen slot for 1 week and above.
            </p>
            <Link 
              href="/bookings?tab=screen"
              className="bg-[#FBFF79] shadow-[0_0_7px_rgba(251,255,121,0.32)] rounded-[6px] px-[14px] py-[6px] mt-[14px] text-[#051235] text-[9.5px] font-bold uppercase tracking-wide z-10 relative inline-block text-decoration-none"
            >
              Book Ad space
            </Link>
            
            {/* Billboard icon mockup */}
            <div className="absolute -right-2 top-[55%] -translate-y-1/2 w-[84px] h-[105px] bg-white/70 backdrop-blur-md border-[1.5px] border-white rounded-[9px] transform rotate-[12deg] shadow-[-10px_10px_47px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col z-0">
              <div className="w-full h-[30px] bg-slate-900 border-b border-white flex items-center justify-center">
                <div className="w-1/2 h-[10px] bg-[#D4AF37] rounded"></div>
              </div>
              <div className="p-2 flex flex-col gap-1.5 flex-1 bg-gradient-to-b from-white to-slate-200">
                <div className="w-full h-1.5 bg-slate-400 rounded-sm"></div>
                <div className="w-4/5 h-1.5 bg-slate-300 rounded-sm"></div>
                <div className="w-3/5 h-1.5 bg-slate-300 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div>
            <h3 className="text-[14px] font-bold text-black mb-[16px]">Recent Ad Booking Calendar</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[#7D7D7D] text-[13px] font-medium">{todayStr}</span>
                <span className="bg-[#2B2E48] text-white text-[9.5px] font-bold px-[7px] py-[2px] rounded-full">TODAY</span>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6 px-3 bg-gray-50 rounded-[8px] border border-gray-100">
                  <p className="text-[12px] text-gray-500 m-0">No active bookings today</p>
                </div>
              ) : (
                upcomingEvents.map((ev, i) => (
                  <div key={i} className="relative border border-[#DCDCDD] rounded-[6px] py-[10px] px-[15px] overflow-hidden bg-white">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: ev.border }}></div>
                    <p className="text-[13px] font-semibold text-black mb-1 leading-[18px] truncate">{ev.title}</p>
                    <p className="text-[11px] text-black/50 leading-[14px] m-0">{ev.time}</p>
                  </div>
                ))
              )}
            </div>

            <Link 
              href="/bookings?tab=calendar" 
              className="mt-6 w-full text-center text-[#D6A028] text-[13px] font-bold flex items-center justify-center gap-1 hover:opacity-80 transition-opacity text-decoration-none"
            >
              See full calendar <ChevronRight size={14} />
            </Link>
          </div>

          {/* Floating Chat Widget */}
          <Link href="/chat" className="absolute bottom-[30px] right-[24px] z-50 text-decoration-none">
            <div className="bg-white rounded-full py-[12px] px-[18px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-2.5 relative cursor-pointer hover:-translate-y-1 transition-transform border border-slate-100">
              <span className="text-[#1A1A1A] font-semibold text-[15px]">Chat with Arella</span>
              <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-tr from-[#CA94EB] to-[#25DDDC] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('/images/Asset_3.png')] bg-cover opacity-80" />
              </div>
            </div>
          </Link>
          
        </div>
      </div>

      {/* Request Creative Service Modal */}
      <RequestCreativeServiceModal 
        open={showCreativeModal} 
        onClose={() => setShowCreativeModal(false)} 
      />

      {/* Filter Modal Overlay */}
      <AnimatePresence>
        {showFilter && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[383px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex flex-col relative"
              style={{ fontFamily: F }}
            >
              {/* Header */}
              <div className="px-5 pt-[20px] pb-[16px] border-b border-[rgba(162,161,168,0.1)]">
                <h2 className="text-[18px] font-bold text-[#16151C] leading-[26px]">Filter Ads</h2>
              </div>

              {/* Body */}
              <div className="px-[20px] pt-[20px] pb-[28px] flex flex-col gap-[20px]">
                
                {/* Search Input */}
                <div className="h-[46px] w-full rounded-[10px] border border-[rgba(162,161,168,0.2)] flex items-center px-[14px] gap-[10px]">
                  <Search size={18} className="text-[#16151C]" />
                  <input 
                    type="text" 
                    placeholder="Search ads by title or booking ref..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-gray-400 text-[#16151C]"
                  />
                </div>

                {/* Status Options */}
                <div className="flex flex-col gap-[14px]">
                  <h3 className="text-[14px] font-semibold text-[#16151C]">Status</h3>
                  
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-center gap-[30px]">
                      <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, live: !f.live}))}>
                        <div className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center transition-colors ${filters.live ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.3)]'}`}>
                          {filters.live && <Check size={14} strokeWidth={3} className="text-white" />}
                        </div>
                        <span className="text-[14px] text-[#16151C]">Live</span>
                      </label>
                      
                      <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, inReview: !f.inReview}))}>
                        <div className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center transition-colors ${filters.inReview ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.3)]'}`}>
                          {filters.inReview && <Check size={14} strokeWidth={3} className="text-white" />}
                        </div>
                        <span className="text-[14px] text-[#16151C]">In review</span>
                      </label>
                    </div>

                    <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, ended: !f.ended}))}>
                      <div className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center transition-colors ${filters.ended ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.3)]'}`}>
                        {filters.ended && <Check size={14} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className="text-[14px] text-[#16151C]">Ended</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-[20px] pb-[20px] flex items-center justify-between gap-3">
                <button 
                  onClick={() => setShowFilter(false)} 
                  className="flex-1 h-[44px] rounded-[8px] border border-[rgba(162,161,168,0.2)] text-[#16151C] text-[14px] font-medium flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowFilter(false)} 
                  className="flex-1 h-[44px] rounded-[8px] bg-[#D4AF37] text-[#000000] text-[14px] font-bold flex items-center justify-center hover:bg-[#b58b24] transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
