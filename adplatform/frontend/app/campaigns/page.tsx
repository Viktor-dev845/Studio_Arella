'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight, 
  Trash2, Eye, Play, Pause, X, Calendar, Check, Globe, Download 
} from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
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
  budget: string;
  spent: string;
  impressions: string;
  status: 'Active' | 'Pending' | 'Ended' | 'Draft';
  adsCount: number;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  { id: '1', name: 'Summer Solstice Launch', schedule: '16-08-2026 12PM', budget: '1,200,000', spent: '650,000', impressions: '450,000', status: 'Active', adsCount: 4 },
  { id: '2', name: 'Bemsoft Bulletin Highway Promo', schedule: '16-08-2026 12PM', budget: '800,000', spent: '800,000', impressions: '620,000', status: 'Ended', adsCount: 2 },
  { id: '3', name: 'Lekki Toll Gate Digital Blitz', schedule: '20-08-2026 09AM', budget: '2,500,000', spent: '1,100,000', impressions: '1,250,000', status: 'Active', adsCount: 6 },
  { id: '4', name: 'Podcast Sponsorship Waves', schedule: '22-08-2026 02PM', budget: '450,000', spent: '0', impressions: '0', status: 'Pending', adsCount: 1 },
  { id: '5', name: 'Ikeja City Mall Weekend Ad', schedule: '25-08-2026 10AM', budget: '350,000', spent: '0', impressions: '0', status: 'Draft', adsCount: 0 },
  { id: '6', name: 'Victoria Island LED Takeover', schedule: '28-08-2026 06PM', budget: '1,800,000', spent: '720,000', impressions: '890,000', status: 'Active', adsCount: 3 },
  { id: '7', name: 'National Youth Creator Fest', schedule: '02-09-2026 12PM', budget: '900,000', spent: '0', impressions: '0', status: 'Pending', adsCount: 2 },
  { id: '8', name: 'Q3 Product Spotlight', schedule: '05-09-2026 08AM', budget: '600,000', spent: '600,000', impressions: '540,000', status: 'Ended', adsCount: 2 },
  { id: '9', name: 'Studio Arella Audio Bumper', schedule: '10-09-2026 11AM', budget: '300,000', spent: '150,000', impressions: '180,000', status: 'Active', adsCount: 1 },
  { id: '10', name: 'Holiday Early Birds', schedule: '15-09-2026 01PM', budget: '1,500,000', spent: '0', impressions: '0', status: 'Draft', adsCount: 0 },
];

