'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, Check, Megaphone, Loader2, Calendar, DollarSign, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { usePreferencesStore } from '@/store/preferencesStore';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

const F = 'var(--font-dm-sans)';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api').replace('/api', '');

function fullUrl(url: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { toast } = useToast();
  const { currency, rates } = usePreferencesStore();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [modalState, setModalState] = useState<'none' | 'confirm' | 'success'>('none');
  const [linkedBookings, setLinkedBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!idStr) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.get(`/campaigns/${idStr}`),
      api.get('/bookings?limit=100').catch(() => ({ data: { bookings: [] } }))
    ])
      .then(([campRes, bookRes]) => {
        if (!isMounted) return;
        setCampaign(campRes.data);
        const books = (bookRes.data.bookings || []).filter((b: any) => b.campaign_id === idStr);
        setLinkedBookings(books);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load campaign:', err);
        setCampaign(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [idStr]);

  const handleCancel = async () => {
    if (!campaign?.id) return;
    setCancelling(true);
    try {
      await api.delete(`/campaigns/${campaign.id}`);
      setCampaign((prev: any) => prev ? { ...prev, status: 'ended' } : null);
      setModalState('success');
      toast('Campaign has been cancelled successfully', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not cancel campaign', 'error');
      setModalState('none');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" style={{ fontFamily: F }}>
          <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
          <p className="text-gray-500 text-[14px]">Loading campaign details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ fontFamily: F }}>
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
            <Megaphone size={30} className="text-[#D4AF37]" />
          </div>
          <h2 className="text-[20px] font-bold text-gray-900">Campaign Not Found</h2>
          <p className="text-gray-500 text-[14px]">The requested campaign could not be located or may have been deleted.</p>
          <Link
            href="/campaigns"
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-semibold text-[14px] rounded-[8px] text-decoration-none transition-colors"
          >
            ← Back to Campaigns
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isEnded = campaign.status === 'ended';
  const isDraft = campaign.status === 'draft';
  const isActive = campaign.status === 'active';

  const statusBg = isActive ? 'bg-[rgba(152,255,197,0.5)]' : isEnded ? 'bg-[rgba(251,189,178,0.5)]' : 'bg-[rgba(255,240,190,0.5)]';
  const statusColor = isActive ? 'text-[#07BC56]' : isEnded ? 'text-[#D44F37]' : 'text-[#D4AF37]';
  const statusLabel = isActive ? 'Active' : isEnded ? 'Ended' : isDraft ? 'Draft' : 'Pending';

  const scheduleLabel = campaign.start_date && campaign.end_date
    ? `${new Date(campaign.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(campaign.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Ongoing Campaign';

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full bg-[#FFFFFF] overflow-y-auto pt-[40px] pb-[60px]" style={{ fontFamily: F }}>
        
        {/* Main Content Column */}
        <div className="w-full max-w-[952px] mx-auto flex flex-col px-4">
          
          {/* Header Row */}
          <div className="flex items-center justify-between w-full mb-[30px]">
            <div className="flex items-center gap-[37px]">
              <button 
                onClick={() => router.push('/campaigns')}
                className="flex items-center gap-1 text-[#000000] text-[14px] font-medium hover:opacity-70 transition-opacity cursor-pointer"
              >
                <ChevronLeft size={18} strokeWidth={2} />
                <span>Back</span>
              </button>
              <h1 className="text-[16px] font-bold text-[#000000] leading-[32px]">Campaign Overview</h1>
            </div>
          </div>

          {/* Branded Campaign Banner */}
          <div 
            className="w-full h-[280px] sm:h-[340px] rounded-[20px] relative overflow-hidden mb-[30px] flex flex-col justify-end p-8"
            style={{
              background: 'linear-gradient(135deg, #101828 0%, #1E293B 50%, #2D1537 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}
          >
            <div className="absolute top-6 right-6">
              <div className={`${statusBg} rounded-[40px] px-[16px] py-[6px] flex items-center justify-center backdrop-blur-md`}>
                <span className={`${statusColor} text-[13px] font-bold`}>{statusLabel}</span>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[#D4AF37] text-[13px] font-bold uppercase tracking-wider mb-2">
                STUDIO ARELLA CAMPAIGN
              </p>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-white mb-2 leading-tight">
                {campaign.name}
              </h2>
              <p className="text-white/70 text-[14px] max-w-[600px] m-0">
                {campaign.description || 'Digital billboard and creator broadcast activation.'}
              </p>
            </div>
          </div>

          {/* Campaign Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-[40px]">
            <div className="bg-gray-50 border border-gray-100 rounded-[14px] p-4 text-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Total Budget</p>
              <p className="text-[18px] font-bold text-gray-900 m-0">
                {formatCurrency(Number(campaign.budget) || 0, currency, rates)}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-[14px] p-4 text-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Total Spent</p>
              <p className="text-[18px] font-bold text-gray-900 m-0">
                {formatCurrency(Number(campaign.spent) || 0, currency, rates)}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-[14px] p-4 text-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Impressions</p>
              <p className="text-[18px] font-bold text-gray-900 m-0">
                {(Number(campaign.impressions) || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-[14px] p-4 text-center">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Schedule</p>
              <p className="text-[12px] font-semibold text-gray-700 m-0 truncate">
                {scheduleLabel}
              </p>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-[50px]">
            {!isEnded && (
              <Link 
                href={`/book?campaign_id=${campaign.id}`}
                className="px-8 h-[44px] bg-[#D4AF37] hover:bg-[#c9a32c] rounded-[8px] text-[#111111] text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm text-decoration-none"
              >
                + Book Billboard Slot for this Campaign
              </Link>
            )}
            {!isEnded ? (
              <button 
                onClick={() => setModalState('confirm')}
                className="px-6 h-[44px] border border-gray-300 hover:bg-gray-100 rounded-[8px] text-gray-700 text-[14px] font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel Campaign
              </button>
            ) : (
              <Link 
                href="/campaigns"
                className="px-8 h-[44px] bg-[#101828] hover:bg-[#1a2538] rounded-[8px] text-white text-[14px] font-bold flex items-center justify-center transition-colors text-decoration-none"
              >
                Re-book New Campaign
              </Link>
            )}
          </div>
          
          {/* Creative Materials Section */}
          <div className="flex flex-col w-full">
            <h3 className="text-[16px] font-bold text-[#000000] mb-[20px]">Campaign Materials & Ads</h3>
            
            {linkedBookings.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-[16px] p-8 text-center flex flex-col items-center justify-center">
                <ImageIcon size={32} className="text-gray-300 mb-2" />
                <p className="text-[14px] font-semibold text-gray-800 mb-1">No ad slots booked against this campaign yet</p>
                <p className="text-[12px] text-gray-500 max-w-[400px] mb-4">
                  You can reserve prime digital billboard screens using your campaign budget.
                </p>
                <Link
                  href="/bookings?tab=screen"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c9a32c] text-black font-bold text-[13px] rounded-[6px] text-decoration-none transition-colors"
                >
                  + Book Ad Slot
                </Link>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-[24px] overflow-x-auto pb-4">
                {linkedBookings.map((b) => (
                  <Link href={`/my-ads/${b.id}`} key={b.id} className="flex flex-col gap-[10px] min-w-[160px] text-decoration-none">
                    <div className="w-[160px] h-[160px] rounded-[8px] bg-slate-100 border border-gray-100 overflow-hidden relative flex items-center justify-center">
                      {b.creative_url ? (
                        <img src={fullUrl(b.creative_url) || ''} alt={b.creative_title || 'Ad'} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={28} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-[13px] text-[#000000] font-semibold truncate">{b.creative_title || 'Screen Ad'}</span>
                    <span className="text-[11px] text-gray-500 font-mono">{b.booking_number}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalState !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            {modalState === 'confirm' && (
              <motion.div 
                key="confirm"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-[400px] bg-[#FFFFFF] rounded-[20px] shadow-2xl p-6"
                style={{ fontFamily: F }}
              >
                <h3 className="text-[#16151C] text-[18px] font-bold text-center mb-3">
                  Cancel Campaign?
                </h3>
                <p className="text-gray-600 text-[13px] leading-relaxed text-center mb-6">
                  Are you sure you want to cancel <strong>{campaign.name}</strong>? Please review Studio Arella terms & conditions regarding cancellations.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setModalState('none')}
                    className="flex-1 h-[44px] border border-gray-200 rounded-[8px] flex items-center justify-center text-gray-700 text-[14px] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Keep Campaign
                  </button>
                  <button 
                    disabled={cancelling}
                    onClick={handleCancel}
                    className="flex-1 h-[44px] bg-[#D4AF37] rounded-[8px] flex items-center justify-center text-black text-[14px] font-bold hover:bg-[#c9a32c] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            )}

            {modalState === 'success' && (
              <motion.div 
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-[400px] bg-[#FFFFFF] rounded-[20px] shadow-2xl p-6 text-center"
                style={{ fontFamily: F }}
              >
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">Campaign Cancelled</h3>
                <p className="text-[13px] text-gray-600 mb-6">Your campaign has been successfully cancelled and its status updated to ended.</p>
                <button
                  onClick={() => {
                    setModalState('none');
                    router.push('/campaigns');
                  }}
                  className="w-full h-[44px] bg-[#101828] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#1a2538] transition-colors cursor-pointer"
                >
                  Back to Campaigns
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
