'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, FadeCard, Skeleton } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Search,
  Loader2,
  Mic,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Mail,
  FileText,
  DollarSign,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';

const F = theme.font.body;

interface PodcastBooking {
  id: string;
  booking_number: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  package_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  addons: any[];
  base_cost: number | string;
  addons_cost: number | string;
  total_cost: number | string;
  status: string;
  payment_status: string;
  notes: string | null;
  cancellation_reason: string | null;
  refund_amount: number | string | null;
  cancelled_at: string | null;
  series_id: string | null;
  created_at: string;
}

export default function AdminPodcastsPage() {
  const [bookings, setBookings] = useState<PodcastBooking[]>([]);
  const [counts, setCounts] = useState({ all: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Modals
  const [selectedDetails, setSelectedDetails] = useState<PodcastBooking | null>(null);
  const [completeTarget, setCompleteTarget] = useState<PodcastBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PodcastBooking | null>(null);

  // Form states
  const [adminNotes, setAdminNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchBookings = async (tab = activeTab) => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (tab !== 'all') params.status = tab;
      const res = await api.get('/admin/podcasts', { params });
      setBookings(res.data.bookings || []);
      if (res.data.counts) {
        setCounts(res.data.counts);
      }
    } catch (err: any) {
      toast('Failed to load podcast bookings', 'error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleMarkCompleted = async () => {
    if (!completeTarget) return;
    setProcessing(true);
    try {
      await api.put(`/admin/podcasts/${completeTarget.id}/status`, {
        status: 'completed',
        notes: adminNotes.trim() ? `${completeTarget.notes ? completeTarget.notes + ' | ' : ''}Studio Note: ${adminNotes.trim()}` : completeTarget.notes,
      });
      toast(`Session ${completeTarget.booking_number} marked as completed. Customer notified.`, 'success');
      setCompleteTarget(null);
      setAdminNotes('');
      fetchBookings(activeTab);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to complete session', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setProcessing(true);
    try {
      await api.put(`/admin/podcasts/${cancelTarget.id}/status`, {
        status: 'cancelled',
        reason: cancelReason.trim() || 'Cancelled by admin',
        refund: refundToWallet,
      });
      toast(
        refundToWallet
          ? `Session ${cancelTarget.booking_number} cancelled & ₦${Number(cancelTarget.total_cost).toLocaleString()} refunded to customer wallet.`
          : `Session ${cancelTarget.booking_number} cancelled without refund.`,
        'success'
      );
      setCancelTarget(null);
      setCancelReason('');
      fetchBookings(activeTab);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to cancel session', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!search.trim()) return bookings;
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        (b.booking_number || '').toLowerCase().includes(q) ||
        (b.user_name || '').toLowerCase().includes(q) ||
        (b.user_email || '').toLowerCase().includes(q) ||
        (b.notes || '').toLowerCase().includes(q) ||
        (b.package_type || '').toLowerCase().includes(q)
    );
  }, [bookings, search]);

  return (
    <PageTransition>
      <div style={{ fontFamily: F, maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.color.goldLight, border: `1px solid ${theme.color.goldMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={18} color={theme.color.goldDark} />
              </div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                Podcast Studio Sessions
              </h1>
            </div>
            <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
              Manage physical recording studio bookings, complete live sessions, and handle customer cancellations & refunds.
            </p>
          </div>

          <button
            onClick={() => fetchBookings(activeTab)}
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
            <RotateCcw size={13} color={theme.color.text3} /> Refresh
          </button>
        </div>

        {/* Status Tabs & Search */}
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
              { id: 'all', label: 'All Sessions', count: counts.all, color: theme.color.text2 },
              { id: 'confirmed', label: 'Confirmed / Upcoming', count: counts.confirmed, color: theme.color.goldDark },
              { id: 'completed', label: 'Completed', count: counts.completed, color: theme.color.success },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: theme.color.error },
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
          <div style={{ position: 'relative', width: 300, maxWidth: '100%' }}>
            <Search
              size={14}
              color={theme.color.text4}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking #, name, notes..."
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

        {/* Main Table / Container */}
        <div
          style={{
            background: theme.color.surface,
            borderRadius: 16,
            border: `1px solid ${theme.color.border}`,
            overflow: 'hidden',
            boxShadow: theme.shadow.sm,
          }}
        >
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <Loader2 size={28} className="animate-spin" color={theme.color.gold} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: theme.color.text3 }}>Loading podcast sessions...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: theme.color.text3 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: theme.color.surface2, border: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Mic size={24} color={theme.color.text3} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px' }}>
                No podcast bookings found
              </p>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
                {search ? 'Try clearing your search term.' : `There are no ${activeTab === 'all' ? '' : activeTab} podcast sessions.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: theme.color.surface2, borderBottom: `1px solid ${theme.color.border}` }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Booking</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Customer</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Package & Schedule</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Session Notes</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Total</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: theme.color.text2, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    const isConfirmed = b.status === 'confirmed';
                    const isCompleted = b.status === 'completed';
                    const isCancelled = b.status === 'cancelled';

                    return (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: `1px solid ${theme.color.border}`,
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Booking Number */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <span
                            className="mono"
                            style={{
                              fontWeight: 800,
                              color: theme.color.text1,
                              display: 'inline-block',
                              background: theme.color.surface2,
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: `1px solid ${theme.color.border}`,
                            }}
                          >
                            {b.booking_number}
                          </span>
                          <div style={{ fontSize: 11, color: theme.color.text4, marginTop: 4 }}>
                            Booked {new Date(b.created_at).toLocaleDateString()}
                          </div>
                          {b.series_id && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: 4,
                                fontSize: 10,
                                fontWeight: 700,
                                color: theme.color.goldDark,
                                background: theme.color.goldLight,
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}
                            >
                              Recurring Series
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, color: theme.color.text1 }}>
                            {b.user_name || 'Customer'}
                          </div>
                          <div style={{ fontSize: 12, color: theme.color.text3 }}>
                            <a href={`mailto:${b.user_email}`} style={{ color: theme.color.text3, textDecoration: 'none' }}>
                              {b.user_email}
                            </a>
                          </div>
                        </td>

                        {/* Package & Schedule */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: theme.color.text1,
                                fontSize: 13,
                              }}
                            >
                              {b.package_type}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: theme.color.text3,
                                background: theme.color.surface2,
                                padding: '1px 6px',
                                borderRadius: 4,
                              }}
                            >
                              {b.duration_minutes ? `${b.duration_minutes} min` : '1 hr'}
                            </span>
                          </div>

                          <div style={{ fontSize: 12, color: theme.color.text2, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} color={theme.color.text3} />
                            <span>{new Date(b.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div style={{ fontSize: 12, color: theme.color.goldDark, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <Clock size={13} />
                            <span>
                              {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {b.addons && b.addons.length > 0 && (
                            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {b.addons.map((a: any, idx: number) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: 10,
                                    background: theme.color.surface2,
                                    color: theme.color.text2,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    border: `1px solid ${theme.color.border2}`,
                                  }}
                                >
                                  +{a.name || a}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Customer Notes */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top', maxWidth: 220 }}>
                          {b.notes ? (
                            <div
                              style={{
                                fontSize: 12,
                                color: theme.color.text2,
                                background: theme.color.surface2,
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: `1px solid ${theme.color.border2}`,
                                lineHeight: 1.4,
                              }}
                            >
                              "{b.notes}"
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: theme.color.text4 }}>No special notes</span>
                          )}

                          {isCancelled && b.cancellation_reason && (
                            <div style={{ marginTop: 6, fontSize: 11, color: theme.color.error }}>
                              <strong>Cancelled:</strong> {b.cancellation_reason}
                            </div>
                          )}
                        </td>

                        {/* Cost */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div className="mono" style={{ fontWeight: 800, color: theme.color.text1, fontSize: 14 }}>
                            ₦{Number(b.total_cost).toLocaleString()}
                          </div>
                          {b.payment_status === 'paid' ? (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 3 }}>
                              PAID
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, color: theme.color.goldDark, background: theme.color.goldLight, padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 3 }}>
                              {b.payment_status}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <StatusBadge status={b.status === 'confirmed' ? 'active' : b.status} />
                        </td>

                        {/* Action buttons */}
                        <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setSelectedDetails(b)}
                              style={{
                                padding: '6px 10px',
                                background: theme.color.surface2,
                                border: `1px solid ${theme.color.border}`,
                                borderRadius: 7,
                                fontSize: 12,
                                fontWeight: 600,
                                color: theme.color.text2,
                                cursor: 'pointer',
                                fontFamily: F,
                              }}
                            >
                              Details
                            </button>

                            {isConfirmed && (
                              <>
                                <button
                                  onClick={() => {
                                    setCompleteTarget(b);
                                    setAdminNotes('');
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#F0FDF4',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: 7,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#16A34A',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontFamily: F,
                                  }}
                                  title="Mark studio recording finished"
                                >
                                  <CheckCircle2 size={13} /> Complete
                                </button>

                                <button
                                  onClick={() => {
                                    setCancelTarget(b);
                                    setCancelReason('');
                                    setRefundToWallet(true);
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    borderRadius: 7,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontFamily: F,
                                  }}
                                >
                                  <XCircle size={13} /> Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Mark Completed */}
        <AnimatePresence>
          {completeTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCompleteTarget(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(3px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ width: '100%', maxWidth: 480, background: theme.color.surface, borderRadius: 18, padding: 24, border: `1px solid ${theme.color.border}`, boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} color="#16A34A" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: theme.color.text1 }}>Complete Podcast Session</h3>
                      <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>Booking #{completeTarget.booking_number}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: theme.color.text2, lineHeight: 1.5, marginBottom: 16 }}>
                    This confirms that <strong style={{ color: theme.color.text1 }}>{completeTarget.user_name}</strong>'s recording session ({completeTarget.package_type}) has wrapped up. An in-app notification will be sent to the customer.
                  </p>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                      Optional Studio / Handover Note
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Master audio WAV file uploaded to drive, stems provided..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: `1px solid ${theme.color.border}`,
                        background: theme.color.surface2,
                        color: theme.color.text1,
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setCompleteTarget(null)}
                      style={{ flex: 1, padding: '11px', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: theme.color.text2, cursor: 'pointer', fontFamily: F }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMarkCompleted}
                      disabled={processing}
                      style={{ flex: 1, padding: '11px', background: '#16A34A', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}
                    >
                      {processing ? 'Updating...' : 'Confirm Completed'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Modal: Cancel & Refund */}
        <AnimatePresence>
          {cancelTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCancelTarget(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(3px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ width: '100%', maxWidth: 480, background: theme.color.surface, borderRadius: 18, padding: 24, border: `1px solid ${theme.color.border}`, boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={18} color="#DC2626" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: theme.color.text1 }}>Cancel Podcast Session</h3>
                      <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>Booking #{cancelTarget.booking_number}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: theme.color.text2, lineHeight: 1.5, marginBottom: 16 }}>
                    Are you sure you want to cancel the session for <strong style={{ color: theme.color.text1 }}>{cancelTarget.user_name}</strong>?
                  </p>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                      Cancellation Reason <span style={{ color: theme.color.error }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Studio maintenance, client requested schedule conflict..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: `1px solid ${theme.color.border}`,
                        background: theme.color.surface2,
                        color: theme.color.text1,
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  {/* Refund checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      background: theme.color.surface2,
                      border: `1px solid ${theme.color.border}`,
                      borderRadius: 10,
                      marginBottom: 18,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={refundToWallet}
                      onChange={(e) => setRefundToWallet(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1 }}>
                        Refund ₦{Number(cancelTarget.total_cost).toLocaleString()} to Customer Wallet
                      </div>
                      <div style={{ fontSize: 11, color: theme.color.text3 }}>
                        Credits will be deposited immediately into customer's platform wallet balance.
                      </div>
                    </div>
                  </label>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setCancelTarget(null)}
                      style={{ flex: 1, padding: '11px', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: theme.color.text2, cursor: 'pointer', fontFamily: F }}
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={processing}
                      style={{ flex: 1, padding: '11px', background: '#DC2626', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}
                    >
                      {processing ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Modal: Full Booking Details */}
        <AnimatePresence>
          {selectedDetails && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDetails(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(3px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ width: '100%', maxWidth: 540, background: theme.color.surface, borderRadius: 18, padding: 24, border: `1px solid ${theme.color.border}`, boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 800, color: theme.color.goldDark }}>
                        {selectedDetails.booking_number}
                      </span>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 0', color: theme.color.text1 }}>
                        Podcast Session Breakdown
                      </h3>
                    </div>
                    <StatusBadge status={selectedDetails.status === 'confirmed' ? 'active' : selectedDetails.status} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: theme.color.surface2, padding: 12, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase' }}>Customer</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, marginTop: 2 }}>{selectedDetails.user_name || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: theme.color.text3 }}>{selectedDetails.user_email}</div>
                    </div>

                    <div style={{ background: theme.color.surface2, padding: 12, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase' }}>Package</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, marginTop: 2 }}>{selectedDetails.package_type}</div>
                      <div style={{ fontSize: 12, color: theme.color.text3 }}>{selectedDetails.duration_minutes || 60} minutes</div>
                    </div>

                    <div style={{ background: theme.color.surface2, padding: 12, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, marginTop: 2 }}>
                        {new Date(selectedDetails.start_time).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 12, color: theme.color.goldDark, fontWeight: 600 }}>
                        {new Date(selectedDetails.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(selectedDetails.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ background: theme.color.surface2, padding: 12, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase' }}>Financials</div>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, marginTop: 2 }}>
                        ₦{Number(selectedDetails.total_cost).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>
                        {selectedDetails.payment_status.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {selectedDetails.notes && (
                    <div style={{ marginBottom: 16, background: theme.color.surface2, padding: 12, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Customer Notes</div>
                      <div style={{ fontSize: 13, color: theme.color.text1, lineHeight: 1.4 }}>{selectedDetails.notes}</div>
                    </div>
                  )}

                  {selectedDetails.cancellation_reason && (
                    <div style={{ marginBottom: 16, background: '#FEF2F2', padding: 12, borderRadius: 10, border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Cancellation Reason</div>
                      <div style={{ fontSize: 13, color: '#991B1B' }}>{selectedDetails.cancellation_reason}</div>
                      {selectedDetails.refund_amount && Number(selectedDetails.refund_amount) > 0 && (
                        <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700, marginTop: 4 }}>
                          Refunded: ₦{Number(selectedDetails.refund_amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedDetails(null)}
                    style={{ width: '100%', padding: '10px', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: theme.color.text1, cursor: 'pointer', fontFamily: F }}
                  >
                    Close Details
                  </button>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
