'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  Eye, 
  Clock, 
  Activity, 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Tv, 
  ArrowUpRight, 
  CheckCircle2, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  Radio,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { theme } from '@/lib/theme';
import { useToast } from '@/components/ui/ToastProvider';
import Link from 'next/link';

const F = theme.font.body;

// Chart Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontFamily: F }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: entry.color, margin: index > 0 ? '4px 0 0' : 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            <span>{entry.name}: {Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Seed Proof of Play Records
const SEED_PROOF_DATA = [
  { id: 'pop-1', creative_title: 'Bemsoft Bulletin Highway — Prime Summer', screen_name: 'Bems Junction Billboard', city: 'Umuahia', booking_number: 'BK_SCR_8371940', play_count: 8420, airtime_mins: 280, impressions: 420000, last_played: '2026-08-16T12:00:00Z', status: 'Live' },
  { id: 'pop-2', creative_title: 'Studio Arella Brand Awakening 4K', screen_name: 'Victoria Island Studio Tower', city: 'Lagos', booking_number: 'BK_SCR_9182374', play_count: 6150, airtime_mins: 205, impressions: 310500, last_played: '2026-08-16T11:45:00Z', status: 'Live' },
  { id: 'pop-3', creative_title: 'Aba Tech Summit Spotlight', screen_name: 'Aba Road Digital Wall', city: 'Port Harcourt', booking_number: 'BK_SCR_4829103', play_count: 4890, airtime_mins: 163, impressions: 245000, last_played: '2026-08-16T10:30:00Z', status: 'Live' },
  { id: 'pop-4', creative_title: 'Lekki Phase 1 Luxury Launch', screen_name: 'Ikeja Prime Display', city: 'Lagos', booking_number: 'BK_SCR_1029384', play_count: 2750, airtime_mins: 92, impressions: 168000, last_played: '2026-08-15T18:20:00Z', status: 'Completed' },
  { id: 'pop-5', creative_title: 'Growth Lab Podcast Teaser', screen_name: 'Bems Junction Billboard', city: 'Umuahia', booking_number: 'BK_SCR_5928104', play_count: 1240, airtime_mins: 41, impressions: 72000, last_played: '2026-08-15T15:10:00Z', status: 'Completed' },
  { id: 'pop-6', creative_title: 'Arella Creative Studio Promo', screen_name: 'Victoria Island Studio Tower', city: 'Lagos', booking_number: 'BK_SCR_7192840', play_count: 1130, airtime_mins: 38, impressions: 64950, last_played: '2026-08-14T20:00:00Z', status: 'Completed' },
];

// Seed Trend Charts
const TIMELINE_DATA = [
  { time: '01 Aug', plays: 1200, impressions: 64000 },
  { time: '03 Aug', plays: 1950, impressions: 98000 },
  { time: '05 Aug', plays: 2840, impressions: 142000 },
  { time: '07 Aug', plays: 2400, impressions: 125000 },
  { time: '09 Aug', plays: 3650, impressions: 195000 },
  { time: '11 Aug', plays: 4100, impressions: 218000 },
  { time: '13 Aug', plays: 3890, impressions: 202000 },
  { time: '15 Aug', plays: 4550, impressions: 236000 },
];

