'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, Tv, Mic2 } from 'lucide-react';

export default function LandingHero() {
  return (
    <section id="home" className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
      {/* Background subtle radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#FFFDF0]/70 via-[#FDFBF4]/40 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        {/* Hero Top Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-7 sm:space-y-9">
          {/* Social Proof Trust Badge - Enlarged */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3.5 sm:gap-4 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white border border-gray-200/90 shadow-xs"
          >
            {/* Avatar Stack */}
            <div className="flex items-center -space-x-2.5">
              <img
                src="https://framerusercontent.com/images/XgYtYeXrDM8DOPn5wrJEPcxZlZ4.png?width=160&height=160"
                alt="Customer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <img
                src="https://framerusercontent.com/images/Jel6j0VpIx3Y3m43iM4UsGwgLwU.png?width=160&height=160"
                alt="Customer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <img
                src="https://framerusercontent.com/images/Jhp5ncerLg3UJApdSxZPv7isrZo.png?width=160&height=160"
                alt="Customer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center border-2 border-white">
                80+
              </div>
            </div>

            {/* Stars & Rating */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 text-sm sm:text-base font-bold text-gray-900">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span>4.5+</span>
              <span className="text-gray-500 font-normal">· 1,000+ Customers joined</span>
            </div>
          </motion.div>

          {/* Headline - Significantly Enlarged and Commanding */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[88px] font-black text-[#000000] tracking-tight leading-[1.06]"
          >
            Push Your Ad &amp; Podcast Live With Ease
          </motion.h1>

          {/* Subtitle - More Legible and Impactful */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-[23px] text-[#4A4B48] max-w-3xl leading-relaxed font-normal"
          >
            Advertise your business on Umuahia&apos;s premier digital screen, or record professional audio and video in our premium podcast studio.
          </motion.p>

          {/* CTA Buttons - Large and Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5 pt-3"
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-black text-white text-lg sm:text-xl font-bold shadow-xl hover:bg-zinc-800 transition-all duration-200 active:scale-95 hover:shadow-2xl"
              style={{
                boxShadow:
                  '0 12px 30px -5px rgba(0, 0, 0, 0.2), inset 0px 17.5px 35px 0px rgba(255, 255, 255, 0.12)',
              }}
            >
              <span>Get Started Today</span>
              <ArrowUpRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <Link
              href="/book-ad"
              className="inline-flex items-center justify-center gap-2.5 px-9 py-5 rounded-full bg-[#FCFDFD] text-black border-2 border-gray-300/80 text-lg sm:text-xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-xs hover:border-gray-400"
            >
              <span>Book Ad Slot</span>
            </Link>
          </motion.div>
        </div>

        {/* Hero Visual Presentation Container - Wider and Grand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 md:mt-24 max-w-6xl xl:max-w-7xl mx-auto"
        >
          {/* Main Visual Image */}
          <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden border border-gray-200/90 shadow-2xl bg-white">
            <img
              src="https://framerusercontent.com/images/mbaLsJRoIuYgOkW2em1hbCl3718.png?width=1500&height=1000"
              alt="Studio Arella Display Screen & Podcast Studio"
              className="w-full h-auto object-cover"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Feature Badge 1: Digital screen - Enlarged */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-12 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex items-center gap-4 max-w-[260px] sm:max-w-[310px]"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Tv className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">10ft x 6ft</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Digital LED screen</p>
            </div>
          </motion.div>

          {/* Floating Feature Badge 2: Studio podcasting - Enlarged */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute -top-6 sm:-top-8 right-4 sm:right-12 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl flex items-center gap-4 max-w-[260px] sm:max-w-[310px]"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Mic2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Premium Suite</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Studio podcasting &amp; 4K</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
