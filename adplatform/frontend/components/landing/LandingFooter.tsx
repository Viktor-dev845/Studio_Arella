'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer id="contact" className="w-full bg-[#FFFFFF] text-[#16151C] pt-14 pb-16 border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Top Bar: Support Mail Pill (Left) & Social Media Icons (Right) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-10 border-b border-gray-100">
          {/* Email Support Pill */}
          <a
            href="mailto:support@studioarella.com"
            className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 transition-all text-xs sm:text-sm font-medium text-gray-800 shadow-2xs group"
          >
            <img
              src="https://framerusercontent.com/images/MqgQN7l9Rx0r4BjXOXzDIgwXP0.png?width=88&height=80"
              alt="Mail Icon"
              className="w-4 h-4 object-contain"
            />
            <span>support@studioarella.com</span>
            <span className="text-gray-400 group-hover:text-black transition-colors ml-1 font-mono text-sm leading-none">›</span>
          </a>

          {/* Social Media Links */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-normal text-gray-400">Social media:</span>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200/90 hover:border-gray-400 flex items-center justify-center p-1.5 transition-colors"
                aria-label="Instagram"
              >
                <img
                  src="https://framerusercontent.com/images/o6VyNJrlDoIS5bquMWuBKc3Reo.svg?width=24&height=24"
                  alt="Instagram"
                  className="w-4 h-4 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>

              {/* Dribbble */}
              <a
                href="https://www.dribbble.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200/90 hover:border-gray-400 flex items-center justify-center p-1.5 transition-colors"
                aria-label="Dribbble"
              >
                <img
                  src="https://framerusercontent.com/images/t5QShDHhwfBDe6nmET5u0vFeN60.png?width=96&height=96"
                  alt="Dribbble"
                  className="w-4 h-4 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>

              {/* Twitter / X */}
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200/90 hover:border-gray-400 flex items-center justify-center p-1.5 transition-colors"
                aria-label="Twitter X"
              >
                <img
                  src="https://framerusercontent.com/images/jhbqji9QrdyB5kcAQ7qi883BNo.svg?width=24&height=24"
                  alt="Twitter"
                  className="w-4 h-4 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>

              {/* GitHub */}
              <a
                href="https://www.github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-200/90 hover:border-gray-400 flex items-center justify-center p-1.5 transition-colors"
                aria-label="GitHub"
              >
                <img
                  src="https://framerusercontent.com/images/pjADYwGAF4U8Wp7pG1nIv38kkM.svg?width=24&height=24"
                  alt="GitHub"
                  className="w-4 h-4 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Main Content: Info & Links (Left) + Large Studio Arella Logo Graphic (Right) */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16 pt-2">
          
          {/* Left Column: Brand Bio + 3-Column Navigation Grid */}
          <div className="flex-1 w-full max-w-2xl space-y-8">
            {/* Small Brand Logo */}
            <Link href="/" className="inline-block">
              <img
                src="/studio-arella-logo.png"
                alt="Studio Arella"
                className="h-12 w-auto object-contain filter drop-shadow-xs"
              />
            </Link>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg font-normal">
              The easiest way to book premium digital screen advertising and professional podcast studio sessions in Umuahia. A Bems Group Initiative.
            </p>

            {/* 3 Columns of Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 pt-4">
              {/* 1. Company */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Company
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                  <li>
                    <a href="#process" className="hover:text-black transition-colors">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-black transition-colors">
                      Pricing Plans
                    </a>
                  </li>
                  <li>
                    <Link href="/auth/register" className="hover:text-black transition-colors">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/login" className="hover:text-black transition-colors">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 2. Pages */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Pages
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                  <li>
                    <Link href="/blog" className="hover:text-black transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:text-black transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a href="#services" className="hover:text-black transition-colors">
                      About us
                    </a>
                  </li>
                </ul>
              </div>

              {/* 3. Quick Links */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Quick Links
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                  <li>
                    <Link href="/privacy" className="hover:text-black transition-colors">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-black transition-colors">
                      Usage Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/404" className="hover:text-black transition-colors">
                      404
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Large Studio Arella Logo Graphic */}
          <div className="w-full lg:w-auto flex items-center justify-center lg:justify-end self-center lg:self-end pt-6 lg:pt-0">
            <img
              src="/studio-arella-logo.png"
              alt="Studio Arella by Bemps"
              className="w-48 sm:w-60 md:w-72 h-auto object-contain filter drop-shadow-sm select-none"
            />
          </div>

        </div>

        {/* Minimal Copyright Row */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 Studio Arella. All rights reserved. A Bems Group Initiative.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <a href="tel:08164523926" className="hover:text-gray-600 transition-colors">Tel: 08164523926</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
