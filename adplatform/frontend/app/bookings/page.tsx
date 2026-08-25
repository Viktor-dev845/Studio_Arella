'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Monitor, Mic, X, ArrowLeft, UploadCloud, Copy, Check } from 'lucide-react';
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
  const [cancelSuccessOpen, setCancelSuccessOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendBy, setExtendBy] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [extendBillingModalOpen, setExtendBillingModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'billing' | 'pay_from_wallet' | 'pay_with_card' | 'success'>('billing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');

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
                            } else if (b.action === 'Extend') {
                              setSelectedAdId(b.id);
                              setExtendModalOpen(true);
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-12 pb-10 px-8 max-w-[340px] w-full mx-4 shadow-2xl flex flex-col items-center text-center">
              <h3 className="text-[15px] font-bold text-gray-900 mb-10 leading-[1.4] max-w-[240px]">
                Are you sure you want to cancel<br/>this Ad?
              </h3>
              <div className="flex items-center justify-center gap-3 w-full">
                <button 
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-[10px] border border-gray-200 bg-white text-[11px] font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button 
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelSuccessOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-[10px] bg-[#EAB308] hover:bg-[#CA8A04] text-[11px] font-bold text-gray-900 transition-colors shadow-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Success Modal */}
        {cancelSuccessOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <div className="bg-white rounded-[24px] pt-12 pb-10 px-8 max-w-[320px] w-full mx-4 shadow-2xl flex flex-col items-center text-center">
              <div className="relative mb-8 mt-2 flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-[#EAB308]/20 blur-[20px] rounded-full"></div>
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-[#A17116] to-[#714603] flex items-center justify-center shadow-lg">
                  <X className="text-[#FDE047]" size={14} strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-8">
                Ads cancelled
              </h3>
              <button 
                onClick={() => setCancelSuccessOpen(false)}
                className="w-[110px] py-2.5 rounded-[10px] bg-[#EAB308] hover:bg-[#CA8A04] text-[11px] font-bold text-gray-900 transition-colors shadow-sm"
              >
                Finish
              </button>
            </div>
          </div>
        )}

        {/* Extend Ad Booking Modal */}
        {extendModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-2">
                <button 
                  onClick={() => setExtendModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-[15px] font-bold text-gray-900">
                  Extend Ad Booking
                </h2>
                <button 
                  onClick={() => setExtendModalOpen(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-10 pt-6 space-y-6">
                {/* Extend By Input */}
                <input
                  type="text"
                  placeholder="Extend by? (e.g 2 hours, 2 weeks, 2 months)"
                  value={extendBy}
                  onChange={(e) => setExtendBy(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors"
                />

                {/* Additional Info Textarea */}
                <textarea
                  placeholder="Add any additional info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-5 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-900 placeholder:text-[#94A3B8] placeholder:font-medium focus:outline-none focus:border-gray-400 focus:ring-0 transition-colors resize-none"
                />

                {/* Upload section */}
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 mb-3 text-left">Or upload additional Ads materials</p>
                  <div className="w-full border-2 border-dashed border-[#FDE047] bg-[#FEFCE8]/20 rounded-[16px] py-10 px-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#FEFCE8]/50 transition-colors">
                    <div className="w-12 h-12 bg-[#FEF08A] rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <UploadCloud size={20} className="text-[#854D0E]" />
                    </div>
                    <p className="text-[13px] font-bold text-gray-800 mb-1.5">Drag & Drop or choose file to upload</p>
                    <p className="text-[11px] font-semibold text-gray-400">Supported formats : jpeg, png, pdf</p>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setExtendModalOpen(false);
                      setExtendBillingModalOpen(true);
                      setModalStep('billing');
                      setPaymentMethod('wallet');
                    }}
                    className="w-full py-4 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Extend Ad space
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extend Billing Modal */}
        {extendBillingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] w-full max-w-[460px] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50">
                <button 
                  onClick={() => {
                    if (modalStep === 'pay_from_wallet' || modalStep === 'pay_with_card' || modalStep === 'success') {
                      setModalStep('billing');
                    } else {
                      setExtendBillingModalOpen(false);
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
                    setExtendBillingModalOpen(false);
                    setModalStep('billing');
                  }} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              {modalStep === 'billing' ? (
                <div className="px-8 pb-10 pt-6">
                  <div className="text-center mb-8">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 months Ad space</h3>
                    <p className="text-[14px] font-bold text-gray-900">extension at #300,000</p>
                  </div>

                  <div className="space-y-4">
                    {/* Pay with card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center gap-4 px-5 py-6 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'card' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#EAB308]' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#EAB308]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">Pay with card</span>
                    </div>

                    {/* Pay from wallet */}
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col gap-2 px-5 py-5 rounded-[16px] cursor-pointer border-[1.5px] transition-colors ${paymentMethod === 'wallet' ? 'border-[#EAB308] bg-[#FEFCE8]/40' : 'border-gray-200 hover:border-gray-300'}`}
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
                          <span className="text-[11px] font-semibold text-gray-500">Wallet ID: 23cvo_23759ryi</span>
                          <button className="flex items-center gap-1 text-[10px] font-bold text-[#EAB308] hover:underline">
                            Copy <Copy size={10} />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900">NGN 5,215,005.25</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-8">
                    <button 
                      onClick={() => {
                        if (paymentMethod === 'wallet') {
                          setModalStep('pay_from_wallet');
                        } else if (paymentMethod === 'card') {
                          setModalStep('pay_with_card');
                        }
                      }}
                      className="w-full py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_with_card' ? (
                <div className="px-8 pb-12 pt-6">
                  <div className="text-center mb-8">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 months Ad space</h3>
                    <p className="text-[14px] font-bold text-gray-900">extension at #300,000</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Card holder's name" className="w-full px-5 py-4 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                    <div className="relative">
                      <input type="text" placeholder="Card number" className="w-full px-5 py-4 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <div className="w-[24px] h-[14px] bg-[#1434CB] rounded-[2px] text-[7px] font-bold flex items-center justify-center text-white italic tracking-tighter">VISA</div>
                        <div className="w-[24px] h-[14px] flex items-center justify-center relative">
                          <div className="w-[12px] h-[12px] rounded-full bg-[#EB001B] absolute left-0 mix-blend-multiply opacity-90"></div>
                          <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-0 mix-blend-multiply opacity-90"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Expiry date (MM/YY)" className="w-1/2 px-5 py-4 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                      <input type="text" placeholder="CVV" className="w-1/2 px-5 py-4 text-[13px] font-bold bg-white border border-gray-200 rounded-[14px] focus:outline-none focus:border-[#EAB308] placeholder-gray-400" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <button 
                      onClick={() => setModalStep('success')}
                      className="w-full py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ) : modalStep === 'pay_from_wallet' ? (
                <div className="px-8 pb-12 pt-6">
                  <div className="flex items-center justify-between px-6 py-8 rounded-[16px] border-[1.5px] border-[#EAB308] bg-white shadow-sm mb-6">
                    <span className="text-[13px] font-bold text-gray-900">Total amount</span>
                    <span className="text-[13px] font-bold text-gray-900">NGN 300,000.25</span>
                  </div>
                  <button 
                    onClick={() => setModalStep('success')}
                    className="w-full py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
                  >
                    Pay
                  </button>
                </div>
              ) : (
                <div className="px-8 pb-10 pt-12 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-[#FEFCE8] flex items-center justify-center mb-6 relative">
                    <div className="w-14 h-14 rounded-full bg-[#CA8A04] flex items-center justify-center relative z-10 shadow-lg">
                      <Check size={28} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#FDE047]/50 to-transparent blur-md"></div>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-8">Payment successful</h3>
                  <button 
                    onClick={() => {
                      setExtendBillingModalOpen(false);
                      setModalStep('billing');
                      setExtendBy('');
                      setAdditionalInfo('');
                    }}
                    className="w-full py-3.5 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-900 text-[13px] font-bold rounded-[12px] transition-colors shadow-sm"
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
