'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Globe, Mic } from 'lucide-react';
import { theme } from '@/lib/theme';
import api from '@/lib/api';

const F = theme.font.body;

interface PodcastRightPanelProps {
  variant?: 'calendar' | 'promos';
}

function formatBookingTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}


export default function PodcastRightPanel({ variant = 'calendar' }: PodcastRightPanelProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/shows?limit=5'),
      api.get('/podcasts/my-bookings'),
    ]).then(([showsRes, bkRes]) => {
      if (!isMounted) return;
      if (showsRes.status === 'fulfilled' && showsRes.value.data?.shows) {
        setTopics(showsRes.value.data.shows.slice(0, 5));
      }
      if (bkRes.status === 'fulfilled' && bkRes.value.data?.bookings) {
        const active = bkRes.value.data.bookings
          .filter((b: any) => b.status !== 'cancelled')
          .slice(0, 3);
        setUpcomingBookings(active);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric', weekday: 'short' });

  if (variant === 'promos') {
    return (
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0, fontFamily: F }}>
        {/* Billboard Promo Card */}
        <div
          style={{
            background: '#493700',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.35 }}>
              Place your Ad on our billboard for wider reach
            </h3>
            <p style={{ fontSize: 10.5, color: '#D5CCA7', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
              Did you know that over 70% of businesses goes unknown? Amplify your brand with Studio Arella screens!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <Link
              href="/bookings?tab=screen"
              style={{
                background: '#E2F163',
                color: '#1E293B',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.04em',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'inline-block',
              }}
            >
              BOOK AD SPACE
            </Link>

            <div
              style={{
                width: 64,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                background: '#4D4421',
                border: '1px solid rgba(255,255,255,0.15)',
                transform: 'rotate(-8deg)',
              }}
            >
              <img
                src="/billboard.jpg"
                alt="Billboard screen"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Studio Arella Promo Card */}
        <div
          style={{
            background: '#222222',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.35 }}>
              Podcasting with Studio Arella got easier
            </h3>
            <p style={{ fontSize: 10.5, color: theme.color.text4, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
              Think of a quality studio session that amplifies your voice, think of Studio Arella
            </p>
          </div>

          <div>
            <Link
              href="/bookings?tab=podcast"
              style={{
                background: '#E2F163',
                color: '#0F172A',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.04em',
                display: 'inline-block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              BOOK PODCAST SESSION
            </Link>
          </div>
        </div>

        {/* Chat with Arella bubble */}
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'flex-start',
            position: 'relative',
          }}
        >
          <Link
            href="/chat"
            style={{
              textDecoration: 'none',
              background: '#FFFFFF',
              borderRadius: 24,
              padding: '14px 20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1 }}>
              Chat with Arella
            </span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #A1C4FD, #C2E9FB)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 10px rgba(161,196,253,0.6)' }}>
              <Globe size={14} color="#3B82F6" strokeWidth={2} />
            </div>
            
            {/* Speech bubble tail */}
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                left: 32,
                width: 16,
                height: 16,
                background: '#FFFFFF',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                transform: 'rotate(25deg)',
              }}
            />
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0, fontFamily: F }}>
      {/* Add a podcast button */}
      <Link
        href="/podcast/new"
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#F5F0E6',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          color: '#0F172A',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'block',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#EBE3D3';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#F5F0E6';
        }}
      >
        Add a podcast
      </Link>

      {/* Featured topics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 14px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
            Featured topics
          </h3>
        </div>

        {topics.length === 0 ? (
          <div
            style={{
              padding: '16px 14px',
              background: '#FAFAFA',
              borderRadius: 12,
              border: '1px dashed #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#FFF7ED',
                color: '#EA580C',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Mic size={16} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: theme.color.text1, margin: '0 0 3px' }}>
              No active topics yet
            </p>
            <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, lineHeight: 1.4 }}>
              Topics and trending shows will appear here as episodes are published.
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'absolute', left: 15.5, top: 16, bottom: 16, width: 1, background: '#E2E8F0', zIndex: 0 }} />
            {topics.map((t, i) => (
              <Link
                key={t.id || i}
                href={`/podcast/${t.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1, textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: t.cover_url ? theme.color.surface2 : 'linear-gradient(135deg, #1E293B, #0F172A)',
                    border: `2px solid ${theme.color.surface}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {t.cover_url ? (
                    <img
                      src={t.cover_url}
                      alt={t.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Mic size={14} color="#EA580C" />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.color.text1,
                      margin: '0 0 2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {t.title}
                  </p>
                  <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 400 }}>
                    {t.creator_name ? `By ${t.creator_name}` : `${t.episode_count || 0} episodes`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Podcast Booking Calendar */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 12px' }}>
          Recent Podcast Booking Calendar
        </h3>

        {/* Date and Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{todayFormatted}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', background: '#1E293B', padding: '3px 8px', borderRadius: 12, letterSpacing: '0.02em' }}>
              TODAY
            </span>
          </div>
        </div>

        {/* Bookings cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {upcomingBookings.length === 0 ? (
            <div
              style={{
                background: '#FAF8F0',
                border: '1px solid #E8DFBF',
                borderLeft: '3px solid #D4AF37',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16151C' }}>No sessions booked today</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 10 }}>AVAILABLE</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
                Acoustic recording suites ready for booking.
              </p>
            </div>
          ) : (
            upcomingBookings.map((b, i) => (
              <div
                key={b.id || i}
                style={{
                  background: theme.color.surface,
                  border: `1px solid ${theme.color.border}`,
                  borderLeft: `3px solid #10B981`,
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: theme.color.text1, margin: '0 0 4px' }}>
                  {b.package_type || 'Podcast Session'}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                  {formatBookingTime(b.start_time)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Book podcast slot button */}
        <Link
          href="/bookings?tab=podcast"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#F5F0E6',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#0F172A',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'block',
            marginBottom: 10,
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#EBE3D3';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#F5F0E6';
          }}
        >
          Book podcast slot
        </Link>

        {/* See full calendar */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/bookings?tab=calendar"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#CCA336',
              textDecoration: 'none',
            }}
          >
            See full calendar &gt;
          </Link>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div style={{ marginTop: 8 }}>
        <Link
          href="/chat"
          style={{
            background: theme.color.surface,
            border: `1px solid ${theme.color.border}`,
            borderRadius: 24,
            padding: '10px 18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1 }}>Chat with Arella</span>
          <span style={{ fontSize: 15 }}>🌐</span>
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              right: 28,
              width: 10,
              height: 10,
              background: theme.color.surface,
              borderRight: `1px solid ${theme.color.border}`,
              borderBottom: `1px solid ${theme.color.border}`,
              transform: 'rotate(45deg)',
            }}
          />
        </Link>
      </div>
    </div>
  );
}
