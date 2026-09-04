'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import PodcastRightPanel from '@/components/podcast/PodcastRightPanel';

const F = theme.font.body;

interface PodcastItem {
  id: string;
  title: string;
  listeners: string;
  episodes: string;
  img: string;
  overlayBadge?: string;
  overlayColor?: string;
}

const PODCAST_ITEMS: PodcastItem[] = [
  {
    id: '1',
    title: 'Undressed',
    listeners: '2M active listeners',
    episodes: '135 episodes',
    img: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Weak In Your Light',
    listeners: '200K active listeners',
    episodes: '135 episodes',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    overlayBadge: 'WEAK IN YOUR LIGHT',
    overlayColor: '#D97706',
  },
  {
    id: '3',
    title: 'Sober Reflection',
    listeners: '20K active listeners',
    episodes: '135 episodes',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    overlayBadge: 'pink SOBER',
    overlayColor: '#DC2626',
  },
  {
    id: '4',
    title: 'Father And Son',
    listeners: '2K active listeners',
    episodes: '135 episodes',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    overlayBadge: 'DELUXE EDITION',
    overlayColor: '#2563EB',
  },
  {
    id: '5',
    title: 'Business On',
    listeners: 'Liked Songs',
    episodes: '135 episodes',
    img: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=500&auto=format&fit=crop&q=80',
    overlayBadge: 'sphere',
    overlayColor: '#7C3AED',
  },
];

// All 10 items (repeating the 5 cards for the 2 rows)
const ALL_PODCAST_ITEMS: PodcastItem[] = [
  ...PODCAST_ITEMS,
  ...PODCAST_ITEMS.map((item, idx) => ({ ...item, id: `${idx + 6}` })),
];

export default function PodcastsPage() {
  const [trendingView, setTrendingView] = useState<'board' | 'list'>('board');
  const [allView, setAllView] = useState<'board' | 'list'>('board');

  const renderCard = (pod: PodcastItem) => (
    <Link
      key={pod.id}
      href={`/podcast/${pod.id}`}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        transition: 'transform 0.15s ease',
      }}
      className="podcast-card-hover"
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#F1F5F9',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <img
          src={pod.img}
          alt={pod.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Artistic styled badge simulating Figma artwork overlay if present */}
        {pod.overlayBadge && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {pod.id === '2' || pod.id === '7' ? (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  fontSize: 8,
                  fontWeight: 900,
                  color: '#B45309',
                  background: 'rgba(254, 243, 199, 0.9)',
                  padding: '2px 5px',
                  borderRadius: 3,
                  letterSpacing: '0.05em',
                }}
              >
                WEAK IN YOUR LIGHT
              </div>
            ) : null}

            {pod.id === '3' || pod.id === '8' ? (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#EF4444',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  transform: 'rotate(-12deg)',
                  letterSpacing: '0.08em',
                }}
              >
                pink SOBER
              </div>
            ) : null}

            {pod.id === '4' || pod.id === '9' ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  right: 8,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)',
                  textAlign: 'center',
                  fontSize: 8,
                  fontWeight: 900,
                  color: '#1E3A8A',
                  padding: '3px 0',
                  borderRadius: 4,
                  letterSpacing: '0.1em',
                }}
              >
                DELUXE EDITION
              </div>
            ) : null}

            {pod.id === '5' || pod.id === '10' ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.12em',
                }}
              >
                sphere
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0F172A',
            margin: '0 0 3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {pod.title}
        </p>
        <p
          style={{
            fontSize: 11,
            color: '#94A3B8',
            fontWeight: 500,
            margin: '0 0 3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {pod.listeners}
        </p>
        <p
          style={{
            fontSize: 11,
            color: '#CCA336',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {pod.episodes}
        </p>
      </div>
    </Link>
  );

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          .podcast-card-hover:hover {
            transform: translateY(-2px);
          }
        `}</style>
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
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* 1. Your trending topics (2) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Your trending topics (2)
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setTrendingView('board')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: trendingView === 'board' ? 700 : 500,
                      color: trendingView === 'board' ? '#0F172A' : '#64748B',
                      background: '#FFFFFF',
                      border: trendingView === 'board' ? '1px solid #E2E8F0' : '1px solid transparent',
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <LayoutGrid size={13} />
                    <span>Board View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrendingView('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: trendingView === 'list' ? 700 : 500,
                      color: trendingView === 'list' ? '#0F172A' : '#64748B',
                      background: '#FFFFFF',
                      border: trendingView === 'list' ? '1px solid #E2E8F0' : '1px solid transparent',
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <List size={13} />
                    <span>List View</span>
                  </button>
                </div>
              </div>

              {trendingView === 'board' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 18,
                  }}
                >
                  {PODCAST_ITEMS.map(renderCard)}
                </div>
              ) : (
                /* List View matching podcast-listview mockup */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[PODCAST_ITEMS[0], PODCAST_ITEMS[0]].map((pod, i) => (
                    <Link
                      key={i}
                      href={`/podcast/${pod.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        textDecoration: 'none',
                        padding: '6px 0',
                      }}
                    >
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
                        <img
                          src={pod.img}
                          alt={pod.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                          {pod.title}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                          {pod.listeners} • {pod.episodes}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. All podcasts (10) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  All podcasts (10)
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setAllView('board')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: allView === 'board' ? 700 : 500,
                      color: allView === 'board' ? '#0F172A' : '#64748B',
                      background: '#FFFFFF',
                      border: allView === 'board' ? '1px solid #E2E8F0' : '1px solid transparent',
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <LayoutGrid size={13} />
                    <span>Board View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllView('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: allView === 'list' ? 700 : 500,
                      color: allView === 'list' ? '#0F172A' : '#64748B',
                      background: '#FFFFFF',
                      border: allView === 'list' ? '1px solid #E2E8F0' : '1px solid transparent',
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <List size={13} />
                    <span>List View</span>
                  </button>
                </div>
              </div>

              {allView === 'board' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                    gap: 18,
                    rowGap: 24,
                  }}
                >
                  {ALL_PODCAST_ITEMS.map(renderCard)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ALL_PODCAST_ITEMS.map((pod, i) => (
                    <Link
                      key={i}
                      href={`/podcast/${pod.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        textDecoration: 'none',
                        padding: '6px 0',
                      }}
                    >
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
                        <img
                          src={pod.img}
                          alt={pod.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
                          {pod.title}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                          {pod.listeners} • {pod.episodes}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <PodcastRightPanel variant="calendar" />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
