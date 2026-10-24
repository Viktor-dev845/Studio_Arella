'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  Check, 
  Copy, 
  Loader2, 
  Sparkles, 
  Download, 
  Clock, 
  CreditCard,
  DollarSign,
  Heart,
  Users,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';
import { theme } from '@/lib/theme';

const F = theme.font.body;
const NIGERIAN_BANKS = [
  'Access Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank (GTBank)',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'Wema Bank / ALAT',
  'Kuda Bank',
  'Opay / Paycom',
  'PalmPay',
  'Moniepoint MFB',
];

interface CreatorWalletData {
  id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
}

interface EarningItem {
  id: string;
  source_type: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  description: string;
  created_at: string;
}

interface PayoutItem {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  failure_reason?: string;
  created_at: string;
}

export default function CreatorMonetizationView() {
  const { toast } = useToast();
  const { currency, rates } = usePreferencesStore();

  const [wallet, setWallet] = useState<CreatorWalletData | null>(null);
  const [earningsSummary, setEarningsSummary] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<EarningItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [membersSummary, setMembersSummary] = useState<{ active_members: number; mrr: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: NIGERIAN_BANKS[0],
    account_number: '',
    account_name: '',
  });
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, membersRes] = await Promise.allSettled([
        api.get('/creator/wallet'),
        api.get('/memberships/creator-members'),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value.data) {
        setWallet(walletRes.value.data.wallet);
        setEarningsSummary(walletRes.value.data.earnings_summary || []);
        setTransactions(walletRes.value.data.recent_transactions || []);
        setPayouts(walletRes.value.data.recent_payouts || []);

        if (walletRes.value.data.wallet) {
          setBankForm({
            bank_name: walletRes.value.data.wallet.bank_name || NIGERIAN_BANKS[0],
            account_number: walletRes.value.data.wallet.account_number || '',
            account_name: walletRes.value.data.wallet.account_name || '',
          });
        }
      }

      if (membersRes.status === 'fulfilled' && membersRes.value.data) {
        setMembersSummary({
          active_members: membersRes.value.data.active_members || 0,
          mrr: membersRes.value.data.monthly_recurring_revenue || 0,
        });
      }
    } catch (err: any) {
      console.error('Failed to load creator monetization data:', err);
      toast('Could not load creator earnings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.account_number || bankForm.account_number.length < 10) {
      toast('Please enter a valid 10-digit account number', 'error');
      return;
    }
    if (!bankForm.account_name.trim()) {
      toast('Please enter the account name matching your bank account', 'error');
      return;
    }

    setIsUpdatingBank(true);
    try {
      const res = await api.put('/creator/wallet/bank', bankForm);
      toast('Bank account updated successfully', 'success');
      setWallet((prev) => prev ? { ...prev, ...res.data.wallet } : prev);
      setShowBankModal(false);
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Failed to update bank details', 'error');
    } finally {
      setIsUpdatingBank(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 1000) {
      toast('Minimum withdrawal amount is ₦1,000', 'error');
      return;
    }

    if (!wallet?.account_number || !wallet?.bank_name) {
      toast('Please add your bank account first before requesting a payout', 'error');
      setShowBankModal(true);
      return;
    }

    if (amountNum > (wallet?.available_balance || 0)) {
      toast(`Insufficient available balance. You have ₦${(wallet?.available_balance || 0).toLocaleString()}`, 'error');
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await api.post('/creator/payout', { amount: amountNum });
      toast('Payout request submitted successfully! Funds will be transferred to your account.', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await loadData();
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Failed to submit payout request', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const availableBalance = wallet?.available_balance || 0;
  const pendingBalance = wallet?.pending_balance || 0;
  const totalEarned = wallet?.total_earned || 0;
  const totalWithdrawn = wallet?.total_withdrawn || 0;

  return (
    <div className="flex flex-col gap-8 w-full" style={{ fontFamily: F }}>
      {/* ─── TOP METRIC CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Available For Payout */}
        <div 
          className="rounded-[20px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)', color: '#fff', minHeight: 165 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Wallet size={16} />
              </div>
              <span className="text-[13px] font-medium text-neutral-300">Available For Payout</span>
            </div>
            {pendingBalance > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ₦{pendingBalance.toLocaleString()} pending
              </span>
            )}
          </div>

          <div className="my-2">
            <span className="text-[30px] font-extrabold tracking-tight text-white leading-none">
              {loading ? '...' : formatCurrency(availableBalance, currency, rates)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                if (!wallet?.account_number) {
                  setShowBankModal(true);
                  toast('Please link your bank account to receive payouts', 'info');
                } else {
                  setShowWithdrawModal(true);
                }
              }}
              disabled={availableBalance < 1000}
              className={`px-4 py-2 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all ${
                availableBalance >= 1000 
                  ? 'bg-[#D4AF37] hover:bg-[#b58b24] text-black cursor-pointer shadow-md' 
                  : 'bg-white/10 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ArrowUpRight size={14} />
              Request Payout
            </button>
            <span className="text-[11px] text-neutral-400">Min ₦1,000</span>
          </div>
        </div>

        {/* Card 2: Total Earned Lifetime */}
        <div 
          className="rounded-[20px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10"
          style={{ minHeight: 165 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Sparkles size={16} />
              </div>
              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Total Lifetime Earnings</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              85% Creator Share
            </span>
          </div>

          <div className="my-2">
            <span className="text-[30px] font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none">
              {loading ? '...' : formatCurrency(totalEarned, currency, rates)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-100 dark:border-white/10 text-[12px] text-neutral-500">
            <span>Total Withdrawn: <strong>{formatCurrency(totalWithdrawn, currency, rates)}</strong></span>
            {membersSummary && membersSummary.active_members > 0 && (
              <span className="text-[#D4AF37] font-semibold">{membersSummary.active_members} subscribers</span>
            )}
          </div>
        </div>

        {/* Card 3: Payout Bank Account */}
        <div 
          className="rounded-[20px] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10"
          style={{ minHeight: 165 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Building2 size={16} />
              </div>
              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Payout Destination</span>
            </div>
            <button
              onClick={() => setShowBankModal(true)}
              className="text-[12px] font-bold text-[#C69A2C] hover:underline cursor-pointer"
            >
              {wallet?.account_number ? 'Edit Bank' : '+ Add Bank'}
            </button>
          </div>

          <div className="my-2">
            {wallet?.account_number ? (
              <div>
                <p className="text-[16px] font-bold text-neutral-900 dark:text-white m-0 truncate">
                  {wallet.bank_name}
                </p>
                <p className="text-[14px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 m-0 mt-0.5">
                  {wallet.account_number}
                </p>
                <p className="text-[11px] text-neutral-400 m-0 truncate mt-0.5">
                  {wallet.account_name}
                </p>
              </div>
            ) : (
              <div className="py-1">
                <p className="text-[13px] font-medium text-neutral-400 m-0">No bank account linked yet.</p>
                <p className="text-[11px] text-neutral-400 m-0 mt-0.5">Link your Nigerian bank account to receive withdrawals.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-100 dark:border-white/10 text-[11px] text-neutral-400">
            <span>Direct NGN local transfers</span>
            <span className="text-emerald-600 font-semibold">Instant processing</span>
          </div>
        </div>
      </div>

      {/* ─── EARNINGS LEDGER & PAYOUT HISTORY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Earnings Ledger */}
        <div className="bg-white dark:bg-[#111111] rounded-[20px] p-6 border border-neutral-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white m-0">
                Recent Earnings & Tips
              </h3>
              <span className="text-[12px] text-neutral-400">
                {transactions.length} record{transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center text-neutral-400 gap-2">
                <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
                <span className="text-[13px]">Loading earnings ledger...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-white/10 rounded-[12px]">
                <Heart size={24} className="text-[#D4AF37] mb-2" />
                <p className="text-[14px] font-bold text-neutral-800 dark:text-neutral-200 m-0">No earnings recorded yet</p>
                <p className="text-[12px] text-neutral-400 m-0 mt-1 max-w-xs">
                  Fan tips, paid membership subscriptions, and audio show revenue will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100 dark:divide-white/5">
                {transactions.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                        {tx.source_type === 'tip' ? <Heart size={14} /> : <Users size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-neutral-900 dark:text-white m-0 truncate">
                          {tx.description || `${tx.source_type.toUpperCase()} Earning`}
                        </p>
                        <p className="text-[11px] text-neutral-400 m-0 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(Number(tx.net_amount || 0), currency, rates)}
                      </span>
                      <p className="text-[10px] text-neutral-400 m-0">
                        Gross: ₦{Number(tx.gross_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Payout Requests History */}
        <div className="bg-white dark:bg-[#111111] rounded-[20px] p-6 border border-neutral-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white m-0">
                Payout & Withdrawal History
              </h3>
              <span className="text-[12px] text-neutral-400">
                {payouts.length} withdrawal{payouts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center text-neutral-400 gap-2">
                <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
                <span className="text-[13px]">Loading payouts...</span>
              </div>
            ) : payouts.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-white/10 rounded-[12px]">
                <Building2 size={24} className="text-neutral-400 mb-2" />
                <p className="text-[14px] font-bold text-neutral-800 dark:text-neutral-200 m-0">No withdrawals requested yet</p>
                <p className="text-[12px] text-neutral-400 m-0 mt-1 max-w-xs">
                  When you withdraw your available earnings to your Nigerian bank account, tracking details appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100 dark:divide-white/5">
                {payouts.slice(0, 8).map((p) => {
                  const statusColors: Record<string, string> = {
                    completed: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
                    pending: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200',
                    processing: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200',
                    failed: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200',
                  };
                  const badgeClass = statusColors[p.status] || 'text-neutral-700 bg-neutral-100';

                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-neutral-900 dark:text-white">
                            {formatCurrency(Number(p.amount), currency, rates)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeClass}`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 m-0 mt-0.5 truncate">
                          {p.bank_name} ({p.account_number}) · {new Date(p.created_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[12px] font-mono text-neutral-500">
                          {p.status === 'completed' ? 'Paid' : 'In Review'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: REQUEST WITHDRAWAL ─── */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-neutral-900 dark:text-white m-0">Request Payout</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Withdrawal Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">₦</span>
                  <input
                    type="number"
                    min="1000"
                    max={availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-[12px] border border-neutral-300 dark:border-white/10 bg-transparent text-[15px] font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[11px] text-neutral-400">
                  <span>Available: ₦{availableBalance.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(availableBalance))}
                    className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Destination Bank Review */}
              <div className="bg-neutral-50 dark:bg-white/5 rounded-[14px] p-3.5 border border-neutral-200 dark:border-white/10 text-[12px]">
                <p className="text-neutral-500 m-0 mb-1 font-medium">Payout will be sent to:</p>
                <p className="font-bold text-neutral-900 dark:text-white m-0">{wallet?.bank_name}</p>
                <p className="font-mono text-neutral-600 dark:text-neutral-300 m-0">{wallet?.account_number} · {wallet?.account_name}</p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-[12px] border border-neutral-200 dark:border-white/10 text-[13px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 1000}
                  className="flex-1 py-2.5 rounded-[12px] bg-[#D4AF37] hover:bg-[#b58b24] text-black text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isWithdrawing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: UPDATE BANK ACCOUNT ─── */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-neutral-900 dark:text-white m-0">Link Payout Bank Account</h3>
              <button onClick={() => setShowBankModal(false)} className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateBank} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Select Bank
                </label>
                <select
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#18181B] text-[13px] font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Account Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, account_number: e.target.value.replace(/\D/g, '') }))}
                  placeholder="0123456789"
                  className="w-full px-3 py-2.5 rounded-[12px] border border-neutral-300 dark:border-white/10 bg-transparent text-[14px] font-mono font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Account Name (Beneficiary)
                </label>
                <input
                  type="text"
                  value={bankForm.account_name}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, account_name: e.target.value }))}
                  placeholder="e.g. John Doe / Studio Business Ltd"
                  className="w-full px-3 py-2.5 rounded-[12px] border border-neutral-300 dark:border-white/10 bg-transparent text-[13px] font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 rounded-[12px] border border-neutral-200 dark:border-white/10 text-[13px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBank}
                  className="flex-1 py-2.5 rounded-[12px] bg-[#D4AF37] hover:bg-[#b58b24] text-black text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdatingBank ? <Loader2 size={16} className="animate-spin" /> : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
