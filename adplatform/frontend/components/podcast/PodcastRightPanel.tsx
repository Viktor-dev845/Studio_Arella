'use client';

import Link from 'next/link';
import { ChevronRight, Globe } from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface PodcastRightPanelProps {
  variant?: 'calendar' | 'promos';
}

const TOP_PERFORMING_TOPICS = [
  {
    title: 'Family life podcast',
    listeners: '2M active listeners',
    avatarBg: 'linear-gradient(135deg, #A855F7, #EC4899)',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    title: 'Growth Lab podcast',
    listeners: '1M active listeners',
    avatarBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
  },
  {
    title: 'Growth Lab',
    listeners: '800K active listeners',
    avatarBg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    title: 'Positioning podcast',
    listeners: '500K active listeners',
    avatarBg: 'linear-gradient(135deg, #EF4444, #B91C1C)',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    title: 'Business On',
    listeners: '200K active listeners',
    avatarBg: 'linear-gradient(135deg, #10B981, #047857)',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  },
];

export default function PodcastRightPanel({ variant = 'calendar' }: PodcastRightPanelProps) {
  if (variant === 'promos') {
    return (
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0, fontFamily: F }}>
        {/* Billboard Promo Card */}
        <div
          style={{
            background: '#3B3416',
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
              Did you know that over 78% of businesses grow with billboard? That's a lot of potential revenue lost!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <Link
              href="/podcast/book"
              style={{
                background: '#FBF5E8',
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
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80"
                alt="Billboard screen"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Studio Arella Promo Card */}
        <div
          style={{
            background: '#1E1F24',
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
              href="/podcast/book"
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

      {/* Your top performing topics */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 14px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: '#000000', margin: 0 }}>
            Your top performing topics
          </h3>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Vertical connecting line */}
          <div style={{ position: 'absolute', left: 15.5, top: 16, bottom: 16, width: 1, background: '#E2E8F0', zIndex: 0 }} />
          {TOP_PERFORMING_TOPICS.map((topic, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: topic.avatarBg,
                  border: `2px solid ${theme.color.surface}`,
                }}
              >
                <img
                  src={topic.img}
                  alt={topic.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#000000',
                    margin: '0 0 2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {topic.title}
                </p>
                <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 400 }}>
                  {topic.listeners}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Podcast Booking Calendar */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 500, color: '#000000', margin: '0 0 12px' }}>
          Recent Podcast Booking Calendar
        </h3>

        {/* Date and Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 400 }}>Aug 15, Sat</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', background: '#1E293B', padding: '3px 8px', borderRadius: 12, letterSpacing: '0.02em' }}>
              TODAY
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}>
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Bookings cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderLeft: `3px solid #10B981`, borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#000000', margin: '0 0 4px' }}>Podcast session</p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>16:00</p>
          </div>
          <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderLeft: `3px solid #F59E0B`, borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#000000', margin: '0 0 4px' }}>Ad screen booking</p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>14:00</p>
          </div>
          <div style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderLeft: `3px solid #3B82F6`, borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#000000', margin: '0 0 4px' }}>Ad screen booking</p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>13:00</p>
          </div>
        </div>

        {/* Book podcast slot button */}
        <Link
          href="/podcast/book"
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
            href="/bookings"
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
