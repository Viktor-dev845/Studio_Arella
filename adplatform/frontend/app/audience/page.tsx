'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mic, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface Show {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  creator_name: string | null;
  episode_count: string;
}

export default function AudiencePreviewPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shows')
      .then((res) => setShows(res.data.shows || []))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, padding: '24px 32px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Users size={20} color={theme.color.gold} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
              Audience Preview
            </h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 28px' }}>
            This is a real, read-only preview of what a listener browsing Studio Arella's published podcasts would see — no booking, wallet, or creator tools here.
          </p>

          {loading ? (
            <p style={{ fontSize: 13, color: theme.color.text3 }}>Loading published podcasts…</p>
          ) : shows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: theme.color.surface2, borderRadius: 16, border: `1px dashed ${theme.color.border}` }}>
              <Mic size={28} color={theme.color.text4} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: theme.color.text3, margin: 0 }}>No podcasts have any published episodes yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {shows.map((s) => (
                <Link key={s.id} href={`/audience/${s.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden', background: theme.color.surface2, border: `1px solid ${theme.color.border}` }}>
                    {s.cover_url ? (
                      <img src={s.cover_url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mic size={28} color={theme.color.text4} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>{s.creator_name || 'Studio Arella Creator'} · {s.episode_count} episode{s.episode_count === '1' ? '' : 's'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
