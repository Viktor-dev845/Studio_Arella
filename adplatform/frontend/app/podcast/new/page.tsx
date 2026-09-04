'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Calendar, Clock, X, ArrowLeft, Copy, Check, Globe } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  // Card Input State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCopyWalletId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('23cvo_23759ryi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formattedValue.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiryDate(value.substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').substring(0, 4));
  };

  const cardType = (() => {
    const num = cardNumber.replace(/\D/g, '');
    if (num.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^50|^6/.test(num)) return 'verve';
    return null;
  })();

  const resetModals = () => {
    setBillingModalOpen(false);
    setModalStep('billing');
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <style>{`
          textarea:focus, input:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
        
        <div className="font-body w-full min-h-[calc(100vh-64px)] p-6 sm:p-10 relative flex flex-col justify-between">
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-10 max-w-[1240px] items-start">
            
            {/* Left Column (Form) */}
            <div className="flex-1 w-full min-w-0 bg-white rounded-[24px] p-6 sm:p-10 border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-8">
              
              {/* Header */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/bookings" 
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-900 font-semibold text-[13px] transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </Link>
                <h1 className="text-[16px] font-bold text-gray-900 ml-1">Book podcast slot</h1>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                {/* Description Textarea */}
                <textarea
                  placeholder="Describe your session"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[16px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] focus:border-[#C69A2C] transition-colors min-h-[160px] resize-y"
                />

                {/* Duration & Session Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter studio duration (e.g 2 hours)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] focus:border-[#C69A2C] transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setSessionTypeOpen(!sessionTypeOpen)}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[14px] text-[13px] font-medium text-left flex items-center justify-between focus:border-[#C69A2C] transition-colors"
                    >
                      <span className={sessionType ? 'text-gray-900 font-medium' : 'text-[#94A3B8]'}>
                        {sessionType || 'How would you run your studio session?'}
                      </span>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {sessionTypeOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] rounded-[14px] py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                        {['One time booking', 'Recurring booking'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => { setSessionType(option); setSessionTypeOpen(false); }}
                            className="w-full px-5 py-2.5 text-left text-[13px] font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-between transition-colors"
                          >
                            <span>{option}</span>
                            {sessionType === option && (
                              <div className="h-3.5 w-[3px] bg-[#C69A2C] rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Schedule a date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] focus:border-[#C69A2C] transition-colors"
                    />
                    <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      onFocus={(e) => (e.target.type = 'time')}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      className="w-full px-5 py-4 pr-12 bg-white border border-gray-200 rounded-[14px] text-[13px] font-medium text-gray-900 placeholder:text-[#94A3B8] focus:border-[#C69A2C] transition-colors"
                    />
                    <Clock size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button 
                  type="button"
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-[12px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setModalStep('billing');
                    setBillingModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[12px] transition-all shadow-sm"
                >
                  Book Slot
                </button>
              </div>
              
            </div>

            {/* Right Column (Promo Banner) */}
            <div className="w-full lg:w-[320px] flex-shrink-0">
              <div className="bg-[#18181B] rounded-[24px] p-7 shadow-xl flex flex-col justify-between min-h-[160px]">
                <p className="text-[14px] font-semibold text-white/90 leading-[1.6] mb-6">
                  we are running Ad space promo, get a discount for more than 3months booking
                </p>
                <button 
                  type="button"
                  className="bg-[#F4F860] hover:bg-[#e4ec30] text-[#0F172A] text-[11px] font-black tracking-wider uppercase rounded-lg py-2.5 px-5 transition-colors w-fit shadow-sm"
                >
                  BOOK PODCAST SESSION
                </button>
              </div>
            </div>

          </div>

          {/* Floating Widget: Book with Arella */}
          <div className="fixed bottom-8 right-8 z-30">
            <button
              type="button"
              onClick={() => {
                setModalStep('billing');
                setBillingModalOpen(true);
              }}
              className="bg-white hover:bg-gray-50 text-[#0F172A] border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all hover:shadow-lg"
            >
              <span>Book with Arella</span>
              <span className="text-[15px]">🌐</span>
            </button>
          </div>
        </div>

        {/* ─── MODAL OVERLAY ─── */}
        {billingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-[28px] w-full max-w-[480px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-2">
                <button 
                  type="button"
                  onClick={() => {
                    if (modalStep === 'pay_from_wallet' || modalStep === 'pay_with_card') {
                      setModalStep('billing');
                    } else {
                      resetModals();
                    }
                  }} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>

                <h2 className="text-[15px] font-bold text-gray-900">
                  {modalStep === 'billing' ? 'Billing' : 'Pay from wallet'}
                </h2>

                <button 
                  type="button"
                  onClick={resetModals} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ─── STEP 1: BILLING (Frame 2121459606) ─── */}
              {modalStep === 'billing' && (
                <div className="px-7 sm:px-8 pb-8 pt-4">
                  {/* Session Title & Amount */}
                  <div className="text-center my-6">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 hours studio session at</h3>
                    <p className="text-[15px] font-black text-gray-900">#300,000</p>
                  </div>

                  <div className="space-y-4">
                    {/* Pay with card */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center gap-3.5 px-5 py-4 rounded-[16px] cursor-pointer border transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-[#C69A2C] bg-white' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-[#C69A2C]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#C69A2C]" />}
                      </div>
                      <span className="text-[13px] font-bold text-gray-900">Pay with card</span>
                    </div>

                    {/* Pay from wallet (Selected as in Figma) */}
                    <div 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col gap-2 px-5 py-4 rounded-[16px] cursor-pointer border-[1.5px] transition-all ${
                        paymentMethod === 'wallet' 
                          ? 'border-[#C69A2C] bg-white' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {/* Top Row: Radio + Title + Fund wallet */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                            paymentMethod === 'wallet' ? 'border-[#C69A2C]' : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'wallet' && <div className="w-2 h-2 rounded-full bg-[#C69A2C]" />}
                          </div>
                          <span className="text-[13px] font-bold text-gray-900">Pay from wallet</span>
                        </div>
                        <span className="text-[12px] font-bold text-[#C69A2C] hover:underline">
                          Fund wallet
                        </span>
                      </div>
                      
                      {/* Bottom Row: Wallet ID + Balance */}
                      <div className="flex items-center justify-between pl-[30px] pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <span>Wallet ID: 23cvo_23759ryi</span>
                          <button 
                            type="button"
                            onClick={handleCopyWalletId}
                            className="flex items-center gap-0.5 text-[11px] font-bold text-[#C69A2C] hover:underline ml-1"
                          >
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                            <Copy size={11} />
                          </button>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900">NGN 5,215,005.25</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-8">
                    <button 
                      type="button"
                      onClick={() => {
                        if (paymentMethod === 'wallet') {
                          setModalStep('pay_from_wallet');
                        } else {
                          setModalStep('pay_with_card');
                        }
                      }}
                      className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: PAY FROM WALLET (Frames 2121459610 & 2121459611) ─── */}
              {modalStep === 'pay_from_wallet' && (
                <div className="px-7 sm:px-8 pb-8 pt-6">
                  {/* Amount Card with Golden Border */}
                  <div className="flex items-center justify-between px-6 py-6 rounded-[18px] border-[1.5px] border-[#C69A2C] bg-white mb-6">
                    <span className="text-[13px] font-medium text-gray-800">Total amount</span>
                    <span className="text-[13px] font-bold text-gray-900">NGN 300,000.25</span>
                  </div>

                  {/* Pay Button */}
                  <button 
                    type="button"
                    onClick={() => setModalStep('success')}
                    className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                  >
                    Pay
                  </button>
                </div>
              )}

              {/* ─── OPTIONAL CARD PAYMENT FORM ─── */}
              {modalStep === 'pay_with_card' && (
                <div className="px-7 sm:px-8 pb-8 pt-4">
                  <div className="text-center my-4">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">3 hours studio session at</h3>
                    <p className="text-[15px] font-black text-gray-900">#300,000</p>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Card holder's name" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-4 py-3 text-[13px] font-medium text-gray-900 bg-white border border-gray-200 rounded-[12px] focus:outline-none focus:border-[#C69A2C]" 
                    />
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Card number" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-3 text-[13px] font-medium text-gray-900 bg-white border border-gray-200 rounded-[12px] focus:outline-none focus:border-[#C69A2C]" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {cardType === 'visa' || !cardType ? (
                          <div className="w-[24px] h-[14px] bg-[#1434CB] rounded-[2px] text-[7px] font-bold flex items-center justify-center text-white italic tracking-tighter">VISA</div>
                        ) : null}
                        {cardType === 'mastercard' || !cardType ? (
                          <div className="w-[24px] h-[14px] flex items-center justify-center relative">
                            <div className="w-[12px] h-[12px] rounded-full bg-[#EB001B] absolute left-0 mix-blend-multiply opacity-90"></div>
                            <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-0 mix-blend-multiply opacity-90"></div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="w-1/2 px-4 py-3 text-[13px] font-medium text-gray-900 bg-white border border-gray-200 rounded-[12px] focus:outline-none focus:border-[#C69A2C]" 
                      />
                      <input 
                        type="text" 
                        placeholder="CVV" 
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-1/2 px-4 py-3 text-[13px] font-medium text-gray-900 bg-white border border-gray-200 rounded-[12px] focus:outline-none focus:border-[#C69A2C]" 
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button 
                      type="button"
                      onClick={() => setModalStep('success')}
                      className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: PAYMENT SUCCESSFUL (Frame 2121459612) ─── */}
              {modalStep === 'success' && (
                <div className="px-7 sm:px-8 pb-8 pt-8 flex flex-col items-center">
                  {/* Golden Glow Aura & Checkmark Badge */}
                  <div className="relative flex items-center justify-center w-36 h-36 mb-4">
                    <div className="absolute inset-0 bg-[#C69A2C]/25 blur-2xl rounded-full"></div>
                    <div className="relative w-[64px] h-[64px] bg-[#9E7B21] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(158,123,33,0.35)]">
                      <Check size={30} className="text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[17px] font-bold text-gray-900 mb-8">Payment successful</h3>

                  {/* Finish Button */}
                  <button 
                    type="button"
                    onClick={resetModals}
                    className="w-full py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[14px] font-bold rounded-[14px] transition-colors shadow-sm"
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
