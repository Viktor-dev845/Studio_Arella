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
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 md:mb-20 space-y-5">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-[#FAFAFA] border border-gray-200/90 text-sm font-bold text-gray-700 shadow-2xs">
            The Process
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#000000] tracking-tight leading-[1.08]">
            From sign-up to screen<br className="hidden sm:inline" /> in four simple steps
          </h2>
          <p className="text-xl sm:text-2xl text-[#4A4B48] leading-relaxed">
            Fast, transparent, and completely self-service.
          </p>
        </div>

        {/* 4 Steps Vertical Progression / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#FAFAFA] rounded-[32px] border border-gray-200/80 overflow-hidden flex flex-col justify-between group hover:border-gray-300 hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Preview */}
              <div className="relative h-72 sm:h-88 md:h-[380px] w-full overflow-hidden bg-gray-100">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 flex items-center justify-center font-black text-lg text-black shadow-md">
                  {step.number}
                </div>
              </div>

              {/* Text & Content */}
              <div className="p-8 sm:p-10 flex flex-col justify-between flex-1">
                <div className="space-y-3.5 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Action Button */}
                <div>
                  <Link
                    href={step.actionHref}
                    className="inline-flex items-center gap-2.5 text-base sm:text-lg font-bold text-black hover:text-amber-600 transition-colors group/link"
                  >
                    <span>{step.actionText}</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
