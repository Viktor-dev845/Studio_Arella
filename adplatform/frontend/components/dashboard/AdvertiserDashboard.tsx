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
import { ChevronDown, CreditCard, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';

const F = theme.font.body;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          fontFamily: F,
        }}
      >
        <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
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

// 12-month Podcast Bookings data with distinct alternating colors matching screenshot
const PODCAST_BOOKINGS_BARS = [
  { name: 'Jan', val: 18, color: '#FDE68A' }, // warm gold
  { name: 'Feb', val: 30, color: '#FEF3C7' }, // soft cream
  { name: 'Mar', val: 22, color: '#0F172A' }, // solid black
  { name: 'Apr', val: 32, color: '#ECFCCB' }, // soft lime
  { name: 'May', val: 14, color: '#FCD34D' }, // amber gold
  { name: 'Jun', val: 26, color: '#FEF3C7' }, // soft cream
  { name: 'Jul', val: 18, color: '#ECFCCB' }, // soft lime
  { name: 'Aug', val: 30, color: '#FEF3C7' }, // soft cream
  { name: 'Sep', val: 22, color: '#0F172A' }, // solid black
  { name: 'Oct', val: 36, color: '#FDE68A' }, // warm gold
  { name: 'Nov', val: 14, color: '#FEF3C7' }, // soft cream
  { name: 'Dec', val: 26, color: '#ECFCCB' }, // soft lime
];

// Activities matching screenshot exactly
const ACTIVITIES = [
  {
    bg: 'linear-gradient(135deg, #C084FC 0%, #EC4899 100%)',
    title: 'Family life podcast hit 2M vie...',
    time: 'Just now',
  },
  {
    bg: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
    title: 'Growth Lab podcast is trendi...',
    time: '59 minutes ago',
  },
  {
    bg: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    title: 'Growth Lab hit 15M conversat...',
    time: '12 hours ago',
  },
  {
    bg: 'linear-gradient(135deg, #A16207 0%, #CA8A04 100%)',
    title: 'Positioning podcast is trendin...',
    time: 'Today, 11:59 AM',
  },
  {
    bg: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)',
    title: 'Business On hit 2M views',
    time: 'Feb 2, 2026',
  },
];

export default function AdvertiserDashboard() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/finances/balance')
      .then((res) => {
        if (isMounted) setBalance(res.data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: F,
        display: 'flex',
        gap: 28,
        padding: '24px 28px 40px',
        minHeight: '100%',
        alignItems: 'flex-start',
        background: '#FAFAFA',
      }}
    >
      {/* ─── LEFT COLUMN (Main Content) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header: Overview and Today dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Overview
          </h1>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            Today <ChevronDown size={14} color="#64748B" />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {/* Card 1: Total Podcast */}
          <div
            style={{
              background: '#F9FAEE',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.06)',
            }}
          >
            <p style={{ fontSize: 13, color: '#0F172A', margin: '0 0 16px', fontWeight: 700 }}>Total Podcast</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>7</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 11, fontWeight: 800 }}>
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
              border: '1px solid rgba(212,175,55,0.06)',
            }}
          >
            <p style={{ fontSize: 13, color: '#0F172A', margin: '0 0 16px', fontWeight: 700 }}>Total Active Listeners</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>3,671</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', fontSize: 11, fontWeight: 800 }}>
                -0.03% <FaArrowTrendDown size={10} />
              </div>
            </div>
          </div>

          {/* Card 3: Followers */}
          <div
            style={{
              background: '#F9FAEE',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid rgba(212,175,55,0.06)',
            }}
          >
            <p style={{ fontSize: 13, color: '#0F172A', margin: '0 0 16px', fontWeight: 700 }}>Followers</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>3,671</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 11, fontWeight: 800 }}>
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
              border: '1px solid rgba(212,175,55,0.06)',
            }}
          >
            <p style={{ fontSize: 13, color: '#0F172A', margin: '0 0 16px', fontWeight: 700 }}>Booked Podcast Slots</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>2</span>
            </div>
          </div>
        </div>

        {/* Row 2: Line Chart & Traffic by Podcast */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: 16 }}>
          {/* Left Chart Card */}
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '22px 24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Total Podcast Views</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', cursor: 'pointer' }}>Total Followers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A' }} /> This year
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818CF8' }} /> Last year
                </div>
              </div>
            </div>

            <div style={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VIEWS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F8FAFC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                  <YAxis
                    domain={[0, 32000]}
                    ticks={[0, 10000, 20000, 30000]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="thisYear" name="This year" stroke="#0F172A" strokeWidth={1.8} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="lastYear" name="Last year" stroke="#818CF8" strokeWidth={1.8} strokeDasharray="3 3" dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Card: Traffic by Podcast */}
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '22px 24px', border: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>Traffic by Podcast</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TRAFFIC_BY_PODCAST.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ fontSize: 12, color: '#334155', fontWeight: 600, width: 85, whiteSpace: 'nowrap' }}>
                    {t.name}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ height: 4, width: `${t.filled}%`, background: '#0F172A', borderRadius: 2 }} />
                    <div style={{ height: 4, width: `${100 - t.filled}%`, background: '#F1F5F9', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Podcast Bookings (12 Months Bar Chart) */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '22px 24px', border: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>Podcast Bookings</p>
          <div style={{ height: 190, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PODCAST_BOOKINGS_BARS} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={8} />
                <YAxis domain={[0, 35]} ticks={[0, 10, 20, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="val" name="Bookings" radius={[10, 10, 10, 10]} barSize={18}>
                  {PODCAST_BOOKINGS_BARS.map((entry, index) => (
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
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>My Balance</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {/* Ad Slot Card */}
            <div
              style={{
                background: 'linear-gradient(145deg, #3F3512 0%, #28220A 100%)',
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
                  from ₦1,000/<br />min
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
                background: 'linear-gradient(145deg, #CFA335 0%, #B88E20 100%)',
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
                  $ {(balance?.credits ? balance.credits.toLocaleString() : '10,000')}
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <CreditCard size={17} color="#FFFFFF" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link
              href="/bookings/screen-ad"
              style={{
                padding: '9px 12px',
                background: '#F1F5F9',
                color: '#0F172A',
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
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
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
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>Activities</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ACTIVITIES.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: act.bg,
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 700, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Booking Calendar Section */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>Recent Booking Calendar</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Aug 15, Sat</span>
              <span style={{ fontSize: 9, background: '#0F172A', color: '#FFFFFF', padding: '2px 7px', borderRadius: 100, fontWeight: 800 }}>
                TODAY
              </span>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              <button
                style={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  color: '#475569',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ChevronLeft size={12} />
              </button>
              <button
                style={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  color: '#475569',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {[
              { title: 'Podcast session', time: '16:00', border: '#22C55E' },
              { title: 'Ad screen booking', time: '14:00', border: '#F59E0B' },
              { title: 'Ad screen booking', time: '13:00', border: '#3B82F6' },
            ].map((ev, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderLeft: `3px solid ${ev.border}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
              >
                <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 700, margin: '0 0 2px' }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0, fontWeight: 600 }}>{ev.time}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Link
              href="/bookings/screen-ad"
              style={{
                padding: '8px 12px',
                background: '#F1F5F9',
                color: '#0F172A',
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
              href="/podcast/new"
              style={{
                padding: '8px 12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
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
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              textDecoration: 'none',
              color: '#1E293B',
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
                  background: '#fff',
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
                borderTop: '6px solid #FFFFFF',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))',
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
