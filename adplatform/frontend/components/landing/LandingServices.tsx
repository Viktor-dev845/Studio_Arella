'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LandingServices() {
  const adServices = [
    {
      title: 'Digital Screen Advertising',
      description:
        "Your ad displayed on our 10ft × 6ft LED screen at Bems Junction — one of Umuahia's highest-traffic locations.",
      icon: 'https://framerusercontent.com/images/YctqM8OyhwFL90QnMTHgJ5x8Q.png?width=34&height=34',
    },
    {
      title: 'Professional Graphic Design',
      description:
        "Our creative team designs eye-catching adverts and promotional flyers that effectively communicate your brand's message.",
      icon: 'https://framerusercontent.com/images/mKFKHx2VvA3ulj2NHud5REjrYY.png?width=34&height=34',
    },
    {
      title: 'Instant Ad Delivery',
      description:
        'Upload your creative from anywhere in the world. Book your slot, pay online, and your ad goes live — no delays.',
      icon: 'https://framerusercontent.com/images/XUfXNIpjOKlSE2XTNK8Q84SGqSI.png?width=34&height=34',
    },
  ];

  const studioServices = [
    {
      title: 'Premium Podcast Studio',
      description:
        'Record your next viral podcast with professional mics, soundproofing, and optional multi-cam video or live-streaming setups.',
      icon: 'https://framerusercontent.com/images/bihqJibi3c0PlHWBguSUmD2Pztk.png?width=34&height=34',
    },
    {
      title: 'Video Production',
      description:
        'We visit your business location, office, store, or event to create high-quality promotional videos at budget-friendly rates.',
      icon: 'https://framerusercontent.com/images/3wJa0XduK8tGBEUGCX5wDNtGh78.png?width=34&height=34',
    },
  ];

  return (
    <section id="services" className="py-24 md:py-36 bg-[#FAFAFA] relative">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 md:mb-20 space-y-5">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white border border-gray-200/90 text-sm font-bold text-gray-700 shadow-2xs">
            Services &amp; Capabilities
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#000000] tracking-tight leading-[1.08]">
            Everything your brand needs to get seen in Umuahia
          </h2>
          <p className="text-xl sm:text-2xl text-[#4A4B48] leading-relaxed max-w-3xl">
            From digital screen bookings to professional creative production — we handle every part of your advertising journey.
          </p>
        </div>

        {/* 2-Column Bento Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left Column: Digital Screen Advertising Suite */}
          <div className="bg-white rounded-[32px] border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            {/* Visual Hero Image for Digital Screen */}
            <div className="relative h-72 sm:h-96 md:h-[400px] w-full overflow-hidden bg-gray-100">
              <img
                src="https://framerusercontent.com/images/fp1B0ewfYQSleB0DhLVM7REqfI.png?scale-down-to=1024&width=1952&height=2888"
                alt="Digital Screen Advertising at Bems Junction"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-sm font-bold uppercase tracking-wider">
                  Screen Advertising
                </span>
              </div>
            </div>

            {/* Service Cards Stack */}
            <div className="p-7 sm:p-9 space-y-5">
              {adServices.map((service, idx) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-[#FBFBFA] border border-gray-200/70 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center p-3 flex-shrink-0 shadow-xs">
                    <img src={service.icon} alt={service.title} className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Podcast Studio & Video Production */}
          <div className="bg-white rounded-[32px] border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            {/* Visual Hero Image for Podcast Studio */}
            <div className="relative h-72 sm:h-96 md:h-[400px] w-full overflow-hidden bg-gray-100">
              <img
                src="https://framerusercontent.com/images/DcS5rQsmoSVzj89g6sTY5BCmdLM.png?scale-down-to=1024&width=800&height=1200"
                alt="Studio Arella Podcast Studio"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-sm font-bold uppercase tracking-wider">
                  Audio &amp; Video Suite
                </span>
              </div>
            </div>

            {/* Service Cards Stack */}
            <div className="p-7 sm:p-9 space-y-5">
              {studioServices.map((service, idx) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.15 }}
                  className="p-6 rounded-2xl bg-[#FBFBFA] border border-gray-200/70 hover:border-gray-300 hover:bg-white hover:shadow-md transition-all duration-200 flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center p-3 flex-shrink-0 shadow-xs">
                    <img src={service.icon} alt={service.title} className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                      {service.title}
                    </h3>
                    <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Bonus Quick Booking Callout Card */}
              <div className="p-6 rounded-2xl bg-[#FFFDF0] border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <p className="text-base sm:text-lg font-bold text-gray-900">Custom Brand Campaign?</p>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Need combination packages or dedicated screen coverage?</p>
                </div>
                <a
                  href="#contact"
                  className="px-6 py-3 rounded-full bg-black text-white text-sm sm:text-base font-bold hover:bg-zinc-800 transition-colors flex-shrink-0 self-start sm:self-auto shadow-sm"
                >
                  Talk to Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
