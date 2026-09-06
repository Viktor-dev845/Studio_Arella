'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import PodcastRightPanel from '@/components/podcast/PodcastRightPanel';
import api from '@/lib/api';

const F = theme.font.body;

interface Episode {
  id: string;
  title: string;
  cover_url: string | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
}
interface Show {
  id: string;
  title: string;
  cover_url: string | null;
}

function formatEpisodeDuration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m} min ${s.toString().padStart(2, '0')} sec`;
}

const EXAMPLE_BADGE: React.CSSProperties = {
  fontSize: 9, fontWeight: 800, color: '#94A3B8', background: '#FFFFFF',
  padding: '2px 7px', borderRadius: 100, letterSpacing: '0.04em', textTransform: 'uppercase',
};

const ANALYTICS_DATA = [
  { month: 'Jan', plays: 18, listeners: 10 },
  { month: 'Feb', plays: 24, listeners: 15 },
  { month: 'Mar', plays: 30, listeners: 20 },
  { month: 'Apr', plays: 50, listeners: 35 },
  { month: 'May', plays: 35, listeners: 28 },
  { month: 'Jun', plays: 20, listeners: 25 },
  { month: 'Jul', plays: 45, listeners: 28 },
  { month: 'Aug', plays: 62, listeners: 38 },
  { month: 'Sep', plays: 48, listeners: 36 },
  { month: 'Oct', plays: 65, listeners: 40 },
  { month: 'Nov', plays: 52, listeners: 44 },
  { month: 'Dec', plays: 40, listeners: 48 },
];

export default function PodcastDetailPage() {
  const params = useParams<{ id: string }>();
  const [selectedTimeframe, setSelectedTimeframe] = useState('Year');
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingShow, setLoadingShow] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    setLoadingShow(true);
    api.get(`/shows/${params.id}`)
      .then(res => {
        setShow(res.data.podcast);
        setEpisodes(res.data.episodes || []);
      })
      .catch(() => { setShow(null); setEpisodes([]); })
      .finally(() => setLoadingShow(false));
  }, [params.id]);

  return (
    <DashboardLayout>
      <PageTransition>
        <div
          style={{
            fontFamily: F,
            padding: '24px 32px 48px',
            background: '#FFFFFF',
            minHeight: '100%',
            display: 'flex',
            gap: 36,
            alignItems: 'flex-start',
          }}
        >
          {/* ─── MAIN COLUMN ─── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link
                  href="/podcast"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F172A',
                    textDecoration: 'none',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Link>

                <h1 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {loadingShow ? 'Loading…' : show ? `${show.title} podcast` : 'Podcast not found'}
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Today</span>
                <ChevronDown size={14} color="#64748B" />
              </div>
            </div>

            {/* 4 Stat Cards — example data until follower/listener tracking exists */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={EXAMPLE_BADGE}>Example data</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {/* Stat 1: Total Active Listeners */}
              <div
                style={{
                  background: '#FAF8ED',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Total Active Listeners
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    3,015
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <span>+11.01%</span>
                    <FaArrowTrendUp size={9} />
                  </div>
                </div>
              </div>

              {/* Stat 2: Total Plays */}
              <div
                style={{
                  background: '#FAF8ED',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Total Plays
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    3,671
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <span>-0.03%</span>
                    <FaArrowTrendDown size={9} />
                  </div>
                </div>
              </div>

              {/* Stat 3: Followers */}
              <div
                style={{
                  background: '#FAF8ED',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Followers
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    3,671
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <span>+15.03%</span>
                    <FaArrowTrendUp size={9} />
                  </div>
                </div>
              </div>

              {/* Stat 4: Total Likes */}
              <div
                style={{
                  background: '#FAF8ED',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Total Likes
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    367
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Analytics Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Recent analytics
                  </h3>
                  <span style={EXAMPLE_BADGE}>Example data</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Year</span>
                  <ChevronDown size={14} color="#64748B" />
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCA336' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0F172A' }}>Total Plays</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A3E635' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0F172A' }}>Active Listeners</span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div style={{ width: '100%', height: 260, position: 'relative' }}>
                {/* April '50' peak badge matching screenshot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '26.5%',
                    top: '41%',
                    transform: 'translate(-50%, -100%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      background: '#CCA336',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    50
                  </div>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2.5px solid #CCA336',
                      marginTop: 4,
                    }}
                  />
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotalPlays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CCA336" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#CCA336" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="colorActiveListeners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A3E635" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#A3E635" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748B', fontFamily: F }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748B', fontFamily: F }}
                      ticks={[10, 20, 30, 40, 50, 60, 70]}
                      tickFormatter={(v) => `${v}K`}
                    />
                    <Area
                      type="monotone"
                      dataKey="plays"
                      stroke="#CCA336"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#colorTotalPlays)"
                    />
                    <Area
                      type="monotone"
                      dataKey="listeners"
                      stroke="#A3E635"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#colorActiveListeners)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All episodes (2) Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  All episodes ({episodes.length})
                </h3>

                <Link
                  href={`/podcast/${params.id}/episode/new`}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#CCA336',
                    background: '#FFFFFF',
                    border: '1px solid #CCA336',
                    borderRadius: 6,
                    padding: '6px 14px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Add New Episode
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {loadingShow ? (
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>Loading episodes…</p>
                ) : episodes.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>No episodes published yet.</p>
                ) : episodes.map((ep) => {
                  const duration = formatEpisodeDuration(ep.duration_seconds);
                  const uploaded = new Date(ep.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#F1F5F9',
                          flexShrink: 0,
                        }}
                      >
                        {ep.cover_url && (
                          <img
                            src={ep.cover_url}
                            alt={`${ep.title} cover`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                          {ep.title}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                          {ep.status === 'scheduled' ? 'Scheduled' : 'Uploaded'} {uploaded}{duration ? ` • ${duration}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <PodcastRightPanel variant="calendar" />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
