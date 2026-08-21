'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ChevronDown, UploadCloud, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

export default function BookScreenAdPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [campaignType, setCampaignType] = useState('One time booking');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timer, setTimer] = useState('');

  const F = theme.font.body;

  return (
    <DashboardLayout>
      <div style={{ fontFamily: F, padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Breadcrumb & Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 32 }}>
          <Link href="/bookings" style={{ color: '#334155', textDecoration: 'none' }}>My bookings</Link>
          <span>/</span>
          <span style={{ color: '#0F172A' }}>Screen Ad</span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 32px' }}>Book Ad</h1>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          
          {/* Form Content (Left) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
            
            {/* Title / Description */}
            <textarea
              placeholder="Title Describe your Ad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%', minHeight: 120, padding: 16, borderRadius: 12,
                border: '1px solid #E2E8F0', background: '#FFFFFF',
                fontSize: 14, color: '#0F172A', outline: 'none', resize: 'vertical',
                fontFamily: F
              }}
            />

            {/* Duration & Campaign Type Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              
              {/* Duration Dropdown */}
              <div style={{ position: 'relative' }}>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    fontSize: 14, color: duration ? '#0F172A' : '#94A3B8', outline: 'none',
                    appearance: 'none', cursor: 'pointer', fontFamily: F
                  }}
                >
                  <option value="" disabled>Duration</option>
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                </select>
                <ChevronDown size={18} color="#94A3B8" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              {/* Campaign Type Dropdown */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowCampaignDropdown(!showCampaignDropdown)}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 12,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    fontSize: 14, color: '#94A3B8', outline: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: F
                  }}
                >
                  <span style={{ color: campaignType ? '#0F172A' : '#94A3B8' }}>
                    {campaignType || 'How would you run your Ad campaign?'}
                  </span>
                  <ChevronDown size={18} color="#94A3B8" />
                </div>

                {showCampaignDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', zIndex: 10, padding: 8 }}>
                    <div 
                      onClick={() => { setCampaignType('One time booking'); setShowCampaignDropdown(false); }}
                      style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontWeight: 600, cursor: 'pointer', borderRadius: 8, background: campaignType === 'One time booking' ? '#F8FAFC' : 'transparent', fontFamily: F }}
                    >
                      One time booking
                    </div>
                    <div 
                      onClick={() => { setCampaignType('Recurring booking'); setShowCampaignDropdown(false); }}
                      style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontWeight: 600, cursor: 'pointer', borderRadius: 8, background: campaignType === 'Recurring booking' ? '#F8FAFC' : 'transparent', fontFamily: F }}
                    >
                      Recurring booking
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <p style={{ fontSize: 13, color: '#334155', fontWeight: 600, margin: '0 0 12px' }}>
                Upload Ad materials (You can upload multiple files at once)
              </p>
              <div style={{ 
                border: '1px dashed #D4AF37', borderRadius: 12, padding: 40, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: '#FFFDF5', cursor: 'pointer'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <UploadCloud size={20} color="#B49020" />
                </div>
                <p style={{ fontSize: 14, color: '#B49020', fontWeight: 700, margin: '0 0 8px' }}>
                  Drag & Drop or choose file to upload
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
                  Supported formats: jpeg, png, gif
                </p>
              </div>
            </div>

            {/* Date and Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>
              {/* Delivery Timeline */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Schedule service delivery timeline"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 48px 16px 16px', borderRadius: 12,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    fontSize: 14, color: '#0F172A', outline: 'none', fontFamily: F
                  }}
                />
                <Calendar size={18} color="#0F172A" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>

              {/* Timer */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Set timer (optional)"
                  value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 48px 16px 16px', borderRadius: 12,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    fontSize: 14, color: '#0F172A', outline: 'none', fontFamily: F
                  }}
                />
                <Clock size={18} color="#0F172A" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 16 }}>
              <button style={{ 
                padding: '14px 32px', background: '#FFFFFF', border: '1px solid #E2E8F0', 
                borderRadius: 8, color: '#0F172A', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F 
              }}>
                Cancel
              </button>
              <button style={{ 
                padding: '14px 32px', background: '#D4AF37', border: 'none', 
                borderRadius: 8, color: '#0F172A', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F 
              }}>
                Book Slot
              </button>
            </div>

          </div>

          {/* Promo Card (Right) */}
          <div style={{ 
            width: 320, background: '#1A1A1A', borderRadius: 16, padding: 32, 
            display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0 
          }}>
            <p style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
              We are running Ad space promo, get a discount for more than 5months booking
            </p>
            <button style={{ 
              background: '#FDE68A', border: 'none', borderRadius: 8, padding: '14px', 
              color: '#0F172A', fontSize: 12, fontWeight: 800, cursor: 'pointer', width: '100%', fontFamily: F 
            }}>
              BOOK PODCAST SESSION
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
