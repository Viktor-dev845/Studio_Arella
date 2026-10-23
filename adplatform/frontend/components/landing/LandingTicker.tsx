'use client';

import React from 'react';

export default function LandingTicker() {
  const logos = [
    { id: 1, src: 'https://framerusercontent.com/images/KIDzdJlL3UO1eLKPLIw8vh9pvyA.png' },
    { id: 2, src: 'https://framerusercontent.com/images/P8y3WeK0nRJYY136tLn9knon9Co.png' },
    { id: 3, src: 'https://framerusercontent.com/images/ryU8nO47MmkW6B3yQuOFHBa8sqM.png' },
    { id: 4, src: 'https://framerusercontent.com/images/j5OCGBCZjN8EYoo5EROpdVV1A.png' },
    { id: 5, src: 'https://framerusercontent.com/images/RJ6p0xWgOQNbyuc4BzOC6wlUiI.png' },
    { id: 6, src: 'https://framerusercontent.com/images/smpVwitrhJkwHjh1wAaisAhPp7g.png' },
  ];

  // Duplicate for seamless infinite loop
  const marqueeList = [...logos, ...logos, ...logos];

  return (
    <section className="py-14 md:py-20 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16 mb-9 text-center">
        <p className="text-sm sm:text-base uppercase tracking-widest text-[#4A4B48] font-bold">
          Trusted by Top Businesses &amp; Brands
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-28 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling flex track */}
        <div className="flex w-max items-center gap-16 sm:gap-24 animate-marquee">
          {marqueeList.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 h-12 sm:h-16 flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity duration-200 grayscale hover:grayscale-0"
            >
              <img
                src={logo.src}
                alt="Partner Brand"
                className="h-full w-auto max-w-[180px] sm:max-w-[240px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
