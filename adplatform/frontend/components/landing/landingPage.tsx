'use client';

import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import LandingTicker from './LandingTicker';
import LandingServices from './LandingServices';
import LandingProcess from './LandingProcess';
import LandingTestimonials from './LandingTestimonials';
import LandingFAQ from './LandingFAQ';
import LandingCTA from './LandingCTA';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#16151C] selection:bg-amber-400 selection:text-black font-sans antialiased overflow-x-hidden">
      {/* 1. Header & Navigation */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <main>
        <LandingHero />

        {/* 3. Social Proof Brand Ticker */}
        <LandingTicker />

        {/* 4. Services / Benefits Section */}
        <LandingServices />

        {/* 5. 4-Step Process Section */}
        <LandingProcess />

        {/* 6. Testimonials & Real-World Stats */}
        <LandingTestimonials />

        {/* 7. Interactive FAQ Accordion */}
        <LandingFAQ />

        {/* 8. Pre-Footer Call to Action Banner */}
        <LandingCTA />
      </main>

      {/* 9. Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}
