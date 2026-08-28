'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

export default function BookPodcastSessionPage() {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [sessionTypeOpen, setSessionTypeOpen] = useState(false);
  const [sessionType, setSessionType] = useState('One time booking');

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          textarea:focus, input:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
        <div className="font-body max-w-7xl mx-auto flex gap-10">
          
          {/* Left Column (Form) */}
          <div className="flex-1 min-w-0 bg-white rounded-[32px] p-10 shadow-sm border border-gray-50 flex flex-col gap-10">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <Link href="/bookings" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-[13px] transition-colors">
                <ChevronLeft size={16} /> Back
              </Link>
              <h1 className="text-[16px] font-bold text-gray-900 ml-2">Book podcast slot</h1>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-6">
              <textarea
                placeholder="Describe your session"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-5 bg-white border border-gray-200 rounded-[16px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors min-h-[160px] resize-y"
              />

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter studio duration (e.g 2 hours)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                </div>
                
                <div className="flex-1 relative">
                  <button 
                    onClick={() => setSessionTypeOpen(!sessionTypeOpen)}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 text-left flex items-center justify-between focus:outline-none focus:border-gray-400 transition-colors"
                  >
                    <span className={sessionType ? 'text-gray-900' : 'text-[#94A3B8] font-medium'}>
                      {sessionType || 'How would you run your studio session?'}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </button>
                  
                  {sessionTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-[16px] py-3 z-20 animate-in fade-in zoom-in-95 duration-100">
                      {['One time booking', 'Recurring booking'].map((option) => (
                        <button
                          key={option}
                          onClick={() => { setSessionType(option); setSessionTypeOpen(false); }}
                          className="w-full px-6 py-3 text-left text-[13px] font-bold text-gray-900 hover:bg-gray-50 flex items-center justify-between transition-colors"
                        >
                          {option}
                          {sessionType === option && (
                            <div className="h-4 w-[3px] bg-[#EAB308] rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Schedule a date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                  <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Select time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 mt-6">
              <button 
                className="px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors"
              >
                Cancel
              </button>
              <button 
                className="px-8 py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
              >
                Book Slot
              </button>
            </div>
            
          </div>

          {/* Right Column (Promo) */}
          <div className="w-[320px] flex-shrink-0 pt-[72px]">
            <div className="bg-[#1A1A1A] rounded-[24px] p-8 shadow-xl">
              <h3 className="text-[15px] font-bold text-white leading-[1.6] mb-8">
                we are running Ad space promo. get a discount for more than 3months booking
              </h3>
              <button className="bg-[#F4F860] hover:bg-[#e4ec30] text-[#0F172A] text-[10px] font-extrabold tracking-wider uppercase rounded-lg py-3 px-6 transition-colors w-fit">
                BOOK PODCAST SESSION
              </button>
            </div>
          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
