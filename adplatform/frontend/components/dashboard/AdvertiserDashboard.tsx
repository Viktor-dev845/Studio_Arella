'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { ChevronDown, CreditCard, Megaphone, Globe } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';

const F = theme.font.body;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: 11, color: '#334155', margin: '0 0 3px', fontFamily: F }}>{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ fontSize: 14, fontWeight: 800, color: entry.color, margin: index > 0 ? '4px 0 0' : 0, fontFamily: F }}>
          {entry.value}
        </p>
      ))}
    </div>
  );
  return null;
};

// Dummy data for the line chart (matching the Figma visual)
const PERFORMANCE_DATA = [
  { name: 'Jan', thisYear: 12000, lastYear: 5000 },
  { name: 'Feb', thisYear: 8000, lastYear: 13000 },
  { name: 'Mar', thisYear: 14000, lastYear: 21000 },
  { name: 'Apr', thisYear: 25000, lastYear: 8000 },
  { name: 'May', thisYear: 29000, lastYear: 15000 },
  { name: 'Jun', thisYear: 22000, lastYear: 13000 },
  { name: 'Jul', thisYear: 19000, lastYear: 25000 },
  { name: 'Aug', thisYear: 24000, lastYear: 31000 },
];

// Dummy data to match Figma visual for "Traffic by Podcast"
const TRAFFIC_DATA = [
  { name: 'Growth Lab', value: 80 },
  { name: 'Love is all', value: 65 },
  { name: 'Positioning', value: 75 },
  { name: 'Business on', value: 40 },
  { name: 'Family life', value: 55 }
];

// Dummy data for bar chart
const BAR_DATA = [
  { name: 'Jan', val1: 18, val2: 0, val3: 0 },
  { name: 'Feb', val1: 0, val2: 0, val3: 30 },
  { name: 'Mar', val1: 0, val2: 22, val3: 0 },
  { name: 'Apr', val1: 0, val2: 0, val3: 32 },
  { name: 'May', val1: 14, val2: 0, val3: 0 },
  { name: 'Jun', val1: 0, val2: 0, val3: 26 },
  { name: 'Jul', val1: 18, val2: 0, val3: 0 },
  { name: 'Aug', val1: 0, val2: 0, val3: 30 },
  { name: 'Sep', val1: 0, val2: 22, val3: 0 },
  { name: 'Oct', val1: 36, val2: 0, val3: 0 },
  { name: 'Nov', val1: 0, val2: 0, val3: 14 },
  { name: 'Dec', val1: 0, val2: 0, val3: 26 },
];

// Dummy activities
const ACTIVITIES = [
  { avatar: '/user1.jpg', text: 'Family life podcast hit 2M views', time: 'Just now' },
  { avatar: '/user2.jpg', text: 'Growth Lab podcast is trending', time: '59 minutes ago' },
  { avatar: '/user3.jpg', text: 'Growth Lab hit 15M conversations', time: '12 hours ago' },
  { avatar: '/user4.jpg', text: 'Positioning podcast is trending', time: 'Today, 11:59 AM' },
  { avatar: '/user5.jpg', text: 'Business On hit 2M views', time: 'Feb 2, 2026' }
];

