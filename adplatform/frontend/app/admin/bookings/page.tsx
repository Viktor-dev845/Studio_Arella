'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/components/ui/ToastProvider';
import { CalendarCheck, Search, Eye, Ban, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden', boxShadow: theme.shadow.sm } as React.CSSProperties;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const { toast } = useToast();

  const fetchBookings = () => {
    api.get('/admin/bookings?limit=100')
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      if (cancelTarget.booking_type === 'podcast') {
        await api.put(`/admin/podcasts/${cancelTarget.id}/status`, {
          status: 'cancelled',
          reason: cancelReason || 'Cancelled by admin',
          refund: true,
        });
      } else {
        await api.put(`/bookings/${cancelTarget.id}/cancel`, {
          reason: cancelReason || 'Cancelled by admin',
          force_refund: true,
        });
      }

      toast(`Booking ${cancelTarget.booking_number} cancelled and refunded if eligible`, 'success');
      setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b));
      setCancelTarget(null);
      setCancelReason('');
      if (selectedBooking && selectedBooking.id === cancelTarget.id) {
        setSelectedBooking((prev: any) => ({ ...prev, status: 'cancelled' }));
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch =
      b.booking_number?.toLowerCase().includes(q) ||
      b.user_name?.toLowerCase().includes(q) ||
      b.user_email?.toLowerCase().includes(q) ||
      b.screen_name?.toLowerCase().includes(q) ||
      b.campaign_name?.toLowerCase().includes(q);

    const matchType = typeFilter === 'all' || b.booking_type === typeFilter;
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ padding: '8px', background: theme.color.goldLight, borderRadius: theme.radius.md, display: 'flex' }}>
              <CalendarCheck size={20} color={theme.color.goldDark} />
            </div>
            <h1 style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.02em' }}>All Bookings</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {bookings.length} total bookings on the platform (digital screen ads + podcast studio sessions)
          </p>
        </div>

        {/* Filters and search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by booking #, advertiser, screen, or package..." 
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: theme.color.surface,
                border: `1.5px solid ${theme.color.border}`,
                borderRadius: 9,
                color: theme.color.text1,
                fontSize: 13,
                outline: 'none',
                fontFamily: F,
                boxSizing: 'border-box'
              }} 
            />
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'ad', 'podcast'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${typeFilter === t ? theme.color.gold : theme.color.border}`,
                  background: typeFilter === t ? theme.color.gold : theme.color.surface,
                  color: typeFilter === t ? theme.color.charcoal900 : theme.color.text2,
                  textTransform: 'capitalize'
                }}
              >
                {t === 'all' ? 'All Types' : t === 'ad' ? 'Screen Ads' : 'Podcasts'}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'active', 'confirmed', 'pending_payment', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? theme.color.goldDark : theme.color.border}`,
                  background: statusFilter === s ? theme.color.surface2 : theme.color.surface,
                  color: statusFilter === s ? theme.color.goldDark : theme.color.text3,
                  textTransform: 'capitalize'
                }}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <Table>
            <TableHead>
              {['Booking #', 'Type', 'Advertiser', 'Screen / Package', 'Total Cost', 'Start Date', 'Status', 'Actions'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => <td key={j} style={{ padding: '14px 16px' }}><Skeleton height={12} width={80} /></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: theme.color.text3 }}>No bookings found</td></tr>
              ) : filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell><span style={{ fontWeight: 800, color: theme.color.text1 }}>{b.booking_number}</span></TableCell>
                  <TableCell>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                      background: b.booking_type === 'podcast' ? theme.color.goldLight : theme.color.infoLight,
                      color: b.booking_type === 'podcast' ? theme.color.goldDark : theme.color.info,
                      textTransform: 'uppercase'
                    }}>
                      {b.booking_type === 'podcast' ? 'Podcast' : 'Screen Ad'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.color.text1 }}>{b.user_name || 'User'}</div>
                      <div style={{ fontSize: 11, color: theme.color.text3 }}>{b.user_email || '—'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{b.screen_name || b.campaign_name || '—'}</TableCell>
                  <TableCell><span style={{ color: theme.color.success, fontWeight: 800 }}>₦{Number(b.total_cost || 0).toLocaleString()}</span></TableCell>
                  <TableCell><span style={{ fontSize: 12 }}>{b.start_time ? new Date(b.start_time).toLocaleDateString() : '—'}</span></TableCell>
                  <TableCell><StatusBadge status={b.status === 'confirmed' ? 'active' : b.status} /></TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        title="View details"
                        style={{
                          background: theme.color.surface2,
                          border: `1px solid ${theme.color.border}`,
                          padding: '5px 8px',
                          borderRadius: 6,
                          color: theme.color.text2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        <Eye size={13} />
                      </button>

                      {!['cancelled', 'completed', 'ended'].includes(b.status) && (
                        <button
                          onClick={() => {
                            setCancelTarget(b);
                            setCancelReason('');
                          }}
                          title="Cancel booking"
                          style={{
                            background: theme.color.errorLight,
                            border: `1px solid ${theme.color.error}`,
                            padding: '5px 8px',
                            borderRadius: 6,
                            color: theme.color.error,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          <Ban size={13} /> Cancel
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBooking(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 520, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarCheck size={16} color={theme.color.goldDark} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>Booking {selectedBooking.booking_number}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>Type: {selectedBooking.booking_type === 'podcast' ? 'Studio Session' : 'Screen Ad'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Customer</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, marginTop: 2 }}>{selectedBooking.user_name || '—'}</div>
                        <div style={{ fontSize: 12, color: theme.color.text3 }}>{selectedBooking.user_email || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Status</div>
                        <div style={{ marginTop: 4 }}><StatusBadge status={selectedBooking.status === 'confirmed' ? 'active' : selectedBooking.status} /></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Target Screen / Package</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.text1, marginTop: 2 }}>{selectedBooking.screen_name || selectedBooking.campaign_name || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Total Amount</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.color.success, marginTop: 2 }}>₦{Number(selectedBooking.total_cost || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Start Time</div>
                        <div style={{ fontSize: 13, color: theme.color.text1, marginTop: 2 }}>{selectedBooking.start_time ? new Date(selectedBooking.start_time).toLocaleString() : '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Created Date</div>
                        <div style={{ fontSize: 13, color: theme.color.text1, marginTop: 2 }}>{new Date(selectedBooking.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                      {!['cancelled', 'completed', 'ended'].includes(selectedBooking.status) && (
                        <button
                          onClick={() => {
                            setCancelTarget(selectedBooking);
                            setCancelReason('');
                          }}
                          style={{
                            padding: '8px 16px',
                            background: theme.color.errorLight,
                            color: theme.color.error,
                            border: `1px solid ${theme.color.error}`,
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Booking
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedBooking(null)}
                        style={{
                          padding: '8px 16px',
                          background: theme.color.surface2,
                          color: theme.color.text1,
                          border: `1px solid ${theme.color.border}`,
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Cancellation Modal */}
        <AnimatePresence>
          {cancelTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCancelTarget(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 111, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 440, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ban size={16} color={theme.color.error} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>Cancel Booking</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>{cancelTarget.booking_number} ({cancelTarget.booking_type || 'ad'})</p>
                      </div>
                    </div>
                    <button onClick={() => setCancelTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCancelBooking} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: theme.color.text2, lineHeight: 1.5 }}>
                      Are you sure you want to cancel booking <strong>{cancelTarget.booking_number}</strong>? If eligible, wallet credit will be refunded to the advertiser automatically.
                    </p>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                        Cancellation Reason *
                      </label>
                      <input
                        type="text"
                        required
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="e.g. Requested by client, screen technical maintenance..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: `1.5px solid ${theme.color.border}`,
                          background: theme.color.surface,
                          color: theme.color.text1,
                          fontSize: 13,
                          fontFamily: F,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setCancelTarget(null)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: theme.color.surface2,
                          color: theme.color.text2,
                          border: `1px solid ${theme.color.border}`,
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Nevermind
                      </button>
                      <button
                        type="submit"
                        disabled={cancelling}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: theme.color.error,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: cancelling ? 'not-allowed' : 'pointer',
                          opacity: cancelling ? 0.7 : 1
                        }}
                      >
                        {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
