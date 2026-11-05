'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default like Framer

  const faqs = [
    {
      question: 'Where exactly is the Studio Arella screen located?',
      answer:
        'The screen is at Bems Junction, Finbars, Bende Road, Umuahia, Abia State — a high-traffic location with thousands of daily road users. It is a 10ft × 6ft digital LED display.',
    },
    {
      question: 'Where is the Podcast Studio located?',
      answer:
        'The Studio Arella podcast suite is located at our main office in Umuahia. It is fully soundproofed and equipped with premium microphones, professional lighting, and multi-camera setups.',
    },
    {
      question: 'How much does it cost to advertise on the screen?',
      answer:
        'Plans start from ₦1,000 for a 1-minute slot. We offer packages up to 8-hour full-day bookings. All plans are billed once at time of booking with no hidden fees.',
    },
    {
      question: 'How much does it cost to book the Podcast Studio?',
      answer:
        'Our Audio-Only podcast sessions start at ₦10,000 per hour. If you require Audio + Video with a multi-cam setup, the rate is ₦20,000 per hour.',
    },
    {
      question: "I don't have an ad — can your team create one?",
      answer:
        'Yes. Our professional creative team offers graphic design services and promotional video production. Contact us via the Request Creative page or call 08164523926 to discuss your needs.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-36 bg-white relative">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/5 text-[#1F1F1F] text-xs font-semibold uppercase tracking-wider">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#000000] tracking-tight leading-[1.12]">
            Your questions answered
          </h2>
          <p className="text-base sm:text-lg text-[#5E5F5C] leading-relaxed max-w-2xl">
            No hidden fees. No surprises. Choose the plan that fits your financial goals, upgrade anytime you want.
          </p>
        </div>

        {/* FAQ Accordion List Matching Framer FAQ Wrapper Exactly (1280px width, 24px gap) */}
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-[24px]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className={`rounded-[16px] border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#EAE0F5] bg-[#F8F3FC] shadow-xs'
                    : 'border-gray-200/80 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left p-6 sm:p-7 gap-4 focus:outline-hidden cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg md:text-xl font-bold text-gray-950 leading-snug">
                    {faq.question}
                  </span>
                  <span className="text-2xl font-light text-gray-600 flex items-center justify-center w-6 h-6 flex-shrink-0 select-none">
                    {isOpen ? '–' : '+'}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 text-sm sm:text-base text-[#5E5F5C] leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
