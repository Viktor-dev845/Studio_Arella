'use client';

import { useState } from 'react';
import { ArrowLeft, X, ChevronDown, Check } from 'lucide-react';

interface AudienceVerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  price?: string;
  billingPeriod?: string;
  onPaymentSuccess?: () => void;
}

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'OPay',
  'Moniepoint MFB',
  'Stanbic IBTC Bank',
  'Sterling Bank',
];

export default function AudienceVerifyPaymentModal({
  isOpen,
  onClose,
  planName = 'Standard',
  price = '$12',
  billingPeriod = 'monthly',
  onPaymentSuccess,
}: AudienceVerifyPaymentModalProps) {
  const [selectedBank, setSelectedBank] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [addThisCard, setAddThisCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Format Card Number (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-quicksand animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Frame 2121459663: 625px x 836px, radius 32px) ─── */}
      <div 
        className="w-full max-w-[625px] h-[836px] max-h-[96vh] bg-white rounded-[32px] pt-[32px] px-6 sm:px-[40px] pb-[40px] relative flex flex-col items-center shadow-[0px_20px_60px_rgba(0,0,0,0.2)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header: Back Arrow, Title, Close Button ─── */}
        <div className="w-full flex items-center justify-between relative h-[30px] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px] font-quicksand m-0">
            {billingPeriod === 'yearly' ? 'Yearly subscription' : 'Monthly subscription'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer"
            title="Close modal"
          >
            <X size={24} strokeWidth={2} className="text-[#344053]" />
          </button>
        </div>

        {/* ─── Subtitle: Standard/Pro monthly subscription of $12 ─── */}
        <div className="w-full text-center mt-[75px] sm:mt-[95px] px-4">
          <h3 className="text-[16px] font-bold text-[#101828] leading-[21px] font-quicksand m-0 max-w-[260px] mx-auto">
            {planName} {billingPeriod} subscription of {price}
          </h3>
        </div>

        {/* ─── Form Container (Frame 1000001032: 420px wide centered) ─── */}
        <form onSubmit={handlePay} className="w-full max-w-[420px] flex flex-col mt-[45px] sm:mt-[60px]">
          <div className="w-full flex flex-col gap-6">
            {/* 1. Select bank dropdown */}
            <div className="relative w-full">
              <div
                onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] flex items-center justify-between cursor-pointer select-none focus-within:border-[#D4AF37] transition-colors"
              >
                <span className={`text-[17px] font-light font-quicksand ${selectedBank ? 'text-[#101828]' : 'text-[rgba(162,161,168,0.8)]'}`}>
                  {selectedBank || '--- Select bank ---'}
                </span>
                <ChevronDown size={20} strokeWidth={2} className="text-[#101828]" />
              </div>

              {isBankDropdownOpen && (
                <div 
                  className="absolute left-0 right-0 top-[62px] z-30 bg-white rounded-[10px] p-2 shadow-[-4.75px_20px_30px_rgba(184,184,184,0.3)] border border-gray-100 max-h-[200px] overflow-y-auto flex flex-col gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBank(b);
                        setIsBankDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[14px] rounded-[6px] transition-colors cursor-pointer ${
                        selectedBank === b ? 'bg-[#FFFBEE] font-medium text-black' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Enter card name */}
            <div className="w-full h-[56px]">
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Enter card name"
                className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
              />
            </div>

            {/* 3. Enter card number (with Mastercard logo) */}
            <div className="relative w-full h-[56px]">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="Enter card number"
                className="w-full h-[56px] pl-4 pr-12 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
              />
              {/* Mastercard Logo: 20px x 16px */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[24px] h-[18px] bg-white border border-[#C5CDD0] rounded-[3px] flex items-center justify-center p-0.5 pointer-events-none">
                <svg className="w-4 h-3" viewBox="0 0 24 16">
                  <circle cx="8" cy="8" r="7" fill="#EB001B" />
                  <circle cx="16" cy="8" r="7" fill="#F79E1B" fillOpacity="0.85" />
                </svg>
              </div>
            </div>

            {/* 4. Expiry Date & CVV Row (Frame 1000001003) */}
            <div className="w-full flex items-center gap-5">
              {/* Expiry Date */}
              <div className="flex-1 h-[56px]">
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="Expiry date (MM/YY)"
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
                />
              </div>

              {/* CVV */}
              <div className="flex-1 h-[56px]">
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="CVV"
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
                />
              </div>
            </div>

            {/* 5. Checkbox: Add this card */}
            <div 
              onClick={() => setAddThisCard(!addThisCard)}
              className="flex items-center gap-3 cursor-pointer select-none mt-2"
            >
              <div 
                className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-colors ${
                  addThisCard 
                    ? 'bg-[#D4AF37] text-white' 
                    : 'border border-[rgba(162,161,168,0.4)] bg-white'
                }`}
              >
                {addThisCard && <Check size={14} strokeWidth={3} className="text-white" />}
              </div>
              <span className="text-[16px] text-[#696F79] font-normal font-quicksand">
                Add this card
              </span>
            </div>
          </div>

          {/* 6. Pay Button (Frame 9720: 420px x 56px, background #D4AF37, radius 6px) */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-[56px] mt-8 bg-[#D4AF37] hover:bg-[#c29f31] text-[#000000] font-medium text-[16px] rounded-[6px] flex items-center justify-center transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75 font-quicksand"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Pay'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
