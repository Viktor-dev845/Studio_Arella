'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Mic, Play } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface Episode {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  audio_url: string;
  duration_seconds: number | null;
  status: string;
  created_at: string;
}
interface Show {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
}

function formatDuration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudienceShowPage() {
  const params = useParams<{ id: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api.get(`/shows/${params.id}`)
      .then((res) => {
        setShow(res.data.podcast);
        // A real audience view only ever sees genuinely published episodes,
        // never scheduled/draft ones the creator can see on their own page.
        setEpisodes((res.data.episodes || []).filter((e: Episode) => e.status === 'published'));
      })
      .catch(() => { setShow(null); setEpisodes([]); })
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, padding: '24px 32px 48px', maxWidth: 760 }}>
          <Link href="/audience" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: theme.color.text1, textDecoration: 'none', marginBottom: 20 }}>
            <ChevronLeft size={16} /> Back to Audience Preview
          </Link>

          {loading ? (
            <p style={{ fontSize: 13, color: theme.color.text3 }}>Loading…</p>
          ) : !show ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: theme.color.surface2, borderRadius: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>This podcast doesn&apos;t exist.</p>
              <Link href="/audience" style={{ fontSize: 13, fontWeight: 700, color: theme.color.gold, textDecoration: 'none' }}>← Back to Audience Preview</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
                <div style={{ width: 100, height: 100, borderRadius: 16, overflow: 'hidden', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, flexShrink: 0 }}>
                  {show.cover_url ? (
                    <img src={show.cover_url} alt={show.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={28} color={theme.color.text4} />
                    </div>
                  )}
                </div>
                <div>
                  <h1 style={{ fontFamily: theme.font.display, fontSize: 22, fontWeight: 800, color: theme.color.text1, margin: '0 0 6px' }}>{show.title}</h1>
                  {show.description && <p style={{ fontSize: 13, color: theme.color.text3, margin: 0, lineHeight: 1.5 }}>{show.description}</p>}
                </div>
              </div>

              <h2 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 14px' }}>Episodes ({episodes.length})</h2>

              {episodes.length === 0 ? (
                <p style={{ fontSize: 13, color: theme.color.text3 }}>No published episodes yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {episodes.map((ep) => (
                    <div key={ep.id} style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: playingId === ep.id ? 10 : 0 }}>
                        <button
                          onClick={() => setPlayingId(playingId === ep.id ? null : ep.id)}
                          style={{ width: 36, height: 36, borderRadius: '50%', background: theme.color.gold, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          title="Play episode"
                        >
                          <Play size={15} color="#fff" fill="#fff" />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: theme.color.text1, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.title}</p>
                          <p style={{ fontSize: 11.5, color: theme.color.text3, margin: 0 }}>
                            {new Date(ep.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {formatDuration(ep.duration_seconds) ? ` · ${formatDuration(ep.duration_seconds)}` : ''}
                          </p>
                        </div>
                      </div>
                      {playingId === ep.id && (
                        <audio controls autoPlay src={ep.audio_url} style={{ width: '100%', height: 36 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
