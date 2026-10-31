'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageTransition, FadeCard, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import { FaUsers, FaArrowRight, FaShield, FaDisplay, FaMoneyBillWave, FaCalendarCheck } from 'react-icons/fa6';
import { DollarSign, Megaphone, Monitor, CalendarCheck, Film, Paintbrush, Mic, Mail, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card: React.CSSProperties = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg };

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/bookings?limit=5')])
      .then(([s, b]) => { setStats(s.data); setRecentBookings(b.data.bookings || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const topCards = [
    { label: 'Total Users',    value: stats?.users    || 0, icon: FaUsers,        color: theme.color.gold, bg: theme.color.goldLight, border: theme.color.goldMid, href: '/admin/users' },
    { label: 'Total Revenue',  value: `₦${Number(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: theme.color.success, bg: theme.color.successLight, border: theme.color.success, href: '/admin/finances' },
    { label: 'All Campaigns',  value: stats?.campaigns || 0, icon: Megaphone,      color: theme.color.info, bg: theme.color.infoLight, border: theme.color.infoBorder, href: '/admin/campaigns' },
    { label: 'All Bookings',   value: stats?.bookings  || 0, icon: CalendarCheck,  color: theme.color.warning, bg: theme.color.warningLight, border: theme.color.warning, href: '/admin/bookings' },
    { label: 'Reg. Screens',   value: stats?.screens   || 0, icon: Monitor,        color: theme.color.glitchCyan, bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', href: '/admin/screens' },
  ];

  const pendingAttention = [
    stats?.pending_ads > 0 && {
      count: stats.pending_ads,
      label: 'Creatives awaiting review',
      href: '/admin/review',
      icon: Film,
      color: theme.color.warning,
      bg: theme.color.warningLight,
      border: theme.color.warning,
    },
    stats?.pending_requests > 0 && {
      count: stats.pending_requests,
      label: 'Creative requests pending',
      href: '/admin/requests',
      icon: Paintbrush,
      color: theme.color.info,
      bg: theme.color.infoLight,
      border: theme.color.infoBorder,
    },
    stats?.leads_count > 0 && {
      count: stats.leads_count,
      label: 'Ad inquiries & leads',
      href: '/admin/leads',
      icon: Mail,
      color: theme.color.gold,
      bg: theme.color.goldLight,
      border: theme.color.goldMid,
    },
  ].filter(Boolean) as any[];

  const adminActions = [
    { label: 'Manage Users',       href: '/admin/users',     Icon: FaUsers,        color: theme.color.gold, bg: theme.color.goldLight, border: theme.color.goldMid },
    { label: 'Creative Review',    href: '/admin/review',    Icon: Film,           color: theme.color.warning, bg: theme.color.warningLight, border: theme.color.warning },
    { label: 'Creative Requests',  href: '/admin/requests',  Icon: Paintbrush,     color: theme.color.info, bg: theme.color.infoLight, border: theme.color.infoBorder },
    { label: 'All Campaigns',      href: '/admin/campaigns', Icon: Megaphone,      color: theme.color.info, bg: theme.color.infoLight, border: theme.color.infoBorder },
    { label: 'All Bookings',       href: '/admin/bookings',  Icon: CalendarCheck,  color: theme.color.warning, bg: theme.color.warningLight, border: theme.color.warning },
    { label: 'Podcast Bookings',   href: '/admin/podcasts',  Icon: Mic,            color: theme.color.gold, bg: theme.color.goldLight, border: theme.color.goldMid },
    { label: 'All Screens',        href: '/admin/screens',   Icon: FaDisplay,      color: theme.color.success, bg: theme.color.successLight, border: theme.color.success },
    { label: 'Ad Leads',           href: '/admin/leads',     Icon: Mail,           color: theme.color.gold, bg: theme.color.goldLight, border: theme.color.goldMid },
    { label: 'Platform Wallet',    href: '/admin/finances',  Icon: FaMoneyBillWave,color: theme.color.warning, bg: theme.color.warningLight, border: theme.color.warning },
    { label: 'Blog Manager',       href: '/admin/blog',      Icon: FileText,       color: theme.color.info, bg: theme.color.infoLight, border: theme.color.infoBorder },
  ];

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <FaShield size={16} color={theme.color.gold} />
            <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.2px' }}>Studio Arella Overview</h1>
          </div>
          <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>Real-time snapshot of the Studio Arella advertising and creator ecosystem</p>
        </div>

        {/* Action Required Banner if pending items exist */}
        {pendingAttention.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 20, padding: '14px 18px', background: theme.color.surface, border: `1.5px solid ${theme.color.goldMid}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: theme.shadow.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.color.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} color={theme.color.goldDark} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1, margin: 0 }}>Actions Requiring Attention</p>
                <p style={{ fontSize: 12, color: theme.color.text3, margin: 0 }}>There are items awaiting your admin review or follow-up.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pendingAttention.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link key={item.label} href={item.href}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: item.bg, border: `1px solid ${item.border}`, borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, color: theme.color.text1 }}>
                    <ItemIcon size={12} color={item.color} />
                    <span><strong>{item.count}</strong> {item.label}</span>
                    <FaArrowRight size={10} color={theme.color.text3} />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stat cards */}
        <div className="stats-grid" style={{ marginBottom: 18 }}>
          {topCards.map(({ label, value, icon: Icon, color, bg, border, href }, i) => (
            <FadeCard key={label} delay={i * 0.06}>
              <Link href={href} style={{ ...card, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none', transition: 'all 0.15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ marginTop: 8 }}>
                  {loading ? <Skeleton width={50} height={22} style={{ marginBottom: 4 }} /> : <p style={{ fontSize: 22, fontWeight: 900, color: theme.color.text1, margin: 0, letterSpacing: '-0.4px' }}>{value}</p>}
                  <p style={{ fontSize: 11, color: theme.color.text3, margin: '2px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                </div>
              </Link>
            </FadeCard>
          ))}
        </div>

        <div className="stats-grid" style={{ gap: 16 }}>
          {/* Recent bookings */}
          <FadeCard delay={0.2} style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>Recent Bookings</p>
              <Link href="/admin/bookings" style={{ fontSize: 12, color: theme.color.gold, textDecoration: 'none', fontWeight: 700 }}>View all →</Link>
            </div>
            {recentBookings.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', background: theme.color.surface2, borderRadius: 10, border: `1px dashed ${theme.color.border}` }}>
                <FaCalendarCheck size={24} color={theme.color.text4} style={{ display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: theme.color.text4, margin: 0 }}>No bookings yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentBookings.map((b: any) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: theme.color.surface2, borderRadius: 10, border: `1px solid ${theme.color.border2}` }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: b.booking_type === 'podcast' ? theme.color.goldDark : theme.color.info, background: b.booking_type === 'podcast' ? theme.color.goldLight : theme.color.infoLight, padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                          {b.booking_type || 'ad'}
                        </span>
                        <p style={{ fontSize: 12, fontWeight: 700, color: theme.color.text1, margin: 0 }}>{b.booking_number}</p>
                      </div>
                      <p style={{ fontSize: 11, color: theme.color.text3, margin: '2px 0 0' }}>₦{Number(b.total_cost || 0).toLocaleString()} · {b.user_name || b.user_email || 'User'}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </FadeCard>

          {/* Admin quick actions */}
          <FadeCard delay={0.25} style={{ ...card, padding: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: '0 0 14px' }}>Quick Navigation</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
              {adminActions.map(({ label, href, Icon, color, bg, border }) => (
                <Link key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px', background: bg, border: `1px solid ${border}`, borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '0.85')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.color.text1, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 12px', background: theme.color.successLight, border: `1px solid ${theme.color.success}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: theme.color.success, boxShadow: `0 0 5px ${theme.color.success}` }} />
              <span style={{ fontSize: 12, color: theme.color.text1, fontWeight: 700 }}>Studio Arella platform active</span>
            </div>
          </FadeCard>

          {/* Recent users */}
          <FadeCard delay={0.3} style={{ ...card, gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.color.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>Recent User Registrations</p>
              <Link href="/admin/users" style={{ fontSize: 12, color: theme.color.gold, textDecoration: 'none', fontWeight: 700 }}>Manage users →</Link>
            </div>
            {!stats?.recent_users?.length ? (
              <div style={{ padding: '32px', textAlign: 'center', color: theme.color.text4, fontSize: 13 }}>No users signed up yet</div>
            ) : (
              <div className="responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: theme.color.surface2 }}>
                    {['Name','Email','Role','Credits','Joined'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: theme.color.text3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_users.map((u: any) => {
                    const rm = {
                      admin: { bg: theme.color.goldLight, text: theme.color.goldDark },
                      advertiser: { bg: theme.color.infoLight, text: theme.color.info },
                      screen_owner: { bg: theme.color.successLight, text: theme.color.success },
                    }[u.role as string] || { bg: theme.color.surface2, text: theme.color.text2 };
                    return (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderTop: `1px solid ${theme.color.border2}` }} whileHover={{ background: theme.color.surface2 }}>
                        <td style={{ padding: '11px 16px', fontWeight: 700, color: theme.color.text1 }}>{u.name}</td>
                        <td style={{ padding: '11px 16px', color: theme.color.text2 }}>{u.email}</td>
                        <td style={{ padding: '11px 16px' }}><span style={{ fontSize: 11, fontWeight: 700, color: rm.text, background: rm.bg, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>{u.role?.replace('_',' ')}</span></td>
                        <td style={{ padding: '11px 16px', color: theme.color.success, fontWeight: 700 }}>₦{Number(u.credits||0).toLocaleString()}</td>
                        <td style={{ padding: '11px 16px', color: theme.color.text3, fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </FadeCard>
        </div>
      </div>
    </PageTransition>
  );
}
