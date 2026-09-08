'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FaDisplay, FaMapPin, FaPen, FaTrash } from 'react-icons/fa6';
import { Search, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' } as React.CSSProperties;

export default function AdminScreensPage() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', location: '', type: 'digital', size: '', price_per_sec: '', impressions_per_day: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchScreens = () => {
    setLoading(true);
    api.get('/admin/screens?limit=100')
      .then(r => setScreens(r.data.screens || []))
      .catch(() => setScreens([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchScreens(); }, []);

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name || '', location: s.location || '', type: s.type || 'digital',
      size: s.size || '', price_per_sec: String(s.price_per_sec ?? ''),
      impressions_per_day: String(s.impressions_per_day ?? ''), status: s.status || 'active',
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/screens/${editing.id}`, {
        ...form,
        price_per_sec: parseFloat(form.price_per_sec) || 0,
        impressions_per_day: parseInt(form.impressions_per_day) || 0,
      });
      toast('Screen updated', 'success');
      setEditing(null);
      fetchScreens();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to update screen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!confirm(`Remove "${s.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/screens/${s.id}`);
      setScreens(p => p.filter(x => x.id !== s.id));
      toast('Screen removed', 'info');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to remove screen', 'error');
    }
  };

  const filtered = screens.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors: Record<string, string> = { digital: theme.color.gold, billboard: theme.color.gold, indoor: theme.color.success, outdoor: theme.color.gold };

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Monitor size={18} color={theme.color.success} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.color.text1, margin: 0 }}>Studio Arella Screen</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>{screens.length} screens managed by Bems Group</p>
        </div>

        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search screens, locations, owners..." style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 10, color: theme.color.text1, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
        </div>

        <div style={card}>
          <Table>
            <TableHead>
              {['Screen', 'Location', 'Type', 'Owner', 'Price/sec', 'Status', 'Actions'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} style={{ padding: '14px 16px' }}><Skeleton height={12} width={80} /></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: theme.color.text3 }}>
                  <FaDisplay size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                  No screens found
                </td></tr>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${typeColors[s.type] || theme.color.gold}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FaDisplay size={14} color={typeColors[s.type] || theme.color.gold} />
                      </div>
                      <span style={{ fontWeight: 700, color: theme.color.text1 }}>{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FaMapPin size={11} color={theme.color.text3} />{s.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 700, color: typeColors[s.type] || theme.color.gold, background: `${typeColors[s.type] || theme.color.gold}18`, padding: '3px 9px', borderRadius: 100, textTransform: 'capitalize' }}>{s.type}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.owner_name || '—'}</div>
                      {s.owner_email && <div style={{ fontSize: 11, color: theme.color.text3 }}>{s.owner_email}</div>}
                    </div>
                  </TableCell>
                  <TableCell><span style={{ color: theme.color.success, fontWeight: 700 }}>₦{s.price_per_sec}/s</span></TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(s)} title="Edit screen"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex', padding: 4 }}
                        onMouseOver={e => (e.currentTarget.style.color = theme.color.gold)} onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}>
                        <FaPen size={13} />
                      </button>
                      <button onClick={() => handleDelete(s)} title="Delete screen"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, display: 'flex', padding: 4 }}
                        onMouseOver={e => (e.currentTarget.style.color = theme.color.error)} onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}>
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit screen modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.4)', zIndex: 200, backdropFilter: 'blur(3px)' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: 16 }}>
              <motion.div key="modal"
                initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.22, ease: theme.motion.easing }}
                style={{ width: '100%', maxWidth: 500, pointerEvents: 'auto' }}>
                <div style={{ background: theme.color.surface, borderRadius: theme.radius.xl, padding: 28, boxShadow: theme.shadow.lg, fontFamily: F }}>
                  <h2 style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 600, color: theme.color.text1, margin: '0 0 4px', letterSpacing: '-0.2px' }}>Edit Screen</h2>
                  <p style={{ fontSize: 12, color: theme.color.text3, margin: '0 0 20px' }}>Owned by {editing.owner_name || 'unknown'}{editing.owner_email ? ` (${editing.owner_email})` : ''}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Input label="Screen name *" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                    <Input label="Location *" type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                          style={{ width: '100%', padding: '11px 14px', background: theme.color.surface, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: 13, outline: 'none', fontFamily: F, color: theme.color.text1, boxSizing: 'border-box', cursor: 'pointer' }}>
                          <option value="digital">Digital LED</option>
                          <option value="billboard">Billboard</option>
                          <option value="indoor">Indoor</option>
                          <option value="outdoor">Outdoor</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: theme.color.text2, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                          style={{ width: '100%', padding: '11px 14px', background: theme.color.surface, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: 13, outline: 'none', fontFamily: F, color: theme.color.text1, boxSizing: 'border-box', cursor: 'pointer' }}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <Input label="Size" type="text" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input label="Price per second (₦)" type="number" value={form.price_per_sec} onChange={e => setForm({ ...form, price_per_sec: e.target.value })} />
                      <Input label="Impressions / day" type="number" value={form.impressions_per_day} onChange={e => setForm({ ...form, impressions_per_day: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                    <Button onClick={() => setEditing(null)} variant="secondary" style={{ flex: 1 }}>Cancel</Button>
                    <Button onClick={handleSaveEdit} loading={saving} loadingText="Saving..." variant="primary" style={{ flex: 1 }}>Save Changes</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
