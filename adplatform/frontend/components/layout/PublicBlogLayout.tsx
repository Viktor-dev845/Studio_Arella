'use client';

import React from 'react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';

export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: theme.font.body }}>
      {/* Header */}
      <header style={{ 
        width: '100%', 
        padding: '20px 5%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#0A0A0A',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Link href="/blog">
            <img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 65, flexShrink: 0, objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Center Categories (Hidden on very small mobile) */}
        <div className="hidden md:flex" style={{ gap: '30px', alignItems: 'center' }}>
          {['HOME', 'BUSINESS', 'CREATORS', 'TECHNOLOGY', 'CULTURE'].map((cat) => (
            <Link key={cat} href={cat === 'HOME' ? '/blog' : `/blog?category=${cat.toLowerCase()}`} style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          {mounted && user ? (
            <>
              <Link href="/" style={{
                padding: '10px 20px',
                borderRadius: 6,
                background: '#262626',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Dashboard
              </Link>
              <button onClick={() => { logout(); window.location.reload(); }} style={{
                padding: '10px 20px',
                borderRadius: 6,
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}>
                Sign Out
              </button>
            </>
          ) : mounted ? (
            <Link href="/book-ad" style={{
              padding: '10px 20px',
              borderRadius: 6,
              background: '#D4AF37',
              color: '#121212',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-16 pb-8 border-t border-gray-800 z-10 relative">
        <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-12 mb-16">
            
            {/* Column 1: Brand */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              <img src="/logo-white.png" alt="Studio Arella" className="h-12 object-contain self-start" />
              <p className="text-gray-400 text-sm leading-relaxed">
                Studio Arella — your trusted source for accurate, fast and compelling news and digital advertising across Nigeria and Africa.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center cursor-pointer hover:opacity-80"><span className="text-white text-xs font-bold">f</span></div>
                <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center cursor-pointer hover:opacity-80"><span className="text-white text-xs font-bold">t</span></div>
                <div className="w-8 h-8 rounded-full bg-[#E1306C] flex items-center justify-center cursor-pointer hover:opacity-80"><span className="text-white text-xs font-bold">in</span></div>
              </div>
            </div>

            {/* Column 2: Sections */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-[13px] mb-2 border-b-2 border-blue-600 pb-2 inline-block w-fit">SECTIONS</h4>
              {['Home', 'Politics', 'Business', 'Sports', 'Technology', 'Health'].map(link => (
                  <Link key={link} href={link === 'Home' ? '/blog' : `/blog?category=${link.toUpperCase()}`} className="text-gray-400 hover:text-[#D4AF37] text-sm transition-colors">{link}</Link>
              ))}
            </div>

            {/* Column 3: More News */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-[13px] mb-2 border-b-2 border-blue-600 pb-2 inline-block w-fit">MORE NEWS</h4>
              {['Fashion', 'Education', 'Travel', 'Science', 'Lifestyle', 'Economy'].map(link => (
                  <Link key={link} href={`/blog?category=${link.toUpperCase()}`} className="text-gray-400 hover:text-[#D4AF37] text-sm transition-colors">{link}</Link>
              ))}
            </div>

            {/* Column 4: Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-[13px] mb-2 border-b-2 border-blue-600 pb-2 inline-block w-fit">COMPANY</h4>
              {['About Us', 'Our Team', 'Advertise', 'Contact Us', 'Careers'].map(link => {
                  let href = '/';
                  if (link === 'Advertise') href = '/book-ad';
                  if (link === 'About Us') href = '/about';
                  if (link === 'Our Team') href = '/team';
                  if (link === 'Contact Us') href = '/contact';
                  if (link === 'Careers') href = '/careers';
                  return <Link key={link} href={href} className="text-gray-400 hover:text-[#D4AF37] text-sm transition-colors">{link}</Link>;
                })}
            </div>

            {/* Column 5: Subscribe */}
            <div className="xl:col-span-1 flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-[13px] mb-2 border-b-2 border-[#D4AF37] pb-2 inline-block w-fit">STAY NOTIFIED</h4>
              <p className="text-gray-400 text-sm mb-2">Get email alerts when news is posted in your category.</p>
              <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Newsletter!'); }}>
                <input type="text" placeholder="First name" className="bg-[#1A1A1A] border border-gray-800 p-2.5 text-sm rounded-sm text-white focus:border-[#D4AF37] outline-none" required />
                <input type="email" placeholder="Email address" className="bg-[#1A1A1A] border border-gray-800 p-2.5 text-sm rounded-sm text-white focus:border-[#D4AF37] outline-none" required />
                <select className="bg-[#1A1A1A] border border-gray-800 p-2.5 text-sm rounded-sm text-gray-400 focus:border-[#D4AF37] outline-none">
                  <option value="">— Select a category —</option>
                  <option value="politics">Politics</option>
                  <option value="business">Business</option>
                  <option value="tech">Technology</option>
                </select>
                <button type="submit" className="bg-[#0056b3] hover:bg-[#D4AF37] transition-colors text-white font-bold text-sm py-3 rounded-sm mt-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                  Notify Me
                </button>
              </form>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Studio Arella. All Rights Reserved</p>
            <div className="flex gap-6 mt-4 md:mt-0 font-medium tracking-wide">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/cookies" className="hover:text-white">Cookies</Link>
              <Link href="/sitemap" className="hover:text-white">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
