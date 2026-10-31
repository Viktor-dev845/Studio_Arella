'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { PageTransition, FadeCard, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Film,
  Image as ImageIcon,
  Search,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Check
} from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api').replace('/api', '');

function getMediaUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

const REJECTION_PRESETS = [
  'Low video / image resolution',
  'Text is too small or illegible for billboard display',
  'Content policy violation or inappropriate messaging',
  'Incorrect aspect ratio / distorted dimensions',
  'Missing required brand identification or disclaimer',
];

export default function AdminReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const [reviewing, setReviewing] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const fetchQueue = async (tab = activeTab) => {
    try {
      setLoading(true);
      const params: any = {};
      if (tab !== 'all') params.status = tab;
      const res = await api.get('/ads/review-queue', { params });
      setQueue(res.data.queue || []);
      if (res.data.counts) {
        setCounts(res.data.counts);
      }
    } catch (err: any) {
      toast('Failed to load review queue', 'error');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(activeTab);
  }, [activeTab]);

  const handleDecision = async (adId: string, decision: 'approved' | 'rejected') => {
    if (decision === 'rejected' && !reason.trim()) {
      toast('A rejection reason is required when rejecting a creative', 'error');
      return;
    }
    setReviewing(adId);
    try {
      await api.put(`/ads/${adId}/review`, { decision, rejection_reason: reason.trim() });
      toast(
        decision === 'approved'
          ? 'Creative approved! Advertiser was notified.'
          : 'Creative rejected. Advertiser was notified with feedback.',
        'success'
      );
      setSelected(null);
      setReason('');
      fetchQueue(activeTab);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Review action failed', 'error');
    } finally {
      setReviewing(null);
    }
  };

  const filteredQueue = useMemo(() => {
    if (!search.trim()) return queue;
    const q = search.toLowerCase();
    return queue.filter(
      (ad) =>
        (ad.title || '').toLowerCase().includes(q) ||
        (ad.advertiser_name || '').toLowerCase().includes(q) ||
        (ad.advertiser_email || '').toLowerCase().includes(q)
    );
  }, [queue, search]);

  return (
    <PageTransition>
      <div style={{ fontFamily: F, maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.color.goldLight, border: `1px solid ${theme.color.goldMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={18} color={theme.color.goldDark} />
              </div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                Ad Creative Review Queue
              </h1>
            </div>
            <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
              Review customer-submitted billboard & screen creatives. Approved creatives can immediately run on scheduled screens.
            </p>
          </div>

          <button
            onClick={() => fetchQueue(activeTab)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              background: theme.color.surface,
              border: `1px solid ${theme.color.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: theme.color.text2,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            <RotateCcw size={13} color={theme.color.text3} /> Refresh Queue
          </button>
        </div>

        {/* Notice Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(224,165,38,0.1) 0%, rgba(224,165,38,0.03) 100%)',
            border: `1px solid ${theme.color.goldMid}`,
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={16} color={theme.color.goldDark} />
            <span style={{ fontSize: 13, color: theme.color.text1, fontWeight: 600 }}>
              {counts.pending > 0
                ? `${counts.pending} creative${counts.pending === 1 ? '' : 's'} waiting for your review.`
                : 'All pending creatives have been reviewed. Great job!'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: theme.color.goldDark, fontWeight: 700 }}>
            Advertisers receive instant in-app & email notification upon review
          </span>
        </div>

        {/* Controls: Tabs & Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              background: theme.color.surface2,
              padding: 4,
              borderRadius: 12,
              border: `1px solid ${theme.color.border}`,
            }}
          >
            {[
              { id: 'pending', label: 'Pending Review', count: counts.pending, color: theme.color.goldDark },
              { id: 'approved', label: 'Approved', count: counts.approved, color: theme.color.success },
              { id: 'rejected', label: 'Rejected', count: counts.rejected, color: theme.color.error },
              { id: 'all', label: 'All Creatives', count: counts.all, color: theme.color.text2 },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 9,
                    border: 'none',
                    background: active ? theme.color.surface : 'transparent',
                    color: active ? theme.color.text1 : theme.color.text3,
                    boxShadow: active ? theme.shadow.sm : 'none',
                    fontWeight: active ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: F,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 100,
                      background: active ? theme.color.surface2 : 'rgba(0,0,0,0.04)',
                      color: tab.color,
                      border: `1px solid ${theme.color.border2}`,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
            <Search
              size={14}
              color={theme.color.text4}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, advertiser..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 10,
                border: `1px solid ${theme.color.border}`,
                background: theme.color.surface,
                color: theme.color.text1,
                fontSize: 13,
                fontFamily: F,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Creatives List */}
        {loading ? (
          <div style={{ background: theme.color.surface, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.border2}`, display: 'flex', gap: 16, alignItems: 'center' }}>
                <Skeleton width={80} height={60} radius={10} />
                <div style={{ flex: 1 }}>
                  <Skeleton height={16} width={200} style={{ marginBottom: 8 }} />
                  <Skeleton height={12} width={130} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredQueue.length === 0 ? (
          <FadeCard
            style={{
              background: theme.color.surface,
              borderRadius: 16,
              border: `1px solid ${theme.color.border}`,
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: theme.color.surface2,
                border: `1px solid ${theme.color.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Eye size={26} color={theme.color.text3} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>
              No creatives in this view
            </p>
            <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
              {search ? 'Try clearing your search term.' : `There are currently no ${activeTab === 'all' ? '' : activeTab} creatives.`}
            </p>
          </FadeCard>
        ) : (
          <div
            style={{
              background: theme.color.surface,
              borderRadius: 16,
              border: `1px solid ${theme.color.border}`,
              overflow: 'hidden',
              boxShadow: theme.shadow.sm,
            }}
          >
            {filteredQueue.map((ad, i) => {
              const mediaUrl = getMediaUrl(ad.file_url);
              const isVideo = ad.file_type === 'video' || ad.file_url?.endsWith('.mp4');
              const isPending = ad.status === 'pending';
              const isApproved = ad.status === 'approved';
              const isRejected = ad.status === 'rejected';

              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < filteredQueue.length - 1 ? `1px solid ${theme.color.border2}` : 'none',
                    display: 'flex',
                    gap: 18,
                    alignItems: 'flex-start',
                    background: isPending ? 'rgba(224,165,38,0.02)' : 'transparent',
                  }}
                >
                  {/* Thumbnail / Media Preview Box */}
                  <div
                    onClick={() => {
                      setSelected(ad);
                      setReason(ad.rejection_reason || '');
                    }}
                    style={{
                      width: 90,
                      height: 64,
                      borderRadius: 10,
                      background: theme.color.charcoal900,
                      border: `1px solid ${theme.color.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    title="Click to preview in modal"
                  >
                    {mediaUrl ? (
                      isVideo ? (
                        <>
                          <video
                            src={mediaUrl}
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Film size={20} color="#fff" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={mediaUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )
                    ) : (
                      <ImageIcon size={22} color={theme.color.text3} />
                    )}
                  </div>

                  {/* Main Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1 }}>
                            {ad.title || 'Untitled Creative'}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: theme.color.text2,
                              background: theme.color.surface2,
                              border: `1px solid ${theme.color.border}`,
                              padding: '2px 8px',
                              borderRadius: 6,
                              textTransform: 'uppercase',
                            }}
                          >
                            {ad.file_type || (isVideo ? 'video' : 'image')}
                          </span>
                          {ad.duration_seconds && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: theme.color.text2,
                                background: theme.color.surface2,
                                border: `1px solid ${theme.color.border}`,
                                padding: '2px 8px',
                                borderRadius: 6,
                              }}
                            >
                              {ad.duration_seconds}s
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: theme.color.text3, margin: '4px 0 0' }}>
                          Advertiser:{' '}
                          <strong style={{ color: theme.color.text2 }}>{ad.advertiser_name || 'Advertiser'}</strong> ·{' '}
                          <a
                            href={`mailto:${ad.advertiser_email}`}
                            style={{ color: theme.color.goldDark, textDecoration: 'none' }}
                          >
                            {ad.advertiser_email}
                          </a>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={ad.status} />
                      </div>
                    </div>

                    {/* Rejection reason callout if rejected */}
                    {isRejected && ad.rejection_reason && (
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          marginTop: 8,
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                        }}
                      >
                        <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>Rejection Reason: </span>
                          <span style={{ fontSize: 12, color: '#991B1B' }}>{ad.rejection_reason}</span>
                        </div>
                      </div>
                    )}

                    {/* Metadata & Review Actions Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 12,
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: theme.color.text4 }}>
                        <span>Submitted {new Date(ad.created_at).toLocaleString()}</span>
                        {ad.reviewed_at && (
                          <span>· Reviewed {new Date(ad.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {mediaUrl && (
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              background: theme.color.surface2,
                              border: `1px solid ${theme.color.border}`,
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              color: theme.color.text2,
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={12} color={theme.color.text3} /> View Raw Media
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setSelected(ad);
                            setReason(ad.rejection_reason || '');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 16px',
                            background: isPending ? theme.color.gold : theme.color.surface2,
                            border: `1px solid ${isPending ? theme.color.goldDark : theme.color.border}`,
                            color: isPending ? '#fff' : theme.color.text1,
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: F,
                            boxShadow: isPending ? theme.shadow.sm : 'none',
                          }}
                        >
                          <Eye size={13} />
                          {isPending ? 'Review & Decide' : 'Change Decision'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Review & Media Inspection Modal */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.65)',
                  zIndex: 200,
                  backdropFilter: 'blur(4px)',
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 201,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  padding: 16,
                }}
              >
                <motion.div
                  key="modal"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 640, maxHeight: '92vh', pointerEvents: 'auto', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      background: theme.color.surface,
                      borderRadius: 18,
                      padding: 24,
                      boxShadow: theme.shadow.lg,
                      border: `1px solid ${theme.color.border}`,
                      fontFamily: F,
                      overflowY: 'auto',
                    }}
                  >
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <h2 style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px' }}>
                          Review Creative: {selected.title}
                        </h2>
                        <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>
                          Submitted by <strong style={{ color: theme.color.text1 }}>{selected.advertiser_name}</strong> ({selected.advertiser_email})
                        </p>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>

                    {/* Media Preview Box */}
                    {getMediaUrl(selected.file_url) ? (
                      <div
                        style={{
                          background: '#0d1117',
                          borderRadius: 12,
                          padding: 10,
                          marginBottom: 18,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 220,
                          maxHeight: 340,
                          overflow: 'hidden',
                          border: `1px solid ${theme.color.border}`,
                        }}
                      >
                        {selected.file_type === 'video' || selected.file_url?.endsWith('.mp4') ? (
                          <video
                            src={getMediaUrl(selected.file_url)}
                            controls
                            autoPlay
                            loop
                            style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8 }}
                          />
                        ) : (
                          <img
                            src={getMediaUrl(selected.file_url)}
                            alt=""
                            style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 8 }}
                          />
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: theme.color.surface2,
                          borderRadius: 12,
                          padding: 24,
                          marginBottom: 18,
                          textAlign: 'center',
                          color: theme.color.text3,
                        }}
                      >
                        No preview file available
                      </div>
                    )}

                    {/* Rejection presets chips */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Quick Feedback Presets
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {REJECTION_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReason(p)}
                            style={{
                              background: reason === p ? theme.color.goldLight : theme.color.surface2,
                              border: `1px solid ${reason === p ? theme.color.goldMid : theme.color.border}`,
                              color: reason === p ? theme.color.goldDark : theme.color.text3,
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: F,
                              textAlign: 'left',
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rejection Reason Textarea */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Rejection Feedback Note <span style={{ color: theme.color.text4, fontWeight: 400 }}>(required only if rejecting)</span>
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Provide clear reasons so the advertiser can revise their media..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: theme.color.surface,
                          border: `1px solid ${theme.color.border}`,
                          borderRadius: 10,
                          fontSize: 13,
                          fontFamily: F,
                          color: theme.color.text1,
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          lineHeight: 1.5,
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => handleDecision(selected.id, 'rejected')}
                        disabled={reviewing === selected.id}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1.5px solid #FCA5A5',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontFamily: F,
                        }}
                      >
                        <XCircle size={15} /> Reject Creative
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecision(selected.id, 'approved')}
                        disabled={reviewing === selected.id}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#F0FDF4',
                          color: '#16A34A',
                          border: '1.5px solid #86EFAC',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontFamily: F,
                        }}
                      >
                        <CheckCircle2 size={15} /> Approve Creative
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '9px',
                        background: 'none',
                        color: theme.color.text3,
                        border: `1px solid ${theme.color.border}`,
                        borderRadius: 10,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: F,
                      }}
                    >
                      Cancel & Close
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
