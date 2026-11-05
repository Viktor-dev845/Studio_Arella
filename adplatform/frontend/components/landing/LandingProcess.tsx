'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingProcess() {
  const steps = [
    {
      number: '01',
      title: 'Create your account',
      description:
        "Sign up free in seconds — no credit card required. You're instantly ready to start booking ad or studio slots on Studio Arella.",
      actionText: 'Start now - It only takes a minute',
      actionHref: '/auth/register',
      image: 'https://framerusercontent.com/images/qxJBSJuQOLwZ8iZ87tqxQCsSDLo.jpg?scale-down-to=1024&width=5472&height=3648',
    },
    {
      number: '02',
      title: 'Pick your slot on the calendar',
      description:
        'Browse the live booking calendar. Select your preferred date and time. Choose from plans starting at ₦1,000.',
      actionText: 'Browse Booking Calendar',
      actionHref: '/book-ad',
      image: 'https://framerusercontent.com/images/iIYxv1Crr512QZ7CUP1aLLdfFlo.jpg?scale-down-to=1024&width=5000&height=5000',
    },
    {
      number: '03',
      title: 'Upload or request creative design',
      description:
        'Upload your own creative, or let our team create a professional design for you — graphics or video.',
      actionText: 'Request Custom Creative',
      actionHref: '/creative',
      image: 'https://framerusercontent.com/images/R9xBJ14XR4Ln2bdZlcdkIS3h7q0.jpg?scale-down-to=1024&width=4864&height=3328',
    },
    {
      number: '04',
      title: 'Pay and go live',
      description:
        'Pay securely using encrypted processing. Your ad is pushed directly to the Studio Arella screen and you can monitor your campaign.',
      actionText: 'Start now — it only takes a minute',
      actionHref: '/auth/register',
      image: 'https://framerusercontent.com/images/7FQztnuktOxBJlHtIvxWuqph6Q.jpg?scale-down-to=1024&width=5511&height=3674',
    },
  ];

  return (
    <section id="process" className="py-24 md:py-36 bg-white relative">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-[851px] mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/5 text-[#1F1F1F] text-xs font-semibold uppercase tracking-wider">
            The Process
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#000000] tracking-tight leading-[1.12]">
            From sign-up to screen<br className="hidden sm:inline" /> in four simple steps
          </h2>
          <p className="text-lg sm:text-xl text-[#5E5F5C] leading-relaxed">
            Fast, transparent, and completely self-service.
          </p>
        </div>

        {/* 4 Alternating Story Cards Matching Framer Exactly */}
        <div className="flex flex-col items-center gap-[60px] max-w-[1280px] mx-auto">
          {/* Card 1: Create your account */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full bg-[#F8F3FC] border border-[#EFE5F8] rounded-[32px] px-6 py-12 sm:px-12 sm:py-16 lg:px-[60px] lg:py-[90px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14"
          >
            {/* Text Side (Left) */}
            <div className="flex-1 flex flex-col items-start max-w-xl">
              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#000000] tracking-tight leading-tight mb-4">
                Create your account
              </h3>
              <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed mb-8">
                Sign up free in seconds — no credit card required. You&apos;re instantly ready to start booking ad or studio slots on Studio Arella.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 border border-purple-200 text-xs sm:text-sm font-semibold text-[#1F1F1F] hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <span>Start now — it only takes a minute</span>
                <span className="text-[#C49838] font-bold">↗</span>
              </Link>
            </div>

            {/* 3D Graphic Side (Right) */}
            <div className="flex-1 flex justify-center items-center w-full max-w-[480px]">
              <div className="relative w-full">
                {/* 3D Deep Purple Solid Underlay */}
                <div className="absolute -bottom-3 -left-3 inset-0 bg-[#2E084D] rounded-[28px] sm:rounded-[32px]" />
                {/* Front White Picture Frame */}
                <div className="relative bg-white rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 shadow-sm overflow-hidden">
                  <img
                    src="https://framerusercontent.com/images/qxJBSJuQOLwZ8iZ87tqxQCsSDLo.jpg?scale-down-to=1024&width=5472&height=3648"
                    alt="Create your account"
                    className="w-full h-[260px] sm:h-[300px] md:h-[340px] object-cover rounded-[18px] sm:rounded-[22px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Pick your slot on the calendar (Reversed Zigzag) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full bg-[#FDF6EE] border border-[#FAECE0] rounded-[32px] px-6 py-12 sm:px-12 sm:py-16 lg:px-[60px] lg:py-[90px] flex flex-col lg:flex-row-reverse items-center justify-between gap-10 lg:gap-14"
          >
            {/* Text Side (Right) */}
            <div className="flex-1 flex flex-col items-start max-w-xl">
              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#000000] tracking-tight leading-tight mb-4">
                Pick your slot on the calendar
              </h3>
              <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed mb-8">
                Browse the live booking calendar. Select your preferred date and time. Choose from plans starting at ₦1,000.
              </p>
              <Link
                href="/book-ad"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 border border-orange-200 text-xs sm:text-sm font-semibold text-[#1F1F1F] hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <span>Start now — it only takes a minute</span>
                <span className="text-[#C49838] font-bold">↗</span>
              </Link>
            </div>

            {/* 3D Graphic Side (Left) */}
            <div className="flex-1 flex justify-center items-center w-full max-w-[480px]">
              <div className="relative w-full">
                {/* 3D Deep Purple Solid Underlay */}
                <div className="absolute -bottom-3 -left-3 inset-0 bg-[#2E084D] rounded-[28px] sm:rounded-[32px]" />
                {/* Front White Picture Frame */}
                <div className="relative bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
                  <img
                    src="https://framerusercontent.com/images/iIYxv1Crr512QZ7CUP1aLLdfFlo.jpg?scale-down-to=1024&width=5000&height=5000"
                    alt="Pick your slot on the calendar"
                    className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Upload or request creative design */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full bg-[#F5F6FC] border border-[#EBEFF8] rounded-[32px] px-6 py-12 sm:px-12 sm:py-16 lg:px-[60px] lg:py-[90px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14"
          >
            {/* Text Side (Left) */}
            <div className="flex-1 flex flex-col items-start max-w-xl">
              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#000000] tracking-tight leading-tight mb-4">
                Upload or request creative design
              </h3>
              <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed mb-8">
                Upload your own creative, or let our team create a professional design for you — graphics or video.
              </p>
              <Link
                href="/creative"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 border border-indigo-200 text-xs sm:text-sm font-semibold text-[#1F1F1F] hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <span>Start now — it only takes a minute</span>
                <span className="text-[#C49838] font-bold">↗</span>
              </Link>
            </div>

            {/* 3D Graphic Side (Right) */}
            <div className="flex-1 flex justify-center items-center w-full max-w-[480px]">
              <div className="relative w-full">
                {/* 3D Deep Purple Solid Underlay */}
                <div className="absolute -bottom-3 -left-3 inset-0 bg-[#2E084D] rounded-[28px] sm:rounded-[32px]" />
                {/* Front White Picture Frame */}
                <div className="relative bg-white rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 shadow-sm overflow-hidden">
                  <img
                    src="https://framerusercontent.com/images/R9xBJ14XR4Ln2bdZlcdkIS3h7q0.jpg?scale-down-to=1024&width=4864&height=3328"
                    alt="Upload or request creative design"
                    className="w-full h-[260px] sm:h-[300px] md:h-[340px] object-cover rounded-[18px] sm:rounded-[22px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Pay and go live */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full bg-[#FCF9E8] border border-[#F7F2D8] rounded-[32px] px-6 py-12 sm:px-12 sm:py-16 lg:px-[60px] lg:py-[90px] flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14"
          >
            {/* Text Side (Left) */}
            <div className="flex-1 flex flex-col items-start max-w-xl">
              <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#000000] tracking-tight leading-tight mb-4">
                Pay and go live
              </h3>
              <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed mb-8">
                Pay securely using encrypted processing. Your ad is pushed directly to the Studio Arella screen and you can monitor your campaign.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 border border-amber-200 text-xs sm:text-sm font-semibold text-[#1F1F1F] hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <span>Start now — it only takes a minute</span>
                <span className="text-[#C49838] font-bold">↗</span>
              </Link>
            </div>

            {/* 3D Graphic Side (Right) */}
            <div className="flex-1 flex justify-center items-center w-full max-w-[480px]">
              <div className="relative w-full">
                {/* 3D Deep Purple Solid Underlay */}
                <div className="absolute -bottom-3 -left-3 inset-0 bg-[#2E084D] rounded-[28px] sm:rounded-[32px]" />
                {/* Front White Picture Frame */}
                <div className="relative bg-white rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 shadow-sm overflow-hidden">
                  <img
                    src="https://framerusercontent.com/images/7FQztnuktOxBJlHtIvxWuqph6Q.jpg?scale-down-to=1024&width=5511&height=3674"
                    alt="Pay and go live"
                    className="w-full h-[260px] sm:h-[300px] md:h-[340px] object-cover rounded-[18px] sm:rounded-[22px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
