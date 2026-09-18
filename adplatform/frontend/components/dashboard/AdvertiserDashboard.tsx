'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { ChevronDown, CreditCard, Globe } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';

const F = theme.font.body;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: theme.color.surface,
          border: `1px solid ${theme.color.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          fontFamily: F,
        }}
      >
        <p style={{ fontSize: 11, color: theme.color.text3, margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ fontSize: 13, fontWeight: 800, color: entry.color, margin: 0 }}>
            {entry.name}: {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Line chart spline data matching screenshot
const VIEWS_DATA = [
  { name: 'Jan', thisYear: 10000, lastYear: 14000 },
  { name: 'Feb', thisYear: 14000, lastYear: 15000 },
  { name: 'Mar', thisYear: 17000, lastYear: 20000 },
  { name: 'Apr', thisYear: 25000, lastYear: 12000 },
  { name: 'May', thisYear: 29000, lastYear: 16000 },
  { name: 'Jun', thisYear: 22000, lastYear: 21000 },
  { name: 'Jul', thisYear: 24000, lastYear: 27000 },
];

// Traffic by podcast data matching screenshot
const TRAFFIC_BY_PODCAST = [
  { name: 'Growth Lab', filled: 75 },
  { name: 'Love is all', filled: 55 },
  { name: 'Growth Lab', filled: 65 },
  { name: 'Positioning', filled: 80 },
  { name: 'Business on', filled: 45 },
  { name: 'Family life', filled: 60 },
];

const BAR_COLORS = [
  '#FFF6DC', '#FBF2E3', '#111111', '#F1F9CD', '#E8C170', '#FFF6DC',
  '#FBF2E3', '#FFF6DC', '#111111', '#FFF6DC', '#FBF2E3', '#F1F9CD',
];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function podcastBookingsByMonth(bookings: any[]) {
  const year = new Date().getFullYear();
  const counts = new Array(12).fill(0);
  bookings.forEach((b) => {
    const d = new Date(b.start_time);
    if (d.getFullYear() === year) counts[d.getMonth()] += 1;
  });
  return MONTH_NAMES.map((name, i) => ({ name, val: counts[i], color: BAR_COLORS[i] }));
}

// Activities matching screenshot exactly
const ACTIVITIES = [
  {
    avatar: 'https://i.pravatar.cc/150?u=22',
    title: 'Family life podcast hit 2M vie...',
    time: 'Just now',
  },
  {
    avatar: 'https://i.pravatar.cc/150?u=44',
    title: 'Growth Lab podcast is trendi...',
    time: '59 minutes ago',
  },
  {
    avatar: 'https://i.pravatar.cc/150?u=55',
    title: 'Growth Lab hit 15M conversat...',
    time: '12 hours ago',
  },
  {
    avatar: 'https://i.pravatar.cc/150?u=12',
    title: 'Positioning podcast is trendin...',
    time: 'Today, 11:59 AM',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&auto=format&fit=crop',
    title: 'Business On hit 2M views',
    time: 'Feb 2, 2026',
  },
];

function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatEventDay(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return 'Today';
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdvertiserDashboard() {
  const { user } = useAuthStore();
  const { currency, rates } = usePreferencesStore();
  const [balance, setBalance] = useState<any>(null);
  const [podcastBookings, setPodcastBookings] = useState<any[]>([]);
  const [adBookings, setAdBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.get('/finances/balance').then((res) => { if (isMounted) setBalance(res.data); }).catch(() => {});
    api.get('/podcasts/my-bookings').then((res) => { if (isMounted) setPodcastBookings(res.data.bookings || []); }).catch(() => {});
    api.get('/bookings?limit=50').then((res) => { if (isMounted) setAdBookings(res.data.bookings || []); }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const bookedPodcastSlots = podcastBookings.filter((b) => b.status !== 'cancelled').length;

  const upcomingEvents = [
    ...podcastBookings
      .filter((b) => b.status !== 'cancelled' && new Date(b.start_time).getTime() >= Date.now())
      .map((b) => ({ title: 'Podcast session', time: b.start_time, border: '#65B1A8' })),
    ...adBookings
      .filter((b) => !['cancelled', 'failed'].includes(b.status) && new Date(b.start_time).getTime() >= Date.now())
      .map((b) => ({ title: 'Ad screen booking', time: b.start_time, border: '#D4AE37' })),
  ]
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, 3)
    .map((ev) => ({ ...ev, isToday: isSameDay(new Date(ev.time), new Date()) }));

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' });

  const podcastBookingsMonthly = podcastBookingsByMonth(podcastBookings);
  const monthlyMax = Math.max(4, ...podcastBookingsMonthly.map((m) => m.val));
  const yAxisTicks = [0, Math.round(monthlyMax / 2), monthlyMax];

  return (
    <div
      className="advertiser-dashboard-layout"
      style={{
        fontFamily: F,
        display: 'flex',
        gap: 28,
        padding: '24px 28px 40px',
        minHeight: '100%',
        alignItems: 'flex-start',
        background: theme.color.bg,
      }}
    >
      <style>{`
        @media (max-width: 960px) {
          .advertiser-dashboard-layout {
            flex-direction: column !important;
          }
          .advertiser-dashboard-layout > * {
            width: 100% !important;
          }
          .dash-chart-split {
            grid-template-columns: 1fr !important;
          }
          .dash-stat-cards {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .dash-stat-cards {
            grid-template-columns: 1fr !important;
          }
          .dash-2col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* ─── LEFT COLUMN (Main Content) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header: Overview and Today dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0, letterSpacing: '-0.3px' }}>
            Overview
          </h1>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: theme.color.text2,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            Today <ChevronDown size={14} color={theme.color.text3} />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="dash-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {/* Card 1: Total Podcast */}
          <div
            style={{
              background: '#FFFDF5',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
              <p style={{ fontSize: 13, color: theme.color.text1, margin: 0, fontWeight: 500 }}>Total Podcast</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: theme.color.text1, lineHeight: 1 }}>7</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.text1, fontSize: 11, fontWeight: 700 }}>
                +11.01% <FaArrowTrendUp size={10} />
              </div>
            </div>
          </div>

          {/* Card 2: Total Active Listeners */}
          <div
            style={{
              background: '#FFFDF5',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
              <p style={{ fontSize: 13, color: theme.color.text1, margin: 0, fontWeight: 500 }}>Total Active Listeners</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: theme.color.text1, lineHeight: 1 }}>3,671</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.text1, fontSize: 11, fontWeight: 700 }}>
                -0.03% <FaArrowTrendDown size={10} />
              </div>
            </div>
          </div>

          {/* Card 3: Followers */}
          <div
            style={{
              background: '#FFFDF5',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
              <p style={{ fontSize: 13, color: theme.color.text1, margin: 0, fontWeight: 500 }}>Followers</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: theme.color.text1, lineHeight: 1 }}>3,671</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.text1, fontSize: 11, fontWeight: 700 }}>
                +15.03% <FaArrowTrendUp size={10} />
              </div>
            </div>
          </div>

          {/* Card 4: Booked Podcast Slots */}
          <div
            style={{
              background: '#FFFDF5',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.04)',
            }}
          >
            <p style={{ fontSize: 13, color: theme.color.text1, margin: '0 0 16px', fontWeight: 500 }}>Booked Podcast Slots</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 500, color: theme.color.text1, lineHeight: 1 }}>{bookedPodcastSlots}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Line Chart & Traffic by Podcast */}
        <div className="dash-chart-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: 16 }}>
          {/* Left Chart Card */}
          <div style={{ background: theme.color.surface, borderRadius: 20, padding: '22px 24px', border: `1px solid ${theme.color.surface2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1 }}>Total Podcast Views</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: theme.color.text4, cursor: 'pointer' }}>Total Followers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.color.text1, fontWeight: 600 }}>
                  <span style={{ fontSize: 18, lineHeight: 0.5, color: theme.color.text1 }}>•</span> This year
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.color.text1, fontWeight: 600 }}>
                  <span style={{ fontSize: 18, lineHeight: 0.5, color: theme.color.text1 }}>•</span> Last year
                </div>
              </div>
            </div>

            <div style={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VIEWS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={theme.color.bg} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.color.text4 }} dy={8} />
                  <YAxis
                    domain={[0, 32000]}
                    ticks={[0, 10000, 20000, 30000]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: theme.color.text4 }}
                    tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="thisYear" name="This year" stroke="#111111" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="lastYear" name="Last year" stroke="#C4D2E3" strokeWidth={1.5} strokeDasharray="3 3" dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Card: Traffic by Podcast */}
          <div style={{ background: theme.color.surface, borderRadius: 20, padding: '22px 24px', border: `1px solid ${theme.color.surface2}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 20px' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Traffic by Podcast</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {TRAFFIC_BY_PODCAST.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ fontSize: 12, color: theme.color.text2, fontWeight: 500, width: 85, whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
                    <div style={{ height: 2, width: `${t.filled}%`, background: '#111111' }} />
                    <div style={{ height: 2, width: `${100 - t.filled}%`, background: '#EAEAEA' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Podcast Bookings (12 Months Bar Chart) */}
        <div style={{ background: theme.color.surface, borderRadius: 20, padding: '22px 24px', border: `1px solid ${theme.color.surface2}` }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 16px' }}>Podcast Bookings ({new Date().getFullYear()})</p>
          <div style={{ height: 190, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podcastBookingsMonthly} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={theme.color.bg} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.color.text4 }} dy={8} />
                <YAxis domain={[0, monthlyMax]} ticks={yAxisTicks} allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.color.text4 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="val" name="Bookings" radius={[0, 0, 0, 0]} barSize={24}>
                  {podcastBookingsMonthly.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN (My Balance, Activities, Recent Booking Calendar, Chat Widget) ─── */}
      <div style={{ width: 330, display: 'flex', flexDirection: 'column', gap: 28, flexShrink: 0 }}>
        {/* My Balance Section */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 14px' }}>My Balance</p>
          <div className="dash-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {/* Ad Slot Card */}
            <div
              style={{
                background: '#413511',
                borderRadius: 16,
                padding: '14px 14px',
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                minHeight: 118,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Decorative corner curve */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -15,
                  right: -15,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(212,175,55,0.25)',
                }}
              />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3 }}>
                  Book Ad slot
                </p>
                <span style={{ fontSize: 11, color: '#E2E8F0', opacity: 0.9 }}>
                  from #1,000/<br />min
                </span>
              </div>
              <div style={{ display: 'flex', gap: 3, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>

            {/* Wallet Bal Card */}
            <div
              style={{
                background: '#D4AE37',
                borderRadius: 16,
                padding: '14px 14px',
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                minHeight: 118,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Decorative circle at bottom right */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#FDE68A',
                  opacity: 0.85,
                }}
              />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px', color: '#FFFFFF' }}>Wallet Bal</p>
                <p style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                  $ 10,000
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <CreditCard size={17} color="#FFFFFF" />
              </div>
            </div>
          </div>

          <div className="dash-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link
              href="/book"
              style={{
                padding: '9px 12px',
                background: theme.color.surface2,
                color: theme.color.text1,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Book Ad slot
            </Link>
            <Link
              href="/finances"
              style={{
                padding: '9px 12px',
                background: theme.color.surface,
                border: `1px solid ${theme.color.border}`,
                color: '#C69A2C',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Fund wallet
            </Link>
          </div>
        </div>

        {/* Activities Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 14px' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Activities</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ACTIVITIES.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={act.avatar}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: theme.color.text1, fontWeight: 700, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.title}
                  </p>
                  <p style={{ fontSize: 11, color: theme.color.text4, margin: 0 }}>{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Booking Calendar Section */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: '0 0 14px' }}>Recent Booking Calendar</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: theme.color.text2, fontWeight: 600 }}>{today}</span>
              <span style={{ fontSize: 8.5, background: theme.color.charcoal900, color: '#FFFFFF', padding: '2px 8px', borderRadius: 12, fontWeight: 800, letterSpacing: '0.04em' }}>
                TODAY
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={{ background: 'none', border: `1px solid ${theme.color.border}`, borderRadius: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color.text3, cursor: 'pointer' }}>&lt;</button>
              <button style={{ background: 'none', border: `1px solid ${theme.color.border}`, borderRadius: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color.text3, cursor: 'pointer' }}>&gt;</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: 12, color: theme.color.text4, fontWeight: 600 }}>No upcoming bookings.</p>
            ) : upcomingEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  background: theme.color.surface,
                  border: `1px solid ${theme.color.border}`,
                  borderLeft: `3px solid ${ev.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 12, color: theme.color.text1, fontWeight: 500, margin: 0 }}>{ev.title}</p>
                </div>
                <p style={{ fontSize: 11, color: theme.color.text3, margin: 0, fontWeight: 400 }}>{formatEventTime(ev.time)}</p>
              </div>
            ))}
          </div>

          <div className="dash-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Link
              href="/book"
              style={{
                padding: '8px 12px',
                background: theme.color.surface2,
                color: theme.color.text1,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Book Ad slot
            </Link>
            <Link
              href="/podcast/book"
              style={{
                padding: '8px 12px',
                background: theme.color.surface,
                border: `1px solid ${theme.color.border}`,
                color: '#C69A2C',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Book podcast
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              href="/calendar"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#C69A2C',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              See full calendar &gt;
            </Link>
          </div>
        </div>

        {/* Chat with Arella Speech Bubble Widget at bottom right */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6, position: 'relative' }}>
          <Link
            href="/chat"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: theme.color.surface,
              border: `1px solid ${theme.color.border}`,
              borderRadius: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textDecoration: 'none',
              color: theme.color.text1,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: F,
              transition: 'all 0.2s',
            }}
          >
            <span>Chat with Arella</span>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)',
                padding: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: theme.color.surface,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Globe size={11} color="#4F46E5" />
              </div>
            </div>

            {/* Speech bubble small triangle pointer */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: 36,
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${theme.color.surface}`,
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))',
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
