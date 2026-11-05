'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, ShieldCheck } from 'lucide-react';

export default function LandingTestimonials() {
  const stats = [
    {
      value: '100%',
      label: 'Improved Sales Growth',
      icon: TrendingUp,
    },
    {
      value: '50K+',
      label: 'Daily road users at Bems Junction',
      icon: Users,
    },
    {
      value: '100%',
      label: 'Nigerian-owned & operated',
      icon: ShieldCheck,
    },
  ];

  const testimonials = [
    {
      name: 'Ngozi Obi',
      role: 'Marketing Officer, Abia SME',
      highlight: '“Using this platform has completely improved sales”',
      quote:
        '“We booked two slots near Umuahia market for a product launch, uploaded our graphic, and it went live the same day. The real-time data was a bonus we did not expect.”',
      avatar:
        'https://framerusercontent.com/images/cz25k9bZZYaN9322N08WN8lbE.png?width=224&height=224',
      rating: 5,
    },
    {
      name: 'Chukwuemeka Agu',
      role: 'Owner, Agu Supermarket',
      highlight: '“No phone calls, no negotiation — just results”',
      quote:
        '“I listed my shop-front screen and had my first booking within the week. No phone calls, no negotiation — the ad was running. That’s exactly what we needed.”',
      avatar:
        'https://framerusercontent.com/images/cNFNVLNjIlJcXdGN0WUcpRhrA.png?scale-down-to=1024&width=1128&height=1288',
      rating: 5,
    },
    {
      name: 'Ifeanyi Nwosu',
      role: 'Brand Manager, Nwosu & Sons',
      highlight: '“High-impact LED billboard accessible to all”',
      quote:
        '“Studio Arella made high-impact LED screen advertising accessible to local businesses in Umuahia. The digital calendar booking is fast, seamless, and clear.”',
      avatar:
        'https://framerusercontent.com/images/xkA15EjvUVWeYMWSTKqleApRmNk.png?scale-down-to=512&width=2048&height=2048',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 md:py-36 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[80px]">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/5 text-[#1F1F1F] text-xs font-semibold uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#000000] tracking-tight leading-[1.12]">
            What Our Users Say
          </h2>
          <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed max-w-2xl">
            Explore intelligent tools designed to help you save smarter, spend wiser, and stay in full control.
          </p>
        </div>

        {/* Unified Bento Grid Matching Framer Exactly (4 Columns x 2 Rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Column 1 (Spans 2 rows): Tall Ngozi Obi Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[16px] p-8 border border-gray-200/90 shadow-xs flex flex-col justify-between lg:row-span-2 min-h-[460px] hover:shadow-md transition-shadow"
          >
            <div>
              {/* Header: Avatar, Name, and Quotation Icon */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="https://framerusercontent.com/images/cz25k9bZZYaN9322N08WN8lbE.png?width=224&height=224"
                    alt="Ngozi Obi"
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="text-base font-bold text-gray-950 leading-tight">Ngozi Obi</h4>
                    <p className="text-xs text-[#737373] mt-0.5">Marketing Officer, Abia SME</p>
                  </div>
                </div>
                <span className="text-4xl text-gray-200 font-serif leading-none select-none">“</span>
              </div>

              {/* Bold Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight leading-snug mb-4">
                &ldquo;Using this platform has completely improved sales&rdquo;
              </h3>

              {/* Body Text */}
              <p className="text-sm sm:text-base text-[#5E5F5C] leading-relaxed">
                &ldquo;We booked two slots near Umuahia market for a product launch, uploaded our graphic, and it went live the same day. The real-time data was a bonus we did not expect.&rdquo;
              </p>
            </div>

            {/* Rating Stars at Bottom */}
            <div className="flex items-center gap-1 text-[#E97724] text-sm pt-6 mt-6 border-t border-gray-100">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
          </motion.div>

          {/* Column 2, Row 1: Ifeanyi Nwosu Photo Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[16px] overflow-hidden min-h-[220px] bg-gray-100 border border-gray-200/80 shadow-xs flex items-end group"
          >
            <img
              src="https://framerusercontent.com/images/nePXEsHyuHXaUEimdv56jQiDxOc.jpeg"
              alt="Ifeanyi Nwosu"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlay Name Tag */}
            <div className="relative z-10 m-3 w-full bg-white/95 backdrop-blur-md rounded-[12px] p-2.5 flex items-center gap-2.5 border border-white/60 shadow-xs">
              <img
                src="https://framerusercontent.com/images/xkA15EjvUVWeYMWSTKqleApRmNk.png?scale-down-to=512&width=2048&height=2048"
                alt="Ifeanyi Nwosu"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-950 truncate">Ifeanyi Nwosu</p>
                <p className="text-[10px] text-[#737373] truncate">Brand Manager, Nwosu &amp; Sons</p>
              </div>
            </div>
          </motion.div>

          {/* Column 3, Row 1: 50K+ Daily Users Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-[16px] p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
                50K+
              </p>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 font-medium">
                Daily road users at Bems Junction
              </p>
            </div>
          </motion.div>

          {/* Column 4, Row 1: Gradient 100% Nigerian-Owned Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[16px] p-6 border border-[#d1d0fc] shadow-xs flex flex-col justify-between min-h-[220px] text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #7C74EA 0%, #9F72D6 50%, #E98D71 100%)',
            }}
          >
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                100%
              </p>
              <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                Nigerian-owned &amp; operated
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-300 text-sm">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
          </motion.div>

          {/* Column 2, Row 2: 100% Sales Growth Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-[16px] p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between min-h-[220px] hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
                100%
              </p>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 font-medium">
                Improved Sales Growth
              </p>
            </div>
          </motion.div>

          {/* Column 3 & 4, Row 2 (Spans 2 columns): Dark Chukwuemeka Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0A0A0A] rounded-[16px] p-8 border border-neutral-800 shadow-md flex flex-col justify-between text-white lg:col-span-2 min-h-[220px]"
          >
            {/* Quote Body */}
            <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-normal mb-6">
              &ldquo;I listed my shop-front screen and had my first booking within the week. No phone calls, no negotiation — the ad was running. That&apos;s exactly what we needed.&rdquo;
            </p>

            {/* Author Footer */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                <img
                  src="https://framerusercontent.com/images/cNFNVLNjIlJcXdGN0WUcpRhrA.png?scale-down-to=1024&width=1128&height=1288"
                  alt="Chukwuemeka Agu"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">Chukwuemeka Agu</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Owner, Agu Supermarket</p>
                </div>
              </div>
              <span className="text-3xl text-neutral-800 font-serif leading-none select-none">”</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
