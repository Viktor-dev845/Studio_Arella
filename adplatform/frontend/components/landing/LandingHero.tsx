'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, Tv, Mic2 } from 'lucide-react';

export default function LandingHero() {
  return (
    <section id="home" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-white">
      {/* Background subtle radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#FFFDF0]/60 via-[#FDFBF4]/30 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20">
        {/* Hero Top Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Social Proof Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/80 shadow-xs"
          >
            {/* Avatar Stack */}
            <div className="flex items-center -space-x-2">
              <img
                src="https://framerusercontent.com/images/XgYtYeXrDM8DOPn5wrJEPcxZlZ4.png?width=160&height=160"
                alt="Customer"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <img
                src="https://framerusercontent.com/images/Jel6j0VpIx3Y3m43iM4UsGwgLwU.png?width=160&height=160"
                alt="Customer"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <img
                src="https://framerusercontent.com/images/Jhp5ncerLg3UJApdSxZPv7isrZo.png?width=160&height=160"
                alt="Customer"
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-black/5"
              />
              <div className="w-7 h-7 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                80+
              </div>
            </div>

            {/* Stars & Rating */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-gray-200 text-xs font-semibold text-gray-900">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>4.5+</span>
              <span className="text-gray-500 font-normal">· 1,000+ Customer joined</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold text-[#000000] tracking-tight leading-[1.1]"
          >
            Push Your Ad &amp; Podcast Live With Ease
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#5E5F5C] max-w-2xl leading-relaxed"
          >
            Advertise your business on Umuahia&apos;s premier digital screen, or record professional audio and video in our premium podcast studio.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-black text-white text-base font-semibold shadow-lg hover:bg-zinc-800 transition-all duration-200 active:scale-95"
              style={{
                boxShadow:
                  '0 10px 25px -5px rgba(0, 0, 0, 0.15), inset 0px 17.5px 35px 0px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span>Get Started Today</span>
              <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <Link
              href="/book-ad"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#FCFDFD] text-black border border-gray-300/80 text-base font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <span>Book Ad Slot</span>
            </Link>
          </motion.div>
        </div>

        {/* Hero Visual Presentation Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-12 md:mt-16 max-w-5xl mx-auto"
        >
          {/* Main Visual Image */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-white">
            <img
              src="https://framerusercontent.com/images/mbaLsJRoIuYgOkW2em1hbCl3718.png?width=1500&height=1000"
              alt="Studio Arella Display Screen & Podcast Studio"
              className="w-full h-auto object-cover"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Feature Badge 1: Digital screen */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-5 sm:-bottom-7 left-4 sm:left-10 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3.5 max-w-[220px] sm:max-w-[260px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">10ft x 6ft</p>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Digital screen</p>
            </div>
          </motion.div>

          {/* Floating Feature Badge 2: Studio podcasting */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute -top-5 sm:-top-7 right-4 sm:right-10 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3.5 max-w-[220px] sm:max-w-[260px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Mic2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Premium</p>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Studio podcasting</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
