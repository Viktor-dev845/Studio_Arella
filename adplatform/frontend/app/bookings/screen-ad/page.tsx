'use client';

import { useState } from 'react';
import { UploadCloud, Calendar, Clock, X, ArrowLeft, Copy } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

export default function BookScreenAdPage() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [timeline, setTimeline] = useState('');
  const [timer, setTimer] = useState('');
  const [hasRequestedCreative, setHasRequestedCreative] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [modalStep, setModalStep] = useState<'billing' | 'pay_from_wallet'>('billing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');

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
                <button 
                  onClick={() => setShowBillingModal(true)}
                  className="px-10 py-2.5 rounded-lg text-sm font-bold text-gray-900 bg-[#EAB308] hover:bg-[#CA8A04] transition-colors shadow-sm"
                >
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

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-[540px] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <button 
                onClick={() => {
                  if (modalStep === 'pay_from_wallet') {
                    setModalStep('billing');
                  } else {
                    setShowBillingModal(false);
                    setModalStep('billing');
                  }
                }} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-[17px] font-bold text-gray-900">
                {modalStep === 'billing' ? 'Billing' : 'Pay from wallet'}
              </h2>
              <button 
                onClick={() => {
                  setShowBillingModal(false);
                  setModalStep('billing');
                }} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {modalStep === 'billing' ? (
              <div className="px-12 pb-12 pt-2">
                <div className="text-center mb-12">
                  <h3 className="text-[15px] font-bold text-gray-900">3 months Ad space at</h3>
                  <p className="text-[15px] font-bold text-gray-900">#300,000</p>
                </div>

                <div className="space-y-6">
                  {/* Pay with card */}
                  <div 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-4 px-6 py-9 rounded-2xl cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'card' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#EAB308]' : 'border-gray-300'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Pay with card</span>
                  </div>

                  {/* Pay from wallet */}
                  <div 
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex flex-col gap-2 px-6 py-7 rounded-2xl cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'wallet' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[#EAB308]' : 'border-gray-300'}`}>
                          {paymentMethod === 'wallet' && <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Pay from wallet</span>
                      </div>
                      <span className="text-[13px] font-bold text-[#EAB308] hover:underline">Fund wallet</span>
                    </div>
                    
                    <div className="flex items-center justify-between pl-9 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-gray-500">Wallet ID: 23cvo_23759ryi</span>
                        <button className="flex items-center gap-1 text-[11px] font-bold text-[#EAB308] hover:underline">
                          Copy <Copy size={11} />
                        </button>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">NGN 5,215,005.25</span>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="mt-10">
                  <button 
                    onClick={() => {
                      if (paymentMethod === 'wallet') {
                        setModalStep('pay_from_wallet');
                      }
                    }}
                    className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-sm font-bold rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-12 pb-24 pt-8">
                <div className="flex items-center justify-between px-8 py-10 rounded-2xl border-[1.5px] border-[#EAB308] bg-white shadow-sm mb-6">
                  <span className="text-sm font-bold text-gray-900">Total amount</span>
                  <span className="text-sm font-bold text-gray-900">NGN 300,000.25</span>
                </div>
                <button className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-sm font-bold rounded-xl transition-colors">
                  Pay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
