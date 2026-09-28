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
            <img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 40, objectFit: 'contain' }} />
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
            <Link href="/auth/login" style={{
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
      <footer style={{
        padding: '40px 5%',
        borderTop: `1px solid ${theme.color.border}`,
        textAlign: 'center',
        background: '#FAFAFA'
      }}>
        <p style={{ margin: 0, color: theme.color.text3, fontSize: 14 }}>
          &copy; {new Date().getFullYear()} Studio Arella. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
