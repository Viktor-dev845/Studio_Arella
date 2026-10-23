'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mic2, Tv } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section id="cta" className="py-20 md:py-32 bg-white relative">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        <div className="relative rounded-[40px] overflow-hidden bg-[#0A0D14] border border-gray-800 text-white shadow-2xl p-10 sm:p-14 lg:p-20">
          {/* Background Atmospheric Visual */}
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://framerusercontent.com/images/luF6GJ4aSqJimJzbnwPzDMkfL4w.png?scale-down-to=2048&width=5760&height=2624"
              alt="Studio Background"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Deep dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-transparent z-0 pointer-events-none" />

          {/* Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold text-white/95">
                <span>Start Today</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Instant Onboarding</span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Ready To Launch Your Ad Or Book Your Podcast?
              </h2>

              <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed max-w-2xl font-normal">
                Create your account, upload your creative, and go live on the Studio Arella screen today. Or step into our soundproof studio with high-end mics, multi-cam video, and a dedicated engineer ready for you.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 pt-3">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-3 px-9 py-5 rounded-full bg-white text-black text-base sm:text-lg font-bold shadow-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
                >
                  <Tv className="w-5 h-5 text-black" />
                  <span>Create Advertiser Account</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>

                <Link
                  href="/book-ad"
                  className="inline-flex items-center justify-center gap-3 px-9 py-5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 text-base sm:text-lg font-bold backdrop-blur-md transition-all duration-200 shadow-sm"
                >
                  <Mic2 className="w-5 h-5 text-amber-400" />
                  <span>Book Studio Time</span>
                </Link>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[28px] overflow-hidden border border-white/20 shadow-2xl bg-zinc-900 group">
                <img
                  src="https://framerusercontent.com/images/nePXEsHyuHXaUEimdv56jQiDxOc.jpeg?scale-down-to=512&width=1024&height=768"
                  alt="Soundproof Podcast Suite"
                  className="w-full h-72 sm:h-88 md:h-[380px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm uppercase tracking-widest text-amber-400 font-bold mb-1">
                    Soundproof Suite
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white">
                    Multi-cam video, 4K recording &amp; pro audio engineer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
