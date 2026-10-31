'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Search, Loader2, Mic, Eye, CheckCircle2, Ban, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' } as React.CSSProperties;

export default function AdminPodcastsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refundToWallet, setRefundToWallet] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/podcasts?limit=100');
      setBookings(res.data.bookings || []);
    } catch (err: any) {
      toast('Failed to load podcast bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, reason?: string, refund = false) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/podcasts/${id}/status`, {
        status: newStatus,
        reason,
        refund,
      });
      toast(res.data.message || `Booking status updated to ${newStatus}`, 'success');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      setCancelTarget(null);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to update booking status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      (b.booking_number || '').toLowerCase().includes(q) ||
      (b.user_name || '').toLowerCase().includes(q) ||
      (b.user_email || '').toLowerCase().includes(q) ||
      (b.package_type || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ padding: '8px', background: theme.color.goldLight, borderRadius: theme.radius.md, display: 'flex' }}>
              <Mic size={20} color={theme.color.goldDark} />
            </div>
            <h1 style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.02em' }}>All Podcast Bookings</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {bookings.length} studio recording and production bookings across Studio Arella
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking #, name, email, or package..."
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                borderRadius: 9,
                border: `1.5px solid ${theme.color.border}`,
                background: theme.color.surface,
                color: theme.color.text1,
                fontSize: 13,
                outline: 'none',
                fontFamily: F,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? theme.color.gold : theme.color.border}`,
                  background: statusFilter === s ? theme.color.gold : theme.color.surface,
                  color: statusFilter === s ? theme.color.charcoal900 : theme.color.text2,
                  textTransform: 'capitalize'
                }}
              >
                {s === 'all' ? 'All Statuses' : s}
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><Loader2 size={24} className="animate-spin" color={theme.color.gold} style={{ margin: '0 auto' }} /></div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: theme.color.text3 }}>
              {bookings.length === 0 ? 'No podcast bookings found.' : 'No bookings match your search.'}
            </div>
          ) : (
            <Table>
              <TableHead>
                {['Booking', 'Customer', 'Package & Schedule', 'Amount', 'Status', 'Actions'].map(h => (
                  <TableHeaderCell key={h}>{h}</TableHeaderCell>
                ))}
              </TableHead>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div style={{ fontWeight: 800, color: theme.color.text1 }}>{b.booking_number}</div>
                      <div style={{ fontSize: 11, color: theme.color.text4, marginTop: 2 }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 600, color: theme.color.text1 }}>{b.user_name || 'Studio Creator'}</div>
                      <div style={{ fontSize: 11, color: theme.color.text3 }}>{b.user_email || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 700, color: theme.color.text1 }}>{b.package_type}</div>
                      <div style={{ fontSize: 12, color: theme.color.text3, marginTop: 2 }}>
                        {new Date(b.start_time).toLocaleString()} ({Math.round(b.duration_minutes / 60)} hr)
                      </div>
                      {b.addons && b.addons.length > 0 && (
                        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {b.addons.map((a: any, i: number) => (
                            <span key={i} style={{ background: theme.color.surface2, padding: '1px 6px', borderRadius: 4, fontSize: 10, color: theme.color.text2 }}>
                              {a.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ fontWeight: 800, color: theme.color.success }}>
                        ₦{Number(b.total_cost).toLocaleString()}
                      </div>
                      {b.payment_status === 'paid' && <div style={{ fontSize: 10, color: theme.color.success, fontWeight: 700, marginTop: 2 }}>PAID</div>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status === 'confirmed' ? 'active' : b.status} />
                    </TableCell>
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
                            fontSize: 12
                          }}
                        >
                          <Eye size={13} />
                        </button>

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            title="Mark completed"
                            style={{
                              background: theme.color.successLight,
                              border: `1px solid ${theme.color.success}`,
                              padding: '5px 8px',
                              borderRadius: 6,
                              color: theme.color.success,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle2 size={13} /> Complete
                          </button>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setCancelTarget(b);
                              setCancelReason('');
                              setRefundToWallet(true);
                            }}
                            title="Cancel session"
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
          )}
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
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 500, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mic size={16} color={theme.color.goldDark} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>Session {selectedBooking.booking_number}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>{selectedBooking.package_type}</p>
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
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Session Time</div>
                        <div style={{ fontSize: 13, color: theme.color.text1, marginTop: 2 }}>{new Date(selectedBooking.start_time).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Total Amount</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: theme.color.success, marginTop: 2 }}>₦{Number(selectedBooking.total_cost || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    {selectedBooking.notes && (
                      <div style={{ padding: '12px 14px', background: theme.color.surface2, borderRadius: 8, fontSize: 13, color: theme.color.text2 }}>
                        <strong>Notes:</strong> {selectedBooking.notes}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
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
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>Cancel Podcast Session</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>{cancelTarget.booking_number} ({cancelTarget.package_type})</p>
                      </div>
                    </div>
                    <button onClick={() => setCancelTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateStatus(cancelTarget.id, 'cancelled', cancelReason, refundToWallet);
                  }} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: theme.color.text2, lineHeight: 1.5 }}>
                      Cancel studio session <strong>{cancelTarget.booking_number}</strong> for {cancelTarget.user_name || 'the user'}?
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
                        placeholder="e.g. Schedule clash, studio maintenance..."
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

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.color.text1, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={refundToWallet}
                        onChange={e => setRefundToWallet(e.target.checked)}
                      />
                      <span>Refund session fee (₦{Number(cancelTarget.total_cost).toLocaleString()}) to user wallet</span>
                    </label>

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
                        Keep Session
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: theme.color.error,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          opacity: actionLoading ? 0.7 : 1
                        }}
                      >
                        {actionLoading ? 'Cancelling…' : 'Confirm Cancel'}
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
