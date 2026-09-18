'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight,
  Trash2, Eye, Play, Pause, X, Calendar, Check, Globe, Download,
  ArrowLeft, CreditCard, Wallet, Upload, Copy,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/currency';

const F = theme.font.body;
const GOLD = '#C69A2C';
const BANKS = ['GTBank', 'Wema Bank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Union Bank', 'Sterling Bank'];
const CREATIVE_SERVICES = ['Campaign banner design', 'Campaign storytelling'];

type WizardStep = 'details' | 'creative-service' | 'creative-service-success' | 'billing' | 'card' | 'card-confirm' | 'wallet' | 'otp' | 'success';

// "2026-01-01" -> "2026-04-01" becomes "3 months"; short ranges fall back to
// weeks/days so the Billing header always reads naturally.
function formatCampaignDuration(start: string, end: string): string {
  if (!start || !end) return 'Campaign';
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  if (days <= 0) return 'Campaign';
  if (days < 14) return `${days}-day`;
  if (days < 60) { const w = Math.round(days / 7); return `${w} week${w > 1 ? 's' : ''}`; }
  const m = Math.round(days / 30);
  return `${m} month${m > 1 ? 's' : ''}`;
}

interface CampaignItem {
  id: string;
  name: string;
  schedule: string;
  budget: number;
  spent: number;
  impressions: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  adsCount: number;
}

const STATUS_LABELS: Record<CampaignItem['status'], string> = {
  draft: 'Draft', active: 'Active', paused: 'Paused', ended: 'Ended',
};

