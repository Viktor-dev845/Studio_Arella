'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Mic, Plus } from 'lucide-react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import PodcastRightPanel from '@/components/podcast/PodcastRightPanel';
import api from '@/lib/api';

const F = theme.font.body;

interface PodcastShow {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  creator_name?: string;
  episode_count?: number | string;
  created_at?: string;
}

const CURATED_SHOWS: PodcastShow[] = [
  {
    id: 'creative-blueprint',
    title: 'The Creative Blueprint',
    description: 'Conversations with Eastern Nigeria top brand architects, designers, and digital makers.',
    cover_url: '/audience/podcast-zara.png',
    creator_name: 'Adam Udochi',
    episode_count: 8,
  },
  {
    id: 'eastern-pulse',
    title: 'Eastern Pulse Audio',
    description: 'Weekly breakdown of commerce, media trends, and consumer culture in Abia State.',
    cover_url: '/audience/podcast-scthon.png',
    creator_name: 'Kyle Fisher',
    episode_count: 14,
  },
  {
    id: 'tech-voices-umuahia',
    title: 'Tech Voices Umuahia',
    description: 'Spotlighting founders and creative builders scaling regional startups from the South-East.',
    cover_url: '/audience/podcast-drozd.png',
    creator_name: 'Theresa Steward',
    episode_count: 6,
  },
  {
    id: 'soundscapes-session',
    title: 'Soundscapes & Frequencies',
    description: 'Studio Arella live acoustic sessions, audio mixing masterclasses, and artist profiles.',
    cover_url: '/audience/mockup-sphinx.png',
    creator_name: 'Studio Arella Sound Team',
    episode_count: 12,
  },
  {
    id: 'growth-and-grit',
    title: 'Growth & Grit Marketing',
    description: 'Practical playbooks for outdoor billboard reach, retail conversions, and audience growth.',
    cover_url: '/audience/plant-podcast.png',
    creator_name: 'Brandon Wilson',
    episode_count: 5,
  },
];

