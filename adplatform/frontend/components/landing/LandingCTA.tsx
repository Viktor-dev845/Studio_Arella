'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mic2, Tv } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section id="cta" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20">
        <div className="relative rounded-[36px] overflow-hidden bg-[#0A0D14] border border-gray-800 text-white shadow-2xl p-8 sm:p-12 lg:p-16">
          {/* Background Atmospheric Visual */}
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://framerusercontent.com/images/luF6GJ4aSqJimJzbnwPzDMkfL4w.png?scale-down-to=2048&width=5760&height=2624"
              alt="Studio Background"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Deep dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-transparent z-0 pointer-events-none" />

          {/* Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90">
                <span>Start Today</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Instant Onboarding</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready To Launch Your Ad Or Book Your Podcast?
              </h2>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl">
                Create your account, upload your creative, and go live on the Studio Arella screen today. Or step into our soundproof studio with high-end mics, multi-cam video, and a dedicated engineer ready for you.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-black text-sm sm:text-base font-bold shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                >
                  <Tv className="w-4 h-4 text-black" />
                  <span>Create Advertiser Account</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  href="/book-ad"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm sm:text-base font-bold backdrop-blur-md transition-all duration-200"
                >
                  <Mic2 className="w-4 h-4 text-amber-400" />
                  <span>Book Studio Time</span>
                </Link>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-900 group">
                <img
                  src="https://framerusercontent.com/images/nePXEsHyuHXaUEimdv56jQiDxOc.jpeg?scale-down-to=512&width=1024&height=768"
                  alt="Soundproof Podcast Suite"
                  className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    Soundproof Suite
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
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
