'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function LandingHero() {
  return (
    <section id="home" className="relative w-full flex flex-col items-center justify-center pt-[160px] pb-[60px] bg-white overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center gap-[80px]">
        {/* Hero Top Content */}
        <div className="flex flex-col items-center text-center max-w-[744px] mx-auto">
          {/* Social Proof Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6 sm:mb-8"
          >
            {/* Avatar Stack + 80+ badge */}
            <div className="flex items-center">
              <div className="flex items-center -space-x-2">
                <img
                  src="/landing/avatar-1.png"
                  alt="Customer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
                />
                <img
                  src="/landing/avatar-2.png"
                  alt="Customer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
                />
                <img
                  src="/landing/avatar-3.png"
                  alt="Customer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
                />
              </div>
              <span className="ml-1.5 px-2.5 py-0.5 rounded-full bg-[#E97724] text-white text-xs sm:text-[13px] font-bold tracking-tight">
                50+
              </span>
            </div>

            {/* Stars & Customer Joined */}
            <div className="flex flex-col items-start text-left pl-1">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-900 leading-none">
                <span className="text-[#E97724] text-sm tracking-tighter">★★★★★</span>
                <span className="text-[#1F1F1F]">4.5+</span>
              </div>
              <span className="text-[11px] sm:text-xs text-[#5E5F5C] font-normal mt-0.5 leading-none">
                1,000+ Customers billed
              </span>
            </div>
          </motion.div>

          {/* Headline - Exact 3-line statement */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold text-[#000000] tracking-tight leading-[1.2] max-w-full"
          >
            Push Your Ad &amp; <br />
            Podcast Live With <br />
            Ease
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-[#5E5F5C] max-w-2xl leading-relaxed font-normal"
          >
            Advertise your business on Umuahia&apos;s premier digital screen, or record professional audio and video in our premium podcast studio.
          </motion.p>

          {/* Single CTA Button - Exact Framer Primary Button specifications */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-[12px] px-[28px] py-[16px] rounded-[107px] bg-[#D3AF37] hover:bg-[#C29F2F] text-white text-base sm:text-lg font-semibold shadow-sm transition-all duration-200 active:scale-95"
            >
              <span>Get Started Today</span>
              <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Billboard Visual Presentation - Frameless 3D billboard directly on canvas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-12 md:mt-16 max-w-4xl lg:max-w-5xl mx-auto"
        >
          {/* Billboard Image without surrounding card border */}
          <div className="relative flex justify-center items-center">
            <img
              src="/landing/billboard-3d.png"
              alt="Studio Arella LED Billboard"
              className="w-full max-w-[880px] h-auto object-contain select-none pointer-events-none drop-shadow-md"
            />

            {/* Floating Pill Badge 1: 10ft x 6ft / Digital screen */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute left-2 sm:left-6 md:left-12 top-[42%] -translate-y-1/2 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl px-5 py-3 shadow-lg flex flex-col items-start min-w-[130px] sm:min-w-[150px]"
            >
              <span className="text-sm sm:text-base font-bold text-black leading-tight">
                10ft x 6ft
              </span>
              <span className="text-xs sm:text-[13px] text-[#737373] mt-0.5 leading-tight">
                Digital screen
              </span>
            </motion.div>

            {/* Floating Pill Badge 2: Premium / Studio podcasting */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute right-4 sm:right-10 md:right-16 bottom-[14%] bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl px-5 py-3 shadow-lg flex flex-col items-start min-w-[140px] sm:min-w-[160px]"
            >
              <span className="text-sm sm:text-base font-bold text-black leading-tight">
                Premium
              </span>
              <span className="text-xs sm:text-[13px] text-[#737373] mt-0.5 leading-tight">
                Studio podcasting
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
