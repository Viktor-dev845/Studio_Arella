'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Calendar, Clock, X, ArrowLeft, Copy, Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

export default function BookPodcastSessionPage() {
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [sessionTypeOpen, setSessionTypeOpen] = useState(false);
  const [sessionType, setSessionType] = useState('One time booking');

  // Billing Modal State
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'billing' | 'pay_from_wallet' | 'pay_with_card' | 'success'>('billing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          textarea:focus, input:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
        <div className="font-body w-full flex gap-10 p-8">
          
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
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                  <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Select time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    onFocus={(e) => (e.target.type = 'time')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                  />
                  <Clock size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                onClick={() => setBillingModalOpen(true)}
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

        {/* Billing Modal */}
        {billingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-2">
                <button 
                  onClick={() => {
                    if (modalStep !== 'billing' && modalStep !== 'success') {
                      setModalStep('billing');
                    } else {
                      setBillingModalOpen(false);
                      setModalStep('billing');
                    }
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  {modalStep === 'billing' ? 'Billing' : paymentMethod === 'card' ? 'Pay with card' : 'Pay from wallet'}
                </h2>
                <button 
                  onClick={() => {
                    setBillingModalOpen(false);
                    setModalStep('billing');
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              {modalStep === 'billing' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="text-center mb-10">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 hours studio session at</h3>
                    <p className="text-[14px] font-bold text-gray-900">₦300,000</p>
                  </div>

                  <div className="space-y-6">
                    {/* Pay with card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center gap-4 px-6 py-7 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'card' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#EAB308]' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#EAB308]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">Pay with card</span>
                    </div>

                    {/* Pay from wallet */}
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col gap-2 px-6 py-6 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'wallet' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#EAB308]' : 'border-gray-300'}`}>
                            {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-[#EAB308]" />}
                          </div>
                          <span className="text-[13px] font-bold text-gray-900">Pay from wallet</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#EAB308] hover:underline">Fund wallet</span>
                      </div>
                      
                      <div className="flex items-center justify-between pl-8 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-gray-500">Wallet ID: 234_22100A</span>
                          <button className="flex items-center gap-1 text-[10px] font-bold text-[#EAB308] hover:underline">
                            Copy <Copy size={10} />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900">NGN 5,215,000.23</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-10">
                    <button 
                      onClick={() => {
                        if (paymentMethod === 'wallet') {
                          setModalStep('pay_from_wallet');
                        } else if (paymentMethod === 'card') {
                          setModalStep('pay_with_card');
                        }
                      }}
                      className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_with_card' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="text-center mb-10">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 hours studio session at</h3>
                    <p className="text-[14px] font-bold text-gray-900">₦300,000</p>
                  </div>
                  <div className="space-y-6">
                    <input type="text" placeholder="Card holder's name" className="w-full px-5 py-5 text-[13px] font-bold text-gray-900 bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                    <div className="relative">
                      <input type="text" placeholder="Card number" maxLength={19} className="w-full px-5 py-5 text-[13px] font-bold text-gray-900 bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <div className="w-[24px] h-[14px] bg-[#1434CB] rounded-[2px] text-[7px] font-bold flex items-center justify-center text-white italic tracking-tighter">VISA</div>
                        <div className="w-[24px] h-[14px] flex items-center justify-center relative">
                          <div className="w-[12px] h-[12px] rounded-full bg-[#EB001B] absolute left-0 mix-blend-multiply opacity-90"></div>
                          <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-0 mix-blend-multiply opacity-90"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Expiry date (MM/YY)" maxLength={5} className="w-1/2 px-5 py-5 text-[13px] font-bold text-gray-900 bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                      <input type="text" placeholder="CVV" maxLength={4} className="w-1/2 px-5 py-5 text-[13px] font-bold text-gray-900 bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                    </div>
                  </div>
                  <div className="mt-10">
                    <button 
                      onClick={() => setModalStep('success')}
                      className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_from_wallet' ? (
                <div className="px-10 pb-16 pt-8">
                  <div className="flex items-center justify-between px-6 py-10 rounded-[16px] border-[1.5px] border-[#EAB308] bg-white shadow-sm mb-8">
                    <span className="text-[13px] font-bold text-gray-900">Total amount</span>
                    <span className="text-[13px] font-bold text-gray-900">NGN 300,000.25</span>
                  </div>
                  <button 
                    onClick={() => setModalStep('success')}
                    className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Pay
                  </button>
                </div>
              ) : (
                <div className="px-10 pb-12 pt-14 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-[#FEFCE8] flex items-center justify-center mb-8 relative">
                    <div className="w-14 h-14 rounded-full bg-[#CA8A04] flex items-center justify-center relative z-10 shadow-lg">
                      <Check size={28} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#FDE047]/50 to-transparent blur-md"></div>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-10">Payment successful</h3>
                  <button 
                    onClick={() => {
                      setBillingModalOpen(false);
                      setModalStep('billing');
                    }}
                    className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