export default function CampaignsPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
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

  // Try fetching dynamic campaigns if backend available
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/campaigns');
        if (res.data?.campaigns?.length > 0) {
          const apiItems = res.data.campaigns.map((c: any, i: number) => ({
            id: c.id || String(i + 1),
            name: c.name || 'Untitled Campaign',
            schedule: c.start_date ? `${c.start_date} 12PM` : '16-08-2026 12PM',
            budget: Number(c.budget || 0).toLocaleString(),
            spent: Number(c.spent || 0).toLocaleString(),
            impressions: Number(c.impressions || 0).toLocaleString(),
            status: (c.status || 'Active') as CampaignItem['status'],
            adsCount: c.ad_count || 1,
          }));
          setCampaigns(apiItems);
        }
      } catch {
        // Keep initial mock campaigns
      }
    })();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter a campaign name', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/campaigns', {
        name,
        budget: parseFloat(budget.replace(/,/g, '')) || 0,
        start_date: startDate,
        end_date: endDate,
      });
      toast('Campaign created successfully!', 'success');
    } catch {
      toast('Campaign created locally', 'success');
    } finally {
      const newCamp: CampaignItem = {
        id: String(Date.now()),
        name,
        schedule: startDate ? `${startDate} 12PM` : '16-08-2026 12PM',
        budget: Number(budget || 0).toLocaleString(),
        spent: '0',
        impressions: '0',
        status: 'Active',
        adsCount: 0,
      };
      setCampaigns([newCamp, ...campaigns]);
      setCreateModalOpen(false);
      setName('');
      setBudget('');
      setStartDate('');
      setEndDate('');
      setSaving(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast('Campaign deleted', 'info');
  };

  const filtered = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: CampaignItem['status']) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
      case 'Pending':
        return 'text-amber-700 bg-amber-50 border-amber-200/60';
      case 'Ended':
        return 'text-purple-700 bg-purple-50 border-purple-200/60';
      case 'Draft':
        return 'text-blue-700 bg-blue-50 border-blue-200/60';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F }} className="max-w-[1360px] mx-auto p-6 sm:p-10 flex flex-col gap-8 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Campaigns</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">Manage your advertising campaigns, budgets, and impressions</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <span>Today</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Campaigns', value: String(campaigns.length), trend: '+8.4%', up: true },
              { label: 'Total Budget (NGN)', value: '₦4,500,000', trend: '+12.0%', up: true },
              { label: 'Total Spent (NGN)', value: '₦2,180,500', trend: '-2.1%', up: false },
              { label: 'Total Impressions', value: '1.8M', trend: '+15.2%', up: true },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-white rounded-[18px] p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              >
                <p className="text-[12.5px] font-bold text-slate-500 mb-3">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-[24px] font-black text-slate-900 leading-none">{stat.value}</span>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {stat.trend} {stat.up ? <FaArrowTrendUp size={9} /> : <FaArrowTrendDown size={9} />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Main Card: Toolbar + Table */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
              <h2 className="text-[17px] font-bold text-slate-900">All Campaigns</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search campaign name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[12.5px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C69A2C] transition-colors"
                  />
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-[10px] text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-slate-500" />
                  <span>Filter</span>
                </button>

                {/* Export Button */}
                <button
                  onClick={() => toast('Exporting campaigns CSV...', 'info')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-[10px] text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Download size={14} className="text-slate-500" />
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
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Campaign Info</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Budget (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Spent (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Impressions</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400 text-[13px]">
                        No campaigns found matching your query
                      </td>
                    </tr>
                  ) : (
                    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-bold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{c.adsCount} ad slots active</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600">
                          {c.schedule}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-slate-800">
                          {c.budget}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600">
                          {c.spent}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-semibold text-slate-700">
                          {c.impressions}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => toast(`Viewing campaign: ${c.name}`, 'info')}
                              className="text-[12px] font-bold text-[#C69A2C] hover:underline"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-[12px] text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold focus:outline-none focus:border-[#C69A2C]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div>
                Showing 1 to {Math.min(pageSize, filtered.length)} out of {filtered.length} records
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  &lt;
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#C69A2C] text-white font-bold text-[12px] shadow-sm">
                  1
                </button>
                <button 
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={filtered.length <= pageSize}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

          {/* ─── CREATE CAMPAIGN MODAL ─── */}
          {createModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
              <div className="bg-white rounded-[24px] w-full max-w-[460px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-7 pt-6 pb-2">
                  <h3 className="text-[16px] font-bold text-slate-900">Create New Campaign</h3>
                  <button 
                    onClick={() => setCreateModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCampaign} className="px-7 pb-7 pt-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Campaign Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Q4 Independence Day Special"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-[#C69A2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Budget (NGN) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-[#C69A2C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[12px] text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-[#C69A2C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[12px] text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-[#C69A2C]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-bold rounded-[10px] transition-colors"
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
              <div className="bg-white rounded-[24px] w-full max-w-[380px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <h3 className="text-[15px] font-bold text-slate-900">Filter Campaigns</h3>
                  <button 
                    onClick={() => setFilterModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
                  <p className="text-[12px] font-bold text-slate-600">Select Status</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['All', 'Active', 'Pending', 'Ended', 'Draft'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`py-2 px-3 rounded-[10px] text-[12px] font-bold border transition-colors ${
                          statusFilter === st 
                            ? 'border-[#C69A2C] bg-[#C69A2C]/10 text-[#C69A2C]' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {st}
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
                      className="px-4 py-2 border border-slate-200 text-slate-700 text-[12px] font-bold rounded-[10px] hover:bg-slate-50"
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
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-5 py-3 rounded-full text-[13px] font-bold flex items-center gap-2.5 transition-all hover:shadow-lg relative group"
            >
              <span>Chat with Arella</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1px] flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Globe size={12} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-slate-200/90 rotate-45"></div>
            </Link>
          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
