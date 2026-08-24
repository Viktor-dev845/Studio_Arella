'use client';

import { useState } from 'react';
import { UploadCloud, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

export default function BookScreenAdPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [timeline, setTimeline] = useState('');
  const [timer, setTimer] = useState('');
  const [hasRequestedCreative, setHasRequestedCreative] = useState(false);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="w-full font-body pt-4 lg:pl-4 lg:pr-8">
          <div className="mb-10">
            <h1 className="text-[17px] font-bold text-gray-900">Book Ad</h1>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24">
            {/* Form Section */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Title / Description */}
              <div>
                <textarea
                  placeholder="Describe your Ad"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors resize-none"
                />
              </div>

              {/* Dropdowns row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 appearance-none focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                    style={{ color: duration ? '#111827' : '#94A3B8', fontWeight: duration ? 700 : 500 }}
                  >
                    <option value="" disabled style={{ fontWeight: 700 }}>Duration</option>
                    <option value="hourly" style={{ fontWeight: 700 }} className="text-gray-900">Hourly</option>
                    <option value="weekly" style={{ fontWeight: 700 }} className="text-gray-900">Weekly</option>
                    <option value="monthly" style={{ fontWeight: 700 }} className="text-gray-900">Monthly</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 appearance-none focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                    style={{ color: campaignType ? '#111827' : '#94A3B8', fontWeight: campaignType ? 700 : 500 }}
                  >
                    <option value="" disabled style={{ fontWeight: 700 }}>How would you run your Ad campaign?</option>
                    <option value="one_time" style={{ fontWeight: 700 }} className="text-gray-900">One time booking</option>
                    <option value="recurring" style={{ fontWeight: 700 }} className="text-gray-900">Recurring booking</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Upload Materials */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Upload Ad materials <span className="text-gray-400 font-semibold ml-1">(You can upload multiple files at once)</span>
                </label>
                <div className="w-full border-2 border-dashed border-[#FDE047] bg-[#FEFCE8]/40 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FEFCE8]/70 transition-colors">
                  <div className="w-12 h-12 bg-[#FEF08A] rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={20} className="text-[#854D0E]" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">Drag & Drop or choose file to upload</p>
                  <p className="text-[11px] font-semibold text-gray-400">Supported formats : jpeg, png, pdf</p>
                </div>

                {/* Creative Request Toggle */}
                <div className="mt-4 text-[13px] font-medium text-gray-700">
                  {!hasRequestedCreative ? (
                    <p>
                      Don't have Ad materials yet?{' '}
                      <button 
                        onClick={() => setHasRequestedCreative(true)}
                        className="text-[#EAB308] font-semibold hover:underline"
                      >
                        Request Ad creative services
                      </button>
                    </p>
                  ) : (
                    <p>
                      Ad banner design on request?{' '}
                      <button className="text-[#EAB308] font-semibold hover:underline mr-2">Change</button>
                      <button 
                        onClick={() => setHasRequestedCreative(false)}
                        className="text-[#EF4444] font-semibold hover:underline"
                      >
                        Cancel
                      </button>
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline & Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Schedule service delivery timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full pr-11 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Set timer (optional)"
                    value={timer}
                    onChange={(e) => setTimer(e.target.value)}
                    className="w-full pr-11 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="px-10 py-2.5 rounded-lg text-sm font-bold text-gray-900 bg-[#EAB308] hover:bg-[#CA8A04] transition-colors shadow-sm">
                  Book Slot
                </button>
              </div>

            </div>

            {/* Promo Card Right Sidebar */}
            <div className="w-full lg:w-[280px] shrink-0 pt-1">
              <div className="bg-[#191919] rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
                <p className="text-[13px] font-bold leading-normal text-white">
                  We are running Ad space promo, get a discount for more than 5months booking
                </p>
                <button className="w-full py-3 bg-[#FCE365] rounded-xl text-[11px] font-bold uppercase tracking-wider text-[#1C1917] hover:bg-[#FACC15] transition-colors">
                  BOOK PODCAST SESSION
                </button>
              </div>
            </div>

          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
