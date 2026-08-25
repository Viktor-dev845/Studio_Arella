'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Monitor, Mic } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

// Mock data based on the screenshot provided
const mockBookings = [
  { id: 1, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Active', action: 'Extend' },
  { id: 2, info: 'Bemsoft Bulletin Highway', date: '18-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Cancel' },
  { id: 3, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '2 hours', status: 'Ended', action: 'Send a review' },
  { id: 4, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: false, billing: '200,000', duration: '1 month', status: 'Cancelled', action: 'Book a slot' },
  { id: 5, info: 'Bemsoft Bulletin Highway', date: '18-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 6, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 7, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 8, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
  { id: 9, info: 'Bemsoft Bulletin Highway', date: '16-08-2026 12PM', reschedule: true, billing: '200,000', duration: '1 month', status: 'Pending', action: 'Extend' },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('screen');
  const [search, setSearch] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="font-body max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">My bookings</h1>
            
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('screen')}
                className={`flex items-center gap-2 pb-3 text-[13px] font-bold transition-colors relative ${
                  activeTab === 'screen' ? 'text-[#EAB308]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Monitor size={16} />
                Screen Ads
                {activeTab === 'screen' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EAB308] rounded-t-full" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('podcast')}
                className={`flex items-center gap-2 pb-3 text-[13px] font-bold transition-colors relative ${
                  activeTab === 'podcast' ? 'text-[#EAB308]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Mic size={16} />
                Podcast studio
                {activeTab === 'podcast' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EAB308] rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-bold text-gray-900">All bookings</h2>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Filter */}
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter size={14} />
                Filter
              </button>

              {/* Book Ad Slot */}
              <Link
                href="/bookings/screen-ad"
                className="flex items-center justify-center px-6 py-2.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                Book Ad Slot
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    {['CAMPAIGN INFO', 'SCHEDULE', 'BILLING (NGN)', 'DURATION', 'STATUS', 'ACTION'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.map((b, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{b.info}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-2">
                          {b.date}
                          {b.reschedule && <span className="text-[10px] text-[#EAB308] font-bold italic">Reschedule</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-gray-700">{b.billing}</td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-gray-500">{b.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${
                          b.status === 'Active' ? 'text-green-600' :
                          b.status === 'Pending' ? 'text-gray-400' :
                          b.status === 'Ended' ? 'text-gray-400' :
                          b.status === 'Cancelled' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            if (b.action === 'Cancel') {
                              setSelectedAdId(b.id);
                              setCancelModalOpen(true);
                            }
                          }}
                          className={`text-xs font-bold transition-colors ${
                          b.action === 'Extend' ? 'text-[#EAB308] hover:text-[#CA8A04]' :
                          b.action === 'Cancel' ? 'text-red-500 hover:text-red-600' :
                          b.action === 'Send a review' ? 'text-blue-500 hover:text-blue-600' :
                          b.action === 'Book a slot' ? 'text-green-600 hover:text-green-700' : 'text-gray-600'
                        }`}>
                          {b.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] p-8 max-w-[340px] w-full mx-4 shadow-xl flex flex-col items-center text-center">
              <h3 className="text-[15px] font-bold text-gray-900 mb-8 max-w-[200px] leading-snug">
                Are you sure you want to cancel this Ad?
              </h3>
              <div className="flex items-center gap-4 w-full">
                <button 
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    // TODO: handle cancel ad
                    setCancelModalOpen(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-[13px] font-bold text-gray-900 transition-colors shadow-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
