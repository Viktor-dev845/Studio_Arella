'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'How it works', href: '#process' },
    { name: 'Services', href: '#services' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact us', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs py-3.5 border-b border-gray-100'
          : 'bg-transparent py-5 sm:py-6'
      }`}
    >
      <div className="max-w-[1520px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Logo - Bold, Clear, and Enlarged */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0 py-1">
          <div className="relative transition-transform duration-200 group-hover:scale-105">
            <img
              src="/studio-arella-logo.png"
              alt="Studio Arella"
              className="h-14 sm:h-16 md:h-20 w-auto object-contain filter drop-shadow-xs"
            />
          </div>
        </Link>

        {/* Desktop Nav Links Pill - Enlarged with comfortable touch & text size */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 px-7 py-3 bg-white/95 border border-gray-200/90 rounded-full shadow-xs backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 text-base font-bold text-[#1F1F1F] hover:text-[#000000] hover:bg-gray-100/80 rounded-full transition-colors duration-150"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            href="/auth/login"
            className="text-base font-bold text-gray-800 hover:text-black px-4 py-2.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white text-base font-bold shadow-md hover:bg-zinc-800 transition-all duration-200 hover:shadow-xl active:scale-95"
            style={{
              boxShadow:
                'inset 0px 17.5px 35px 0px rgba(255, 255, 255, 0.08), inset 0px -4px 6px 0px rgba(255, 255, 255, 0.03)',
            }}
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-gray-800 hover:text-black py-2 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-base font-semibold text-gray-800 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 text-base font-semibold text-white bg-black rounded-full hover:bg-zinc-800 transition-colors shadow-md"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
