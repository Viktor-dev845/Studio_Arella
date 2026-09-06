'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Film, Image as ImageIcon, Loader2, X, ArrowLeft, Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

interface AdDetail {
  id: string;
  booking_number: string;
  title: string;
  creative_url: string | null;
  file_type: string | null;
  start_time: string;
  end_time: string;
  status: string;
  total_cost: number;
  cost_per_sec: number;
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

function slotStatus(b: AdDetail): { label: string; className: string } {
  const now = Date.now();
  const start = new Date(b.start_time).getTime();
  const end = new Date(b.end_time).getTime();
  if (b.status === 'cancelled') return { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' };
  if (b.status === 'pending_payment') return { label: 'Pending', className: 'bg-amber-50 text-amber-600' };
  if (end <= now) return { label: 'Ended', className: 'bg-gray-100 text-gray-500' };
  if (start > now) return { label: `Goes live in ${formatRelative(start - now)}`, className: 'bg-amber-50 text-amber-600' };
  return { label: `Ends in ${formatRelative(end - now)}`, className: 'bg-green-50 text-green-600' };
}

const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

type ExtendUnit = 'minutes' | 'hours' | 'days';
const UNIT_MINUTES: Record<ExtendUnit, number> = { minutes: 1, hours: 60, days: 60 * 24 };

export default function MyAdDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const [showExtend, setShowExtend] = useState(false);
  const [extendAmount, setExtendAmount] = useState('1');
  const [extendUnit, setExtendUnit] = useState<ExtendUnit>('hours');
  const [extending, setExtending] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/bookings?limit=100')
      .then(res => {
        const row = (res.data.bookings || []).find((b: any) => b.id === params.id);
        setAd(row ? {
          id: row.id,
          booking_number: row.booking_number,
          title: row.creative_title || 'Screen Ad',
          creative_url: row.creative_url,
          file_type: row.file_type,
          start_time: row.start_time,
          end_time: row.end_time,
          status: row.status,
          total_cost: Number(row.total_cost) || 0,
          cost_per_sec: Number(row.cost_per_sec) || 0,
        } : null);
      })
      .catch(() => setAd(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [params.id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/bookings/${params.id}/cancel`, {});
      setShowCancel(false);
      setCancelSuccess(ad?.title || 'Your ad');
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not cancel this ad. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleExtend = async () => {
    const amount = Number(extendAmount);
    if (!amount || amount <= 0) return;
    const additionalMinutes = Math.round(amount * UNIT_MINUTES[extendUnit]);
    setExtending(true);
    try {
      const res = await api.put(`/bookings/${params.id}/extend`, { additional_minutes: additionalMinutes });
      setShowExtend(false);
      setExtendSuccess(res.data.additional_cost);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not extend this ad. Please try again.');
    } finally {
      setExtending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div style={{ padding: '80px 0', textAlign: 'center', color: theme.color.text3, fontFamily: F }}>
            <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            Loading…
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  if (!ad) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div style={{ padding: '80px 0', textAlign: 'center', fontFamily: F }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 12px' }}>Ad not found</p>
            <Link href="/my-ads" style={{ color: theme.color.gold, fontWeight: 700, textDecoration: 'none' }}>← Back to My Ads</Link>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const status = slotStatus(ad);
  const url = fullUrl(ad.creative_url);
  const now = Date.now();
  const canCancel = ['active', 'pending_payment'].includes(ad.status);
  const canExtend = ad.status === 'active' && new Date(ad.end_time).getTime() > now;

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Link href="/my-ads" style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.color.text2, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <ChevronLeft size={16} /> My Ads
            </Link>
            <div style={{ display: 'flex', gap: 10 }}>
              {canExtend && (
                <button onClick={() => setShowExtend(true)} style={{ padding: '9px 18px', background: theme.color.gold, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>
                  Extend Slot
                </button>
              )}
              {canCancel && (
                <button onClick={() => setShowCancel(true)} style={{ padding: '9px 18px', background: theme.color.surface, color: '#DC2626', border: `1px solid ${theme.color.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>
                  Cancel Ad
                </button>
              )}
            </div>
          </div>

          <div style={{ width: '100%', aspectRatio: '16 / 9', background: theme.color.surface2, borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {url ? (
              ad.file_type === 'video' ? (
                <video src={url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )
            ) : (
              ad.file_type === 'video' ? <Film size={40} color={theme.color.text4} /> : <ImageIcon size={40} color={theme.color.text4} />
            )}
          </div>

          <h1 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, textAlign: 'center', margin: '0 0 8px' }}>{ad.title}</h1>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${status.className}`}>{status.label}</span>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {naira(ad.total_cost)} · Booking #{ad.booking_number}
          </p>
        </div>

        {/* Cancel confirm */}
        {showCancel && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 340, width: '100%', margin: 16, textAlign: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 8px' }}>Are you sure you want to cancel this Ad?</h3>
              <p style={{ fontSize: 12, color: theme.color.text3, margin: '0 0 20px' }}>
                Refund eligibility depends on how far out your slot is — full refund if 48+ hours away, none if sooner.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCancel(false)} disabled={cancelling} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${theme.color.border}`, background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>No</button>
                <button onClick={handleCancel} disabled={cancelling} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: theme.color.gold, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {cancelling && <Loader2 size={13} className="animate-spin" />} Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel success */}
        {cancelSuccess && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 340, width: '100%', margin: 16, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: theme.color.gold, opacity: 0.25, filter: 'blur(16px)' }} />
                <div style={{ position: 'relative', width: 56, height: 56, margin: '10px auto 0', borderRadius: '50%', background: '#9E7B21', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} color="#fff" strokeWidth={3} />
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Ad cancelled</h3>
              <button onClick={() => setCancelSuccess(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: theme.color.gold, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Finish</button>
            </div>
          </div>
        )}

        {/* Extend modal */}
        {showExtend && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 24, maxWidth: 400, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 4px' }}>
                <button onClick={() => setShowExtend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={18} /></button>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Extend slot</h2>
                <button onClick={() => setShowExtend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="number" min={1} value={extendAmount} onChange={e => setExtendAmount(e.target.value)}
                    style={{ width: 90, padding: '11px', border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center' }} />
                  <select value={extendUnit} onChange={e => setExtendUnit(e.target.value as ExtendUnit)}
                    style={{ flex: 1, padding: '11px', border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                <p style={{ fontSize: 11.5, color: theme.color.text3 }}>Charged from your wallet — exact cost confirmed when you extend.</p>
                <button onClick={handleExtend} disabled={extending} style={{ padding: '13px', borderRadius: 12, border: 'none', background: theme.color.gold, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {extending && <Loader2 size={15} className="animate-spin" />} {extending ? 'Extending…' : 'Extend & pay from wallet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extend success */}
        {extendSuccess !== null && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 340, width: '100%', margin: 16, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: theme.color.gold, opacity: 0.25, filter: 'blur(16px)' }} />
                <div style={{ position: 'relative', width: 56, height: 56, margin: '10px auto 0', borderRadius: '50%', background: '#9E7B21', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} color="#fff" strokeWidth={3} />
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, margin: '0 0 8px' }}>Slot extended</h3>
              <p style={{ fontSize: 12, color: theme.color.text3, margin: '0 0 20px' }}>{naira(extendSuccess)} charged from your wallet.</p>
              <button onClick={() => setExtendSuccess(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: theme.color.gold, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Finish</button>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
