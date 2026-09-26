'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const F = 'var(--font-dm-sans)';

export default function AdDetailsPage() {
  const router = useRouter();

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
                className="flex items-center gap-1 text-[#000000] text-[14px] font-medium"
              >
                <ChevronLeft size={18} strokeWidth={2} />
                <span>Back</span>
              </button>
              <h1 className="text-[14px] font-bold text-[#000000] leading-[32px]">My Ads</h1>
            </div>
            
            <button className="w-[139px] h-[40px] bg-[#D4AF37] rounded-[6px] text-[rgba(0,0,0,0.8)] text-[14px] font-medium flex items-center justify-center hover:bg-[#c9a32c] transition-colors">
              Extend Slot
            </button>
          </div>

          {/* Main Hero Image */}
          <div 
            className="w-full h-[434px] rounded-[20px] bg-cover bg-center border-[1px] border-[rgba(0,0,0,0.05)] mb-[30px]"
            style={{ backgroundImage: `url('https://picsum.photos/seed/ad-hero/1200/600')` }}
          />

          {/* Ad Info */}
          <div className="flex flex-col items-center gap-[12px] mb-[60px]">
            <h2 className="text-[25px] font-bold text-[#000000] leading-[24px]">So clean Advert</h2>
            <p className="text-[18px] text-[rgba(0,0,0,0.4)] leading-[20px]">Ends in 2hrs</p>
            <div className="bg-[rgba(152,255,197,0.5)] rounded-[40px] px-[14px] py-[4px] flex items-center justify-center mt-2">
              <span className="text-[#07BC56] text-[12px] font-semibold leading-[16px]">Active</span>
            </div>
          </div>
          
          {/* Creative Materials Section */}
          <div className="flex flex-col w-full">
            <h3 className="text-[14px] font-bold text-[#000000] mb-[24px]">Your Ad creative materials</h3>
            
            <div className="flex flex-row items-center gap-[24px] overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col gap-[12px] min-w-[154px]">
                  <div 
                    className="w-[154px] h-[154px] rounded-[6px] bg-cover bg-center border border-[rgba(0,0,0,0.05)]"
                    style={{ backgroundImage: `url('https://picsum.photos/seed/ad-mat-${item}/300/300')` }}
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
