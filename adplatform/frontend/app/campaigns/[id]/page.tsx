'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, Check } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const F = 'var(--font-dm-sans)';

const MOCK_CAMPAIGNS = {
  active: {
    title: "Podcast sponsorship wave",
    subtitle: "4,000 impressions",
    status: "Active",
    statusBg: "bg-[rgba(152,255,197,0.5)]",
    statusColor: "text-[#07BC56]",
    actionButton: null,
  },
  pending: {
    title: "Podcast sponsorship wave",
    subtitle: "4,000 impressions",
    status: "Pending",
    statusBg: "bg-[rgba(255,240,190,0.5)]",
    statusColor: "text-[#D4AF37]",
    actionButton: "Cancel",
    buttonWidth: "w-[116px]",
  },
  ended: {
    title: "Podcast sponsorship wave",
    subtitle: "4,000 impressions",
    status: "Ended",
    statusBg: "bg-[rgba(251,189,178,0.5)]",
    statusColor: "text-[#D44F37]",
    actionButton: "Restart Campaign",
    buttonWidth: "w-[143px]",
  }
};

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = parseInt(idStr || '1');
  
  const [modalState, setModalState] = useState<'none' | 'confirm' | 'success'>('none');
  
  // For demonstration: map IDs to different states.
  const campaign = id % 3 === 0 ? MOCK_CAMPAIGNS.ended : (id % 2 === 0 ? MOCK_CAMPAIGNS.pending : MOCK_CAMPAIGNS.active);

  const handleAction = () => {
    if (campaign.actionButton === 'Cancel') {
      setModalState('confirm');
    } else if (campaign.actionButton === 'Restart Campaign') {
      // Just an example redirect back for now
      router.push('/campaigns');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full bg-[#FFFFFF] overflow-y-auto pt-[40px] pb-[60px]" style={{ fontFamily: F }}>
        
        {/* Main Content Column - 952px Wide */}
        <div className="w-full max-w-[952px] mx-auto flex flex-col">
          
          {/* Header Row */}
          <div className="flex items-center justify-between w-full mb-[30px]">
            <div className="flex items-center gap-[37px]">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-1 text-[#000000] text-[14px] font-medium hover:opacity-70 transition-opacity"
              >
                <ChevronLeft size={18} strokeWidth={2} />
                <span>Back</span>
              </button>
              <h1 className="text-[14px] font-bold text-[#000000] leading-[32px]">Campaign</h1>
            </div>
          </div>

          {/* Main Hero Image */}
          <div 
            className="w-full h-[434px] rounded-[20px] bg-cover bg-center border-[1px] border-[rgba(0,0,0,0.05)] mb-[30px]"
            style={{ backgroundImage: `url('https://picsum.photos/seed/camp-hero-${id}/1200/600')` }}
          />

          {/* Campaign Info */}
          <div className="flex flex-col items-center gap-[12px] mb-[60px]">
            <h2 className="text-[25px] font-bold text-[#000000] leading-[24px] tracking-tight">{campaign.title}</h2>
            <p className="text-[18px] text-[rgba(0,0,0,0.4)] leading-[20px]">{campaign.subtitle}</p>
            <div className={`${campaign.statusBg} rounded-[40px] px-[14px] py-[4px] flex items-center justify-center mt-2`}>
              <span className={`${campaign.statusColor} text-[12px] font-semibold leading-[16px]`}>{campaign.status}</span>
            </div>
            {campaign.actionButton && (
              <button 
                onClick={handleAction}
                className={`${campaign.buttonWidth} h-[40px] mt-[10px] bg-[#D4AF37] rounded-[6px] text-[rgba(0,0,0,0.8)] text-[14px] font-medium flex items-center justify-center hover:bg-[#c9a32c] transition-colors`}
              >
                {campaign.actionButton}
              </button>
            )}
          </div>
          
          {/* Creative Materials Section */}
          <div className="flex flex-col w-full">
            <h3 className="text-[14px] font-bold text-[#000000] mb-[24px]">Your campaign materials</h3>
            
            <div className="flex flex-row items-center gap-[24px] overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col gap-[12px] min-w-[154px]">
                  <div 
                    className="w-[154px] h-[154px] rounded-[6px] bg-cover bg-center border border-[rgba(0,0,0,0.05)]"
                    style={{ backgroundImage: `url('https://picsum.photos/seed/camp-mat-${id}-${item}/300/300')` }}
                  />
                  <span className="text-[14px] text-[#000000] font-medium">Banner graphics</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalState !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px]"
          >
            {modalState === 'confirm' && (
              <motion.div 
                key="confirm"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-[383px] h-[320px] bg-[#FFFFFF] rounded-[20px] shadow-lg"
                style={{ fontFamily: F }}
              >
                {/* Text Content */}
                <div className="absolute top-[40px] left-[20px] w-[343px]">
                  <p className="text-[#16151C] text-[20px] font-semibold leading-[30px] text-center">
                    Are you sure you want to cancel this campaign? Ad cancelled is non-refundable after 72hrs of booking. Read Studio Arella <span className="text-[#DCA92A]">terms & condition</span>
                  </p>
                </div>

                {/* Buttons */}
                <div className="absolute top-[217px] left-[20px] flex gap-[11px]">
                  <button 
                    onClick={() => setModalState('none')}
                    className="w-[166px] h-[50px] border border-[rgba(162,161,168,0.2)] rounded-[10px] flex items-center justify-center text-[#16151C] text-[16px] font-normal hover:bg-gray-50 transition-colors"
                  >
                    No
                  </button>
                  <button 
                    onClick={() => setModalState('success')}
                    className="w-[166px] h-[50px] bg-[#DCA92A] rounded-[6px] flex items-center justify-center text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors"
                  >
                    Yes
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
                className="relative w-[383px] h-[433px] bg-[#FFFFFF] rounded-[20px] shadow-lg"
                style={{ fontFamily: F }}
              >
                {/* Top Line */}
                <div className="absolute top-[66px] left-[20px] w-[343px] border-t border-[rgba(162,161,168,0.1)]" />

                {/* Success Icon */}
                <div className="absolute top-[94px] left-[156.5px] w-[70px] h-[70px]">
                  <div className="absolute inset-[-36px] bg-gradient-to-br from-[#443A18] to-[#D4AF37] opacity-10 blur-[5px] rounded-full" />
                  <div className="absolute inset-[-20px] bg-gradient-to-br from-[#443A18] to-[#D4AF37] opacity-15 blur-[5px] rounded-full" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#443A18] to-[#D4AF37] rounded-full flex items-center justify-center shadow-md">
                    <Check className="text-white w-8 h-8" strokeWidth={3} />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute top-[224px] w-full text-center">
                  <h3 className="text-[#16151C] text-[20px] font-semibold leading-[30px] px-[20px]">
                    {campaign.title} cancelled
                  </h3>
                </div>

                {/* Finish Button */}
                <button 
                  onClick={() => {
                    setModalState('none');
                    router.push('/campaigns');
                  }}
                  className="absolute top-[307px] left-[108.5px] w-[166px] h-[50px] bg-[#DCA92A] rounded-[6px] text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors flex items-center justify-center"
                >
                  Finish
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