export default function AdvertiserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/dashboard/stats').then(res => { if (isMounted) setStats((prev: any) => ({ ...prev, ...res.data })) }),
      api.get('/analytics/hourly').then(res => { if (isMounted) setChartData(res.data) }),
      Promise.all([
        api.get('/bookings?limit=6').catch(() => ({ data: { bookings: [] } })),
        api.get('/podcasts/my-bookings').catch(() => ({ data: { bookings: [] } }))
      ]).then(([ads, pods]) => {
        if (isMounted) {
          const adB = ads.data.bookings || [];
          const podB = pods.data.bookings || [];
          const combined = [
            ...adB.map((b: any) => ({ ...b, _type: 'ad' })),
            ...podB.map((b: any) => ({ ...b, _type: 'podcast' }))
          ];
          combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setBookings(combined.slice(0, 6));
        }
      }),
      api.get('/finances/balance').then(res => { if (isMounted) setBalance(res.data) }),
      api.get('/finances/revenue').then(res => {
        if (isMounted) setStats((prev: any) => ({ ...prev, total_revenue: res.data.total_revenue || 0 }));
      })
    ]).then(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i % 12 || 12}${i >= 12 ? 'pm' : 'am'}`);
  const lineChartData = chartData.map((d: any, i: number) => ({ ...d, label: hourLabels[d.hour ?? i] }));
  
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 24, height: 24, border: `2.5px solid #F1F5F9`, borderTopColor: '#0F172A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: F, display: 'flex', gap: 32, padding: '32px 32px 32px 40px', minHeight: '100%', alignItems: 'flex-start' }}>
      
      {/* ─── LEFT COLUMN (Main Content) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>Overview</h1>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Today <ChevronDown size={14} />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Podcast', value: 7, trend: '+11.01%', up: true, bg: '#F9FAEF' },
            { label: 'Total Active Listeners', value: '3,671', trend: '-0.03%', up: false, bg: '#FFFDF5' },
            { label: 'Followers', value: '3,671', trend: '+15.03%', up: true, bg: '#F9FAEF' },
            { label: 'Booked Podcast Slots', value: 2, trend: '', up: true, bg: '#FFFDF5' },
          ].map((stat, i) => (
            <div key={i} style={{ background: stat.bg, borderRadius: 16, padding: '24px 20px', border: '1px solid rgba(212,175,55,0.05)' }}>
              <p style={{ fontSize: 14, color: '#0F172A', margin: '0 0 16px', fontWeight: 700 }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{stat.value}</span>
                {stat.trend && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: stat.up ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: 800 }}>
                    {stat.trend} {stat.up ? <FaArrowTrendUp size={10} /> : <FaArrowTrendDown size={10} />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Middle Row: Line Chart & Traffic */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Line Chart */}
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Total Podcast Views</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8' }}>Total Followers</span>
              </div>
              <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F172A' }} /> This year
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#93C5FD' }} /> Last year
                </div>
              </div>
            </div>
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="thisYear" stroke="#0F172A" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="lastYear" stroke="#93C5FD" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic by Podcast */}
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '24px', border: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 24px' }}>Traffic by Podcast</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {TRAFFIC_DATA.map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 13, color: '#334155', fontWeight: 600, width: 80 }}>{t.name}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ height: 4, width: `${t.value}%`, background: '#0F172A', borderRadius: 4 }} />
                    <div style={{ height: 4, width: `${100 - t.value}%`, background: '#F1F5F9', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Bar Chart */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '24px', border: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 24px' }}>Podcast Bookings</p>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="val1" fill="#FDE68A" radius={[4, 4, 4, 4]} barSize={16} />
                <Bar dataKey="val2" fill="#0F172A" radius={[4, 4, 4, 4]} barSize={16} />
                <Bar dataKey="val3" fill="#ECFCCB" radius={[4, 4, 4, 4]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN (My Balance & Calendar) ─── */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 32, flexShrink: 0 }}>
        
        {/* My Balance Section */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#334155', margin: '0 0 16px' }}>My Balance</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {/* Ad Slot Card */}
            <div style={{ flex: 1, background: 'linear-gradient(145deg, #4A401A 0%, #2A240E 100%)', borderRadius: 16, padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, background: 'rgba(212,175,55,0.2)', borderRadius: '50%' }} />
              <p style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.4 }}>Book Ad slot<br/>from ₦1,000/<br/>min</p>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: 16 }}>
                {/* Dots */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
            </div>

            {/* Wallet Bal Card */}
            <div style={{ flex: 1, background: 'linear-gradient(145deg, #D4AF37 0%, #B49020 100%)', borderRadius: 16, padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, background: '#FDE68A', borderRadius: '50%', opacity: 0.9 }} />
              <p style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700, margin: '0 0 8px' }}>Wallet Bal</p>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.4)', margin: '8px 0', width: '100%' }} />
              <p style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 800, margin: '0 0 16px' }}>$ {(balance?.credits ? balance.credits.toLocaleString() : '10,000')}</p>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <CreditCard size={18} color="#FFFFFF" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/book" style={{ flex: 1, padding: '10px', background: '#F1F5F9', color: '#0F172A', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
              Book Ad slot
            </Link>
            <Link href="/finances" style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#D4AF37', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
              Fund wallet
            </Link>
          </div>
        </div>

        {/* Activities */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#334155', margin: '0 0 16px' }}>Activities</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ACTIVITIES.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={`https://i.pravatar.cc/100?img=${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 700, margin: '0 0 2px' }}>{act.text}</p>
                  <p style={{ fontSize: 10, color: '#64748B', margin: 0 }}>{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Booking Calendar */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#334155', margin: '0 0 16px' }}>Recent Booking Calendar</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>Aug 15, Sat</span>
              <span style={{ fontSize: 9, background: '#0F172A', color: '#FFFFFF', padding: '2px 8px', borderRadius: 100, fontWeight: 800 }}>TODAY</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#334155', cursor: 'pointer' }}>{'<'}</button>
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#334155', cursor: 'pointer' }}>{'>'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { title: 'Podcast session', time: '16:00', border: '#10B981' },
              { title: 'Ad screen booking', time: '14:00', border: '#F59E0B' },
              { title: 'Ad screen booking', time: '13:00', border: '#3B82F6' },
            ].map((ev, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `3px solid ${ev.border}`, borderRadius: 8, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 700, margin: '0 0 4px' }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0, fontWeight: 600 }}>{ev.time}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/book" style={{ flex: 1, padding: '10px', background: '#F1F5F9', color: '#0F172A', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
              Book Ad slot
            </Link>
            <Link href="/podcast" style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#D4AF37', borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
              Book podcast
            </Link>
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Link href="/bookings?tab=calendar" style={{ fontSize: 12, fontWeight: 700, color: '#C69A2C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              See full calendar &gt;
            </Link>

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
                marginTop: 8
              }}
            >
              <span>Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={13} color="#4F46E5" />
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
