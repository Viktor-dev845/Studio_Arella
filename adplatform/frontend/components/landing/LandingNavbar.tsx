'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          ? 'bg-white/90 backdrop-blur-md shadow-xs py-3 border-b border-gray-100'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-36 h-10 transition-transform duration-200 group-hover:scale-[1.02]">
            <img
              src="https://framerusercontent.com/images/zDGuuHXeRPbuar1slIqnbQuWOOs.png"
              alt="Studio Arella"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav Links Pill */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-4 py-1.5 bg-white/80 border border-gray-200/80 rounded-full shadow-xs backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-1.5 text-sm font-medium text-[#16151C] hover:text-[#000000] hover:bg-gray-100/70 rounded-full transition-colors duration-150"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-700 hover:text-black px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium shadow-sm hover:bg-zinc-800 transition-all duration-200 hover:shadow-md active:scale-95"
            style={{
              boxShadow:
                'inset 0px 17.5px 35px 0px rgba(255, 255, 255, 0.08), inset 0px -4px 6px 0px rgba(255, 255, 255, 0.03)',
            }}
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                className="text-base font-medium text-gray-800 hover:text-black py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-zinc-800 transition-colors shadow-sm"
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
