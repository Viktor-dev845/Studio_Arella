'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useToast } from '@/components/ui/ToastProvider';
import { Megaphone, Search, Eye, Trash2, Pause, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' } as React.CSSProperties;

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchCampaigns = () => {
    api.get('/admin/campaigns?limit=100')
      .then(r => setCampaigns(r.data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/campaigns/${id}`, { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast(`Campaign status updated to ${newStatus}`, 'success');
      if (selectedCampaign && selectedCampaign.id === id) {
        setSelectedCampaign((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to update campaign status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/campaigns/${deleteTarget.id}`);
      setCampaigns(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast('Campaign deleted successfully', 'success');
      setDeleteTarget(null);
      if (selectedCampaign && selectedCampaign.id === deleteTarget.id) {
        setSelectedCampaign(null);
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to delete campaign', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = campaigns.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name?.toLowerCase().includes(q) ||
      c.user_name?.toLowerCase().includes(q) ||
      c.user_email?.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Megaphone size={18} color={theme.color.gold} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0 }}>All Campaigns</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {campaigns.length} total advertising campaigns created across Studio Arella
          </p>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search campaigns, owners, or emails..."
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

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'active', 'paused', 'ended', 'draft'].map(s => (
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
          <Table>
            <TableHead>
              {['Campaign', 'Owner', 'Budget', 'Spent', 'Impressions', 'Status', 'Actions'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} style={{ padding: '14px 16px' }}><Skeleton height={12} width={80} /></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: theme.color.text3 }}>No campaigns found</td></tr>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <span style={{ fontWeight: 700, color: theme.color.text1, display: 'block' }}>{c.name}</span>
                      {c.description && <span style={{ fontSize: 11, color: theme.color.text3 }}>{c.description.slice(0, 45)}...</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.color.text1 }}>{c.user_name || '—'}</div>
                      <div style={{ fontSize: 11, color: theme.color.text3 }}>{c.user_email || '—'}</div>
                    </div>
                  </TableCell>
                  <TableCell>₦{Number(c.budget || 0).toLocaleString()}</TableCell>
                  <TableCell><span style={{ color: theme.color.gold, fontWeight: 700 }}>₦{Number(c.spent || 0).toLocaleString()}</span></TableCell>
                  <TableCell>{Number(c.impressions || 0).toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedCampaign(c)}
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

                      {c.status === 'active' && (
                        <button
                          disabled={updatingId === c.id}
                          onClick={() => handleUpdateStatus(c.id, 'paused')}
                          title="Pause campaign"
                          style={{
                            background: theme.color.warningLight,
                            border: `1px solid ${theme.color.warning}`,
                            padding: '5px 8px',
                            borderRadius: 6,
                            color: theme.color.warning,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          <Pause size={12} /> Pause
                        </button>
                      )}

                      {c.status === 'paused' && (
                        <button
                          disabled={updatingId === c.id}
                          onClick={() => handleUpdateStatus(c.id, 'active')}
                          title="Resume campaign"
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
                          <Play size={12} /> Resume
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTarget(c)}
                        title="Delete campaign"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.color.text3,
                          cursor: 'pointer',
                          padding: 5
                        }}
                        onMouseOver={e => (e.currentTarget.style.color = theme.color.error)}
                        onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Campaign Details Modal */}
        <AnimatePresence>
          {selectedCampaign && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCampaign(null)}
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
                        <Megaphone size={16} color={theme.color.goldDark} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>{selectedCampaign.name}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>Owner: {selectedCampaign.user_name || '—'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCampaign(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedCampaign.description && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Description</div>
                        <div style={{ fontSize: 13, color: theme.color.text1, marginTop: 4, lineHeight: 1.5 }}>{selectedCampaign.description}</div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Status</div>
                        <div style={{ marginTop: 4 }}><StatusBadge status={selectedCampaign.status} /></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Budget</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: theme.color.text1, marginTop: 2 }}>₦{Number(selectedCampaign.budget || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Spent</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: theme.color.gold, marginTop: 2 }}>₦{Number(selectedCampaign.spent || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Impressions / Clicks</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, marginTop: 2 }}>
                          {Number(selectedCampaign.impressions || 0).toLocaleString()} / {Number(selectedCampaign.clicks || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedCampaign(null)}
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

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 111, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 400, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F, textAlign: 'center', padding: 24 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.color.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Trash2 size={20} color={theme.color.error} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: theme.color.text1 }}>Delete Campaign?</h3>
                  <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.color.text3, lineHeight: 1.5 }}>
                    "{deleteTarget.name}" will be permanently deleted from the platform.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setDeleteTarget(null)}
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
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteCampaign}
                      disabled={deleting}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: theme.color.error,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        opacity: deleting ? 0.7 : 1
                      }}
                    >
                      {deleting ? 'Deleting…' : 'Delete Campaign'}
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
