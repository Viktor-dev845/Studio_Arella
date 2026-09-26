'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

const F = 'var(--font-dm-sans)';

const KPIS = [
  { title: "Total Creatives", count: 7, sub: "Video & Image asset", bg: "bg-[#FBFFF0]" },
  { title: "Live Ads", count: 3, bg: "bg-[#FFFAEA]" },
  { title: "In Review", count: 3, bg: "bg-[#FBFFF0]" },
  { title: "Verified Screenplay", count: 2, bg: "bg-[#FFFAEA]" }
];

const ADS_ROW1 = [
  { title: "So clean Advert", subtitle: "Ends in 2hrs", status: "Live", statusColor: "text-[#88D437]" },
  { title: "Monnify advert", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Viva Advert", subtitle: "Ended", status: "Re-book slot", statusColor: "text-[#37BFD4]" },
  { title: "Bemsoft", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Bemsfarm", subtitle: "Ends in 2hrs", status: "Live", statusColor: "text-[#88D437]" },
];

const ADS_ROW2 = [
  { title: "So clean Advert", subtitle: "Ends in 2hrs", status: "Live", statusColor: "text-[#88D437]" },
  { title: "Monnify advert", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Viva Advert", subtitle: "Ended", status: "Re-book slot", statusColor: "text-[#37BFD4]" },
  { title: "Bemsoft", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Bemsfarm", subtitle: "Ends in 2hrs", status: "Live", statusColor: "text-[#88D437]" },
];

const ADS_ROW3 = [
  { title: "So clean Advert", subtitle: "Ends in 2hrs", status: "Live", statusColor: "text-[#88D437]" },
  { title: "Monnify advert", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Viva Advert", subtitle: "Ended", status: "Re-book slot", statusColor: "text-[#37BFD4]" },
  { title: "Bemsoft", subtitle: "Goes Live in 24hrs", status: "In review", statusColor: "text-[#D4AF37]" },
  { title: "Bemsfarm", subtitle: "Ends in 2hrs", status: "Active", statusColor: "text-[#88D437]" },
];

const ALL_ADS = [...ADS_ROW1, ...ADS_ROW2, ...ADS_ROW3];

export default function AdsPage() {
  return (
    <DashboardLayout>
      <div className="flex h-full w-full bg-[#FFFFFF]" style={{ fontFamily: F }}>
        {/* Left Column (Main Content) */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto pt-[32px]">
          
          {/* KPI Row */}
          <div className="flex gap-[28px] px-8 mb-12">
            {KPIS.map((kpi, idx) => (
              <div key={idx} className={`flex-1 min-w-[200px] h-[112px] rounded-[20px] p-[24px] flex flex-col justify-center ${kpi.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[24px] font-semibold text-[#1C1C1C] leading-[36px]">{kpi.count}</span>
                  {kpi.sub && (
                    <span className="text-[12px] text-black leading-[16px] max-w-[50px]">{kpi.sub}</span>
                  )}
                </div>
                <p className="text-[14px] text-black leading-[20px]">{kpi.title}</p>
              </div>
            ))}
          </div>

          {/* Actions Row */}
          <div className="flex justify-between items-center px-8 mb-6">
            <h2 className="text-[18px] font-bold text-black">My Ads</h2>
            <div className="flex items-center gap-4">
              <button className="h-[40px] px-4 flex items-center gap-2 border border-[rgba(162,161,168,0.2)] rounded-[8px] text-[14px] text-[#16151C] hover:bg-slate-50 transition-colors font-medium">
                <Settings2 size={16} strokeWidth={1.5} />
                Filter
              </button>
              <button className="h-[40px] px-6 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-medium rounded-[6px] text-[14px] transition-colors opacity-90">
                Book Ad Slot
              </button>
            </div>
          </div>

          {/* Ads Grid */}
          <div className="px-8 pb-12">
            <div className="flex flex-wrap gap-[28px]">
              {ALL_ADS.map((ad, idx) => (
                <div key={idx} className="flex flex-col w-[154px]">
                  <div className="w-[154px] h-[154px] bg-slate-100 rounded-[6px] mb-3 overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/ad${idx}/300/300`} alt={ad.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.background = '#F1F3F4'; }} />
                  </div>
                  <h3 className="text-[16px] text-[#000000] font-normal leading-[20px] mb-1 truncate">{ad.title}</h3>
                  <p className="text-[14px] text-black/40 leading-[20px] mb-1 truncate">{ad.subtitle}</p>
                  <span className={`text-[14px] ${ad.statusColor} leading-[20px]`}>{ad.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] shrink-0 border-l border-[rgba(0,0,0,0.1)] pt-2 pb-6 px-4 relative flex flex-col bg-[#FFFFFF] hidden xl:flex overflow-x-hidden">
          
          {/* Request Creative Service Button */}
          <button className="w-full h-[37px] bg-[#F5F1E8] hover:bg-[#ebe5d5] rounded-[6px] flex items-center justify-center text-[16px] font-medium text-[#121212] mb-4 mt-[7px] transition-colors">
            Request creative service
          </button>

          {/* Promo Banner */}
          <div className="w-full h-[181px] bg-[#524007] rounded-[15px] p-[16px] relative overflow-hidden mb-6">
            <p className="text-[#FFFFFF] text-[12.5px] leading-[16px] w-[184px] z-10 relative">
              You got a billboard discount on your next billboard Ad patronage
            </p>
            <p className="text-[#D5E0ED] text-[7.5px] leading-[11px] font-medium w-[121px] mt-[14px] z-10 relative">
              Get 10% off in our Ad rate in your next Ad patronage when you book a slot for 1week and above
            </p>
            <button className="bg-[#FBFF79] shadow-[0_0_7px_rgba(251,255,121,0.32)] rounded-[6px] px-[17px] py-[8px] mt-[16px] text-[#051235] text-[9.5px] font-semibold uppercase tracking-wide z-10 relative inline-block">
              Book Ad space
            </button>
            
            {/* Tilted graphic mockup */}
            <div className="absolute -right-2 top-[55%] -translate-y-1/2 w-[84px] h-[105px] bg-white/70 backdrop-blur-md border-[1.5px] border-white rounded-[9px] transform rotate-[12deg] shadow-[-10px_10px_47px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col z-0">
              <div className="w-full h-[30px] bg-slate-900 border-b border-white flex items-center justify-center">
                <div className="w-1/2 h-[10px] bg-red-500 rounded"></div>
              </div>
              <div className="p-2 flex flex-col gap-1.5 flex-1 bg-gradient-to-b from-white to-slate-200">
                <div className="w-full h-1.5 bg-slate-400 rounded-sm"></div>
                <div className="w-4/5 h-1.5 bg-slate-300 rounded-sm"></div>
                <div className="w-3/5 h-1.5 bg-slate-300 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div>
            <h3 className="text-[14px] font-medium text-black mb-[18px]">Recent Ad Booking Calendar</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[#7D7D7D] text-[14px]">Aug 15, Sat</span>
                <span className="bg-[#2B2E48] text-white text-[10px] font-medium px-[7px] py-[3px] rounded-full">TODAY</span>
              </div>
              <div className="flex gap-1.5">
                <button className="w-6 h-6 rounded border border-[#DCDCDD] flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <ChevronLeft size={14} className="text-[#7D7D7D]" />
                </button>
                <button className="w-6 h-6 rounded border border-[#DCDCDD] flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <ChevronRight size={14} className="text-[#7D7D7D]" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              {/* Viva Ad */}
              <div className="relative border border-[#DCDCDD] rounded-[4px] py-[10px] px-[15px] overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#50C099]"></div>
                <p className="text-[14px] text-black mb-1 leading-[20px]">Viva Ad</p>
                <p className="text-[12px] text-black/40 leading-[16px]">16:00</p>
              </div>
              {/* Bemsfarm Ad */}
              <div className="relative border border-[#DCDCDD] rounded-[4px] py-[10px] px-[15px] overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FFC565]"></div>
                <p className="text-[14px] text-black mb-1 leading-[20px]">Bemsfarm Ad</p>
                <p className="text-[12px] text-black/40 leading-[16px]">14:00</p>
              </div>
              {/* Bemsoft Ad */}
              <div className="relative border border-[#DCDCDD] rounded-[4px] py-[10px] px-[15px] overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#5DAAEE]"></div>
                <p className="text-[14px] text-black mb-1 leading-[20px]">Bemsoft Ad</p>
                <p className="text-[12px] text-black/40 leading-[16px]">13:00</p>
              </div>
            </div>

            <button className="mt-6 w-full text-center text-[#D6A028] text-[14px] flex items-center justify-center gap-1 hover:opacity-80 transition-opacity">
              See full calendar <ChevronRight size={14} />
            </button>
          </div>

          {/* Floating Chat Widget */}
          <Link href="/chat" className="absolute bottom-[30px] right-[24px] z-50">
            <div className="bg-white rounded-full py-[14px] px-[20px] shadow-[0_0_168px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 relative cursor-pointer hover:-translate-y-1 transition-transform border border-slate-100">
              <span className="text-[#1A1A1A] font-semibold text-[18px]">Chat with Arella</span>
              <div className="w-[27px] h-[27px] rounded-full bg-gradient-to-tr from-[#CA94EB] to-[#25DDDC] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[url('/images/Asset_3.png')] bg-cover opacity-80" />
                <div className="w-[18px] h-[18px] bg-white/20 rounded-full blur-[1px] absolute top-1 right-1"></div>
              </div>
              {/* Speech tail */}
              <div className="absolute -bottom-[6px] left-[50px] w-4 h-4 bg-white transform rotate-45 border-r border-b border-slate-100"></div>
            </div>
          </Link>
          
        </div>
      </div>
    </DashboardLayout>
  );
}

