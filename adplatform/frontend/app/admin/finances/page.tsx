'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PageTransition, FadeCard, Skeleton } from '@/components/ui/Animations';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { DollarSign, TrendingUp, Users, CreditCard, Search } from 'lucide-react';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: 20 } as React.CSSProperties;

export default function AdminFinancesPage() {
  const [stats, setStats] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/transactions?limit=100')])
      .then(([s, t]) => { setStats(s.data); setTxns(t.data.transactions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = [
    { label: 'Total Platform Revenue', value: `₦${Number(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: theme.color.success, bg: theme.color.successLight },
    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: theme.color.gold, bg: theme.color.goldLight },
    { label: 'Total Bookings', value: stats?.bookings || 0, icon: CreditCard, color: theme.color.gold, bg: theme.color.goldLight },
    { label: 'Registered Screens', value: stats?.screens || 0, icon: TrendingUp, color: theme.color.info, bg: theme.color.infoLight },
  ];

  const filteredTxns = txns.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      (t.reference || '').toLowerCase().includes(q) ||
      (t.source || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.user_name || '').toLowerCase().includes(q) ||
      (t.user_email || '').toLowerCase().includes(q);

    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <DollarSign size={18} color={theme.color.success} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0 }}>Platform Revenue & Finances</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>Financial overview of the Studio Arella advertising and podcast ecosystem</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {summaryCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <FadeCard key={label} delay={i * 0.08} style={{ ...card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={color} />
                </div>
                <div>
                  {loading ? <Skeleton width={60} height={20} style={{ marginBottom: 4 }} /> : <p style={{ fontSize: 20, fontWeight: 900, color: theme.color.text1, margin: 0, letterSpacing: '-0.3px' }}>{value}</p>}
                  <p style={{ fontSize: 11, color: theme.color.text3, margin: '2px 0 0', fontWeight: 600 }}>{label}</p>
                </div>
              </div>
            </FadeCard>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions by reference, source, description, user..."
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

          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'credit', 'debit', 'refund', 'pending'].map(t => (
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
                {t === 'all' ? 'All Transactions' : t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.color.border2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
              Recent Transactions ({filteredTxns.length})
            </p>
          </div>
          <Table>
            <TableHead>
              {['Date', 'Customer', 'Type', 'Source', 'Amount', 'Reference'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} style={{ padding: '14px 20px' }}><Skeleton height={12} width={80} /></td>)}
                </tr>
              )) : filteredTxns.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: theme.color.text3 }}>No transactions found</td></tr>
              ) : filteredTxns.map(t => {
                const isPending = t.type === 'pending';
                const isCredit = t.type === 'credit' || t.type === 'refund';
                const color = isPending ? theme.color.warning : isCredit ? theme.color.success : theme.color.error;
                const bg = isPending ? theme.color.warningLight : isCredit ? theme.color.successLight : theme.color.errorLight;
                return (
                  <TableRow key={t.id}>
                    <TableCell><span style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString()}</span></TableCell>
                    <TableCell>
                      <div>
                        <div style={{ fontWeight: 600, color: theme.color.text1 }}>{t.user_name || 'System / Platform'}</div>
                        {t.user_email && <div style={{ fontSize: 11, color: theme.color.text3 }}>{t.user_email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 11, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: theme.color.text1, display: 'block' }}>
                          {t.source?.replace(/_/g, ' ')}
                        </span>
                        {t.description && <span style={{ fontSize: 11, color: theme.color.text3 }}>{t.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 800, color }}>
                        {isPending ? '' : isCredit ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell><span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.color.text3 }}>{t.reference || '—'}</span></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageTransition>
  );
}
