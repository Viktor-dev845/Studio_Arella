'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Mail, Phone, Building2, Calendar, FileText, Search, Trash2, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' } as React.CSSProperties;

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  message: string | null;
  created_at: string;
}

export default function AdLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchLeads = () => {
    api.get('/leads/admin')
      .then((res) => {
        setLeads(res.data || []);
      })
      .catch((err) => {
        toast('Failed to load inquiries', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/leads/admin/${deleteTarget.id}`);
      setLeads(prev => prev.filter(l => l.id !== deleteTarget.id));
      toast('Lead deleted successfully', 'success');
      setDeleteTarget(null);
      if (selectedLead?.id === deleteTarget.id) {
        setSelectedLead(null);
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to delete lead', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q))
    );
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ padding: '8px', background: theme.color.goldLight, borderRadius: theme.radius.md, display: 'flex' }}>
              <Mail size={20} color={theme.color.goldDark} />
            </div>
            <h1 style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.02em' }}>Inquiries & Ad Leads</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {leads.length} customer inquiries and lead submissions from the Studio Arella portal
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company, or message..."
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

        <div style={card}>
          {loading ? (
            <div style={{ padding: 48 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.color.border2}` }}>
                  <Skeleton height={14} width={180} style={{ marginBottom: 6 }} />
                  <Skeleton height={12} width={120} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: theme.color.text3 }}>
              <FileText size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: theme.color.text2 }}>No leads found</h3>
              <p style={{ margin: 0, fontSize: 13 }}>{leads.length === 0 ? 'When potential advertisers submit the contact form, their inquiries will appear here.' : 'No leads matched your search query.'}</p>
            </div>
          ) : (
            <Table>
              <TableHead>
                {['Contact Details', 'Company', 'Message Preview', 'Date', 'Actions'].map(h => (
                  <TableHeaderCell key={h}>{h}</TableHeaderCell>
                ))}
              </TableHead>
              <TableBody>
                {filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontWeight: 700, color: theme.color.text1 }}>{l.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.color.text3 }}>
                          <Mail size={12} />
                          <a href={`mailto:${l.email}`} style={{ color: theme.color.text2, textDecoration: 'none' }} onMouseOver={e => (e.currentTarget.style.color = theme.color.gold)} onMouseOut={e => (e.currentTarget.style.color = theme.color.text2)}>
                            {l.email}
                          </a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.color.text3 }}>
                          <Phone size={12} />
                          <a href={`tel:${l.phone}`} style={{ color: theme.color.text2, textDecoration: 'none' }}>
                            {l.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {l.company ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: theme.color.text1 }}>
                          <Building2 size={13} color={theme.color.text4} />
                          {l.company}
                        </div>
                      ) : (
                        <span style={{ color: theme.color.text4, fontSize: 12, fontStyle: 'italic' }}>None specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ maxWidth: 260 }}>
                        {l.message ? (
                          <p style={{ margin: 0, fontSize: 13, color: theme.color.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.message}>
                            {l.message}
                          </p>
                        ) : (
                          <span style={{ color: theme.color.text4, fontSize: 12, fontStyle: 'italic' }}>No message</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: theme.color.text3 }}>
                        <Calendar size={12} />
                        {new Date(l.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedLead(l)}
                          title="View complete inquiry"
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
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => setDeleteTarget(l)}
                          title="Delete lead"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.color.text3,
                            cursor: 'pointer',
                            padding: 4
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = theme.color.error)}
                          onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}
                        >
                          <Trash2 size={14} />
                        </button>
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
          {selectedLead && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLead(null)}
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
                        <Mail size={16} color={theme.color.goldDark} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>{selectedLead.name}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>{selectedLead.company || 'Direct Inquiry'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Email</div>
                        <a href={`mailto:${selectedLead.email}`} style={{ fontSize: 13, color: theme.color.gold, fontWeight: 600, marginTop: 2, display: 'block', textDecoration: 'none' }}>{selectedLead.email}</a>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase' }}>Phone</div>
                        <a href={`tel:${selectedLead.phone}`} style={{ fontSize: 13, color: theme.color.text1, fontWeight: 600, marginTop: 2, display: 'block', textDecoration: 'none' }}>{selectedLead.phone}</a>
                      </div>
                    </div>

                    <div style={{ background: theme.color.surface2, padding: '14px 16px', borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: theme.color.text4, textTransform: 'uppercase', marginBottom: 6 }}>Message / Request</div>
                      <p style={{ margin: 0, fontSize: 14, color: theme.color.text1, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {selectedLead.message || 'No additional message was provided with this contact submission.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: theme.color.text3 }}>Submitted {new Date(selectedLead.created_at).toLocaleString()}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            setDeleteTarget(selectedLead);
                          }}
                          style={{
                            padding: '8px 14px',
                            background: theme.color.errorLight,
                            color: theme.color.error,
                            border: `1px solid ${theme.color.error}`,
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setSelectedLead(null)}
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
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: theme.color.text1 }}>Delete Lead Inquiry?</h3>
                  <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.color.text3, lineHeight: 1.5 }}>
                    Inquiry from "{deleteTarget.name}" ({deleteTarget.email}) will be permanently deleted.
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
                      onClick={handleDeleteLead}
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
                      {deleting ? 'Deleting…' : 'Delete Lead'}
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
