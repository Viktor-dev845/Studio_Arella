'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import RequestCreativeServiceModal from '@/components/ui/RequestCreativeServiceModal';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

interface AdCard {
  id: string;
  booking_number: string;
  title: string;
  creative_url: string | null;
  file_type: string | null;
  start_time: string;
  end_time: string;
  status: string;
  total_cost: number;
}

function fullUrl(url: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function formatRelative(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}hr${hrs !== 1 ? 's' : ''}`;
  const days = Math.round(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

function slotStatus(b: AdCard): { label: string; className: string } {
  const now = Date.now();
  const start = new Date(b.start_time).getTime();
  const end = new Date(b.end_time).getTime();

  if (b.status === 'cancelled') return { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' };
  if (b.status === 'pending_payment') return { label: 'Pending', className: 'bg-amber-50 text-amber-600' };
  if (end <= now) return { label: 'Ended', className: 'bg-gray-100 text-gray-500' };
  if (start > now) return { label: `Goes live in ${formatRelative(start - now)}`, className: 'bg-amber-50 text-amber-600' };
  return { label: `Ends in ${formatRelative(end - now)}`, className: 'bg-green-50 text-green-600' };
}

export default function MyAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<AdCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [upcoming, setUpcoming] = useState<{ title: string; time: string }[]>([]);

  useEffect(() => {
    api.get('/bookings?limit=100')
      .then(res => {
        const rows: AdCard[] = (res.data.bookings || []).map((b: any) => ({
          id: b.id,
          booking_number: b.booking_number,
          title: b.creative_title || 'Screen Ad',
          creative_url: b.creative_url,
          file_type: b.file_type,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status,
          total_cost: Number(b.total_cost) || 0,
        }));
        setAds(rows);
        setUpcoming(
          rows
            .filter(b => b.status !== 'cancelled' && new Date(b.start_time).getTime() >= Date.now())
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 3)
            .map(b => ({ title: b.title, time: b.start_time }))
        );
      })
      .catch(() => { setAds([]); setUpcoming([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* Main column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0 }}>My Ads</h1>
              <Link href="/book" style={{ padding: '10px 22px', background: theme.color.gold, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                Book Ad Slot
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center', color: theme.color.text3 }}>
                <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                Loading your ads…
              </div>
            ) : ads.length === 0 ? (
              <div style={{ background: theme.color.surface, border: `1px dashed ${theme.color.border}`, borderRadius: 20, padding: '60px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>You haven't booked any ad slots yet</p>
                <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px' }}>Book a slot on the Bems Junction screen to see it here.</p>
                <Link href="/book" style={{ padding: '11px 24px', background: theme.color.gold, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                  Book Ad Slot
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {ads.map(ad => {
                  const status = slotStatus(ad);
                  const url = fullUrl(ad.creative_url);
                  return (
                    <Link
                      key={ad.id}
                      href={`/my-ads/${ad.id}`}
                      style={{ textDecoration: 'none', background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s' }}
                    >
                      <div style={{ width: '100%', aspectRatio: '4 / 3', background: theme.color.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {url ? (
                          ad.file_type === 'video' ? (
                            <video src={url} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )
                        ) : (
                          ad.file_type === 'video' ? <Film size={28} color={theme.color.text4} /> : <ImageIcon size={28} color={theme.color.text4} />
                        )}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${status.className}`}>{status.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: theme.color.charcoal900, borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.5 }}>
                You got a billboard discount on your next Ad space patronage!
              </p>
              <button
                onClick={() => setShowCreativeModal(true)}
                style={{ width: '100%', padding: '10px', background: theme.color.gold, color: theme.color.charcoal900, border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Request creative service
              </button>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: '0 0 12px' }}>Recent Ad Booking Calendar</p>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: 12, color: theme.color.text3 }}>No upcoming ad slots.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {upcoming.map((u, i) => (
                    <div key={i} style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 8, padding: '9px 12px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: theme.color.text1, margin: '0 0 2px' }}>{u.title}</p>
                      <p style={{ fontSize: 10.5, color: theme.color.text3, margin: 0 }}>{new Date(u.time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/bookings" style={{ fontSize: 11, fontWeight: 700, color: theme.color.gold, textDecoration: 'none' }}>
                See full calendar →
              </Link>
            </div>

            <Link
              href="/chat"
              style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 24, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', boxShadow: theme.shadow.sm, alignSelf: 'flex-start' }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700, color: theme.color.text1 }}>Chat with Arella</span>
              <span style={{ fontSize: 15 }}>🌐</span>
            </Link>
          </div>
        </div>

        <RequestCreativeServiceModal open={showCreativeModal} onClose={() => setShowCreativeModal(false)} />
      </PageTransition>
    </DashboardLayout>
  );
}
