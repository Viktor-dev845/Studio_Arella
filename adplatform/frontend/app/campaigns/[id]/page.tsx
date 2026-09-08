'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, DollarSign, Eye, Layers, Monitor } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const card: React.CSSProperties = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: 20 };

function naira(n: number) { return `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/campaigns/${id}`),
      api.get(`/bookings?campaign_id=${id}&limit=100`),
    ]).then(([campaignRes, bookingsRes]) => {
      setCampaign(campaignRes.data);
      setBookings(bookingsRes.data.bookings || []);
    }).catch(() => setCampaign(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div style={{ fontFamily: F }}>
            <Skeleton height={24} width={200} style={{ marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={80} />)}
            </div>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div style={{ fontFamily: F, textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 8px' }}>Campaign not found</p>
            <Link href="/campaigns" style={{ fontSize: 13, color: theme.color.gold, fontWeight: 700, textDecoration: 'none' }}>← Back to Campaigns</Link>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const budget = Number(campaign.budget || 0);
  const spent = Number(campaign.spent || 0);
  const remaining = Math.max(0, budget - spent);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F }}>
          <button onClick={() => router.push('/campaigns')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: theme.color.text2, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: F }}>
            <ChevronLeft size={16} /> Back to Campaigns
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>{campaign.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={campaign.status} />
                <span style={{ fontSize: 12, color: theme.color.text3 }}>
                  {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  {campaign.end_date ? ` – ${new Date(campaign.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarSign size={14} color={theme.color.gold} />
                <span style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Budget</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0 }}>{naira(budget)}</p>
            </div>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarSign size={14} color={theme.color.error} />
                <span style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Spent</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0 }}>{naira(spent)}</p>
            </div>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarSign size={14} color={theme.color.success} />
                <span style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remaining</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0 }}>{naira(remaining)}</p>
            </div>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Eye size={14} color={theme.color.info} />
                <span style={{ fontSize: 11, color: theme.color.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Impressions</span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: 0 }}>{Number(campaign.impressions || 0).toLocaleString()}</p>
            </div>
          </div>

          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.color.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={15} color={theme.color.gold} />
              <p style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>Bookings under this campaign ({bookings.length})</p>
            </div>
            <Table>
              <TableHead>
                {['Booking', 'Screen', 'Schedule', 'Cost', 'Status'].map((h) => <TableHeaderCell key={h}>{h}</TableHeaderCell>)}
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: theme.color.text3, fontSize: 13 }}>
                    No bookings attached to this campaign yet.
                  </td></tr>
                ) : bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell><span style={{ fontWeight: 700, color: theme.color.text1 }}>{b.booking_number}</span></TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Monitor size={12} color={theme.color.text3} />
                        {b.screen_name || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={12} color={theme.color.text3} />
                        {new Date(b.start_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell><span style={{ fontWeight: 700, color: theme.color.text1 }}>{naira(Number(b.total_cost))}</span></TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
