'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { FaUsers, FaMagnifyingGlass, FaUser, FaWallet, FaXmark } from 'react-icons/fa6';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card: React.CSSProperties = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' };

const roleMeta: Record<string, { bg: string; text: string }> = {
  admin:        { bg: theme.color.goldLight, text: theme.color.goldDark },
  advertiser:   { bg: theme.color.infoLight, text: theme.color.info },
  screen_owner: { bg: theme.color.successLight, text: theme.color.success },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  // Credit adjustment state
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditType, setCreditType] = useState<'credit' | 'debit'>('credit');
  const [creditReason, setCreditReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const { toast } = useToast();

  const fetchUsers = () => {
    api.get('/admin/users?limit=100')
      .then(r => setUsers(r.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id: string, role: string) => {
    setUpdating(id);
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
      toast(`Role updated to ${role.replace('_', ' ')}`, 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredits) return;
    const amountNum = parseFloat(creditAmount);
    if (!amountNum || amountNum <= 0) {
      toast('Please enter a valid positive amount', 'error');
      return;
    }

    setAdjusting(true);
    try {
      const res = await api.put(`/admin/users/${selectedUserForCredits.id}/credits`, {
        amount: amountNum,
        type: creditType,
        reason: creditReason.trim() || undefined,
      });

      const updatedUser = res.data.user;
      setUsers(p => p.map(u => u.id === updatedUser.id ? { ...u, credits: updatedUser.credits } : u));
      toast(res.data.message || 'Balance updated successfully', 'success');
      setSelectedUserForCredits(null);
      setCreditAmount('');
      setCreditReason('');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to adjust balance', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const filtered = users.filter(u => {
    const s = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return s && (roleFilter === 'all' || u.role === roleFilter);
  });

  const inputStyle: React.CSSProperties = {
    background: theme.color.surface,
    border: `1.5px solid ${theme.color.border}`,
    color: theme.color.text1,
    borderRadius: 9,
    padding: '9px 10px 9px 34px',
    fontSize: 13,
    outline: 'none',
    fontFamily: F,
    width: '100%',
    boxSizing: 'border-box'
  };

  const roleCounts = {
    total: users.length,
    advertiser: users.filter(u => u.role === 'advertiser').length,
    screen_owner: users.filter(u => u.role === 'screen_owner').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <FaUsers size={17} color={theme.color.gold} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0 }}>User Management</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
            {roleCounts.total} registered users ({roleCounts.advertiser} advertisers · {roleCounts.screen_owner} screen owners · {roleCounts.admin} admins)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FaMagnifyingGlass size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = theme.color.gold; }}
              onBlur={e => { e.target.style.borderColor = theme.color.border; }}
            />
          </div>
          {['all', 'advertiser', 'screen_owner', 'admin'].map(r => (
            <motion.button key={r} whileTap={{ scale: 0.96 }} onClick={() => setRoleFilter(r)}
              style={{
                padding: '8px 14px',
                background: roleFilter === r ? theme.color.gold : theme.color.surface,
                border: `1.5px solid ${roleFilter === r ? theme.color.gold : theme.color.border}`,
                color: roleFilter === r ? theme.color.charcoal900 : theme.color.text2,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: F,
                textTransform: 'capitalize'
              }}>
              {r === 'all' ? `All (${roleCounts.total})` : `${r.replace('_', ' ')} (${(roleCounts as any)[r] || 0})`}
            </motion.button>
          ))}
        </div>

        <div style={card}>
          <Table>
            <TableHead>
              {['User', 'Email', 'Role', 'Wallet Balance', 'Joined', 'Actions'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} style={{ padding: '14px 16px' }}><Skeleton height={13} width={j === 0 ? 110 : 70} /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: theme.color.text3 }}>No users found matching search or filter</td></tr>
              ) : filtered.map(u => {
                const rm = roleMeta[u.role] || roleMeta.advertiser;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.color.surface2, border: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color.text3, flexShrink: 0, fontWeight: 700, fontSize: 13 }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            u.name?.[0]?.toUpperCase() || <FaUser size={12} />
                          )}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: theme.color.text1, display: 'block' }}>{u.name}</span>
                          {u.business_name && <span style={{ fontSize: 11, color: theme.color.text3 }}>{u.business_name}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span style={{ fontSize: 11, fontWeight: 700, color: rm.text, background: rm.bg, padding: '3px 9px', borderRadius: 100, textTransform: 'capitalize' }}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: theme.color.success, fontWeight: 800 }}>₦{Number(u.credits || 0).toLocaleString()}</span>
                        <button
                          onClick={() => {
                            setSelectedUserForCredits(u);
                            setCreditAmount('');
                            setCreditReason('');
                            setCreditType('credit');
                          }}
                          title="Adjust balance"
                          style={{
                            background: theme.color.goldLight,
                            border: `1px solid ${theme.color.goldMid}`,
                            color: theme.color.goldDark,
                            borderRadius: 6,
                            padding: '3px 7px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <FaWallet size={10} /> Adjust
                        </button>
                      </div>
                    </TableCell>
                    <TableCell><span style={{ fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</span></TableCell>
                    <TableCell>
                      <select
                        value={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                        disabled={updating === u.id}
                        style={{
                          background: theme.color.surface2,
                          border: `1.5px solid ${theme.color.border}`,
                          color: theme.color.text1,
                          borderRadius: 7,
                          padding: '6px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: updating === u.id ? 'not-allowed' : 'pointer',
                          fontFamily: F,
                          outline: 'none'
                        }}
                      >
                        <option value="advertiser">Advertiser</option>
                        <option value="screen_owner">Screen Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Adjust Credits Modal */}
        <AnimatePresence>
          {selectedUserForCredits && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUserForCredits(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 440, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F }}
                >
                  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: theme.color.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaWallet size={15} color={theme.color.goldDark} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.color.text1 }}>Adjust Wallet Balance</h3>
                        <p style={{ margin: 0, fontSize: 12, color: theme.color.text3 }}>{selectedUserForCredits.name} ({selectedUserForCredits.email})</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUserForCredits(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text3, padding: 4 }}>
                      <FaXmark size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleAdjustCredits} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: '10px 14px', background: theme.color.surface2, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: theme.color.text3 }}>Current Balance:</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: theme.color.success }}>₦{Number(selectedUserForCredits.credits || 0).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setCreditType('credit')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: `1.5px solid ${creditType === 'credit' ? theme.color.success : theme.color.border}`,
                          background: creditType === 'credit' ? theme.color.successLight : theme.color.surface,
                          color: creditType === 'credit' ? theme.color.success : theme.color.text2,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        + Add Credits (Credit)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreditType('debit')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: `1.5px solid ${creditType === 'debit' ? theme.color.error : theme.color.border}`,
                          background: creditType === 'debit' ? theme.color.errorLight : theme.color.surface,
                          color: creditType === 'debit' ? theme.color.error : theme.color.text2,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        - Deduct Credits (Debit)
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                        Amount (₦) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={creditAmount}
                        onChange={e => setCreditAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: `1.5px solid ${theme.color.border}`,
                          background: theme.color.surface,
                          color: theme.color.text1,
                          fontSize: 14,
                          fontFamily: F,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                        Reason / Notes
                      </label>
                      <input
                        type="text"
                        value={creditReason}
                        onChange={e => setCreditReason(e.target.value)}
                        placeholder="e.g. Promotional bonus, manual bank transfer reconciliation..."
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
                        onClick={() => setSelectedUserForCredits(null)}
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
                        type="submit"
                        disabled={adjusting}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: creditType === 'credit' ? theme.color.gold : theme.color.error,
                          color: creditType === 'credit' ? theme.color.charcoal900 : '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: adjusting ? 'not-allowed' : 'pointer',
                          opacity: adjusting ? 0.7 : 1
                        }}
                      >
                        {adjusting ? 'Processing…' : creditType === 'credit' ? 'Confirm Top-Up' : 'Confirm Deduction'}
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
