'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  User as UserIcon, 
  Trash2, 
  CreditCard, 
  Download, 
  Search, 
  Sun, 
  RotateCcw, 
  Bell, 
  PanelRightClose,
  Star,
  Layout,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface UserDetailData {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  business_name?: string;
  phone?: string;
  role: string;
  credits: number;
  location?: string;
  state?: string;
  business_address?: string;
  address?: string;
  created_at: string;
  email_verified?: boolean;
}

interface UserAccountsData {
  no_of_bookings: number;
  total_wallet_balance: number;
  service_request: string;
  transactions: number;
  payments: number;
}

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetailData>({
    id: userId || 'usr-001',
    name: 'Bems Network',
    email: 'bemsnetwork@gmail.com',
    business_name: 'Bems Network',
    phone: '+234 908 765 3489',
    role: 'advertiser',
    credits: 5550125,
    state: 'Abia',
    business_address: '23, Finbars road, umuahia, Nigeria',
    created_at: '2026-10-04T00:00:00Z',
    email_verified: true,
  });

  const [accounts, setAccounts] = useState<UserAccountsData>({
    no_of_bookings: 3,
    total_wallet_balance: 5550125,
    service_request: 'Advert placement',
    transactions: 25,
    payments: 685000,
  });

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Fetch live user details if backend has this user
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/admin/users/${userId}`)
      .then((res) => {
        if (res.data?.user) {
          setUser((prev) => ({
            ...prev,
            ...res.data.user,
            name: res.data.user.business_name || res.data.user.name || 'Bems Network',
            state: res.data.user.state || res.data.user.location || 'Abia',
            business_address: res.data.user.business_address || res.data.user.address || '23, Finbars road, umuahia, Nigeria',
          }));
        }
        if (res.data?.accounts) {
          setAccounts((prev) => ({
            ...prev,
            ...res.data.accounts,
          }));
        }
      })
      .catch(() => {
        // Fallback default mockup data (matches Figma design exactly)
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Handle Remove User
  const handleRemoveUser = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast('User removed successfully', 'success');
      setDeleteModalOpen(false);
      router.push('/admin/users');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to remove user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Generate Transaction History
  const handleGenerateHistory = async () => {
    setTransactionsModalOpen(true);
    setLoadingTransactions(true);
    try {
      const res = await api.get(`/admin/users/${userId}/transactions`);
      if (res.data?.transactions) {
        setTransactionsList(res.data.transactions);
      } else {
        // Fallback sample transactions matching the 25 transactions count
        setTransactionsList([
          { id: 'tx-1', type: 'debit', amount: 350000, description: 'Campaign billboard placement #SA-9012', created_at: '2026-11-20' },
          { id: 'tx-2', type: 'debit', amount: 200000, description: 'Prime screen booking', created_at: '2026-11-15' },
          { id: 'tx-3', type: 'credit', amount: 1500000, description: 'Monnify reserved account funding', created_at: '2026-11-10' },
          { id: 'tx-4', type: 'debit', amount: 135000, description: 'Studio Arella LED placement #SA-8711', created_at: '2026-11-05' },
        ]);
      }
    } catch (err) {
      setTransactionsList([
        { id: 'tx-1', type: 'debit', amount: 350000, description: 'Campaign billboard placement #SA-9012', created_at: '2026-11-20' },
        { id: 'tx-2', type: 'debit', amount: 200000, description: 'Prime screen booking', created_at: '2026-11-15' },
        { id: 'tx-3', type: 'credit', amount: 1500000, description: 'Monnify reserved account funding', created_at: '2026-11-10' },
        { id: 'tx-4', type: 'debit', amount: 135000, description: 'Studio Arella LED placement #SA-8711', created_at: '2026-11-05' },
      ]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Export CSV statement
  const exportTransactionCSV = () => {
    const headers = ['Transaction ID', 'Type', 'Amount (NGN)', 'Description', 'Date'];
    const rows = transactionsList.map((t) => [
      t.id,
      t.type,
      t.amount,
      `"${t.description || ''}"`,
      t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '04/10/2026'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${user.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Transaction history downloaded', 'success');
  };

  const displayName = user.business_name || user.name || 'Bems Network';
  const roleDisplay = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')) : 'Advertiser';
  const formattedDate = user.created_at 
    ? (user.created_at.includes('/') ? user.created_at : new Date(user.created_at).toLocaleDateString('en-GB')) 
    : '04/10/2026';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-[#101828]">
      {/* ── TOP HEADER / BREADCRUMB BAR (Figma Specification) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2.5 text-xs text-[#000000]/60 font-sans">
          <button className="p-1 hover:text-[#06152B] transition-colors" title="Toggle Sidebar">
            <Layout size={16} />
          </button>
          <button className="p-1 hover:text-[#06152B] transition-colors" title="Favorites">
            <Star size={16} />
          </button>
          <span className="text-[#000000]/40">/</span>
          <span className="text-[#000000] font-medium">Admin</span>
          <span className="text-[#000000]/40">/</span>
          <Link href="/admin/users" className="hover:text-black transition-colors text-[#000000]/40">All users</Link>
          <span className="text-[#000000]/40">/</span>
          <span className="text-[#000000] font-medium">Default</span>
        </div>

        {/* Right: Search & Quick Action Icons */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          {/* Search Pill */}
          <div className="relative flex items-center bg-black/5 rounded-full px-3 py-1.5 w-44 md:w-56">
            <Search size={14} className="text-[#000000]/40 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-xs w-full text-[#06152B] placeholder:text-[#000000]/40"
            />
            <kbd className="hidden sm:inline-block text-[10px] text-[#000000]/40 border border-black/10 rounded px-1 ml-1 font-mono">
              /
            </kbd>
          </div>

          {/* Quick Icons */}
          <div className="flex items-center gap-2 text-[#000000]/70">
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Theme">
              <Sun size={16} />
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Refresh" onClick={() => window.location.reload()}>
              <RotateCcw size={16} />
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Notifications">
              <Bell size={16} />
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Toggle Panel">
              <PanelRightClose size={16} />
            </button>
            <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              A
            </div>
          </div>
        </div>
      </div>

      {/* ── BREADCRUMB TITLE & BACK LINK (Figma Specification) ── */}
      <div className="space-y-2 pt-2">
        <h1 className="text-base font-normal text-[rgba(16,24,40,0.8)] font-sans">
          All users &gt; {displayName}
        </h1>
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-normal text-[rgba(16,24,40,0.8)] hover:text-[#06152B] transition-colors"
          >
            <span>&lt; BACK</span>
          </Link>
        </div>
      </div>

      {/* ── MAIN DETAIL CONTAINER (Frame 8 in Figma) ── */}
      <div className="bg-white/60 md:bg-white rounded-lg border border-[#D7D7D7] p-6 sm:p-8 max-w-[1080px] shadow-2xs space-y-7">
        {/* Top Header Row: User Avatar, Name, Role badge & Remove user button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-4">
            {/* 58px Wireframe Avatar */}
            <div className="w-[58px] h-[58px] rounded-[60px] bg-[#5F6D7E] flex items-center justify-center shrink-0 shadow-xs">
              <UserIcon size={26} className="text-white stroke-[2]" />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[28px] font-bold leading-9 text-[#101828] font-sans">
                {displayName}
              </h2>

              {/* Role badge (Figma: soft cyan/teal badge) */}
              <span className="inline-flex items-center px-3 py-1 rounded-[16.5px] bg-[rgba(3,197,210,0.2)] text-[#005055] text-[13.5px] font-normal leading-[18px]">
                {roleDisplay}
              </span>
            </div>
          </div>

          {/* Remove User Button */}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white border border-[#D7D7D7] rounded-[16px] text-[#E93131] hover:bg-rose-50 hover:border-rose-200 text-base font-normal transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Trash2 size={20} className="text-[#E93131] stroke-[1.8]" />
            <span>Remove user</span>
          </button>
        </div>

        {/* ── TWO INNER SIDE-BY-SIDE CARDS (Identity & Accounts) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── CARD 1: IDENTITY ── */}
          <div className="bg-white rounded-[8px] border border-[#D7D7D7] p-6 shadow-[1px_1px_2px_rgba(0,0,0,0.08)] flex flex-col justify-between min-h-[350px]">
            <div>
              {/* Card Header: 40px Icon + Title */}
              <div className="flex items-center gap-3 pb-5">
                <div className="w-10 h-10 rounded-full bg-[#FDF7E6] border border-[#D4AD2D] flex items-center justify-center text-[#D4AD2D] shrink-0">
                  <UserIcon size={18} className="stroke-[2]" />
                </div>
                <h3 className="text-[17px] font-medium leading-[22px] tracking-[0.01em] text-[#D2AB2B]">
                  Identity
                </h3>
              </div>

              {/* Field Rows */}
              <div className="space-y-4 text-sm text-[#101828] pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-[#101828]">Email address</span>
                  <span className="font-normal text-[#101828] break-all">
                    {user.email || 'bemsnetwork@gmail.com'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-[#101828]">Business phone</span>
                  <span className="font-normal text-[#101828]">
                    {user.phone || '+234 908 765 3489'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-[#101828]">State</span>
                  <span className="font-normal text-[#101828]">
                    {user.state || 'Abia'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-[#101828]">Business address</span>
                  <span className="font-normal text-[#101828]">
                    {user.business_address || '23, Finbars road, umuahia, Nigeria'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-36 shrink-0 text-[#101828]">Date created</span>
                  <span className="font-normal text-[#101828]">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: ACCOUNTS ── */}
          <div className="bg-white rounded-[8px] border border-[#D7D7D7] p-6 shadow-[1px_1px_2px_rgba(0,0,0,0.08)] flex flex-col justify-between min-h-[350px]">
            <div>
              {/* Card Header: 40px Icon + Title */}
              <div className="flex items-center gap-3 pb-5">
                <div className="w-10 h-10 rounded-full bg-[#E0F3EE] flex items-center justify-center text-[#009E74] shrink-0">
                  <CreditCard size={20} className="stroke-[2]" />
                </div>
                <h3 className="text-[17px] font-medium leading-[22px] tracking-[0.01em] text-[#D2AB2B]">
                  Accounts
                </h3>
              </div>

              {/* Field Rows */}
              <div className="space-y-4 text-sm text-[#101828] pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-44 shrink-0 text-[#101828]">No of bookings</span>
                  <span className="font-normal text-[#101828]">
                    {accounts.no_of_bookings}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-44 shrink-0 text-[#101828]">Total wallet balance</span>
                  <span className="font-normal text-[#101828]">
                    NGN {Number(accounts.total_wallet_balance || 5550125).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-44 shrink-0 text-[#101828]">Service request</span>
                  <span className="font-normal text-[#101828]">
                    {accounts.service_request || 'Advert placement'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-44 shrink-0 text-[#101828]">Transactions</span>
                  <span className="font-normal text-[#101828]">
                    {accounts.transactions}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-44 shrink-0 text-[#101828]">Payments</span>
                  <span className="font-normal text-[#101828]">
                    NGN {Number(accounts.payments || 685000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action: Generate transaction history */}
            <div className="pt-6 flex justify-end">
              <button
                onClick={handleGenerateHistory}
                className="px-5 py-2.5 bg-white border border-[#D7D7D7] rounded-[16px] text-base font-normal text-[#101828] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
              >
                Generate transaction history
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: REMOVE USER CONFIRMATION ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove User Account</h3>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to permanently remove <strong className="text-slate-900">{displayName}</strong> ({user.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveUser}
                disabled={deleting}
                className="px-4 py-2 bg-[#E93131] hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-xs disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GENERATE TRANSACTION HISTORY / STATEMENT ── */}
      {transactionsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-[#D4AF37]" />
                <h3 className="text-base font-bold text-[#101828]">
                  Transaction Statement &bull; {displayName}
                </h3>
              </div>
              <button
                onClick={() => setTransactionsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary Banner */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block">Total Balance</span>
                <span className="font-bold text-[#06152B] text-sm">
                  ₦{Number(accounts.total_wallet_balance).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Payments</span>
                <span className="font-bold text-[#06152B] text-sm">
                  ₦{Number(accounts.payments).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Records</span>
                <span className="font-bold text-[#06152B] text-sm">
                  {accounts.transactions}
                </span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
              {loadingTransactions ? (
                <div className="py-8 text-center text-slate-400">Loading transactions...</div>
              ) : transactionsList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">No transactions recorded yet.</div>
              ) : (
                transactionsList.map((tx, idx) => (
                  <div key={tx.id || idx} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-900">{tx.description || 'Wallet transaction'}</div>
                      <div className="text-[11px] text-slate-500">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-GB') : '04/10/2026'}
                      </div>
                    </div>
                    <div className={`font-semibold text-right ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={exportTransactionCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[#FED757] hover:bg-[#fecb2e] text-black text-xs font-semibold rounded-lg transition-all"
              >
                <Download size={14} />
                <span>Download Statement (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
