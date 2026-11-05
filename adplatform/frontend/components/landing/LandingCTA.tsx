'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section id="cta" className="relative w-full bg-[#000000] text-white py-20 lg:py-28 px-5 sm:px-10 lg:px-16 overflow-hidden">
      {/* Subtle plus-grid background pattern from Framer */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url('https://framerusercontent.com/images/luF6GJ4aSqJimJzbnwPzDMkfL4w.png?scale-down-to=2048&width=5760&height=2624')`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          backgroundSize: '1440px auto',
        }}
      />

      {/* Main Container - max-width 1280px */}
      <div className="relative z-10 max-w-[1280px] mx-auto w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 lg:gap-14 min-h-[540px]">
        
        {/* Left Column: Content */}
        <div className="flex-1 w-full lg:max-w-[580px] flex flex-col justify-center space-y-6 lg:space-y-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.15]">
            Ready To Launch Your Ad Or Book Your Podcast
          </h2>

          <p className="text-base sm:text-lg text-white/70 font-normal leading-relaxed">
            Create your account, upload your creative, and go live on the Studio Arella screen today. Or Step into our soundproof studio. High-end mics, multi-cam video, and a dedicated engineer ready for you.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#D3AF37] hover:bg-[#C29F2F] text-black font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 shadow-md"
            >
              <span>Create Advertiser Account</span>
              <span className="text-base leading-none">↗</span>
            </Link>

            <Link
              href="/book-ad"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#2A2B2E] hover:bg-[#38393D] text-white font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 border border-white/10"
            >
              <span>Book Studio Time</span>
              <span className="text-base leading-none">↗</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="flex-1 w-full lg:h-[540px] h-[360px] sm:h-[440px] relative overflow-hidden">
          <img
            src="https://framerusercontent.com/images/nePXEsHyuHXaUEimdv56jQiDxOc.jpeg?scale-down-to=1024&width=1024&height=768"
            alt="Studio Arella Podcast Studio"
            className="w-full h-full object-cover object-center"
          />
        </div>

      </div>
    </section>
  );
}
