'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List } from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;

// Dummy data matching the Figma mockups
const TRENDING_PODCASTS = [
  { id: '1', title: 'Undressed', listeners: '2M active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' },
  { id: '2', title: 'Weak in Your Light', listeners: '200k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1516280440502-628d02166668?w=400&q=80' },
];

const ALL_PODCASTS = [
  { id: '1', title: 'Undressed', listeners: '2M active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' },
  { id: '2', title: 'Weak in Your Light', listeners: '200k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1516280440502-628d02166668?w=400&q=80' },
  { id: '3', title: 'Sober Reflection', listeners: '20k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&q=80' },
  { id: '4', title: 'Father And Son', listeners: '2k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1583335513577-224b11f385ce?w=400&q=80' },
  { id: '5', title: 'Business On', listeners: 'Liked Songs', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f922?w=400&q=80' },
];

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

export default function PodcastsPage() {
  const [viewMode, setViewMode] = useState<'board'|'list'>('board');

  const PodcastCard = ({ pod }: { pod: any }) => (
    <Link href={`/podcast/${pod.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden', background: '#F1F5F9' }}>
        <img src={pod.img} alt={pod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pod.title}</p>
        <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 4px' }}>{pod.listeners}</p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#D4AF37', margin: 0 }}>{pod.episodes}</p>
      </div>
    </Link>
  );

  return (
    <div style={{ fontFamily: F, display: 'flex', gap: 32, padding: '32px 32px 32px 40px', minHeight: '100%', alignItems: 'flex-start' }}>
      
      {/* ─── LEFT COLUMN (Main Content) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* Trending Topics */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Your trending topics (2)</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setViewMode('board')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: viewMode === 'board' ? '#0F172A' : '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <LayoutGrid size={14} /> Board View
              </button>
              <button onClick={() => setViewMode('list')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: viewMode === 'list' ? '#0F172A' : '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <List size={14} /> List View
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
            {TRENDING_PODCASTS.map((pod, i) => <PodcastCard key={`trend-${i}`} pod={pod} />)}
          </div>
        </div>

        {/* All Podcasts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>All podcasts (10)</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#0F172A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <LayoutGrid size={14} /> Board View
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <List size={14} /> List View
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, rowGap: 32 }}>
            {ALL_PODCASTS.map((pod, i) => <PodcastCard key={`all-${i}`} pod={pod} />)}
            {/* Repeating to match the visual 10 count from Figma */}
            {ALL_PODCASTS.map((pod, i) => <PodcastCard key={`all2-${i}`} pod={pod} />)}
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
          <p style={{ fontSize: 14, fontWeight: 700, color: '#475569', margin: '0 0 16px' }}>Your top performing topics</p>
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
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#64748B', cursor: 'pointer' }}>{'<'}</button>
              <button style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 4, color: '#64748B', cursor: 'pointer' }}>{'>'}</button>
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
  );
}
