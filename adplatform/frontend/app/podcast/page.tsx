'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Mic, Plus, Radio, Headphones, Sparkles, ArrowRight, Calendar } from 'lucide-react';
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
          {pod.cover_url ? (
            <img
              src={pod.cover_url}
              alt={pod.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(234, 88, 12, 0.15)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EA580C',
                }}
              >
                <Mic size={24} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Studio Arella
              </span>
            </div>
          )}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pod.cover_url ? (
            <img
              src={pod.cover_url}
              alt={pod.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
              }}
            >
              <Mic size={22} />
            </div>
          )}
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

  const hasMyShows = myShows.length > 0;
  const hasAllShows = allShows.length > 0;
  const isFresh = !hasMyShows && !hasAllShows;

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          .podcast-card-hover:hover {
            transform: translateY(-2px);
          }
          .creator-feature-card:hover {
            border-color: #EA580C !important;
            box-shadow: 0 4px 14px rgba(234, 88, 12, 0.08) !important;
          }
          @media (max-width: 960px) {
            .podcast-page-layout {
              flex-direction: column !important;
            }
            .podcast-page-layout > * {
              width: 100% !important;
            }
            .creator-quickstart-grid {
              grid-template-columns: 1fr !important;
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
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
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
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Calendar size={14} />
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
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
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
            ) : isFresh ? (
              /* ─── FRESH PLATFORM CREATOR LAUNCHPAD ─── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Hero Welcome Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF8ED 50%, #FFF3DC 100%)',
                    border: '1px solid #FED7AA',
                    borderRadius: 18,
                    padding: '28px 32px',
                    boxShadow: '0 2px 12px rgba(234, 88, 12, 0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'relative', zIndex: 1, maxWidth: 620 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid #FDBA74',
                        borderRadius: 20,
                        padding: '4px 12px',
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#16A34A',
                          boxShadow: '0 0 6px #16A34A',
                        }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', letterSpacing: '0.02em' }}>
                        Studio Arella Audio Studio Online
                      </span>
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', margin: '0 0 10px', lineHeight: 1.3 }}>
                      Welcome to your Creator Audio Workspace
                    </h2>
                    <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.55, margin: '0 0 22px' }}>
                      Publish your podcast series, distribute episodes to listeners across Nigeria, or reserve dedicated acoustic studio time with sound engineer assistance at Studio Arella.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <Link
                        href="/podcast/new"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#EA580C',
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 700,
                          padding: '11px 22px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <Plus size={16} />
                        Create Your First Show
                      </Link>

                      <Link
                        href="/bookings?tab=podcast"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          fontSize: 13,
                          fontWeight: 600,
                          padding: '11px 20px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Headphones size={16} color="#64748B" />
                        Book Studio Recording Time
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3 Quick-Start Action Cards */}
                <div
                  className="creator-quickstart-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 16,
                  }}
                >
                  {/* Card 1 */}
                  <div
                    className="creator-feature-card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#FFF7ED',
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Radio size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>
                        1. Start a New Show
                      </h3>
                      <p style={{ fontSize: 12.5, color: theme.color.text4, lineHeight: 1.5, margin: 0 }}>
                        Set up your podcast title, cover artwork, and genres to establish your public channel.
                      </p>
                    </div>
                    <Link
                      href="/podcast/new"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#EA580C',
                        textDecoration: 'none',
                        marginTop: 'auto',
                      }}
                    >
                      <span>Create Show</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Card 2 */}
                  <div
                    className="creator-feature-card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Mic size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>
                        2. Record at Studio Arella
                      </h3>
                      <p style={{ fontSize: 12.5, color: theme.color.text4, lineHeight: 1.5, margin: 0 }}>
                        Book soundproof acoustic booths with broadcast microphones and sound engineers in Umuahia.
                      </p>
                    </div>
                    <Link
                      href="/bookings?tab=podcast"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#2563EB',
                        textDecoration: 'none',
                        marginTop: 'auto',
                      }}
                    >
                      <span>Reserve Suite</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Card 3 */}
                  <div
                    className="creator-feature-card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 14,
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#F0FDF4',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>
                        3. Distribute & Track
                      </h3>
                      <p style={{ fontSize: 12.5, color: theme.color.text4, lineHeight: 1.5, margin: 0 }}>
                        Publish audio drops, engage listeners across the audience feed, and monitor plays in real time.
                      </p>
                    </div>
                    <Link
                      href="/podcast/new"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#16A34A',
                        textDecoration: 'none',
                        marginTop: 'auto',
                      }}
                    >
                      <span>Get Started</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Clean Empty Catalog Card */}
                <div
                  style={{
                    padding: '36px 24px',
                    textAlign: 'center',
                    background: '#FAFAFA',
                    borderRadius: 16,
                    border: '1px dashed #CBD5E1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      background: '#FFF7ED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EA580C',
                    }}
                  >
                    <Mic size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px' }}>
                      No podcast shows published yet
                    </h3>
                    <p style={{ fontSize: 12.5, color: theme.color.text4, margin: 0, maxWidth: 420 }}>
                      When you create your show or release episodes, they will be listed here in board or list view with episode counts and statistics.
                    </p>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Link
                      href="/podcast/new"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#EA580C',
                        color: '#fff',
                        fontSize: 12.5,
                        fontWeight: 700,
                        padding: '8px 16px',
                        borderRadius: 8,
                        textDecoration: 'none',
                      }}
                    >
                      <Plus size={14} />
                      Create Show
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── REAL SHOWS DISPLAY ─── */
              <>
                {/* 1. Your Shows */}
                {hasMyShows && (
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
                          Your Shows ({myShows.length})
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
                        {myShows.map(renderCard)}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {myShows.map(renderListItem)}
                      </div>
                    )}
                  </div>
                )}

                {/* If user has no shows yet, but others exist */}
                {!hasMyShows && hasAllShows && (
                  <div
                    style={{
                      background: '#FFF7ED',
                      border: '1px solid #FED7AA',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', margin: '0 0 2px' }}>
                        You haven&apos;t created your own show yet
                      </h4>
                      <p style={{ fontSize: 12, color: '#C2410C', margin: 0 }}>
                        Start your creator presence by publishing your first show or reserving studio time.
                      </p>
                    </div>
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
                      Create Show
                    </Link>
                  </div>
                )}

                {/* 2. All / Community Podcasts */}
                {hasAllShows && (
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
                          All podcasts ({allShows.length})
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
                        {allShows.map(renderCard)}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {allShows.map(renderListItem)}
                      </div>
                    )}
                  </div>
                )}
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

