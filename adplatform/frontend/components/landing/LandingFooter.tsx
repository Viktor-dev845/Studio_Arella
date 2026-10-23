'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Send, Check } from 'lucide-react';

export default function LandingFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="contact" className="bg-white border-t border-gray-200/80 pt-20 pb-16">
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16 space-y-16">
        {/* Top Banner: Mail Card & Social Media Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-14 border-b border-gray-100">
          {/* Email Support Card */}
          <a
            href="mailto:support@studioarella.com"
            className="flex items-center gap-5 px-8 py-5 rounded-full border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 transition-all duration-200 shadow-2xs group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <img
                src="https://framerusercontent.com/images/MqgQN7l9Rx0r4BjXOXzDIgwXP0.png?width=88&height=80"
                alt="Mail Icon"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wider">Direct Support</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                support@studioarella.com
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors ml-2" />
          </a>

          {/* Social Links Row */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider mr-1">
              Follow Us:
            </span>

            {/* Instagram */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors p-3 shadow-2xs"
              aria-label="Instagram"
            >
              <img
                src="https://framerusercontent.com/images/o6VyNJrlDoIS5bquMWuBKc3Reo.svg?width=24&height=24"
                alt="Instagram"
                className="w-full h-full object-contain"
              />
            </a>

            {/* Dribbble */}
            <a
              href="https://www.dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors p-3 shadow-2xs"
              aria-label="Dribbble"
            >
              <img
                src="https://framerusercontent.com/images/t5QShDHhwfBDe6nmET5u0vFeN60.png?width=96&height=96"
                alt="Dribbble"
                className="w-full h-full object-contain"
              />
            </a>

            {/* Twitter / X */}
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors p-3 shadow-2xs"
              aria-label="Twitter X"
            >
              <img
                src="https://framerusercontent.com/images/jhbqji9QrdyB5kcAQ7qi883BNo.svg?width=24&height=24"
                alt="Twitter"
                className="w-full h-full object-contain"
              />
            </a>

            {/* GitHub */}
            <a
              href="https://www.github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors p-3 shadow-2xs"
              aria-label="GitHub"
            >
              <img
                src="https://framerusercontent.com/images/pjADYwGAF4U8Wp7pG1nIv38kkM.svg?width=24&height=24"
                alt="GitHub"
                className="w-full h-full object-contain"
              />
            </a>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block py-1">
              <img
                src="/studio-arella-logo.png"
                alt="Studio Arella Logo"
                className="h-16 md:h-20 w-auto object-contain filter drop-shadow-xs"
              />
            </Link>
            <p className="text-base text-[#4A4B48] leading-relaxed max-w-md">
              The easiest way to book premium digital screen advertising and professional podcast studio sessions in Umuahia. A Bems Group Initiative.
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm font-bold">
                📍 Bems Junction, Finbars, Umuahia
              </span>
            </div>
          </div>

          {/* Company Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3.5 text-base text-[#5E5F5C]">
              <li>
                <a href="#process" className="hover:text-black transition-colors font-medium">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-black transition-colors font-medium">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-black transition-colors font-medium">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-black transition-colors font-medium">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Pages (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Pages
            </h4>
            <ul className="space-y-3.5 text-base text-[#5E5F5C]">
              <li>
                <a href="#services" className="hover:text-black transition-colors font-medium">
                  Services
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-black transition-colors font-medium">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-black transition-colors font-medium">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:support@studioarella.com" className="hover:text-black transition-colors font-medium">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links & Legal (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3.5 text-base text-[#5E5F5C]">
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black transition-colors font-medium">
                  Usage Terms
                </Link>
              </li>
              <li>
                <Link href="/book-ad" className="hover:text-black transition-colors font-medium">
                  Ad Specifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Newsletter
            </h4>
            {subscribed ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-sm text-green-700 font-semibold">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-black pr-11 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-xs"
                    aria-label="Subscribe"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Join our weekly newsletter for screen booking alerts &amp; creator tips.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm text-gray-600">
          <p>© 2026 Studio Arella. All rights reserved. A Bems Group Initiative.</p>
          <div className="flex items-center gap-8 font-medium">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
            <a href="tel:08164523926" className="hover:text-black transition-colors">
              Tel: 08164523926
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
