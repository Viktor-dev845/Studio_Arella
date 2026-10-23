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
    <section id="testimonials" className="py-24 md:py-36 bg-[#FAFAFA] relative">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 md:mb-20 space-y-5">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white border border-gray-200/90 text-sm font-bold text-gray-700 shadow-2xs">
            Testimonials &amp; Verified Results
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#000000] tracking-tight leading-[1.08]">
            What Our Users Say
          </h2>
          <p className="text-xl sm:text-2xl text-[#4A4B48] leading-relaxed">
            Real businesses and creators growing their reach with Studio Arella.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-20">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-[28px] p-7 sm:p-9 border border-gray-200/80 shadow-xs flex items-center gap-6 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-none mb-1.5">
                    {stat.value}
                  </p>
                  <p className="text-base sm:text-lg text-[#4A4B48] font-bold">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1.5 text-amber-400 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* Highlight */}
                <p className="text-xl sm:text-2xl font-black text-gray-900 mb-3.5 leading-snug">
                  {t.highlight}
                </p>

                {/* Body Quote */}
                <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed mb-8">
                  {t.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <p className="text-base sm:text-lg font-black text-gray-900">{t.name}</p>
                  <p className="text-sm sm:text-base text-[#5E5F5C] font-medium">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
