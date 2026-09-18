'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight, 
  Trash2, Eye, Play, Pause, X, Calendar, Check, Globe, Download 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

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
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter a campaign name', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/campaigns', {
        name,
        budget: parseFloat(budget.replace(/,/g, '')) || 0,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      setCampaigns(prev => [mapCampaign(res.data), ...prev]);
      toast('Campaign created successfully!', 'success');
      setCreateModalOpen(false);
      setName('');
      setBudget('');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not create campaign. Please try again.', 'error');
    } finally {
      setSaving(false);
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
                  onClick={() => setCreateModalOpen(true)}
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

          {/* ─── CREATE CAMPAIGN MODAL ─── */}
          {createModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[460px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-7 pt-6 pb-2">
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-50">Create New Campaign</h3>
                  <button 
                    onClick={() => setCreateModalOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="px-7 pb-7 pt-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">Campaign Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 Independence Day Special"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">Budget (NGN) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[13px] font-semibold text-slate-900 dark:text-slate-50 focus:outline-none focus:border-[#C69A2C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C69A2C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[12px] text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#C69A2C]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-5 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[13px] font-bold rounded-[10px] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[10px] transition-all shadow-sm disabled:opacity-50"
                    >
                      {saving ? 'Creating...' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
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
