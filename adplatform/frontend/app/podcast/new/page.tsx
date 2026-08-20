'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Image as ImageIcon, UploadCloud, Calendar, Clock, Check } from 'lucide-react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';

const F = theme.font.body;

export default function AddPodcastPage() {
  const [contentRating, setContentRating] = useState('Suitable for everyone');
  const [episodeOption, setEpisodeOption] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
    color: '#0F172A',
    fontFamily: F,
    outline: 'none',
  };

  return (
    <DashboardLayout>
      <style>{`
        ::placeholder {
          color: #94A3B8 !important;
          font-weight: 400 !important;
        }
      `}</style>
      <div style={{ fontFamily: F, display: 'flex', gap: 32, padding: '32px 32px 32px 40px', minHeight: '100%', alignItems: 'flex-start' }}>
      
      {/* ─── LEFT COLUMN (Form Section) ─── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32, background: '#FFFFFF', borderRadius: 16, padding: '24px 32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/podcast" style={{ display: 'flex', alignItems: 'center', color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13, gap: 4 }}>
              <ChevronLeft size={16} /> Back
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Add podcast</h1>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Today <ChevronDown size={14} />
          </button>
        </div>

        {/* Cover Photo */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Add cover photo</label>
          <div style={{ width: 80, height: 80, borderRadius: 12, border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', cursor: 'pointer' }}>
            <ImageIcon size={24} color="#94A3B8" />
          </div>
        </div>

        {/* Title */}
        <input type="text" placeholder="Title" style={inputStyle} />

        {/* Title Description */}
        <textarea placeholder="Title description" style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />

        {/* Episode Row */}
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <select 
              style={{ ...inputStyle, appearance: 'none', color: episodeOption ? '#0F172A' : '#94A3B8', fontWeight: episodeOption ? 600 : 400 }}
              value={episodeOption}
              onChange={(e) => setEpisodeOption(e.target.value)}
            >
              <option value="" disabled>Select episode (optional)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <input type="text" placeholder="Episode title" style={inputStyle} />
          </div>
        </div>

        {/* Episode Description */}
        <textarea placeholder="Episode description" style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />

        {/* Upload Audio */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Upload podcast</label>
          <div style={{ border: '1.5px dashed #D4AF37', borderRadius: 12, padding: '32px', textAlign: 'center', background: '#FFFDF5', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <UploadCloud size={20} color="#FFFFFF" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Drag & Drop or choose file to upload</p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>Supported formats .mp3</p>
          </div>
        </div>

        {/* Schedule & Timer */}
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="text" placeholder="Schedule podcast post (optional)" style={inputStyle} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
            <Calendar size={16} color="#64748B" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="text" placeholder="Set timer (optional)" style={inputStyle} onFocus={(e) => e.target.type = 'time'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
            <Clock size={16} color="#64748B" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Content Rating */}
        <div style={{ position: 'relative', width: '50%' }}>
          <select 
            style={{ ...inputStyle, appearance: 'none', paddingRight: 40 }}
            value={contentRating}
            onChange={(e) => setContentRating(e.target.value)}
          >
            <option value="Suitable for everyone">Suitable for everyone</option>
            <option value="Contain adult content">Contain adult content</option>
          </select>
          <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
          <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '12px 24px' }}>
            Cancel
          </button>
          <button 
            onClick={() => setShowSuccessModal(true)}
            style={{ background: '#D4AF37', border: 'none', color: '#FFFFFF', fontSize: 14, fontWeight: 700, borderRadius: 8, padding: '12px 32px', cursor: 'pointer' }}
          >
            Post
          </button>
        </div>

      </div>

      {/* ─── RIGHT COLUMN (Promo Cards) ─── */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0 }}>
        
        {/* Ad Billboard Promo */}
        <div style={{ background: 'linear-gradient(135deg, #715C13 0%, #4D3F0C 100%)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2, width: '60%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.4 }}>
              Place your Ad on our bill board for wider reach
            </h3>
            <p style={{ fontSize: 10, color: '#E2E8F0', margin: '0 0 20px', lineHeight: 1.5, opacity: 0.8 }}>
              Discover how the Top 1% of businesses get customers from our active community.
            </p>
            <button style={{ background: '#F4F860', border: 'none', color: '#0F172A', fontSize: 11, fontWeight: 800, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', boxShadow: '0 0 12px rgba(244,248,96,0.3)' }}>
              BOOK AD SPACE
            </button>
          </div>
          {/* Decorative graphic placeholder */}
          <div style={{ position: 'absolute', right: -20, bottom: -10, width: 120, height: 140, background: '#FFFFFF', borderRadius: 12, transform: 'rotate(-10deg)', opacity: 0.9, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', padding: 6 }}>
             <img src="/billboard.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} alt="Ad Billboard" />
          </div>
        </div>

        {/* Podcast Session Promo */}
        <div style={{ background: '#1E1E1E', borderRadius: 16, padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.4 }}>
            Podcasting with Studio Arella get easier
          </h3>
          <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 24px', lineHeight: 1.5 }}>
            Book a podcast studio session right inside the application. No external messages needed.
          </p>
          <button style={{ background: '#F4F860', border: 'none', color: '#0F172A', fontSize: 11, fontWeight: 800, borderRadius: 6, padding: '8px 16px', cursor: 'pointer', boxShadow: '0 0 12px rgba(244,248,96,0.3)' }}>
            BOOK PODCAST SESSION
          </button>
        </div>

      </div>
    </div>

    {/* Success Modal Overlay */}
    {showSuccessModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '48px 32px', width: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}>
          
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #E6C245 0%, #B39223 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 0 40px 10px rgba(212, 175, 55, 0.3)' }}>
            <Check size={32} color="#0F172A" strokeWidth={3} />
          </div>
          
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 24px', fontFamily: F }}>Your podcast was a success</h3>
          
          <button 
            onClick={() => setShowSuccessModal(false)}
            style={{ background: '#D4AF37', border: 'none', color: '#FFFFFF', fontSize: 14, fontWeight: 700, borderRadius: 8, padding: '12px 48px', cursor: 'pointer', fontFamily: F }}
          >
            Finish
          </button>
        </div>
      </div>
    )}
    </DashboardLayout>
  );
}
