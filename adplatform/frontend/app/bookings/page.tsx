'use client';

import { useState } from 'react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Monitor, Mic, Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const F = theme.font.body;

const BOOKINGS_DATA = [
  { id: 1, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Active', action: 'Extend' },
  { id: 2, campaign: 'Bemsoft Bulletin Highway', date: '18-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Cancel' },
  { id: 3, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '2 hours', status: 'Ended', action: 'Send a review' },
  { id: 4, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Cancelled', action: 'Book a slot' },
  { id: 5, campaign: 'Bemsoft Bulletin Highway', date: '18-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 6, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 7, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 8, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 9, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 10, campaign: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10B981'; // Green
    case 'Pending': return '#94A3B8'; // Grey
    case 'Ended': return '#94A3B8'; // Grey
    case 'Cancelled': return '#94A3B8'; // Grey
    default: return '#0F172A';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'Extend': return '#D4AF37'; // Gold
    case 'Cancel': return '#EF4444'; // Red
    case 'Send a review': return '#3B82F6'; // Blue
    case 'Book a slot': return '#10B981'; // Green
    default: return '#0F172A';
  }
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'screen' | 'podcast'>('screen');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState(true);
  const [filterDuration, setFilterDuration] = useState(false);

  return (
    <DashboardLayout>
      <div style={{ fontFamily: F, padding: '32px 40px', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Title */}
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>My bookings</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #E2E8F0' }}>
          <button 
            onClick={() => setActiveTab('screen')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              background: 'none', border: 'none', 
              borderBottom: activeTab === 'screen' ? '2px solid #D4AF37' : '2px solid transparent',
              padding: '0 0 12px 0', 
              color: activeTab === 'screen' ? '#D4AF37' : '#64748B', 
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Monitor size={18} /> Screen Ads
          </button>
          <button 
            onClick={() => setActiveTab('podcast')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              background: 'none', border: 'none', 
              borderBottom: activeTab === 'podcast' ? '2px solid #D4AF37' : '2px solid transparent',
              padding: '0 0 12px 0', 
              color: activeTab === 'podcast' ? '#D4AF37' : '#64748B', 
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Mic size={18} /> Podcast studio
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>All bookings</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Search Box */}
              <div style={{ position: 'relative', width: 240 }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  placeholder="Search" 
                  style={{ 
                    width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', 
                    borderRadius: 8, padding: '10px 16px 10px 36px', 
                    fontSize: 13, color: '#0F172A', outline: 'none', fontFamily: F 
                  }}
                />
              </div>

              {/* Filter Button */}
              <button 
                onClick={() => setShowFilterModal(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, 
                  background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, 
                  padding: '10px 16px', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' 
                }}
              >
                <Filter size={14} /> Filter
              </button>

              {/* Book Ad Slot Button */}
              <Link href="/bookings/screen-ad" style={{ 
                background: '#D4AF37', border: 'none', borderRadius: 8, 
                padding: '10px 24px', color: '#0F172A', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
              }}>
                Book Ad Slot
              </Link>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Campaign info</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Schedule</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Billing (NGN)</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Duration</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {BOOKINGS_DATA.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{row.campaign}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 500, color: '#334155' }}>
                      {row.date} 
                      {row.reschedule && <span style={{ color: '#D4AF37', marginLeft: 8, fontSize: 11, fontStyle: 'italic', fontWeight: 600 }}>Reschedule</span>}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{row.billing}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 500, color: '#334155' }}>{row.duration}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: getStatusColor(row.status) }}>{row.status}</td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: getActionColor(row.action), cursor: 'pointer' }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Showing 
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', color: '#0F172A', cursor: 'pointer' }}>
                10 <ChevronDown size={14} />
              </button>
            </div>
            
            <div>Showing 1 to 10 out of 60 records</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: 4 }}><ChevronLeft size={14} /></button>
              <button style={{ background: '#FFFFFF', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}>1</button>
              <button style={{ background: 'none', border: 'none', color: '#0F172A', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}>2</button>
              <button style={{ background: 'none', border: 'none', color: '#0F172A', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}>3</button>
              <button style={{ background: 'none', border: 'none', color: '#0F172A', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700 }}>4</button>
              <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: 4 }}><ChevronRight size={14} /></button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Modal Overlay */}
      {showFilterModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Backdrop */}
          <div 
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }} 
            onClick={() => setShowFilterModal(false)}
          />
          
          {/* Modal Box */}
          <div style={{ position: 'relative', width: 340, background: '#FFFFFF', borderRadius: 16, padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: F }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>Filter</h2>
            
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                placeholder="Search Employee" 
                style={{ 
                  width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', 
                  borderRadius: 8, padding: '10px 16px 10px 36px', 
                  fontSize: 13, color: '#0F172A', outline: 'none', fontFamily: F 
                }}
              />
            </div>

            <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>All Ad bookings</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <input type="checkbox" checked={filterStatus} onChange={(e) => setFilterStatus(e.target.checked)} style={{ accentColor: '#D4AF37', width: 16, height: 16, cursor: 'pointer' }} />
                Status
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <input type="checkbox" checked={filterDuration} onChange={(e) => setFilterDuration(e.target.checked)} style={{ accentColor: '#D4AF37', width: 16, height: 16, cursor: 'pointer' }} />
                By duration
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ flex: 1, padding: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#0F172A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{ flex: 1, padding: '12px', background: '#D4AF37', border: 'none', borderRadius: 8, color: '#0F172A', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