export default function CampaignsPage() {
  const { toast } = useToast();
  const { currency, rates } = usePreferencesStore();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Wizard: step 1 — campaign details ──
  const [wizardStep, setWizardStep] = useState<WizardStep>('details');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const materialsInputRef = useRef<HTMLInputElement>(null);

  // ── Wizard: "Request Ad creative services" sub-flow ──
  const [serviceType, setServiceType] = useState(CREATIVE_SERVICES[0]);
  const [serviceBrief, setServiceBrief] = useState('');
  const [serviceFile, setServiceFile] = useState<File | null>(null);
  const [submittingService, setSubmittingService] = useState(false);

  // ── Wizard: billing (funds the campaign's budget directly) ──
  const [walletBalance, setWalletBalance] = useState(0);
  const [billingMethod, setBillingMethod] = useState<'card' | 'wallet' | null>(null);
  const [paying, setPaying] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // Confirm-screen fields for a saved card — shown to match the design, but
  // charging a saved card uses its stored authorization_code only; none of
  // these are read or sent anywhere.
  const [confirmCardForm, setConfirmCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({ bank: BANKS[0], name: '', number: '', expiry: '', cvv: '' });
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpReference, setOtpReference] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Payment successful and campaign booked');

  const budgetAmount = parseFloat(budget.replace(/,/g, '')) || 0;
  const durationLabel = formatCampaignDuration(startDate, endDate);
  const billingHeader = durationLabel === 'Campaign' ? 'Campaign budget' : `${durationLabel} campaign`;

  const mapCampaign = (c: any): CampaignItem => ({
    id: c.id,
    name: c.name || 'Untitled Campaign',
    schedule: c.start_date ? new Date(c.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    budget: Number(c.budget || 0),
    spent: Number(c.spent || 0),
    impressions: Number(c.impressions || 0),
    status: (c.status || 'draft') as CampaignItem['status'],
    adsCount: Number(c.ad_count || 0),
  });

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await api.get('/campaigns');
      setCampaigns((res.data?.campaigns || []).map(mapCampaign));
    } catch {
      setCampaigns([]);
      toast('Could not load your campaigns. Please refresh.', 'error');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, pageSize]);

  const resetWizard = () => {
    setCreateModalOpen(false);
    setWizardStep('details');
    setName(''); setDescription(''); setBudget(''); setStartDate(''); setEndDate('');
    setDraftCampaignId(null);
    setMaterialFiles([]);
    if (materialsInputRef.current) materialsInputRef.current.value = '';
    setServiceType(CREATIVE_SERVICES[0]); setServiceBrief(''); setServiceFile(null);
    setBillingMethod(null); setSavedCards([]);
    setSelectedCardId(null); setShowNewCardForm(false);
    setConfirmCardForm({ name: '', number: '', expiry: '', cvv: '' });
    setCardForm({ bank: BANKS[0], name: '', number: '', expiry: '', cvv: '' }); setSaveNewCard(true);
    setOtpDigits(['', '', '', '']); setOtpReference(null);
  };

  const finishSuccess = (message: string) => {
    setSuccessMessage(message);
    setWizardStep('success');
    fetchCampaigns();
  };

  const addMaterialFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const valid = Array.from(files).filter((f) => allowed.includes(f.type));
    if (valid.length < files.length) toast('Only JPG, PNG, and GIF files are supported', 'error');
    if (valid.length > 0) setMaterialFiles((prev) => [...prev, ...valid]);
  };

  // ── Step 1: create the campaign, upload any attached creative materials
  // (same real Cloudinary/moderation pipeline as /book, just called once per
  // file and tagged with this campaign's id), then go straight to Billing —
  // no screen/slot selection here; that happens later on /book or /cart,
  // drawing down against the budget funded below. ──
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast('Please enter a campaign name', 'error'); return; }
    if (budgetAmount <= 0) { toast('Please enter a budget for this campaign', 'error'); return; }
    setCreatingCampaign(true);
    try {
      const res = await api.post('/campaigns', {
        name, description,
        budget: budgetAmount,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      const campaignId = res.data.id;
      setCampaigns(prev => [mapCampaign(res.data), ...prev]);
      setDraftCampaignId(campaignId);

      for (const f of materialFiles) {
        try {
          const formData = new FormData();
          formData.append('file', f);
          formData.append('title', `${name} — ${f.name}`);
          formData.append('campaign_id', campaignId);
          formData.append('media_type', 'image');
          await api.post('/ads', formData, { headers: { 'Content-Type': undefined } });
        } catch (uploadErr: any) {
          toast(`"${f.name}" could not be uploaded: ${uploadErr?.response?.data?.message || 'please add it later from Ads'}`, 'error');
        }
      }

      api.get('/finances/balance').then((r) => setWalletBalance(Number(r.data?.credits ?? 0))).catch(() => {});
      setWizardStep('billing');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not create campaign. Please try again.', 'error');
    } finally {
      setCreatingCampaign(false);
    }
  };

  // ── "Request Ad creative services" — wired to the real support pipeline
  // (creative_requests table, admin notifications) already used elsewhere. ──
  const handleRequestCreativeService = async () => {
    if (!serviceBrief.trim()) { toast('Please describe what you need', 'error'); return; }
    setSubmittingService(true);
    try {
      await api.post('/creative-requests', {
        business_name: user?.business_name || user?.name || 'Studio Arella advertiser',
        contact_phone: user?.phone || 'Not provided',
        ad_type: 'image',
        description: `[${serviceType}] ${serviceBrief}`,
      });
      setWizardStep('creative-service-success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not submit your request. Please try again.', 'error');
    } finally {
      setSubmittingService(false);
    }
  };

  const handleBillingContinue = () => {
    if (!billingMethod) { toast('Please choose a payment method', 'error'); return; }
    if (billingMethod === 'wallet') {
      if (walletBalance < budgetAmount) { toast('Insufficient wallet balance. Please fund your wallet.', 'error'); return; }
      setWizardStep('wallet');
      return;
    }
    setLoadingCards(true);
    api.get('/payments/cards').then((r) => setSavedCards(r.data?.cards || [])).catch(() => {}).finally(() => setLoadingCards(false));
    setShowNewCardForm(false);
    setSelectedCardId(null);
    setWizardStep('card');
  };

  const handlePayWallet = async () => {
    if (!draftCampaignId) return;
    setPaying(true);
    try {
      const res = await api.post(`/campaigns/${draftCampaignId}/fund/wallet`);
      finishSuccess(res.data?.message || 'Payment successful and campaign booked');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handlePaySavedCard = async () => {
    if (!draftCampaignId || !selectedCardId) { toast('Please choose a saved card', 'error'); return; }
    setPaying(true);
    try {
      const res = await api.post(`/campaigns/${draftCampaignId}/fund/charge-authorization`, { card_id: selectedCardId, campaign_id: draftCampaignId });
      if (res.data?.status === 'send_otp') {
        setOtpReference(res.data.reference);
        setOtpDigits(['', '', '', '']);
        setWizardStep('otp');
      } else {
        finishSuccess(res.data?.message || 'Payment successful and campaign booked');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Payment failed. Please try a different card.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handlePayNewCard = async () => {
    if (!draftCampaignId) return;
    const [expMonth, expYear] = cardForm.expiry.split('/').map((s) => s.trim());
    if (!cardForm.name || !cardForm.number || !expMonth || !expYear || !cardForm.cvv) {
      toast('Please fill in your card details', 'error');
      return;
    }
    setPaying(true);
    try {
      const res = await api.post(`/campaigns/${draftCampaignId}/fund/charge`, {
        campaign_id: draftCampaignId,
        card: { number: cardForm.number, cvv: cardForm.cvv, expiry_month: expMonth, expiry_year: expYear, name: cardForm.name },
        save_card: saveNewCard,
      });
      if (res.data?.status === 'send_otp') {
        setOtpReference(res.data.reference);
        setOtpDigits(['', '', '', '']);
        setWizardStep('otp');
      } else {
        finishSuccess(res.data?.message || 'Payment successful and campaign booked');
      }
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Card was declined. Please try a different card.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) { toast('Please enter the 4-digit code', 'error'); return; }
    setVerifyingOtp(true);
    try {
      const res = await api.post('/payments/charge/submit-otp', { reference: otpReference, otp });
      finishSuccess(res.data?.message || 'Payment successful and campaign booked');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Incorrect code. Please try again.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    const prev = campaigns;
    setCampaigns(c => c.filter(x => x.id !== id));
    try {
      await api.delete(`/campaigns/${id}`);
      toast('Campaign deleted', 'info');
    } catch (err: any) {
      setCampaigns(prev);
      toast(err?.response?.data?.message || 'Could not delete campaign. Please try again.', 'error');
    }
  };

  const filtered = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Real client-side CSV of whatever's currently filtered — all the data is
  // already loaded, no backend export endpoint needed.
  const handleExport = () => {
    if (filtered.length === 0) { toast('No campaigns to export', 'error'); return; }
    const headers = ['Name', 'Schedule', 'Budget (NGN)', 'Spent (NGN)', 'Impressions', 'Ad Slots', 'Status'];
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = filtered.map(c => [
      escape(c.name), escape(c.schedule), c.budget, c.spent, c.impressions, c.adsCount, escape(STATUS_LABELS[c.status] || c.status),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} campaign${filtered.length !== 1 ? 's' : ''}`, 'success');
  };

  const getStatusStyle = (status: CampaignItem['status']) => {
    switch (status) {
      case 'active':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-white/10';
      case 'paused':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-white/10';
      case 'ended':
        return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-white/10';
      case 'draft':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-white/10';
      default:
        return 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10';
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F }} className="max-w-[1360px] mx-auto p-6 sm:p-10 flex flex-col gap-8 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Campaigns</h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage your advertising campaigns, budgets, and impressions</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-lg text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors shadow-sm">
              <span>Today</span>
              <ChevronDown size={14} className="text-slate-400 dark:text-slate-500" />
            </button>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Campaigns', value: String(campaigns.length) },
              { label: 'Total Budget (NGN)', value: `₦${campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()}` },
              { label: 'Total Spent (NGN)', value: `₦${campaigns.reduce((s, c) => s + c.spent, 0).toLocaleString()}` },
              { label: 'Total Impressions', value: campaigns.reduce((s, c) => s + c.impressions, 0).toLocaleString() },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111111] rounded-[18px] p-5 border border-slate-100 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              >
                <p className="text-[12.5px] font-bold text-slate-500 dark:text-slate-400 mb-3">{stat.label}</p>
                <span className="text-[24px] font-black text-slate-900 dark:text-slate-50 leading-none">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Main Card: Toolbar + Table */}
          <div className="bg-white dark:bg-[#111111] rounded-[24px] border border-slate-100 dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10">
              <h2 className="text-[17px] font-bold text-slate-900 dark:text-slate-50">All Campaigns</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search campaign name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-[10px] text-[12.5px] font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:border-[#C69A2C] transition-colors"
                  />
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[10px] text-[12.5px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-slate-500 dark:text-slate-400" />
                  <span>Filter</span>
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[10px] text-[12.5px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors shadow-sm"
                >
                  <Download size={14} className="text-slate-500 dark:text-slate-400" />
                  <span>Export</span>
                </button>

                {/* Create Campaign Primary Button */}
                <button
                  onClick={() => { setWizardStep('details'); setCreateModalOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2 bg-[#C69A2C] hover:bg-[#b58b24] text-white rounded-[10px] text-[12.5px] font-bold transition-all shadow-sm"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>New Campaign</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign Info</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spent (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 dark:text-slate-500 text-[13px]">
                        {loadingCampaigns ? 'Loading campaigns…' : 'No campaigns found matching your query'}
                      </td>
                    </tr>
                  ) : (
                    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-slate-50">{c.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.adsCount} ad slots active</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                          {c.schedule}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                          {c.budget.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                          {c.spent.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                          {c.impressions.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(c.status)}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/campaigns/${c.id}`}
                              className="text-[12px] font-bold text-[#C69A2C] hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="text-slate-400 dark:text-slate-500 hover:text-rose-600 transition-colors p-1"
                              title="Delete Campaign"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-white/10 text-[12px] text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-[#C69A2C]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div>
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} out of {filtered.length} records
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-40"
                >
                  &lt;
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#C69A2C] text-white font-bold text-[12px] shadow-sm">
                  {currentPage}
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * pageSize >= filtered.length}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

          {/* ─── CREATE CAMPAIGN: STEP 1 — DETAILS ─── */}
          {createModalOpen && wizardStep === 'details' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[460px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-7 pt-6 pb-2 flex-shrink-0">
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-50">Create campaign</h3>
                  <button
                    onClick={resetWizard}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="px-7 pb-7 pt-4 flex flex-col gap-4 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Campaign name e.g Independence day special"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                  />

                  <textarea
                    placeholder="Describe your campaign"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C] resize-none"
                  />

                  <input
                    type="number"
                    placeholder="Budget (NGN) e.g 500,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start date"
                      className="w-full px-3 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C69A2C]"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End date"
                      className="w-full px-3 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C69A2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Upload campaign materials <span className="font-normal text-slate-400">(You can upload multiple files at once)</span>
                    </label>
                    <input
                      ref={materialsInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={(e) => addMaterialFiles(e.target.files)}
                      className="hidden"
                      id="campaign-materials-input"
                    />
                    <label
                      htmlFor="campaign-materials-input"
                      className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[12px] py-5 cursor-pointer hover:border-[#C69A2C] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#C69A2C] flex items-center justify-center">
                        <Upload size={16} className="text-white" />
                      </div>
                      <span className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200">Drag & Drop or choose file to upload</span>
                      <span className="text-[11px] text-slate-400">Supported formats: jpeg, png, gif</span>
                    </label>
                    {materialFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {materialFiles.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-slate-100 dark:bg-white/[0.06] rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name}
                            <button type="button" onClick={() => setMaterialFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-600">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[12px] text-slate-500 dark:text-slate-400 -mt-1">
                    Don&apos;t have campaign materials yet?{' '}
                    <button type="button" onClick={() => setWizardStep('creative-service')} className="text-[#C69A2C] font-bold hover:underline">
                      Request Ad creative services
                    </button>
                  </p>

                  <div className="flex items-center justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={resetWizard}
                      className="px-5 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[13px] font-bold rounded-[10px] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingCampaign}
                      className="px-6 py-2.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                    >
                      {creatingCampaign ? 'Creating…' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── REQUEST AD CREATIVE SERVICES ─── */}
          {createModalOpen && wizardStep === 'creative-service' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-slate-100 dark:border-white/10">
                  <button onClick={() => setWizardStep('details')} className="p-1 text-slate-500 dark:text-slate-400">
                    <ArrowLeft size={18} />
                  </button>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-slate-50">Campaign creative services</span>
                  <button onClick={resetWizard} className="p-1 text-slate-500 dark:text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 pt-5 pb-6 flex flex-col gap-3">
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                  >
                    {CREATIVE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <textarea
                    placeholder="Describe your campaign creative brief"
                    value={serviceBrief}
                    onChange={(e) => setServiceBrief(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C] resize-none"
                  />

                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={(e) => setServiceFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="creative-service-file-input"
                    />
                    <label
                      htmlFor="creative-service-file-input"
                      className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[12px] py-5 cursor-pointer hover:border-[#C69A2C] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#C69A2C] flex items-center justify-center">
                        <Upload size={16} className="text-white" />
                      </div>
                      <span className="text-[12.5px] font-bold text-slate-700 dark:text-slate-200">
                        {serviceFile ? serviceFile.name : 'Or upload Ad creative brief?'}
                      </span>
                      <span className="text-[11px] text-slate-400">Supported formats: jpeg, png, gif</span>
                    </label>
                  </div>

                  <button
                    onClick={handleRequestCreativeService}
                    disabled={submittingService}
                    className="w-full mt-1 px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                  >
                    {submittingService ? 'Submitting…' : 'Add service'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {createModalOpen && wizardStep === 'creative-service-success' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="px-6 pt-10 pb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C69A2C] flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-white" />
                  </div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-50 mb-6">Creative service added</p>
                  <button
                    onClick={() => setWizardStep('details')}
                    className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── CREATE CAMPAIGN: STEPS 3+ — BILLING ─── */}
          {createModalOpen && ['billing', 'card', 'card-confirm', 'wallet', 'otp', 'success'].includes(wizardStep) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-slate-100 dark:border-white/10">
                  {wizardStep !== 'billing' && wizardStep !== 'success' ? (
                    <button
                      onClick={() => {
                        if (wizardStep === 'card' && showNewCardForm) { setShowNewCardForm(false); return; }
                        if (wizardStep === 'card-confirm') { setWizardStep('card'); return; }
                        setWizardStep('billing');
                      }}
                      className="p-1 text-slate-500 dark:text-slate-400"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  ) : <span />}
                  <span className="text-[15px] font-bold text-slate-900 dark:text-slate-50">
                    {wizardStep === 'billing' && 'Billing'}
                    {wizardStep === 'card' && (showNewCardForm ? 'Pay with a new card' : 'Pay with card')}
                    {wizardStep === 'card-confirm' && `Pay with ${savedCards.find((c) => c.id === selectedCardId)?.bank || savedCards.find((c) => c.id === selectedCardId)?.card_type || 'card'} card`}
                    {wizardStep === 'wallet' && 'Pay from wallet'}
                    {wizardStep === 'otp' && 'Verify payment'}
                  </span>
                  {wizardStep !== 'success' ? (
                    <button onClick={resetWizard} className="p-1 text-slate-500 dark:text-slate-400">
                      <X size={18} />
                    </button>
                  ) : <span />}
                </div>

                <div className="px-6 pt-5 pb-6">
                  {wizardStep === 'billing' && (
                    <>
                      <p className="text-center text-[13px] font-bold text-slate-900 dark:text-slate-50 mb-5">
                        {billingHeader} at {formatCurrency(budgetAmount, currency, rates)}
                      </p>
                      <div
                        onClick={() => setBillingMethod('card')}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-[12px] border mb-3 cursor-pointer transition-colors ${billingMethod === 'card' ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-slate-200 dark:border-white/10'}`}
                      >
                        <CreditCard size={18} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-[14px] font-bold text-slate-900 dark:text-slate-50 flex-1">Pay with card</span>
                        {billingMethod === 'card' && <Check size={16} className="text-[#C69A2C]" />}
                      </div>
                      <div
                        onClick={() => setBillingMethod('wallet')}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-[12px] border cursor-pointer transition-colors ${billingMethod === 'wallet' ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-slate-200 dark:border-white/10'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet size={18} className="text-slate-500 dark:text-slate-400" />
                          <div>
                            <p className="text-[14px] font-bold text-slate-900 dark:text-slate-50 m-0">Pay from wallet</p>
                            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 m-0 flex items-center gap-1">
                              Balance: {formatCurrency(walletBalance, currency, rates)}
                              {user?.id && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(user.id); toast('Wallet ID copied', 'success'); }}
                                  className="inline-flex items-center gap-0.5 text-slate-400 hover:text-[#C69A2C]"
                                  title={`Wallet ID: ${user.id}`}
                                >
                                  <Copy size={10} />
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                        {billingMethod === 'wallet' && <Check size={16} className="text-[#C69A2C]" />}
                      </div>
                      <Link href="/finances" className="block text-center text-[11.5px] font-bold text-[#C69A2C] mt-3 hover:underline">
                        Fund wallet →
                      </Link>
                      <button
                        onClick={handleBillingContinue}
                        className="w-full mt-4 px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm"
                      >
                        Continue
                      </button>
                    </>
                  )}

                  {wizardStep === 'card' && !showNewCardForm && (
                    <>
                      <p className="text-center text-[13px] font-bold text-slate-900 dark:text-slate-50 mb-5">
                        {billingHeader} at {formatCurrency(budgetAmount, currency, rates)}
                      </p>
                      {loadingCards ? (
                        <p className="text-center text-[12.5px] text-slate-400 py-4">Loading your saved cards…</p>
                      ) : savedCards.length > 0 ? (
                        <div className="flex flex-col gap-2.5 mb-3">
                          {savedCards.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCardId(c.id)}
                              className={`px-4 py-3 rounded-[12px] border cursor-pointer transition-colors ${selectedCardId === c.id ? 'border-[#C69A2C] bg-[#C69A2C]/5' : 'border-slate-200 dark:border-white/10'}`}
                            >
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedCardId === c.id ? 'border-[#C69A2C]' : 'border-slate-300 dark:border-white/20'}`}>
                                  {selectedCardId === c.id && <span className="w-2 h-2 rounded-full bg-[#C69A2C]" />}
                                </span>
                                <p className="text-[13px] font-bold text-slate-900 dark:text-slate-50 m-0">Pay with {c.bank || c.card_type || 'card'}</p>
                              </div>
                              <div className="flex items-center justify-between pl-[26px]">
                                <span className="text-[11.5px] font-mono text-slate-400 dark:text-slate-500">•••••••••••{c.last4 || '••••'}</span>
                                {c.cardholder_name && <span className="text-[11.5px] text-slate-500 dark:text-slate-400">{c.cardholder_name}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-[12.5px] text-slate-400 mb-3">You have no saved cards yet.</p>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowNewCardForm(true)}
                        className="block w-full text-center text-[12.5px] font-bold text-[#C69A2C] mb-4 hover:underline"
                      >
                        Pay with a new bank card
                      </button>

                      {savedCards.length > 0 && (
                        <button
                          onClick={() => {
                            if (!selectedCardId) { toast('Please choose a saved card', 'error'); return; }
                            const c = savedCards.find((x) => x.id === selectedCardId);
                            setConfirmCardForm({
                              name: c?.cardholder_name || '',
                              number: c?.last4 ? `•••• •••• •••• ${c.last4}` : '',
                              expiry: c?.exp_month && c?.exp_year ? `${c.exp_month}/${c.exp_year}` : '',
                              cvv: '',
                            });
                            setWizardStep('card-confirm');
                          }}
                          disabled={!selectedCardId}
                          className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                        >
                          Continue
                        </button>
                      )}
                    </>
                  )}

                  {wizardStep === 'card-confirm' && (
                    <>
                      <div className="flex flex-col gap-3 mb-4">
                        <input
                          placeholder="Enter amount"
                          value={formatCurrency(budgetAmount, currency, rates)}
                          disabled
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                        <input
                          placeholder="Card holder's name"
                          value={confirmCardForm.name}
                          onChange={(e) => setConfirmCardForm({ ...confirmCardForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                        />
                        <input
                          placeholder="Card number"
                          value={confirmCardForm.number}
                          onChange={(e) => setConfirmCardForm({ ...confirmCardForm, number: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                        />
                        <div className="flex gap-2.5">
                          <input
                            placeholder="Expiry date (MM/YY)"
                            value={confirmCardForm.expiry}
                            onChange={(e) => setConfirmCardForm({ ...confirmCardForm, expiry: e.target.value })}
                            className="w-1/2 px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                          />
                          <input
                            placeholder="CVV"
                            value={confirmCardForm.cvv}
                            onChange={(e) => setConfirmCardForm({ ...confirmCardForm, cvv: e.target.value })}
                            className="w-1/2 px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handlePaySavedCard}
                        disabled={paying}
                        className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                      >
                        {paying ? 'Paying…' : 'Pay'}
                      </button>
                    </>
                  )}

                  {wizardStep === 'card' && showNewCardForm && (
                    <>
                      <p className="text-center text-[13px] font-bold text-slate-900 dark:text-slate-50 mb-5">
                        {billingHeader} at {formatCurrency(budgetAmount, currency, rates)}
                      </p>
                      <div className="flex flex-col gap-3 mb-4">
                        <select
                          value={cardForm.bank}
                          onChange={(e) => setCardForm({ ...cardForm, bank: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                        >
                          {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <input placeholder="Card holder's name" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]" />
                        <input placeholder="Card number" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]" />
                        <div className="flex gap-2.5">
                          <input placeholder="Expiry (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} className="w-1/2 px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]" />
                          <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} className="w-1/2 px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]" />
                        </div>
                        <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={saveNewCard} onChange={(e) => setSaveNewCard(e.target.checked)} className="accent-[#C69A2C]" />
                          Add this card
                        </label>
                      </div>
                      <button
                        onClick={handlePayNewCard}
                        disabled={paying}
                        className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                      >
                        {paying ? 'Paying…' : 'Pay'}
                      </button>
                    </>
                  )}

                  {wizardStep === 'wallet' && (
                    <>
                      <div className="flex items-center justify-between px-4 py-4 rounded-[12px] border border-slate-200 dark:border-white/10 mb-5">
                        <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total amount</span>
                        <strong className="text-[13.5px] text-slate-900 dark:text-slate-50">{formatCurrency(budgetAmount, currency, rates)}</strong>
                      </div>
                      <button
                        onClick={handlePayWallet}
                        disabled={paying}
                        className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                      >
                        {paying ? 'Paying…' : 'Pay'}
                      </button>
                    </>
                  )}

                  {wizardStep === 'otp' && (
                    <>
                      <p className="text-center text-[13px] font-bold text-slate-900 dark:text-slate-50 mb-1">Enter code*</p>
                      <div className="flex items-center justify-center gap-2.5 my-4">
                        {otpDigits.map((d, i) => (
                          <input
                            key={i}
                            id={`campaign-otp-${i}`}
                            value={d}
                            maxLength={1}
                            inputMode="numeric"
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(-1);
                              const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
                              if (v && i < 3) document.getElementById(`campaign-otp-${i + 1}`)?.focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otpDigits[i] && i > 0) document.getElementById(`campaign-otp-${i - 1}`)?.focus();
                            }}
                            className="w-12 h-12 text-center text-[18px] font-bold border border-slate-200 dark:border-white/10 rounded-[10px] bg-white dark:bg-[#111111] text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                          />
                        ))}
                      </div>
                      <p className="text-center text-[11.5px] text-slate-400 dark:text-slate-500 mb-1">
                        <button type="button" onClick={() => toast("If you didn't receive a code, please try paying again.", 'info')} className="text-[#C69A2C] font-bold hover:underline">
                          Didn&apos;t get code? Resend
                        </button>
                      </p>
                      <p className="text-center text-[12px] text-slate-500 dark:text-slate-400 mb-5 mt-4">
                        To authorize this payment, enter the OTP sent to {user?.email ? <strong>{user.email}</strong> : 'the email'} attached to your Studio Arella account
                      </p>
                      <button
                        onClick={handleSubmitOtp}
                        disabled={verifyingOtp}
                        className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                      >
                        {verifyingOtp ? 'Verifying…' : 'Pay'}
                      </button>
                    </>
                  )}

                  {wizardStep === 'success' && (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#C69A2C] flex items-center justify-center mx-auto mb-4">
                        <Check size={28} className="text-white" />
                      </div>
                      <p className="text-[15px] font-bold text-slate-900 dark:text-slate-50 mb-6">{successMessage}</p>
                      <button
                        onClick={resetWizard}
                        className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm"
                      >
                        Finish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── FILTER POPUP ─── */}
          {filterModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[380px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-50">Filter Campaigns</h3>
                  <button 
                    onClick={() => setFilterModalOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
                  <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">Select Status</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['All', 'active', 'paused', 'ended', 'draft'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`py-2 px-3 rounded-[10px] text-[12px] font-bold border transition-colors ${
                          statusFilter === st
                            ? 'border-[#C69A2C] bg-[#C69A2C]/10 text-[#C69A2C]'
                            : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        {st === 'All' ? 'All' : STATUS_LABELS[st as CampaignItem['status']]}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('All');
                        setFilterModalOpen(false);
                      }}
                      className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[12px] font-bold rounded-[10px] hover:bg-slate-50 dark:hover:bg-white/[0.06]"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterModalOpen(false)}
                      className="px-5 py-2 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[12px] font-bold rounded-[10px] shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Widget: Chat with Arella */}
          <div className="fixed bottom-8 right-8 z-30">
            <Link
              href="/chat"
              className="bg-white dark:bg-[#111111] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-5 py-3 rounded-full text-[13px] font-bold flex items-center gap-2.5 transition-all hover:shadow-lg relative group"
            >
              <span>Chat with Arella</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1px] flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white dark:bg-[#111111] rounded-full flex items-center justify-center">
                  <Globe size={12} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white dark:bg-[#111111] border-r border-b border-slate-200 dark:border-white/10 rotate-45"></div>
            </Link>
          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
