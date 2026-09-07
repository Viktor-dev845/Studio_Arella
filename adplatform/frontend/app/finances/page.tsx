'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  Globe,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';

const F = theme.font.body;

export default function FinancesPage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adBookings, setAdBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Modals
  const [showFundModal, setShowFundModal] = useState(false);
  const [showReservedModal, setShowReservedModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  
  // Fund Wallet state
  const [amount, setAmount] = useState('25000');
  const [adding, setAdding] = useState(false);
  
  // Reserved Account KYC state
  const [idType, setIdType] = useState('bvn');
  const [idNumber, setIdNumber] = useState('');
  const [creatingReserved, setCreatingReserved] = useState(false);
  
  // Clipboard copy states
  const [copiedWalletId, setCopiedWalletId] = useState(false);
  const [copiedBankAcct, setCopiedBankAcct] = useState(false);
  
  // Table Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { toast } = useToast();

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [b, t, r, ab] = await Promise.all([
        api.get('/finances/balance'),
        api.get('/finances/transactions?limit=50'),
        api.get('/finances/revenue'),
        api.get('/bookings?limit=100'),
      ]);

      setBalance({
        ...b.data,
        credits: b.data?.credits ?? 0,
        total_revenue: r.data?.total_revenue ?? 0,
        reserved_account_name: b.data?.reserved_account_number ? `Studio Arella / ${user?.name || 'Creator'}` : null,
      });
      setTransactions(t.data?.transactions || []);
      setAdBookings(ab.data?.bookings || []);
    } catch {
      setBalance(null);
      setTransactions([]);
      setAdBookings([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [user]);

  // Copy helpers
  const handleCopyWalletId = (walletId: string) => {
    navigator.clipboard.writeText(walletId);
    setCopiedWalletId(true);
    toast('Wallet ID copied to clipboard', 'success');
    setTimeout(() => setCopiedWalletId(false), 3000);
  };

  const handleCopyBankAcct = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBankAcct(true);
    toast('Account number copied to clipboard', 'success');
    setTimeout(() => setCopiedBankAcct(false), 3000);
  };

  // Fund wallet initialization
  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!val || val < 1000) { 
      toast('Minimum top-up is ₦1,000 (1 minute)', 'error'); 
      return; 
    }
    setAdding(true);
    try {
      const { data } = await api.post('/payments/initialize-credits', { amount: val });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast('Could not start checkout — please try again.', 'error');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not start checkout — please try again.', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Create reserved account
  const handleCreateReserved = async () => {
    if (!idNumber || idNumber.length < 10) { 
      toast(`Please enter a valid 11-digit ${idType.toUpperCase()}`, 'error'); 
      return; 
    }
    setCreatingReserved(true);
    try {
      const { data } = await api.post('/payments/reserved-account', { idType, idNumber });
      toast('Dedicated account generated successfully!', 'success');
      setBalance((prev: any) => ({
        ...prev,
        reserved_account_number: data.account_number,
        reserved_account_bank: data.bank_name,
        reserved_account_name: data.account_name || `Studio Arella / ${user?.name || 'Creator'}`
      }));
      setShowReservedModal(false);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not generate a dedicated account. Please try again.', 'error');
    } finally {
      setCreatingReserved(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Tab filter
      if (activeTab === 'credit' && !(t.type === 'credit' || t.type === 'refund')) return false;
      if (activeTab === 'debit' && t.type !== 'debit') return false;
      
      // Status filter
      const txStatus = t.type === 'pending' ? 'pending' : 'successful';
      if (filterStatus !== 'all' && txStatus !== filterStatus) return false;
      
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sourceMatch = (t.source || '').toLowerCase().includes(query);
        const refMatch = (t.reference || '').toLowerCase().includes(query);
        const channelMatch = (t.channel || '').toLowerCase().includes(query);
        if (!sourceMatch && !refMatch && !channelMatch) return false;
      }
      return true;
    });
  }, [transactions, activeTab, filterStatus, searchQuery]);

  // Pagination calculation
  const totalRecords = filteredTransactions.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const currentRecords = filteredTransactions.slice(startIndex, endIndex);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast('No transactions available to export', 'error');
      return;
    }
    const headers = ['Reference', 'Date', 'Type', 'Source', 'Channel', 'Amount (NGN)', 'Status'];
    const rows = filteredTransactions.map(t => [
      `"${t.reference || ''}"`,
      `"${new Date(t.created_at).toISOString()}"`,
      `"${t.type}"`,
      `"${t.source}"`,
      `"${t.channel || 'Direct'}"`,
      t.amount,
      `"${t.type === 'pending' ? 'pending' : 'successful'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Studio_Arella_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Transaction history downloaded as CSV', 'success');
  };

  const walletCredits = balance?.credits ?? 0;
  const totalSpending = balance?.total_revenue ?? 0;
  const walletId = user?.id ? user.id.slice(0, 13) : '—';
  const hasReservedAccount = Boolean(balance?.reserved_account_number);
  const dedicatedBank = balance?.reserved_account_bank || null;
  const dedicatedAcct = balance?.reserved_account_number || null;

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

          {loadError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#B91C1C' }}>
              Could not load your wallet data. Please refresh the page.
            </div>
          )}

          {/* ─── PAGE HEADER ─── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.3px' }}>
                  Wallet
                </h1>
              </div>
              <p style={{ fontSize: 13, color: theme.color.text3, margin: 0, fontWeight: 500 }}>
                Manage your airtime credits, view real-time balances, and track financial transactions.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setShowReservedModal(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: theme.color.surface, 
                  border: `1px solid ${theme.color.border}`, 
                  borderRadius: 10, 
                  padding: '10px 18px', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: theme.color.text2, 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  fontFamily: F
                }}
              >
                <Building2 size={14} color="#C69A2C" />
                <span>Dedicated Bank Account</span>
              </button>

              <button 
                onClick={() => setShowFundModal(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: '#C69A2C', 
                  border: 'none', 
                  borderRadius: 10, 
                  padding: '10px 22px', 
                  fontSize: 13, 
                  fontWeight: 800, 
                  color: '#FFFFFF', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(198, 154, 44, 0.25)',
                  fontFamily: F
                }}
              >
                <Plus size={14} />
                <span>+ Fund Wallet</span>
              </button>
            </div>
          </div>

          {/* ─── TOP 4 METRIC CARDS ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {[
              {
                label: 'Available Balance',
                value: `₦${walletCredits.toLocaleString()}`,
                subValue: `$${(walletCredits / 1500).toFixed(0).toLocaleString()} USD`,
                icon: CreditCard,
                color: '#C69A2C',
                bg: '#FFFDF5'
              },
              {
                label: 'Total Spent',
                value: `₦${totalSpending.toLocaleString()}`,
                subValue: 'Screen Ads & Studio',
                icon: TrendingDown,
                color: '#EF4444',
                bg: '#FEF2F2'
              },
              {
                label: 'Total Transactions',
                value: transactions.length.toString(),
                subValue: `${transactions.filter(t => t.type === 'credit' || t.type === 'refund').length} In · ${transactions.filter(t => t.type === 'debit').length} Out`,
                icon: DollarSign,
                color: '#10B981',
                bg: '#F0FDF4'
              },
              {
                label: 'Active Ad Slots',
                value: `${adBookings.filter(b => b.status === 'active').length} Active`,
                subValue: `of ${adBookings.length} total ad bookings`,
                icon: Sparkles,
                color: '#6366F1',
                bg: '#EEF2FF'
              },
            ].map((stat, i) => (
              <FadeCard key={stat.label} delay={i * 0.05} style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.color.text3 }}>{stat.label}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={16} color={stat.color} />
                  </div>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: theme.color.text1, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 600 }}>{stat.subValue}</p>
              </FadeCard>
            ))}
          </div>

          {/* ─── DUAL VISUAL CARDS ROW (Figma Signature Section) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Card A: Dark Olive Promo Card */}
            <FadeCard delay={0.15} style={{ background: 'linear-gradient(145deg, #4A401A 0%, #2A240E 100%)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(42, 36, 14, 0.15)' }}>
              {/* Golden ambient circle glow */}
              <div style={{ position: 'absolute', bottom: -30, right: -30, width: 140, height: 140, background: 'rgba(212,175,55,0.25)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: -40, left: -40, width: 100, height: 100, background: 'rgba(212,175,55,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E3C762' }}>
                    Special Broadcast Offer
                  </span>
                  <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>
                    Instant Airtime
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.3px' }}>
                  Book Ad slot from ₦1,000/min
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500 }}>
                  Instant digital screen activation across high-traffic prime Lagos studios.
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 1, marginTop: 18 }}>
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.25)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Triple golden dots */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C69A2C' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  </div>

                  <Link 
                    href="/book"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 18px', 
                      background: theme.color.surface, 
                      color: theme.color.text1, 
                      borderRadius: 10, 
                      fontSize: 12, 
                      fontWeight: 800, 
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>Book Ad Slot</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </FadeCard>

            {/* Card B: Signature Gold Gradient Wallet Card */}
            <FadeCard delay={0.2} style={{ background: 'linear-gradient(145deg, #D4AF37 0%, #B49020 100%)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(180, 144, 32, 0.25)' }}>
              {/* Bright yellow radial orb */}
              <div style={{ position: 'absolute', bottom: -28, right: -28, width: 110, height: 110, background: '#FDE68A', borderRadius: '50%', opacity: 0.9, pointerEvents: 'none' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={17} color="#FFFFFF" />
                    <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.02em' }}>
                      Wallet Bal
                    </span>
                  </div>
                  <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.2)', color: '#FFFFFF', padding: '2px 8px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                    Active
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.4)', margin: '8px 0 12px', width: '100%' }} />

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <p style={{ fontSize: 26, color: '#FFFFFF', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                    $ {(walletCredits / 1500).toFixed(0).toLocaleString()}
                  </p>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                    / ₦{walletCredits.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                    Wallet ID: <code style={{ fontFamily: 'monospace', fontWeight: 700 }}>{walletId}</code>
                  </span>
                  <button
                    onClick={() => handleCopyWalletId(walletId)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}
                    title="Copy Wallet ID"
                  >
                    {copiedWalletId ? <Check size={11} color="#A7F3D0" /> : <Copy size={11} />}
                    <span>{copiedWalletId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1, marginTop: 16, display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => setShowFundModal(true)}
                  style={{ 
                    flex: 1, 
                    padding: '8px 14px', 
                    background: theme.color.charcoal900, 
                    color: '#FFFFFF', 
                    border: 'none', 
                    borderRadius: 8, 
                    fontSize: 12, 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6 
                  }}
                >
                  <Plus size={13} /> Fund Wallet
                </button>
                <button
                  onClick={() => hasReservedAccount ? handleCopyBankAcct(dedicatedAcct!) : setShowReservedModal(true)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Building2 size={13} /> {hasReservedAccount ? (copiedBankAcct ? 'Copied Acct' : 'Bank Acct') : 'Create Acct'}
                </button>
              </div>
            </FadeCard>

          </div>

          {/* ─── DEDICATED VIRTUAL ACCOUNT BANNER ─── */}
          <FadeCard delay={0.25} style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color="#C69A2C" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                    Dedicated Virtual Bank Account
                  </p>
                  {hasReservedAccount && (
                    <span style={{ fontSize: 10, background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                      Zero Transfer Fees
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: theme.color.text3, margin: '3px 0 0', fontWeight: 500 }}>
                  {hasReservedAccount
                    ? <>Bank: <strong style={{ color: theme.color.text1 }}>{dedicatedBank}</strong> · Account Name: <strong style={{ color: theme.color.text1 }}>{balance?.reserved_account_name || 'Studio Arella'}</strong></>
                    : "You haven't generated a dedicated account yet — create one to top up by bank transfer."}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {hasReservedAccount ? (
                <>
                  <div style={{ background: theme.color.bg, border: `1px solid ${theme.color.border}`, borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {dedicatedAcct}
                    </span>
                    <button
                      onClick={() => handleCopyBankAcct(dedicatedAcct!)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedBankAcct ? '#10B981' : '#C69A2C', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                    >
                      {copiedBankAcct ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedBankAcct ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowReservedModal(true)}
                    style={{ background: 'none', border: 'none', color: theme.color.text3, fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change details
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowReservedModal(true)}
                  style={{ background: '#C69A2C', border: 'none', color: '#FFFFFF', borderRadius: 10, padding: '10px 18px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  Generate Account
                </button>
              )}
            </div>
          </FadeCard>

          {/* ─── TRANSACTION HISTORY SECTION ─── */}
          <FadeCard delay={0.3} style={{ background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            
            {/* Toolbar Header */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.color.surface2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              
              {/* Title & Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: theme.color.text1, margin: 0, letterSpacing: '-0.2px' }}>
                  Transaction History
                </h2>

                <div style={{ display: 'inline-flex', background: theme.color.bg, padding: 3, borderRadius: 10, border: `1px solid ${theme.color.border}` }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'credit', label: 'Money In (+)' },
                    { id: 'debit', label: 'Money Out (-)' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                      style={{
                        background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                        color: activeTab === tab.id ? theme.color.text1 : theme.color.text3,
                        border: 'none',
                        borderRadius: 7,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: activeTab === tab.id ? 800 : 600,
                        cursor: 'pointer',
                        boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.15s',
                        fontFamily: F
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Search, Filter, Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: 220 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text4 }} />
                  <input 
                    type="text" 
                    placeholder="Search transaction..." 
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px 8px 34px', 
                      background: theme.color.bg, 
                      border: `1px solid ${theme.color.border}`, 
                      borderRadius: 10, 
                      fontSize: 12, 
                      fontWeight: 500, 
                      color: '#1E293B', 
                      outline: 'none',
                      fontFamily: F
                    }}
                  />
                </div>

                {/* Filter Popup Button */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowFilterPopup(o => !o)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      background: filterStatus !== 'all' ? '#FFFDF5' : '#FFFFFF', 
                      border: `1px solid ${filterStatus !== 'all' ? '#C69A2C' : theme.color.border}`, 
                      borderRadius: 10, 
                      padding: '8px 14px', 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: filterStatus !== 'all' ? '#C69A2C' : '#475569', 
                      cursor: 'pointer',
                      fontFamily: F
                    }}
                  >
                    <Filter size={13} />
                    <span>Filter</span>
                  </button>

                  <AnimatePresence>
                    {showFilterPopup && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 8,
                          background: theme.color.surface,
                          border: `1px solid ${theme.color.border}`,
                          borderRadius: 14,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          padding: 16,
                          width: 220,
                          zIndex: 50
                        }}
                      >
                        <p style={{ fontSize: 12, fontWeight: 800, color: theme.color.text1, margin: '0 0 10px' }}>Filter by Status</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {['all', 'successful', 'pending', 'failed'].map(st => (
                            <button
                              key={st}
                              onClick={() => { setFilterStatus(st); setShowFilterPopup(false); setCurrentPage(1); }}
                              style={{
                                textAlign: 'left',
                                padding: '6px 10px',
                                background: filterStatus === st ? '#FFFDF5' : 'transparent',
                                color: filterStatus === st ? '#C69A2C' : theme.color.text2,
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: filterStatus === st ? 700 : 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Export Button */}
                <button 
                  onClick={handleExportCSV}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    background: theme.color.surface, 
                    border: '1px solid #C69A2C', 
                    color: '#C69A2C', 
                    borderRadius: 10, 
                    padding: '8px 16px', 
                    fontSize: 12, 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    fontFamily: F
                  }}
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
              </div>

            </div>

            {/* Responsive Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: theme.color.bg, borderBottom: `1px solid ${theme.color.border}` }}>
                    {['Transaction / Info', 'Type', 'Payment Channel', 'Reference', 'Amount (NGN)', 'Status', 'Action'].map((h, i) => (
                      <th 
                        key={h} 
                        style={{ 
                          padding: '14px 20px', 
                          color: theme.color.text3, 
                          fontWeight: 700, 
                          fontSize: 11, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em',
                          textAlign: i === 4 ? 'right' : 'left'
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                          <DollarSign size={24} color="#C69A2C" />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 4px' }}>No transactions found</p>
                        <p style={{ fontSize: 12, color: theme.color.text4, margin: 0 }}>Try clearing your search query or status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map(t => {
                      const isCredit = t.type === 'credit' || t.type === 'refund';
                      const isPending = t.type === 'pending';
                      return (
                        <tr 
                          key={t.id}
                          style={{ borderBottom: `1px solid ${theme.color.surface2}`, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FBFDFE'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Transaction Info */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: isPending ? '#FFFBEB' : isCredit ? '#ECFDF5' : '#FEF2F2',
                                border: `1px solid ${isPending ? '#FDE68A' : isCredit ? '#A7F3D0' : '#FECACA'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isPending ? <Clock size={16} color="#D97706" /> : isCredit ? <ArrowDownLeft size={16} color="#059669" /> : <ArrowUpRight size={16} color="#DC2626" />}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 2px' }}>
                                  {t.source}
                                </p>
                                <p style={{ fontSize: 11, color: theme.color.text4, margin: 0 }}>
                                  {new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 12,
                              background: isPending ? '#FFFBEB' : isCredit ? '#ECFDF5' : theme.color.bg,
                              color: isPending ? '#D97706' : isCredit ? '#059669' : theme.color.text3,
                              border: `1px solid ${isPending ? '#FDE68A' : isCredit ? '#A7F3D0' : theme.color.border}`
                            }}>
                              {isPending ? <Clock size={11} /> : isCredit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {isPending ? 'Pending' : t.type === 'refund' ? 'Refund' : isCredit ? 'Credit' : 'Debit'}
                            </span>
                          </td>

                          {/* Payment Channel */}
                          <td style={{ padding: '16px 20px', color: '#475569', fontSize: 13, fontWeight: 600 }}>
                            {t.channel || 'Card / Monnify'}
                          </td>

                          {/* Reference */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: theme.color.text3, fontFamily: 'monospace', fontWeight: 600 }}>
                                {t.reference}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(t.reference);
                                  toast('Reference copied', 'success');
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text4, padding: 2 }}
                                title="Copy reference"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: isPending ? '#D97706' : isCredit ? '#059669' : theme.color.text1,
                              letterSpacing: '-0.3px'
                            }}>
                              {isPending ? '' : isCredit ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 20,
                              background: isPending ? '#FFFBEB' : '#F0FDF4',
                              color: isPending ? '#D97706' : '#16A34A',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPending ? '#D97706' : '#16A34A' }} />
                              {isPending ? 'Pending' : 'Successful'}
                            </span>
                          </td>

                          {/* Action / Receipt */}
                          <td style={{ padding: '16px 20px' }}>
                            <button
                              onClick={() => setSelectedReceipt(t)}
                              style={{ 
                                background: '#FFFDF5', 
                                border: '1px solid #FDE68A', 
                                color: '#C69A2C', 
                                borderRadius: 8, 
                                padding: '5px 12px', 
                                fontSize: 12, 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontFamily: F
                              }}
                            >
                              <Receipt size={12} />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.color.surface2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              {/* Left: Page Size Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: theme.color.text3, fontWeight: 600 }}>Showing</span>
                <select 
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: 8, 
                    border: `1px solid ${theme.color.border}`, 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: theme.color.text1, 
                    background: theme.color.surface,
                    outline: 'none',
                    fontFamily: F
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* Center: Range text */}
              <div style={{ fontSize: 12, color: theme.color.text3, fontWeight: 600 }}>
                Showing {totalRecords === 0 ? 0 : startIndex + 1} to {endIndex} out of {totalRecords} records
              </div>

              {/* Right: Page Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `1px solid ${theme.color.border}`,
                    background: theme.color.surface,
                    color: currentPage === 1 ? theme.color.border2 : theme.color.text2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: isActive ? '1px solid #C69A2C' : '1px solid transparent',
                        background: isActive ? '#FFFDF5' : 'transparent',
                        color: isActive ? '#C69A2C' : theme.color.text3,
                        fontSize: 12,
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        fontFamily: F
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `1px solid ${theme.color.border}`,
                    background: theme.color.surface,
                    color: currentPage === totalPages ? theme.color.border2 : theme.color.text2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </FadeCard>

        </div>

        {/* ─── MODAL 1: FUND WALLET ─── */}
        <AnimatePresence>
          {showFundModal && (
            <>
              <motion.div 
                key="fund-bd" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowFundModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} 
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div 
                  key="fund-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }} 
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}
                >
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '28px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={18} color="#C69A2C" />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                          Fund Wallet
                        </h2>
                      </div>
                      <button 
                        onClick={() => setShowFundModal(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text4, padding: 4 }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 20px', lineHeight: 1.5 }}>
                      Add funds instantly using Debit Card, USSD, or Bank Transfer. Minimum top-up is ₦1,000 (1 airtime minute).
                    </p>

                    {/* Quick Amount Presets */}
                    <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.color.text3, margin: '0 0 8px' }}>
                      Select Amount Preset
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
                      {['5000', '10000', '25000', '50000', '100000', '250000'].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset)}
                          style={{
                            padding: '10px 4px',
                            borderRadius: 10,
                            border: amount === preset ? '1.5px solid #C69A2C' : `1px solid ${theme.color.border}`,
                            background: amount === preset ? '#FFFDF5' : '#FFFFFF',
                            color: amount === preset ? '#C69A2C' : theme.color.text2,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: F
                          }}
                        >
                          ₦{Number(preset).toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div style={{ marginBottom: 16 }}>
                      <Input 
                        label="Or Enter Custom Amount (₦)" 
                        type="number" 
                        placeholder="e.g. 15000" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                      />
                    </div>

                    {/* Airtime Conversion Summary */}
                    <div style={{ background: theme.color.bg, border: `1px solid ${theme.color.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: theme.color.text3, fontWeight: 600 }}>Equivalent Airtime:</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: theme.color.text1 }}>
                          ~{Math.floor((Number(amount) || 0) / 1000)} broadcast minutes
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: theme.color.text3, fontWeight: 600 }}>Payment Gateway:</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                          Monnify (Zero Surcharge)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => setShowFundModal(false)} variant="secondary" style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <Button 
                        loading={adding} 
                        loadingText="Connecting..." 
                        onClick={handleAdd} 
                        variant="primary" 
                        style={{ flex: 1.4, background: '#C69A2C' }}
                      >
                        <ArrowRight size={13} /> Proceed to Pay ₦{Number(amount || 0).toLocaleString()}
                      </Button>
                    </div>

                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── MODAL 2: DEDICATED PERMANENT ACCOUNT (KYC) ─── */}
        <AnimatePresence>
          {showReservedModal && (
            <>
              <motion.div 
                key="res-bd" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowReservedModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} 
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div 
                  key="res-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }} 
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}
                >
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '28px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFDF5', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={18} color="#C69A2C" />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.color.text1, margin: 0 }}>
                          Dedicated Bank Account
                        </h2>
                      </div>
                      <button 
                        onClick={() => setShowReservedModal(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text4, padding: 4 }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 18px', lineHeight: 1.5 }}>
                      Provide your BVN or NIN to generate a personalized Wema/Sterling account number. Any transfer to this account automatically tops up your wallet in seconds.
                    </p>

                    {/* ID Type selector */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      {['bvn', 'nin'].map(type => (
                        <label 
                          key={type}
                          style={{ 
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: 8, 
                            padding: '10px', 
                            borderRadius: 10, 
                            border: idType === type ? '1.5px solid #C69A2C' : `1px solid ${theme.color.border}`,
                            background: idType === type ? '#FFFDF5' : '#FFFFFF',
                            color: idType === type ? '#C69A2C' : theme.color.text2,
                            fontSize: 13, 
                            fontWeight: 700, 
                            cursor: 'pointer' 
                          }}
                        >
                          <input 
                            type="radio" 
                            name="idType" 
                            value={type} 
                            checked={idType === type} 
                            onChange={() => setIdType(type)}
                            style={{ display: 'none' }}
                          />
                          <span>{type.toUpperCase()} Verification</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Input 
                        label={idType === 'bvn' ? 'Bank Verification Number (11 digits)' : 'National Identity Number (11 digits)'} 
                        type="text" 
                        maxLength={11}
                        placeholder={`Enter your 11-digit ${idType.toUpperCase()}`} 
                        value={idNumber} 
                        onChange={e => setIdNumber(e.target.value)} 
                      />
                    </div>

                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ShieldCheck size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.5 }}>
                        <strong>CBN KYC Protected:</strong> Your verification is transmitted securely to Monnify and NIBSS. Studio Arella does not retain your BVN/NIN.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button onClick={() => setShowReservedModal(false)} variant="secondary" style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <Button 
                        loading={creatingReserved} 
                        loadingText="Verifying..." 
                        onClick={handleCreateReserved} 
                        variant="primary" 
                        style={{ flex: 1.4, background: '#C69A2C' }}
                      >
                        Generate Account
                      </Button>
                    </div>

                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── MODAL 3: TRANSACTION RECEIPT ─── */}
        <AnimatePresence>
          {selectedReceipt && (
            <>
              <motion.div 
                key="rec-bd" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReceipt(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} 
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div 
                  key="rec-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }} 
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 440, pointerEvents: 'auto' }}
                >
                  <div style={{ background: theme.color.surface, borderRadius: 24, padding: '28px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C69A2C' }}>
                        Studio Arella Receipt
                      </span>
                      <button 
                        onClick={() => setSelectedReceipt(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.color.text4, padding: 4 }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Check size={24} color="#16A34A" />
                      </div>
                      <p style={{ fontSize: 26, fontWeight: 900, color: theme.color.text1, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                        ₦{Number(selectedReceipt.amount).toLocaleString()}
                      </p>
                      <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>
                        {selectedReceipt.type === 'pending' ? 'Pending' : 'Successful'}
                      </span>
                    </div>

                    <div style={{ background: theme.color.bg, borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: theme.color.text3, fontWeight: 600 }}>Description</span>
                        <strong style={{ color: theme.color.text1 }}>{selectedReceipt.source}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: theme.color.text3, fontWeight: 600 }}>Payment Method</span>
                        <strong style={{ color: theme.color.text1 }}>{selectedReceipt.channel || 'Wallet Airtime'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: theme.color.text3, fontWeight: 600 }}>Transaction Ref</span>
                        <strong style={{ color: theme.color.text1, fontFamily: 'monospace' }}>{selectedReceipt.reference}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: theme.color.text3, fontWeight: 600 }}>Date & Time</span>
                        <strong style={{ color: theme.color.text1 }}>
                          {new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')} {new Date(selectedReceipt.created_at).toLocaleTimeString('en-GB')}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: theme.color.text3, fontWeight: 600 }}>Service Fee</span>
                        <strong style={{ color: '#059669' }}>₦0.00 (Free)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button 
                        onClick={() => {
                          toast('Receipt downloaded', 'success');
                          setSelectedReceipt(null);
                        }} 
                        variant="secondary" 
                        style={{ flex: 1 }}
                      >
                        <Download size={13} /> Download
                      </Button>
                      <Button 
                        onClick={() => setSelectedReceipt(null)} 
                        variant="primary" 
                        style={{ flex: 1, background: '#C69A2C' }}
                      >
                        Close
                      </Button>
                    </div>

                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── FLOATING "CHAT WITH ARELLA 🌐" WIDGET ─── */}
        <div className="chat-fab-widget" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 90 }}>
          <div style={{ position: 'relative' }}>
            <Link
              href="/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                background: theme.color.surface,
                border: `1px solid ${theme.color.border}`,
                borderRadius: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: '#1E293B',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.2s',
                fontFamily: F
              }}
            >
              <span className="chat-fab-label">Chat with Arella</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)', padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', background: theme.color.surface, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={13} color="#4F46E5" />
                </div>
              </div>
            </Link>
            {/* Speech bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: -7,
              right: 28,
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '8px solid #FFFFFF',
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.04))',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

      </PageTransition>
    </DashboardLayout>
  );
}
