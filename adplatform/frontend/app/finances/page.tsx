'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition, FadeCard } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';
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
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  Globe, 
  Sparkles, 
  Wallet, 
  Monitor, 
  PieChart, 
} from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import LinkBankModal from '@/components/wallet/LinkBankModal';
import CreatorMonetizationView from '@/components/wallet/CreatorMonetizationView';

const F = theme.font.body;
const BANKS = ['GTBank', 'Wema Bank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Union Bank', 'Sterling Bank'];
const CARD_VERIFICATION_AMOUNT = 50;
type FundStep = 'cards' | 'confirm' | 'otp' | 'success' | 'add-card' | 'add-card-otp' | 'add-card-success';

export default function FinancesPage() {
  return (
    <Suspense fallback={null}>
      <FinancesPageContent />
    </Suspense>
  );
}

function FinancesPageContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [activeWalletTab, setActiveWalletTab] = useState<'advertiser' | 'creator'>(() => {
    const t = searchParams.get('tab');
    if (t === 'creator') return 'creator';
    return user?.role === 'creator' ? 'creator' : 'advertiser';
  });
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adBookings, setAdBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Modals
  const [showFundModal, setShowFundModal] = useState(false);
  const [showReservedModal, setShowReservedModal] = useState(false);
  const [showLinkBankModal, setShowLinkBankModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [showSpendingInsightModal, setShowSpendingInsightModal] = useState(false);
  
  // Fund Wallet state
  const [amount, setAmount] = useState('25000');
  const [fundStep, setFundStep] = useState<FundStep>('cards');
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  // Confirm-screen fields shown to match the design â€” charging a saved card
  // uses its stored authorization_code only, so name/number/expiry/cvv here
  // are never read or sent anywhere.
  const [confirmCardForm, setConfirmCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpReference, setOtpReference] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [fundSuccessMessage, setFundSuccessMessage] = useState('');
  const [newCardForm, setNewCardForm] = useState({ bank: '', name: '', number: '', expiry: '', cvv: '' });
  const [addingCard, setAddingCard] = useState(false);
  
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
  const { currency, rates } = usePreferencesStore();

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [b, t, r, ab, cardsRes] = await Promise.all([
        api.get('/finances/balance'),
        api.get('/finances/transactions?limit=100'),
        api.get('/finances/revenue'),
        api.get('/bookings?limit=100'),
        api.get('/payments/cards').catch(() => ({ data: { cards: [] } })),
      ]);

      setBalance({
        ...b.data,
        credits: b.data?.credits ?? 0,
        total_revenue: r.data?.total_revenue ?? 0,
        reserved_account_name: b.data?.reserved_account_number ? `Studio Arella / ${user?.name || 'Creator'}` : null,
      });
      setTransactions(t.data?.transactions || []);
      setAdBookings(ab.data?.bookings || []);
      setSavedCards(cardsRes.data?.cards || []);
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

  // â”€â”€ Fund Wallet wizard: amount â†’ choose/add a card â†’ confirm â†’ (OTP) â†’ success â”€â”€
  const resetFundModal = () => {
    setShowFundModal(false);
    setFundStep('cards');
    setSelectedCardId(null);
    setConfirmCardForm({ name: '', number: '', expiry: '', cvv: '' });
    setOtpDigits(['', '', '', '']);
    setOtpReference(null);
    setNewCardForm({ bank: BANKS[0], name: '', number: '', expiry: '', cvv: '' });
  };

  const refreshSavedCards = () => {
    setLoadingCards(true);
    api.get('/payments/cards').then((r) => setSavedCards(r.data?.cards || [])).catch(() => {}).finally(() => setLoadingCards(false));
  };

  const openFundModal = () => {
    setShowFundModal(true);
    setFundStep('cards');
    setSelectedCardId(null);
    refreshSavedCards();
  };

  const finishFundSuccess = (message: string) => {
    setFundSuccessMessage(message);
    setFundStep('success');
    fetchData();
  };

  const handleFundWithSavedCard = async () => {
    if (!selectedCardId) { toast('Please choose a card', 'error'); return; }
    if (!(parseFloat(amount) >= 1000)) { toast('Minimum top-up is â‚¦1,000', 'error'); return; }
    setPaying(true);
    try {
      const res = await api.post('/payments/topup/charge-authorization', { amount: parseFloat(amount), card_id: selectedCardId });
      if (res.data?.status === 'send_otp') {
        setOtpReference(res.data.reference);
        setOtpDigits(['', '', '', '']);
        setFundStep('otp');
      } else {
        finishFundSuccess(res.data?.message || 'Wallet funded successfully');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Payment failed. Please try a different card.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitFundOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) { toast('Please enter the 4-digit code', 'error'); return; }
    setVerifyingOtp(true);
    try {
      const res = await api.post('/payments/charge/submit-otp', { reference: otpReference, otp });
      finishFundSuccess(res.data?.message || 'Wallet funded successfully');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect code. Please try again.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // "Add a bank card" â€” Paystack has no tokenize-only endpoint, so this charges
  // a small â‚¦50 verification amount then immediately credits it back to the
  // wallet (see backend addCardVerification), so adding a card is free in practice.
  const handleAddCard = async () => {
    const [expMonth, expYear] = newCardForm.expiry.split('/').map((s) => s.trim());
    if (!newCardForm.name || !newCardForm.number || !expMonth || !expYear || !newCardForm.cvv) {
      toast('Please fill in your card details', 'error');
      return;
    }
    setAddingCard(true);
    try {
      const res = await api.post('/payments/cards/add', {
        card: { bank: newCardForm.bank, name: newCardForm.name, number: newCardForm.number, cvv: newCardForm.cvv, expiry_month: expMonth, expiry_year: expYear },
      });
      if (res.data?.status === 'send_otp') {
        setOtpReference(res.data.reference);
        setOtpDigits(['', '', '', '']);
        setFundStep('add-card-otp');
      } else {
        setFundSuccessMessage(res.data?.message || 'Card added successfully');
        setFundStep('add-card-success');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not add this card. Please try again.', 'error');
    } finally {
      setAddingCard(false);
    }
  };

  const handleSubmitAddCardOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) { toast('Please enter the 4-digit code', 'error'); return; }
    setVerifyingOtp(true);
    try {
      const res = await api.post('/payments/charge/submit-otp', { reference: otpReference, otp });
      setFundSuccessMessage(res.data?.message || 'Card added successfully');
      setFundStep('add-card-success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect code. Please try again.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const backToCardsAfterAdd = () => {
    refreshSavedCards();
    setNewCardForm({ bank: BANKS[0], name: '', number: '', expiry: '', cvv: '' });
    setFundStep('cards');
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
  const screenAdSpending = useMemo(() => {
    return adBookings
      .filter((b: any) => b.status === 'active' || b.status === 'completed' || b.status === 'ended')
      .reduce((sum: number, b: any) => sum + (Number(b.billing || b.total_cost) || 0), 0);
  }, [adBookings]);
  const totalSpending = (balance?.total_revenue && balance.total_revenue > 0) ? balance.total_revenue : screenAdSpending;
  const walletId = user?.id ? user.id.slice(0, 13) : 'â€”';
  const hasReservedAccount = Boolean(balance?.reserved_account_number);
  const dedicatedBank = balance?.reserved_account_bank || null;
  const dedicatedAcct = balance?.reserved_account_number || null;

  return (

      <DashboardLayout>
        <PageTransition>
          <div className="flex flex-col gap-[32px] pb-[60px] max-w-[1080px] mx-auto w-full mt-6">
            
            {/* Header & Mode Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: '24px', lineHeight: '31px', color: '#101828' }}>
                  {activeWalletTab === 'creator' ? 'Creator Earnings & Payouts' : 'Wallet'}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {activeWalletTab === 'creator'
                    ? 'Track your fan tips, subscriber memberships, and withdraw funds directly to your Nigerian bank account'
                    : 'Manage your billboard advertising budget, view ad credit balances, and fund campaigns'}
                </p>
              </div>

              {/* Segmented Switch */}
              <div className="flex items-center p-1 bg-gray-100 dark:bg-white/10 rounded-[12px] border border-gray-200 dark:border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveWalletTab('advertiser')}
                  className={`px-4 py-2 rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${
                    activeWalletTab === 'advertiser'
                      ? 'bg-white dark:bg-[#111111] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400'
                  }`}
                >
                  Ad Budget
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWalletTab('creator')}
                  className={`px-4 py-2 rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${
                    activeWalletTab === 'creator'
                      ? 'bg-[#D4AF37] text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400'
                  }`}
                >
                  Creator Earnings
                </button>
              </div>
            </div>

            {activeWalletTab === 'creator' ? (
              <CreatorMonetizationView />
            ) : (
              <>
                {/* Top 3 Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Wallet Balance */}
              <div 
                className="relative rounded-[16px] overflow-hidden p-4 flex flex-col justify-between shadow-sm"
                style={{ 
                  height: '134px',
                  background: 'linear-gradient(135deg, #7C8F47 0%, #58672D 100%)',
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet size={16} color="white" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                    Wallet Balance
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '24px', color: '#FFFFFF' }}>
                    {loading ? '...' : formatCurrency(walletCredits, currency, rates)}
                  </div>
                  <button 
                    onClick={openFundModal}
                    className="bg-white rounded-[11.8px] shadow-sm flex justify-center items-center px-[17px] py-[12px]"
                  >
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '13.6px', color: '#101828' }}>
                      Fund wallet
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 2: Total Spent */}
              <div 
                className="relative rounded-[16px] overflow-hidden p-4 flex flex-col justify-between shadow-sm"
                style={{ 
                  height: '134px',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B89025 100%)',
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingDown size={16} color="white" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                    Total Spent
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '24px', color: '#FFFFFF' }}>
                    {loading ? '...' : formatCurrency(totalSpending, currency, rates)}
                  </div>
                  <button 
                    onClick={() => setShowSpendingInsightModal(true)}
                    className="bg-white hover:bg-gray-100 rounded-[11.8px] shadow-sm flex justify-center items-center px-[17px] py-[12px] transition-colors cursor-pointer"
                  >
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '13.6px', color: '#101828' }}>
                      View spending insight
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 3: Special Offer */}
              <div 
                className="relative rounded-[15px] overflow-hidden p-4 flex flex-col justify-between items-start"
                style={{ 
                  height: '134px',
                  backgroundColor: '#524007',
                }}
              >
                <div className="z-10">
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', marginBottom: '6px' }}>
                    Special Offer: Book Ad slot from ₦1,000/min
                  </div>
                  <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '11px', color: '#D5E0ED', maxWidth: '65%', lineHeight: '140%' }}>
                    Instant digital screen activation across high-traffic prime Lagos studios
                  </div>
                </div>
                
                <div className="absolute right-[-6px] top-[18px] w-[90px] h-[100px] flex justify-center items-center z-0 pointer-events-none">
                   <div className="w-[68px] h-[88px] bg-white/10 rounded-[8px] border border-white/20 backdrop-blur-md flex flex-col items-center justify-center p-2 transform rotate-6 shadow-md">
                      <div className="w-full h-[24px] bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-[4px] mb-1 flex items-center justify-center">
                        <Monitor size={12} color="#111" />
                      </div>
                      <span className="text-[6px] text-white/90 text-center font-semibold leading-tight">Prime Lagos Screen Ads</span>
                   </div>
                </div>

                <Link 
                  href="/bookings?tab=screen"
                  className="bg-[#FBFF79] hover:bg-[#f6fa5c] rounded-[6px] px-[17px] py-[8px] z-10 transition-colors text-decoration-none inline-block cursor-pointer"
                  style={{ boxShadow: '0px 0px 7px rgba(251, 255, 121, 0.32)' }}
                >
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: '9.4px', color: '#051235', textTransform: 'uppercase' }}>
                    BOOK AD SLOT
                  </span>
                </Link>
              </div>
            </div>

            {/* Middle Section (2 cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Total Transaction */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Total Transaction</h3>
                   <div className="w-[36px] h-[25px] px-1.5 flex items-center justify-center rounded-[8px] mt-[10px]" style={{ background: 'rgba(3, 197, 210, 0.2)' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '14px', color: '#005055' }}>
                        {loading ? '—' : transactions.length}
                      </span>
                   </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-[10px] w-full max-w-[287px] bg-[#FFFFFF] shadow-sm rounded-[14px] px-[20px] py-[14px] border border-[#F0F0F0] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-[24px] h-[24px] bg-[#E5F9FA] rounded-full flex items-center justify-center">
                      <Download size={14} color="#005055" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#101828' }}>Download transaction history</span>
                  </button>
                </div>
              </div>

              {/* Linked Bank Card */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Linked Bank Card</h3>
                   <div className="w-[36px] h-[25px] px-1.5 flex items-center justify-center rounded-[8px] mt-[10px]" style={{ background: savedCards.length > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(227, 24, 24, 0.15)' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '14px', color: savedCards.length > 0 ? '#15803d' : '#E31818' }}>
                        {loading ? '—' : savedCards.length}
                      </span>
                   </div>
                </div>
                
                <div className="flex justify-between items-center w-full">
                  <button onClick={() => { setShowFundModal(true); setFundStep('add-card'); }} className="flex items-center justify-center w-full max-w-[287px] bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px] transition-colors cursor-pointer">
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#FFFFFF' }}>Add A Bank Card</span>
                  </button>
                  
                  {/* Linked Card Indicator or Card Circles */}
                  <div className="flex relative items-center h-[50px] w-[90px] justify-end">
                     {savedCards.length > 0 ? (
                       <div className="flex items-center gap-1.5 bg-[#F9FAFB] border border-[#E4E7EC] px-2.5 py-1.5 rounded-[10px] text-[11px] font-semibold text-[#344054]">
                         <CreditCard size={14} className="text-[#D4AF37]" />
                         <span>•••• {savedCards[0].last4 || 'Card'}</span>
                       </div>
                     ) : (
                       <div className="flex relative items-center h-[50px] w-[90px]">
                         <div className="w-[44px] h-[44px] rounded-full bg-[#EA001B]/80 mix-blend-multiply absolute right-[40px]"></div>
                         <div className="w-[44px] h-[44px] rounded-full bg-[#FFA200]/80 mix-blend-multiply absolute right-[20px]"></div>
                         <div className="w-[44px] h-[44px] rounded-full border-2 border-[#101828]/10 right-[0px] absolute"></div>
                       </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Dedicated Account Card */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Dedicated Account</h3>
                </div>
                
                {!hasReservedAccount ? (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#667085', lineHeight: 1.4, marginTop: '8px' }}>
                      Generate a dedicated bank account number to easily fund your wallet via direct transfer.
                    </p>
                    <button onClick={() => setShowReservedModal(true)} className="mt-auto flex items-center justify-center w-full bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#FFFFFF' }}>Generate Account</span>
                    </button>
                  </>
                ) : (
                  <div className="mt-[12px] flex flex-col gap-[8px] flex-1 justify-center">
                    <div className="flex justify-between items-center bg-[#F9FAFB] p-[10px] rounded-[10px] border border-[#F0F0F0]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#667085' }}>Bank</span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{dedicatedBank || 'Wema Bank'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F9FAFB] p-[10px] rounded-[10px] border border-[#F0F0F0]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#667085' }}>Account</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{dedicatedAcct}</span>
                        <button onClick={() => navigator.clipboard.writeText(dedicatedAcct)} className="text-[#D4AF37] hover:text-[#b99830]" title="Copy">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 mt-1">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#667085' }}>{balance?.reserved_account_name || `Studio Arella / ${user?.name || 'Creator'}`}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Section: Transaction Table */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#F0F0F0] overflow-hidden w-full overflow-x-auto">
               
               {/* Table Header Area */}
               <div className="flex items-center justify-between px-[24px] py-[24px] border-b border-[#F0F0F0]" 
                    style={{ background: 'linear-gradient(95.19deg, #D4AF37 29.12%, rgba(126, 84, 0, 0.33) 111.32%, rgba(217, 192, 28, 0.33) 111.32%)' }}>
                  
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: '16px', color: '#FFFFFF', marginBottom: '4px' }}>Transaction history</h2>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#FFFFFF' }}>View your transaction history</p>
                  </div>

                  <div className="flex items-center gap-[16px]">
                    <button 
                      onClick={handleExportCSV}
                      className="flex items-center gap-[10px] text-white hover:text-white/80 transition-colors cursor-pointer"
                    >
                       <Download size={18} />
                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px' }}>Generate transaction statement</span>
                    </button>
                    <button 
                      onClick={() => setShowSpendingInsightModal(true)}
                      className="flex items-center gap-[10px] text-white hover:text-white/80 transition-colors ml-[20px] cursor-pointer"
                    >
                       <TrendingUp size={18} />
                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px' }}>View spending insight</span>
                    </button>
                    <button 
                      onClick={() => setShowSpendingInsightModal(true)}
                      title="More spending insights"
                      className="w-[24px] h-[24px] border border-white rounded-[5px] flex items-center justify-center text-white hover:bg-white/10 transition-colors ml-[10px] cursor-pointer"
                    >
                       <span className="text-[14px] leading-none mb-2">...</span>
                    </button>
                  </div>
               </div>

               {/* Table */}
               <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                   <tr className="bg-white border-b border-[#F0F0F0]">
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Service</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Account</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Ref</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>No. of Transactions</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Estimated income</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Status</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Action</th>
                   </tr>
                 </thead>
                 <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-[24px] py-[40px] text-center text-[#5F6D7E] text-[14px]">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-[24px] py-[48px] text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt size={36} className="text-gray-300 mb-1" />
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '15px', color: '#101828', margin: 0 }}>
                            No transactions yet
                          </p>
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#5F6D7E', margin: '0 0 12px' }}>
                            Transactions from wallet top-ups, ad slot bookings, and podcast studio reservations will show here.
                          </p>
                          <button
                            onClick={openFundModal}
                            className="bg-[#D4AF37] hover:bg-[#bfa030] text-[#111111] font-bold text-[12px] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Fund Wallet Now
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((t: any) => {
                      const isCredit = t.type === 'credit' || t.type === 'refund';
                      const isPending = t.type === 'pending' || t.status === 'pending';
                      const isFailed = t.status === 'failed';
                      const statusText = isFailed ? 'FAILED' : isPending ? 'PENDING' : 'SUCCESSFUL';
                      const statusBg = isFailed
                        ? 'rgba(243, 184, 164, 0.2)'
                        : isPending
                        ? 'rgba(3, 36, 210, 0.15)'
                        : 'rgba(3, 197, 210, 0.2)';
                      const statusColor = isFailed ? '#E31818' : isPending ? '#0284c7' : '#005055';

                      const serviceName = t.description || (
                        t.source === 'topup' ? 'Wallet Top-Up' :
                        t.source === 'booking' ? 'Screen Ad Slot Booking' :
                        t.source === 'podcast_booking' ? 'Podcast Studio Booking' :
                        t.source === 'campaign' ? 'Campaign Funding' :
                        t.source || 'Transaction'
                      );
                      const serviceCategory = (
                        t.source === 'booking' ? 'Screen Ad' :
                        t.source === 'podcast_booking' ? 'Podcast' :
                        t.source === 'topup' ? 'Wallet Credit' :
                        t.source === 'campaign' ? 'Campaign' :
                        'Direct'
                      );

                      const channelBadge = (t.channel || (isCredit ? 'Paystack' : 'Wallet')).toUpperCase().slice(0, 4);

                      return (
                        <tr key={t.id || t.reference} className="border-b border-[#F0F0F0] bg-white hover:bg-gray-50/50 transition-colors">
                          <td className="px-[24px] py-[14px]">
                            <div className="flex flex-col">
                              <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>
                                {serviceName}
                              </span>
                              <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '13px', color: '#5F6D7E' }}>
                                {serviceCategory}
                              </span>
                            </div>
                          </td>
                          <td className="px-[24px] py-[14px]">
                            <div className="flex items-center">
                              <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-700 font-bold uppercase tracking-wider">
                                {channelBadge}
                              </span>
                            </div>
                          </td>
                          <td className="px-[24px] py-[14px]" style={{ fontFamily: 'monospace', fontWeight: 500, fontSize: '12px', color: '#475467' }}>
                            {t.reference ? (t.reference.length > 18 ? `${t.reference.slice(0, 8)}...${t.reference.slice(-6)}` : t.reference) : '—'}
                          </td>
                          <td className="px-[24px] py-[14px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '13px', color: '#5F6D7E' }}>
                            {t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '—'}
                          </td>
                          <td className="px-[24px] py-[14px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '14px', color: isCredit ? '#16A34A' : '#101828' }}>
                            {isCredit ? '+' : '-'}{formatCurrency(Number(t.amount) || 0, currency, rates)}
                          </td>
                          <td className="px-[24px] py-[14px]">
                            <span className="px-[10px] py-[3px] rounded-full font-bold" style={{ background: statusBg, color: statusColor, fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-[24px] py-[14px]">
                            <button 
                              onClick={() => setSelectedReceipt(t)}
                              title="View & Download Receipt"
                              className="w-[30px] h-[30px] rounded-md hover:bg-gray-100 flex items-center justify-center text-[#5F6D7E] hover:text-[#101828] transition-colors cursor-pointer"
                            >
                              <Receipt size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              
              {/* Pagination Footer */}
              <div className="flex items-center justify-between px-[24px] py-[14px] gap-[10px] bg-white border-t border-[#F0F0F0]">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-[#5F6D7E] text-[13px] flex items-center gap-1.5 border border-[#F0F0F0] rounded-[6px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                >
                   <ChevronLeft size={15} /> Previous
                </button>
                <div className="flex items-center gap-1.5 text-[13px] text-[#5F6D7E]">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-[28px] h-[28px] flex items-center justify-center rounded-[6px] transition-colors cursor-pointer ${currentPage === pageNum ? 'bg-[#101828] text-white font-semibold' : 'hover:bg-gray-100 text-[#5F6D7E]'}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-[#5F6D7E] text-[13px] flex items-center gap-1.5 border border-[#F0F0F0] rounded-[6px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                >
                   Next <ChevronRight size={15} />
                </button>
              </div>
              
            </div>
            </>
          )}

          </div>

        <AnimatePresence>
          {showFundModal && (
            <>
              <motion.div
                key="fund-bd"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetFundModal}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div
                  key="fund-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 625, pointerEvents: 'auto', minHeight: '633px' }}
                >
                  <div style={{ background: '#FFFFFF', borderRadius: 32, padding: '32px 32px 64px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                      <button
                        onClick={() => {
                          if (fundStep === 'confirm' || fundStep === 'otp') setFundStep('cards');
                          else if (fundStep === 'add-card-otp') setFundStep('add-card');
                          else if (fundStep === 'add-card') setFundStep('cards');
                          else resetFundModal();
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <h2 style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-dm-sans)', color: '#101828', margin: 0, letterSpacing: '-0.01em' }}>
                        {fundStep === 'cards' && 'Fund wallet'}
                        {fundStep === 'confirm' && `Fund with ${savedCards.find((c) => c.id === selectedCardId)?.bank || savedCards.find((c) => c.id === selectedCardId)?.card_type || 'card'} card`}
                        {fundStep === 'otp' && `Pay with ${savedCards.find((c) => c.id === selectedCardId)?.bank || savedCards.find((c) => c.id === selectedCardId)?.card_type || 'Wema'} card`}
                        {fundStep === 'success' && 'Fund wallet'}
                        {fundStep === 'add-card' && 'Add a bank card'}
                        {fundStep === 'add-card-otp' && 'Verify card'}
                        {fundStep === 'add-card-success' && 'Add a bank card'}
                      </h2>
                      
                      <button
                            onClick={resetFundModal}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                    </div>

                    {fundStep === 'cards' && (
                      <div className="flex flex-col items-center">
                        {loadingCards ? (
                          <p style={{ textAlign: 'center', fontSize: 14, color: theme.color.text3, padding: '16px 0' }}>Loading your saved cards...</p>
                        ) : savedCards.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, width: '100%', maxWidth: '468px', marginTop: 10 }}>
                            {savedCards.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => setSelectedCardId(c.id)}
                                style={{
                                  padding: '24px 32px 24px 24px', 
                                  borderRadius: 16, 
                                  cursor: 'pointer',
                                  border: selectedCardId === c.id ? '2px solid #D4AF37' : `1px solid #D7D7D7`,
                                  background: '#FFFFFF',
                                  height: '100px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <span style={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                    border: selectedCardId === c.id ? '2px solid #D4AF37' : '2px solid #D7D7D7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#FFFFFF'
                                  }}>
                                    {selectedCardId === c.id && <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DF4308' }} />}
                                  </span>
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                     <p style={{ margin: 0, fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#101828' }}>
                                        Fund with {c.bank || c.card_type || 'card'}
                                     </p>
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, color: '#101828', letterSpacing: '0.02em', opacity: 0.7 }}>
                                         ************{c.last4 || '****'}
                                       </span>
                                       {c.cardholder_name && (
                                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, color: '#101828', letterSpacing: '0.02em', opacity: 0.7 }}>
                                             {c.cardholder_name}
                                          </span>
                                       )}
                                     </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ textAlign: 'center', fontSize: 14, color: theme.color.text3, marginBottom: 40, marginTop: 10 }}>You have no saved cards yet.</p>
                        )}

                        <button
                          type="button"
                          onClick={() => setFundStep('add-card')}
                          style={{ display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#D4AF37', marginBottom: 40 }}
                        >
                          Add a bank card
                        </button>

                        <button 
                          disabled={!selectedCardId} 
                          onClick={() => setFundStep('confirm')}
                          style={{ 
                             width: '100%', maxWidth: '468px', height: '56px', background: '#D4AF37', borderRadius: 8, 
                             border: 'none', cursor: selectedCardId ? 'pointer' : 'not-allowed', 
                             fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#000000',
                             opacity: selectedCardId ? 1 : 0.6
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    )}
                    {fundStep === 'confirm' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: '420px', marginTop: 10 }}>
                          <input
                            placeholder="Enter amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                          <input
                            placeholder="Card holder's name"
                            value={confirmCardForm.name}
                            onChange={(e) => setConfirmCardForm({ ...confirmCardForm, name: e.target.value })}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ position: 'relative', width: '100%', height: 56 }}>
                            <input
                              placeholder="Card number"
                              value={confirmCardForm.number}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, number: e.target.value })}
                              style={{ 
                                width: '100%', height: '100%', padding: '16px 50px 16px 16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box', letterSpacing: '0.02em'
                              }}
                            />
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 24, height: 16, display: 'flex', alignItems: 'center' }}>
                              <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#EB001B"/>
                                <circle cx="16" cy="8" r="8" fill="#F79E1B"/>
                                <path d="M12 14.5C10.5 13.1 9.5 10.7 9.5 8C9.5 5.3 10.5 2.9 12 1.5C13.5 2.9 14.5 5.3 14.5 8C14.5 10.7 13.5 13.1 12 14.5Z" fill="#FF5F00"/>
                              </svg>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                            <input
                              placeholder="Expiry date (MM/YY)"
                              value={confirmCardForm.expiry}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, expiry: e.target.value })}
                              style={{ 
                                flex: 1, height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                            <input
                              placeholder="CVV"
                              value={confirmCardForm.cvv}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, cvv: e.target.value })}
                              style={{ 
                                flex: 1, height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={handleFundWithSavedCard}
                          disabled={paying}
                          style={{
                            width: '100%', maxWidth: '420px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', marginTop: 100, marginBottom: 20
                          }}
                        >
                          {paying ? 'Funding...' : 'Fund wallet'}
                        </button>
                      </div>
                    )}
                    {fundStep === 'otp' && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '492px', margin: '0 auto', boxSizing: 'border-box' }}>
                        
                        <div style={{ alignSelf: 'center', width: '100%', maxWidth: '415px', marginTop: 30, position: 'relative' }}>
                          <p style={{ fontSize: 16, color: '#696F79', fontFamily: 'var(--font-dm-sans)', margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Enter code*</p>
                          
                          <div style={{ display: 'flex', gap: 45, justifyContent: 'center' }}>
                            {otpDigits.map((d, i) => (
                              <input
                                key={i}
                                id={`fund-otp-${i}`}
                                value={d}
                                maxLength={1}
                                inputMode="numeric"
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '').slice(-1);
                                  const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
                                  if (v && i < 3) document.getElementById(`fund-otp-${i + 1}`)?.focus();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                                      const prev = document.getElementById(`fund-otp-${i - 1}`);
                                      if (prev) {
                                          prev.focus();
                                          const next = [...otpDigits]; next[i - 1] = ''; setOtpDigits(next);
                                      }
                                  }
                                }}
                                style={{
                                  width: 70, height: 66, boxSizing: 'border-box', textAlign: 'center', 
                                  fontSize: 24, fontWeight: 600, color: '#D4AF37', fontFamily: 'var(--font-dm-sans)', 
                                  borderRadius: 8, 
                                  border: d ? '1px solid #D4AF37' : '1px solid rgba(134, 146, 166, 0.5)', 
                                  background: '#FFFFFF', outline: 'none'
                                }}
                              />
                            ))}
                          </div>
                          
                          <p style={{ textAlign: 'right', margin: '16px 0 0 0', fontSize: 12, fontFamily: 'var(--font-dm-sans)', color: '#696F79' }}>
                            Didnâ€™t get code? <button type="button" onClick={() => toast("If you didn't receive a code, please try paying again.", 'info')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#D4AF37', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }}>Resend</button>
                          </p>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#16151C', fontFamily: 'var(--font-dm-sans)', lineHeight: '30px', margin: '60px 0 80px', padding: '0 10px' }}>
                          To authorize this payment, enter the OTP sent to the email <strong>{user?.email || 'your registered email'}</strong> attached to your Studio Arella account
                        </p>

                        <button
                          onClick={handleSubmitFundOtp}
                          disabled={verifyingOtp}
                          style={{
                            width: '100%', maxWidth: '468px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: verifyingOtp ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto', alignSelf: 'center'
                          }}
                        >
                          {verifyingOtp ? 'Verifying...' : 'Pay'}
                        </button>
                      </div>
                    )}
                    {fundStep === 'success' && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '468px', margin: '0 auto', boxSizing: 'border-box' }}>
                        <div style={{ position: 'relative', width: 70, height: 70, margin: '80px auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ position: 'absolute', inset: -36, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.1, filter: 'blur(5px)', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.15, filter: 'blur(5px)', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 25, fontWeight: 400, color: '#FFFFFF' }}>✓</span>
                          </div>
                        </div>
                        
                        <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#16151C', fontFamily: 'var(--font-dm-sans)', lineHeight: '30px', margin: '40px auto 80px', maxWidth: '415px' }}>
                          Wallet funded with successfully. #{amount ? Number(amount).toLocaleString() : '30, 000'} has been added to your wallet balance
                        </p>

                        <button
                          onClick={resetFundModal}
                          style={{
                            width: '100%', maxWidth: '468px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto'
                          }}
                        >
                          Finish
                        </button>
                      </div>
                    )}

                    {fundStep === 'add-card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: '420px', margin: '30px 0 60px' }}>
                          
                          <div style={{ position: 'relative', width: '100%' }}>
                            <select
                              value={newCardForm.bank || ''}
                              onChange={(e) => setNewCardForm({ ...newCardForm, bank: e.target.value })}
                              style={{ 
                                width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                color: newCardForm.bank ? '#101828' : 'rgba(162, 161, 168, 0.8)', 
                                fontSize: 17, fontFamily: 'var(--font-dm-sans)', appearance: 'none', fontWeight: 300 
                              }}
                            >
                              <option value="" disabled hidden>--- Select bank ---</option>
                              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          <input
                            placeholder="Card holder's name"
                            value={newCardForm.name}
                            onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' 
                            }}
                          />

                          <div style={{ position: 'relative', width: '100%' }}>
                            <input
                              placeholder="Card number"
                              value={newCardForm.number}
                              onChange={(e) => setNewCardForm({ ...newCardForm, number: e.target.value })}
                              style={{ 
                                width: '100%', height: 56, padding: '16px 80px 16px 16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' 
                              }}
                            />
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                              <div style={{ width: 20, height: 16, background: '#FFFFFF', border: '0.7px solid #C5CDD0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                <svg width="14" height="5" viewBox="0 0 14 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5.09995 0L3.34995 4.33333H2.24995L1.34995 0.733333C1.29995 0.466667 1.09995 0.333333 0.799951 0.266667L0 0.0666666V0H1.69995C1.99995 0 2.29995 0.2 2.34995 0.533333L2.79995 2.8L4.14995 0H5.09995ZM10 2.93333C10 1.93333 8.59995 1.86667 8.59995 1.33333C8.59995 1.2 8.74995 1 9.04995 0.933333C9.19995 0.933333 9.64995 0.866667 10.0999 1.06667L10.2999 0.2C10.0999 0.133333 9.69995 0 9.34995 0C8.29995 0 7.54995 0.533333 7.54995 1.46667C7.54995 2.13333 8.14995 2.46667 8.59995 2.73333C9.09995 2.93333 9.29995 3.13333 9.29995 3.33333C9.29995 3.66667 8.84995 3.86667 8.59995 3.86667C8.09995 3.86667 7.74995 3.66667 7.49995 3.53333L7.29995 4.4C7.54995 4.53333 7.99995 4.6 8.49995 4.6C9.59995 4.6 10 4.06667 10 2.93333ZM12.7 4.53333H13.75L13.1 0.266667H12.2C11.95 0.266667 11.75 0.4 11.65 0.6L10 4.53333H11.1L11.3 3.86667H12.6L12.7 4.53333ZM11.6 3.06667L12.1 1.6L12.45 3.06667H11.6ZM7.04995 0.266667H6.04995L5.44995 4.53333H6.44995L7.04995 0.266667Z" fill="#1B2E86"/>
                                </svg>
                              </div>
                              <div style={{ width: 20, height: 16, background: '#FFFFFF', border: '0.7px solid #C5CDD0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#EB001B"/>
                                  <circle cx="9.5" cy="4.5" r="4.5" fill="#F79E1B"/>
                                  <path d="M7 8.25C8.03553 7.52554 8.7 6.0964 8.7 4.5C8.7 2.9036 8.03553 1.47446 7 0.75C5.96447 1.47446 5.3 2.9036 5.3 4.5C5.3 6.0964 5.96447 7.52554 7 8.25Z" fill="#FF5F00"/>
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                            <input
                              placeholder="Expiry date (MM/YY)"
                              value={newCardForm.expiry}
                              onChange={(e) => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                              style={{ width: '100%', flex: 1, height: 56, padding: '16px', borderRadius: 10, border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' }}
                            />
                            <input
                              placeholder="CVV"
                              value={newCardForm.cvv}
                              onChange={(e) => setNewCardForm({ ...newCardForm, cvv: e.target.value })}
                              style={{ width: '100%', flex: 1, height: 56, padding: '16px', borderRadius: 10, border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAddCard}
                          disabled={addingCard}
                          style={{
                            width: '100%', maxWidth: '420px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: addingCard ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto', alignSelf: 'center'
                          }}
                        >
                          {addingCard ? 'Adding...' : 'Add card'}
                        </button>
                      </div>
                    )}
                    {fundStep === 'add-card-otp' && (
                      <>
                        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: theme.color.text1, margin: '0 0 1px' }}>Enter code*</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '16px 0' }}>
                          {otpDigits.map((d, i) => (
                            <input
                              key={i}
                              id={`addcard-otp-${i}`}
                              value={d}
                              maxLength={1}
                              inputMode="numeric"
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(-1);
                                const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
                                if (v && i < 3) document.getElementById(`addcard-otp-${i + 1}`)?.focus();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !otpDigits[i] && i > 0) document.getElementById(`addcard-otp-${i - 1}`)?.focus();
                              }}
                              style={{ width: 48, height: 48, textAlign: 'center', fontSize: 18, fontWeight: 800, borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.surface, color: theme.color.text1, fontFamily: F }}
                            />
                          ))}
                        </div>
                        <p style={{ textAlign: 'center', fontSize: 12, color: theme.color.text3, margin: '16px 0 20px' }}>
                          To authorize this card, enter the OTP sent to {user?.email ? <strong>{user.email}</strong> : 'the email'} attached to your Studio Arella account
                        </p>
                        <Button loading={verifyingOtp} loadingText="Verifyingâ€¦" onClick={handleSubmitAddCardOtp} variant="primary" style={{ width: '100%', background: '#C69A2C' }}>
                          Pay
                        </Button>
                      </>
                    )}

                    {fundStep === 'add-card-success' && (
                        <div className="flex flex-col items-center justify-center w-full" style={{ padding: '60px 0 20px' }}>
                          <div className="relative flex items-center justify-center mb-6" style={{ width: 70, height: 70 }}>
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.1, filter: 'blur(5px)' }} />
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.15, filter: 'blur(5px)' }} />
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }} />
                            <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>

                          <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 20, lineHeight: '30px', color: '#16151C', textAlign: 'center', marginBottom: 40, width: '100%', maxWidth: '415px' }}>
                            {fundSuccessMessage || 'Firstbank card added successfully'}
                          </h3>

                          <button 
                            onClick={backToCardsAfterAdd} 
                            style={{ 
                              display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
                              padding: '10px', gap: '10px', width: '100%', maxWidth: '468px', height: '56px', 
                              background: '#D4AF37', borderRadius: '6px', border: 'none', cursor: 'pointer' 
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 16, lineHeight: '21px', color: '#000000' }}>Finish</span>
                          </button>
                        </div>
                      )}

                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* â”€â”€â”€ MODAL 2: DEDICATED PERMANENT ACCOUNT (KYC) â”€â”€â”€ */}
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
                  style={{ width: '100%', maxWidth: 625, pointerEvents: 'auto', minHeight: '633px' }}
                >
                  <div style={{ background: '#FFFFFF', borderRadius: 32, padding: '32px 32px 64px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
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

        {/* â”€â”€â”€ MODAL 3: TRANSACTION RECEIPT â”€â”€â”€ */}
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
                  style={{ width: '100%', maxWidth: 625, pointerEvents: 'auto', minHeight: '633px' }}
                >
                  <div style={{ background: '#FFFFFF', borderRadius: 32, padding: '32px 32px 64px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
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
                        â‚¦{Number(selectedReceipt.amount).toLocaleString()}
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
                        <strong style={{ color: '#059669' }}>â‚¦0.00 (Free)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button
                        onClick={() => {
                          const lines = [
                            'STUDIO ARELLA â€” TRANSACTION RECEIPT',
                            '',
                            `Amount: â‚¦${Number(selectedReceipt.amount).toLocaleString()}`,
                            `Status: ${selectedReceipt.type === 'pending' ? 'Pending' : 'Successful'}`,
                            `Description: ${selectedReceipt.source}`,
                            `Payment Method: ${selectedReceipt.channel || 'Wallet Airtime'}`,
                            `Transaction Ref: ${selectedReceipt.reference}`,
                            `Date & Time: ${new Date(selectedReceipt.created_at).toLocaleDateString('en-GB')} ${new Date(selectedReceipt.created_at).toLocaleTimeString('en-GB')}`,
                            `Service Fee: â‚¦0.00 (Free)`,
                          ];
                          const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `studio-arella-receipt-${selectedReceipt.reference}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
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

        {/* ─── MODAL 4: SPENDING INSIGHTS ─── */}
        <AnimatePresence>
          {showSpendingInsightModal && (
            <>
              <motion.div 
                key="spending-bd" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowSpendingInsightModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} 
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div 
                  key="spending-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.96, y: 10 }} 
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 540, pointerEvents: 'auto' }}
                >
                  <div style={{ background: '#FFFFFF', borderRadius: 28, padding: '28px 28px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: F }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-[36px] h-[36px] rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                          <TrendingDown size={18} className="text-[#D4AF37]" />
                        </div>
                        <div>
                          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-dm-sans)', color: '#101828', margin: 0 }}>
                            Spending Insights
                          </h2>
                          <p style={{ fontSize: 12, color: '#667085', margin: 0 }}>
                            Overview of your ad slots, studio sessions & wallet usage
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowSpendingInsightModal(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085', padding: 4 }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Total summary highlight */}
                    <div style={{ background: 'linear-gradient(135deg, #101828 0%, #1D2939 100%)', borderRadius: 18, padding: '20px', color: '#FFFFFF', marginBottom: 20 }}>
                      <p style={{ fontSize: 12, color: '#98A2B3', margin: '0 0 6px', fontWeight: 500 }}>Total Cumulative Spending</p>
                      <h3 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-dm-sans)' }}>
                        {formatCurrency(totalSpending, currency, rates)}
                      </h3>
                      <p style={{ fontSize: 11, color: '#D4AF37', margin: '8px 0 0', fontWeight: 600 }}>
                        Across all screen ad bookings & studio reservations
                      </p>
                    </div>

                    {/* Category breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      
                      <div style={{ background: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <Monitor size={17} className="text-amber-600" />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', margin: 0 }}>Digital Screen Advertising</p>
                            <p style={{ fontSize: 11, color: '#667085', margin: 0 }}>{adBookings.length} booking{adBookings.length === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                          {formatCurrency(screenAdSpending, currency, rates)}
                        </span>
                      </div>

                      <div style={{ background: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                            <Building2 size={17} className="text-purple-600" />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', margin: 0 }}>Podcast Studio Sessions</p>
                            <p style={{ fontSize: 11, color: '#667085', margin: 0 }}>Audio studio rentals & equipment</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>
                          {formatCurrency(Math.max(0, totalSpending - screenAdSpending), currency, rates)}
                        </span>
                      </div>

                      <div style={{ background: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <Wallet size={17} className="text-emerald-600" />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', margin: 0 }}>Available Wallet Credits</p>
                            <p style={{ fontSize: 11, color: '#667085', margin: 0 }}>Pre-funded balance ready to use</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>
                          {formatCurrency(walletCredits, currency, rates)}
                        </span>
                      </div>

                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button
                        onClick={() => {
                          setShowSpendingInsightModal(false);
                          handleExportCSV();
                        }}
                        variant="secondary"
                        style={{ flex: 1 }}
                      >
                        <Download size={13} /> Export Statement
                      </Button>
                      <Button 
                        onClick={() => setShowSpendingInsightModal(false)} 
                        variant="primary" 
                        style={{ flex: 1, background: '#101828' }}
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

        {showLinkBankModal && <LinkBankModal onClose={() => setShowLinkBankModal(false)} />}

        {/* â”€â”€â”€ FLOATING "CHAT WITH ARELLA ðŸŒ" WIDGET â”€â”€â”€ */}
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
