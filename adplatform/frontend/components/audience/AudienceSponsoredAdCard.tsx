'use client';

import React from 'react';
import Link from 'next/link';
import { Tv, Sparkles, ArrowUpRight, Megaphone, ShieldCheck } from 'lucide-react';
import { XVerifiedBadge } from './AudienceRightSidebar';

interface AudienceSponsoredAdCardProps {
  variant?: 'dooh' | 'creator_boost';
}

export default function AudienceSponsoredAdCard({ variant = 'dooh' }: AudienceSponsoredAdCardProps) {
  return (
    <article className="w-full bg-gradient-to-br from-neutral-900 via-[#181a20] to-[#121318] text-white rounded-[16px] p-6 shadow-sm border border-neutral-800 relative overflow-hidden font-quicksand">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Brand + Promoted Tag */}
      <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
            <Tv size={18} className="text-[#D4AF37]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] text-white tracking-wide">
                Studio Arella Media Network
              </span>
              <XVerifiedBadge size={16} />
            </div>
            <span className="text-[12px] text-gray-400 font-medium">
              @studioarella • Official DOOH Partner
            </span>
          </div>
        </div>

        {/* Promoted Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300 tracking-wider uppercase">
          <Megaphone size={12} />
          <span>Promoted</span>
        </div>
      </div>

      {/* Ad Content */}
      <div className="flex flex-col gap-3 relative z-10">
        <h3 className="text-[17px] sm:text-[18px] font-bold text-white leading-snug">
          Broadcast Your Content Across 120+ Digital Billboards in Lagos, Abuja & Port Harcourt
        </h3>
        
        <p className="text-[13.5px] text-gray-300 leading-relaxed font-normal">
          Amplify your podcast snippets, music drops, and brand messaging onto prime outdoor LED screens. 
          Gain over <strong className="text-white">2.5M+ verified impressions</strong> weekly with automated proof-of-play certification.
        </p>

        {/* Visual Banner Preview */}
        <div className="w-full h-[140px] sm:h-[160px] rounded-xl overflow-hidden relative border border-white/10 bg-neutral-950 mt-1">
          <img
            src="/audience/covers/media.jpg"
            alt="Studio Arella DOOH Billboards"
            className="w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3.5">
            <div className="flex items-center justify-between w-full">
              <span className="text-[12px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live DOOH Screen Slots Available Now
              </span>
              <span className="text-[11px] text-amber-300 font-semibold bg-black/60 px-2 py-0.5 rounded">
                From ₦25,000 / week
              </span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Audited broadcast certification</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/screens"
              className="px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#c29e2c] text-black text-[12.5px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Explore Screens</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
