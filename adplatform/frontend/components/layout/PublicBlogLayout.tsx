'use client';

import React from 'react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', fontFamily: theme.font.body }}>
      {/* Header */}
      <header style={{ 
        width: '100%', 
        padding: '20px 5%', 
        borderBottom: `1px solid ${theme.color.border}`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link href="/blog">
          <img src="/logo-black.png" alt="Studio Arella Logo" style={{ height: 40, objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/" style={{
            padding: '10px 20px',
            borderRadius: 6,
            background: '#F1F5F9',
            color: '#0F172A',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Dashboard
          </Link>
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
