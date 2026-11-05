'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LandingServices() {
  const leftServices = [
    {
      title: 'Digital Screen Advertising',
      description:
        "Your ad displayed on our 10ft × 6ft LED screen at Bems Junction — one of Umuahia's highest-traffic locations.",
      icon: '/landing/icons/screen.png',
    },
    {
      title: 'Professional Graphic Design',
      description:
        "Our creative team designs eye-catching adverts and promotional flyers that effectively communicate your brand's message.",
      icon: '/landing/icons/design.png',
    },
    {
      title: 'Instant Ad Delivery',
      description:
        'Upload your creative from anywhere in the world. Book your slot, pay online, and your ad goes live — no delays.',
      icon: '/landing/icons/delivery.png',
    },
  ];

  const rightServices = [
    {
      title: 'Premium Podcast Studio',
      description:
        'Record your next viral podcast with professional mics, soundproofing, and optional multi-cam video or live-streaming setups.',
      icon: '/landing/icons/mic.png',
    },
    {
      title: 'Video Production',
      description:
        'We visit your business location, office, store, or event to create high-quality promotional videos at budget-friendly rates.',
      icon: '/landing/icons/video.png',
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-[#FAFAFA] relative">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 md:mb-18 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center px-3.5 py-1 rounded-full bg-black/5 text-[#1F1F1F] text-xs font-semibold uppercase tracking-wider"
          >
            Services
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-[#000000] tracking-tight leading-[1.12]"
          >
            Everything your brand needs to get seen in Umuahia
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed max-w-2xl font-normal"
          >
            From digital screen bookings to professional creative production — we handle every part of your advertising journey.
          </motion.p>
        </div>

        {/* 3-Column Bento Grid matching Framer exactly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-[40px] items-stretch">
          {/* Column 1 (Left): 3 Stacked Feature Cards */}
          <div className="flex flex-col justify-between gap-6 lg:gap-[40px]">
            {leftServices.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-[16px] pt-[24px] px-[24px] pb-[60px] border border-gray-100 shadow-xs flex-1 flex flex-col justify-start gap-[14px] hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-[#F7F8F9] border border-gray-100">
                  <img
                    src={service.icon}
                    alt={service.title}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight leading-snug">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-[#5E5F5C] leading-relaxed font-normal">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Column 2 (Center): Tall Sunset Gradient Card with Floating Microphone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-[20px] overflow-hidden min-h-[460px] lg:min-h-full flex items-center justify-center p-6 sm:p-8 shadow-xs border border-purple-200/40"
            style={{
              backgroundImage: 'url(/landing/sunset-gradient.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Centered Floating Microphone Image */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full max-w-[340px] flex items-center justify-center"
            >
              <img
                src="/landing/microphone.png"
                alt="Studio Arella Podcast Broadcast Microphone"
                className="w-full h-auto object-contain drop-shadow-2xl select-none pointer-events-none"
              />
            </motion.div>
          </motion.div>

          {/* Column 3 (Right): 2 Stacked Feature Cards */}
          <div className="flex flex-col justify-between gap-6 lg:gap-[40px]">
            {rightServices.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="bg-white rounded-[16px] pt-[24px] px-[24px] pb-[60px] border border-gray-100 shadow-xs flex-1 flex flex-col justify-start gap-[14px] hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-[#F7F8F9] border border-gray-100">
                  <img
                    src={service.icon}
                    alt={service.title}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#141414] tracking-tight leading-snug">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-[#5E5F5C] leading-relaxed font-normal">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