export default function PodcastsPage() {
  const [trendingView, setTrendingView] = useState<'board' | 'list'>('board');
  const [allView, setAllView] = useState<'board' | 'list'>('board');
  const [myShows, setMyShows] = useState<PodcastShow[]>([]);
  const [allShows, setAllShows] = useState<PodcastShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/shows/mine'),
      api.get('/shows'),
    ]).then(([mineRes, allRes]) => {
      if (!isMounted) return;
      if (mineRes.status === 'fulfilled' && mineRes.value.data?.shows) {
        setMyShows(mineRes.value.data.shows);
      }
      if (allRes.status === 'fulfilled' && allRes.value.data?.shows) {
        setAllShows(allRes.value.data.shows);
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const renderCard = (pod: PodcastShow) => {
    const img = pod.cover_url || '/audience/podcast-zara.png';
    const epCount = pod.episode_count ? `${pod.episode_count} episode${Number(pod.episode_count) === 1 ? '' : 's'}` : '0 episodes';
    const subtitle = pod.creator_name ? `By ${pod.creator_name}` : (pod.description || 'Studio Arella');

    return (
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
            background: theme.color.surface2,
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <img
            src={img}
            alt={pod.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: theme.color.text1,
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
              color: theme.color.text4,
              fontWeight: 500,
              margin: '0 0 3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </p>
          <p
            style={{
              fontSize: 11,
              color: '#E2BC44',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {epCount}
          </p>
        </div>
      </Link>
    );
  };

  const renderListItem = (pod: PodcastShow) => {
    const img = pod.cover_url || '/audience/podcast-zara.png';
    const epCount = pod.episode_count ? `${pod.episode_count} episode${Number(pod.episode_count) === 1 ? '' : 's'}` : '0 episodes';
    const subtitle = pod.creator_name ? `By ${pod.creator_name}` : (pod.description || 'Studio Arella');

    return (
      <Link
        key={pod.id}
        href={`/podcast/${pod.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          textDecoration: 'none',
          padding: '10px 14px',
          borderRadius: 12,
          background: theme.color.surface,
          border: '1px solid #F1F5F9',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            overflow: 'hidden',
            background: theme.color.surface2,
            flexShrink: 0,
          }}
        >
          <img
            src={img}
            alt={pod.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pod.title}
          </p>
          <p style={{ fontSize: 13, color: theme.color.text4, fontWeight: 500, margin: 0 }}>
            {subtitle} · {epCount}
          </p>
        </div>
      </Link>
    );
  };

  const displayTrending = myShows.length > 0 ? myShows : allShows.length > 0 ? allShows.slice(0, 5) : CURATED_SHOWS;
  const displayAll = allShows.length > 0 ? allShows : myShows.length > 0 ? myShows : CURATED_SHOWS;

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          .podcast-card-hover:hover {
            transform: translateY(-2px);
          }
          @media (max-width: 960px) {
            .podcast-page-layout {
              flex-direction: column !important;
            }
            .podcast-page-layout > * {
              width: 100% !important;
            }
          }
          @media (max-width: 640px) {
            .podcast-grid-5 {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 420px) {
            .podcast-grid-5 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
        `}</style>
        <div
          className="podcast-page-layout"
          style={{
            fontFamily: F,
            padding: '24px 32px 48px',
            background: theme.color.surface,
            minHeight: '100%',
            display: 'flex',
            gap: 36,
            alignItems: 'flex-start',
          }}
        >
          {/* ─── MAIN COLUMN ─── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Top Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 4px' }}>
                  Podcasts & Audio Studio
                </h1>
                <p style={{ fontSize: 13, color: theme.color.text4, margin: 0 }}>
                  Publish audio shows, explore creator episodes, or book studio recording time.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href="/bookings?tab=podcast"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#F1F5F9',
                    color: theme.color.text1,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  Book Studio Time
                </Link>
                <Link
                  href="/podcast/new"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#EA580C',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '8px 14px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  <Plus size={14} />
                  New Show
                </Link>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                <div style={{ width: 28, height: 28, border: '2.5px solid #FED7AA', borderTopColor: '#F97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : displayAll.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: '#FAFAFA',
                  borderRadius: 16,
                  border: '1px dashed #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EA580C',
                  }}
                >
                  <Mic size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>
                    No podcast shows published yet
                  </h3>
                  <p style={{ fontSize: 13, color: theme.color.text4, margin: 0, maxWidth: 400 }}>
                    Start your creator journey by creating your first show, or reserve recording studio time at Studio Arella.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Link
                    href="/podcast/new"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#EA580C',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '9px 18px',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    <Plus size={15} />
                    Create Your First Show
                  </Link>
                  <Link
                    href="/bookings?tab=podcast"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#fff',
                      border: '1px solid #CBD5E1',
                      color: theme.color.text1,
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '9px 18px',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    Book Studio Time
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Trending / My Shows */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                        {myShows.length > 0 ? `Your Shows (${myShows.length})` : `Featured Shows (${displayTrending.length})`}
                      </h2>
                    </div>

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
                          color: trendingView === 'board' ? theme.color.text1 : theme.color.text3,
                          background: theme.color.surface,
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
                          color: trendingView === 'list' ? theme.color.text1 : theme.color.text3,
                          background: theme.color.surface,
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
                      className="podcast-grid-5"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                        gap: 18,
                      }}
                    >
                      {displayTrending.map(renderCard)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {displayTrending.map(renderListItem)}
                    </div>
                  )}
                </div>

                {/* 2. All Podcasts */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                        All podcasts ({displayAll.length})
                      </h2>
                    </div>

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
                          color: allView === 'board' ? theme.color.text1 : theme.color.text3,
                          background: theme.color.surface,
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
                          color: allView === 'list' ? theme.color.text1 : theme.color.text3,
                          background: theme.color.surface,
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
                      {displayAll.map(renderCard)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {displayAll.map(renderListItem)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <PodcastRightPanel variant="calendar" />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
