'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const F = 'var(--font-dm-sans)';

const MOCK_CAMPAIGN = {
  title: "Podcast sponsorship wave",
  subtitle: "4,000 impressions",
  status: "Active",
  statusBg: "bg-[rgba(152,255,197,0.5)]",
  statusColor: "text-[#07BC56]",
};

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = parseInt(idStr || '1');
  
  const campaign = MOCK_CAMPAIGN;

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
    </DashboardLayout>
  );
}
