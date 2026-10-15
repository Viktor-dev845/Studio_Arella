'use client';

import { useState } from 'react';
import { ArrowLeft, X, ChevronDown, Check } from 'lucide-react';

interface AudiencePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  itemDescription?: string;
  amount?: string;
  onPaymentSuccess?: () => void;
}

export default function AudiencePaymentModal({
  isOpen,
  onClose,
  onBack,
  title = 'Pay with a new card',
  itemDescription = '3 months Ad space at',
  amount = '₦300,000',
  onPaymentSuccess,
}: AudiencePaymentModalProps) {
  const [selectedBank, setSelectedBank] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-['DM_Sans',sans-serif] animate-in fade-in duration-200">
      {/* ─── Modal Container (Frame 2121459681: 625px x 836px, radius 32px) ─── */}
      <div 
        className="w-full max-w-[625px] min-h-[680px] md:h-[836px] bg-white rounded-[32px] p-6 sm:p-10 relative flex flex-col justify-between shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right ─── */}
        <div className="flex items-center justify-between w-full pt-1">
          <button
            type="button"
            onClick={onBack || onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#101828] text-center">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer"
            title="Close modal"
          >
            <X size={24} strokeWidth={2.5} className="text-[#344053]" />
          </button>
        </div>

        {/* ─── Center Content Area: Form ─── */}
        <form onSubmit={handlePay} className="flex flex-col items-center flex-1 justify-center max-w-[468px] w-full mx-auto my-4 sm:my-6">
          {/* Header Amount Info */}
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-[16px] font-bold text-[#101828] leading-[22px]">
              {itemDescription}
            </p>
            <p className="text-[16px] font-bold text-[#101828] leading-[22px]">
              {amount}
            </p>
          </div>

          {/* Form Fields: gap 4 */}
          <div className="w-full flex flex-col gap-3.5 sm:gap-4">
            {/* 1. Select Bank Dropdown */}
            <div className="relative w-full">
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full h-[52px] sm:h-[56px] px-4 bg-white border border-[#D7D7D7] rounded-[10px] text-[15px] text-gray-800 outline-none appearance-none cursor-pointer focus:border-[#D4AF37]"
              >
                <option value="">--- Select bank ---</option>
                <option value="access">Access Bank</option>
                <option value="gtb">Guaranty Trust Bank (GTB)</option>
                <option value="zenith">Zenith Bank</option>
                <option value="firstbank">First Bank of Nigeria</option>
                <option value="uba">United Bank for Africa (UBA)</option>
                <option value="kuda">Kuda Microfinance Bank</option>
                <option value="opay">OPay</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown size={20} />
              </div>
            </div>

            {/* 2. Enter Card Name */}
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Enter card name"
              className="w-full h-[52px] sm:h-[56px] px-4 bg-white border border-[#D7D7D7] rounded-[10px] text-[15px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]"
            />

            {/* 3. Enter Card Number with Mastercard Logo */}
            <div className="relative w-full">
              <input
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setCardNumber(val);
                }}
                placeholder="Enter card number"
                className="w-full h-[52px] sm:h-[56px] pl-4 pr-14 bg-white border border-[#D7D7D7] rounded-[10px] text-[15px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]"
              />
              {/* Mastercard overlapping circles icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-[18px] h-[18px] rounded-full bg-[#EB001B]" />
                <div className="w-[18px] h-[18px] rounded-full bg-[#F79E1B] -ml-2 opacity-90" />
              </div>
            </div>

            {/* 4. Expiry Date & CVV Row */}
            <div className="w-full grid grid-cols-2 gap-3.5">
              <input
                type="text"
                required
                maxLength={5}
                value={expiryDate}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                  setExpiryDate(v);
                }}
                placeholder="Expiry date (MM/YY)"
                className="w-full h-[52px] sm:h-[56px] px-4 bg-white border border-[#D7D7D7] rounded-[10px] text-[15px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]"
              />
              <input
                type="password"
                required
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="CVV"
                className="w-full h-[52px] sm:h-[56px] px-4 bg-white border border-[#D7D7D7] rounded-[10px] text-[15px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* 5. Checkbox: Add this card */}
            <label 
              onClick={() => setSaveCard(!saveCard)}
              className="flex items-center gap-2.5 pt-1 cursor-pointer select-none group w-fit"
            >
              <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all ${
                saveCard ? 'bg-[#D4AF37] text-white shadow-xs' : 'border border-[#D7D7D7] group-hover:border-black'
              }`}>
                {saveCard && <Check size={13} strokeWidth={3} />}
              </div>
              <span className="text-[14px] text-gray-600 group-hover:text-black transition-colors">
                Add this card
              </span>
            </label>
          </div>

          {/* 6. Pay Action Button (468px x 56px, background #D4AF37) */}
          <div className="w-full mt-8 sm:mt-12">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black rounded-[6px] text-[16px] font-medium leading-[21px] transition-all shadow-sm active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-75"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isSuccess ? (
                'Payment Confirmed!'
              ) : (
                'Pay'
              )}
            </button>
          </div>
        </form>

        {/* Empty bottom space */}
        <div className="h-2" />
      </div>
    </div>
  );
}
