'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';

const F = theme.font.body;

// Chart Dummy Data
const CHART_DATA = [
  { name: 'Jan', plays: 10, listeners: 8 },
  { name: 'Feb', plays: 20, listeners: 15 },
  { name: 'Mar', plays: 15, listeners: 12 },
  { name: 'Apr', plays: 45, listeners: 35 },
  { name: 'May', plays: 30, listeners: 25 },
  { name: 'Jun', plays: 35, listeners: 30 },
  { name: 'Jul', plays: 40, listeners: 38 },
  { name: 'Aug', plays: 50, listeners: 45 },
  { name: 'Sep', plays: 45, listeners: 40 },
  { name: 'Oct', plays: 60, listeners: 55 },
  { name: 'Nov', plays: 65, listeners: 60 },
  { name: 'Dec', plays: 70, listeners: 65 },
];

const PODCAST_DB: Record<string, { title: string }> = {
  '1': { title: 'Undressed' },
  '2': { title: 'Weak in Your Light' },
  '3': { title: 'Sober Reflection' },
  '4': { title: 'Father And Son' },
  '5': { title: 'Business On' },
};

const TOP_PERFORMING = [
  { title: 'Family life podcast', listeners: '2M active listeners', img: 'https://i.pravatar.cc/100?img=1' },
  { title: 'Growth Lab podcast', listeners: '24 active listeners', img: 'https://i.pravatar.cc/100?img=2' },
  { title: 'Growth Lab', listeners: '34 active listeners', img: 'https://i.pravatar.cc/100?img=3' },
  { title: 'Positioning podcast', listeners: '500k active listeners', img: 'https://i.pravatar.cc/100?img=4' },
  { title: 'Business On', listeners: '200k active listeners', img: 'https://i.pravatar.cc/100?img=5' },
];

const CALENDAR_EVENTS = [
  { title: 'Podcast session', time: '16:00', border: '#10B981' },
  { title: 'Podcast booking', time: '14:00', border: '#F59E0B' },
  { title: 'Podcast booking', time: '13:00', border: '#3B82F6' },
];

export default function PodcastDetail({ params }: { params: { id: string } }) {
  const podcast = PODCAST_DB[params.id] || { title: 'Unknown Podcast' };

  const EPISODES = [
    { id: 1, title: podcast.title, date: 'August 17, 2026', duration: '2 min 22 sec', likes: '2K Likes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80' },
    { id: 2, title: podcast.title, date: 'August 13, 2026', duration: '2 min 22 sec', likes: '2K Likes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80' },
    { id: 3, title: podcast.title, date: 'August 10, 2026', duration: '2 min 22 sec', likes: '2K Likes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#D4AF37', borderRadius: 4, padding: '4px 8px', color: '#FFFFFF', fontSize: 12, fontWeight: 700, position: 'relative', top: -20 }}>
          {payload[0].value}
          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #D4AF37' }} />
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div style={{ fontFamily: F, display: 'flex', gap: 32, padding: '32px 32px 32px 40px', minHeight: '100%', alignItems: 'flex-start' }}>
      
      {/* ─── LEFT COLUMN (Main Content) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>{podcast.title} podcast</h1>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Today <ChevronDown size={14} />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Active Listeners', value: '3,015', trend: '+11.01%', up: true },
            { label: 'Total Plays', value: '3,671', trend: '-0.03%', up: false },
            { label: 'Followers', value: '3,671', trend: '+15.03%', up: true },
            { label: 'Total Likes', value: '367', trend: '', up: true },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#FFFDF5', borderRadius: 16, padding: '20px', border: '1px solid rgba(212,175,55,0.1)' }}>
              <p style={{ fontSize: 13, color: '#0F172A', margin: '0 0 16px', fontWeight: 600 }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{stat.value}</span>
                {stat.trend && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: stat.up ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: 700 }}>
                    {stat.trend} {stat.up ? <FaArrowTrendUp size={10} /> : <FaArrowTrendDown size={10} />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Chart */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Recent analytics</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }} /> Total Plays
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1' }} /> Active Listeners
                </div>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 10px', color: '#64748B', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              Year <ChevronDown size={14} />
            </button>
          </div>
          
          <div style={{ height: 300, width: '100%', marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#84CC16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}K` : '0'} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="plays" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorPlays)" activeDot={{ r: 6, fill: '#D4AF37', stroke: '#FFF', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Episodes List */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>All episodes (90)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {EPISODES.map((ep) => (
              <div key={ep.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                  <img src={ep.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Episode" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{ep.title}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>Uploaded {ep.date} - 135 {ep.duration} - {ep.likes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── RIGHT COLUMN ─── */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 32, flexShrink: 0 }}>
        
        {/* Add a podcast button */}
        <Link href="/podcast/new" style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          padding: '16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 12, 
          color: '#0F172A', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          Add a podcast
        </Link>

        {/* Top Performing Topics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#475569', margin: 0 }}>Your top performing topics</p>
            <button style={{ background: 'none', border: 'none', display: 'flex', cursor: 'pointer', color: '#94A3B8' }}><ChevronDown size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_PERFORMING.map((topic, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
                  <img src={topic.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, margin: '0 0 2px' }}>{topic.title}</p>
                  <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{topic.listeners}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Booking Calendar */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#475569', margin: '0 0 16px' }}>Recent Podcast Booking Calendar</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Aug 15, Sat</span>
              <span style={{ fontSize: 9, background: '#0F172A', color: '#FFFFFF', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>TODAY</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#64748B', cursor: 'pointer' }}><ChevronLeft size={12} /></button>
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#64748B', cursor: 'pointer' }}><ChevronRight size={12} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {CALENDAR_EVENTS.map((ev, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `3px solid ${ev.border}`, borderRadius: 8, padding: '12px 16px' }}>
                <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, margin: '0 0 4px' }}>{ev.title}</p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>{ev.time}</p>
              </div>
            ))}
          </div>

          <Link href="/book" style={{ display: 'block', padding: '12px', background: '#FFFDF5', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            Book podcast slot
          </Link>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/calendar" style={{ fontSize: 11, color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>
              See full calendar &gt;
            </Link>
          </div>
        </div>

      </div>
    </div>
    </DashboardLayout>
  );
}