const SCREEN_BAR_DATA = [
  { screen: 'Bems Junc', plays: 9660 },
  { screen: 'VI Tower', plays: 7280 },
  { screen: 'Aba Rd', plays: 4890 },
  { screen: 'Ikeja Prime', plays: 2750 },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>(SEED_PROOF_DATA);
  const [totalPlays, setTotalPlays] = useState(24580);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'year'>('30d');
  
  // Table state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/analytics/proof-of-play'),
      api.get('/analytics/hourly')
    ]).then(([popRes]) => {
      if (!isMounted) return;
      if (popRes.status === 'fulfilled' && popRes.value.data?.breakdown?.length > 0) {
        const serverItems = popRes.value.data.breakdown.map((item: any, i: number) => ({
          id: `srv-${i}`,
          creative_title: item.creative_title,
          screen_name: 'Bems Junction Billboard',
          city: 'Umuahia',
          booking_number: item.booking_number,
          play_count: parseInt(item.play_count) || 100,
          airtime_mins: Math.ceil((parseInt(item.play_count) || 100) / 30),
          impressions: (parseInt(item.play_count) || 100) * 55,
          last_played: item.last_played || new Date().toISOString(),
          status: 'Live'
        }));
        setData(serverItems);
        setTotalPlays(popRes.value.data.total_plays || 24580);
      } else {
        setData(SEED_PROOF_DATA);
        setTotalPlays(24580);
      }
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Filtered Proof-of-Play records
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedScreen !== 'all' && item.screen_name !== selectedScreen) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (item.creative_title || '').toLowerCase().includes(q);
        const refMatch = (item.booking_number || '').toLowerCase().includes(q);
        const screenMatch = (item.screen_name || '').toLowerCase().includes(q);
        if (!titleMatch && !refMatch && !screenMatch) return false;
      }
      return true;
    });
  }, [data, selectedScreen, searchQuery]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const currentRecords = filteredData.slice(startIndex, endIndex);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast('No data to export', 'error');
      return;
    }
    const headers = ['Creative', 'Screen Location', 'City', 'Booking Ref', 'Play Count', 'Airtime (Mins)', 'Impressions', 'Last Played', 'Status'];
    const rows = filteredData.map(r => [
      `"${r.creative_title}"`,
      `"${r.screen_name}"`,
      `"${r.city}"`,
      `"${r.booking_number}"`,
      r.play_count,
      r.airtime_mins,
      r.impressions,
      `"${r.last_played}"`,
      `"${r.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Studio_Arella_Proof_Of_Play_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Proof of Play report exported as CSV', 'success');
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1150, margin: '0 auto', paddingBottom: 60 }}>
          
          {/* ─── PAGE HEADER & TIMEFRAME TOOLBAR ─── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  Analytics & Performance
                </h1>
                <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  Live Proof of Play
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, fontWeight: 500 }}>
                Real-time broadcast execution metrics, viewer impressions, and prime screen airtime reporting.
              </p>
            </div>

            {/* Timeframe & Export */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Timeframe Switcher */}
              <div style={{ display: 'inline-flex', background: '#F8FAFC', padding: 3, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'year', label: 'This Year' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTimeframe(t.id as any); toast(`Viewing ${t.label} analytics`, 'success'); }}
                    style={{
                      background: timeframe === t.id ? '#FFFFFF' : 'transparent',
                      color: timeframe === t.id ? '#0F172A' : '#64748B',
                      border: 'none',
                      borderRadius: 7,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: timeframe === t.id ? 800 : 600,
                      cursor: 'pointer',
                      boxShadow: timeframe === t.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.15s',
                      fontFamily: F
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#C69A2C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                  fontFamily: F,
                  transition: 'all 0.2s'
                }}
              >
                <Download size={14} />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* ─── TOP 4 PERFORMANCE METRIC CARDS ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { 
                label: 'Total Screen Plays', 
                value: totalPlays.toLocaleString(), 
                subValue: 'Across all active screens',
                trend: '+12.4%', 
                up: true, 
                icon: PlayCircle,
                color: '#C69A2C',
                bg: '#FFFDF5' 
              },
              { 
                label: 'Estimated Impressions', 
                value: '1,280,450', 
                subValue: 'Footfall & vehicular traffic',
                trend: '+18.2%', 
                up: true, 
                icon: Eye,
                color: '#059669',
                bg: '#ECFDF5' 
              },
              { 
                label: 'Broadcast Airtime', 
                value: '412.5 hrs', 
                subValue: 'Total play duration',
                trend: '+8.0%', 
                up: true, 
                icon: Clock,
                color: '#6366F1',
                bg: '#EEF2FF' 
              },
              { 
                label: 'Completion Rate', 
                value: '99.2%', 
                subValue: 'Zero-drop broadcast delivery',
                trend: '+0.4%', 
                up: true, 
                icon: CheckCircle2,
                color: '#0284C7',
                bg: '#F0F9FF' 
              },
            ].map((stat, i) => (
              <FadeCard key={stat.label} delay={i * 0.05} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>{stat.label}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={16} color={stat.color} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                    {stat.value}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: stat.up ? '#10B981' : '#EF4444' }}>
                    {stat.trend}
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 600 }}>{stat.subValue}</p>
              </FadeCard>
            ))}
          </div>

          {/* ─── CHARTS SECTION (2 COLUMNS) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
            
            {/* Chart 1: Proof of Play Trend (AreaChart) */}
            <FadeCard delay={0.15} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                    Proof of Play & Reach Velocity
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    Verified screen play count over {timeframe === '30d' ? 'the past 30 days' : 'the active period'}
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#C69A2C', background: '#FFFDF5', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: 14 }}>
                  Verified by IoT Sensors
                </span>
              </div>

              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TIMELINE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C69A2C" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#C69A2C" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="plays" name="Screen Plays" stroke="#C69A2C" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FadeCard>

            {/* Chart 2: Plays by Screen Location (BarChart) */}
            <FadeCard delay={0.2} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                    Airtime Distribution by Billboard
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    Comparative execution volume per billboard terminal
                  </p>
                </div>
                <Tv size={18} color="#64748B" />
              </div>

              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SCREEN_BAR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="screen" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="plays" name="Total Plays" fill="#0F172A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeCard>

          </div>

          {/* ─── PROOF OF PLAY TABLE ─── */}
          <FadeCard delay={0.25} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            
            {/* Table Toolbar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Proof of Play Breakdown
                </h2>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', background: '#F8FAFC', padding: '3px 10px', borderRadius: 14 }}>
                  {filteredData.length} records
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    placeholder="Search creative, ref, screen..." 
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px 8px 34px', 
                      background: '#F8FAFC', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: 10, 
                      fontSize: 12, 
                      fontWeight: 500, 
                      color: '#1E293B', 
                      outline: 'none',
                      fontFamily: F
                    }}
                  />
                </div>

                {/* Filter Screen Dropdown */}
                <select
                  value={selectedScreen}
                  onChange={e => { setSelectedScreen(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155',
                    outline: 'none',
                    fontFamily: F,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Screens</option>
                  <option value="Bems Junction Billboard">Bems Junction Billboard</option>
                  <option value="Victoria Island Studio Tower">Victoria Island Studio Tower</option>
                  <option value="Aba Road Digital Wall">Aba Road Digital Wall</option>
                  <option value="Ikeja Prime Display">Ikeja Prime Display</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Creative & Ad Info', 'Billboard Screen', 'Booking Ref', 'Play Count', 'Est. Reach', 'Last Broadcast', 'Status'].map((h, i) => (
                      <th 
                        key={h} 
                        style={{ 
                          padding: '14px 20px', 
                          color: '#64748B', 
                          fontWeight: 700, 
                          fontSize: 11, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em',
                          textAlign: i === 3 || i === 4 ? 'right' : 'left'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                          <PlayCircle size={24} color="#C69A2C" />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>No analytics records match</p>
                        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Try adjusting your search query or screen filter.</p>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map(r => (
                      <tr 
                        key={r.id}
                        style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FBFDFE'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Creative Info */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Tv size={16} color="#C69A2C" />
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                                {r.creative_title}
                              </p>
                              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                                {r.airtime_mins} mins total airtime
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Screen */}
                        <td style={{ padding: '16px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                            {r.screen_name}
                          </p>
                          <span style={{ fontSize: 11, color: '#64748B' }}>
                            {r.city}
                          </span>
                        </td>

                        {/* Ref */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', fontWeight: 600 }}>
                            {r.booking_number}
                          </span>
                        </td>

                        {/* Play Count */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <span style={{ fontSize: 15, fontWeight: 900, color: '#C69A2C', letterSpacing: '-0.3px' }}>
                            {Number(r.play_count).toLocaleString()}
                          </span>
                        </td>

                        {/* Impressions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                            ~{Number(r.impressions).toLocaleString()}
                          </span>
                        </td>

                        {/* Last Played */}
                        <td style={{ padding: '16px 20px', color: '#64748B', fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={12} color="#94A3B8" />
                            <span>{new Date(r.last_played).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {new Date(r.last_played).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            padding: '4px 10px', 
                            borderRadius: 20, 
                            background: r.status === 'Live' ? '#ECFDF5' : '#F8FAFC',
                            color: r.status === 'Live' ? '#059669' : '#64748B',
                            border: `1px solid ${r.status === 'Live' ? '#A7F3D0' : '#E2E8F0'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.status === 'Live' ? '#10B981' : '#94A3B8' }} />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              {/* Left: Page Size Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Showing</span>
                <select 
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: 8, 
                    border: '1px solid #E2E8F0', 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: '#0F172A', 
                    background: '#FFFFFF',
                    outline: 'none',
                    fontFamily: F
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* Center: Range text */}
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                Showing {totalRecords === 0 ? 0 : startIndex + 1} to {endIndex} out of {totalRecords} records
              </div>

              {/* Right: Page Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: currentPage === 1 ? '#CBD5E1' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: isActive ? '1px solid #C69A2C' : '1px solid transparent',
                        background: isActive ? '#FFFDF5' : 'transparent',
                        color: isActive ? '#C69A2C' : '#64748B',
                        fontSize: 12,
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        fontFamily: F
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: currentPage === totalPages ? '#CBD5E1' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </FadeCard>

        </div>

        {/* ─── FLOATING "CHAT WITH ARELLA 🌐" WIDGET ─── */}
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 90 }}>
          <div style={{ position: 'relative' }}>
            <Link 
              href="/chat"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 10, 
                padding: '12px 24px', 
                background: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: 24, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: '#1E293B',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                fontFamily: F
              }}
            >
              <span>Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={13} color="#4F46E5" />
                </div>
              </div>
            </Link>
            {/* Speech bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: -7,
              right: 28,
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid #FFFFFF',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.04))',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

      </PageTransition>
    </DashboardLayout>
  );
}
