'use client';

import { useState } from 'react';
import { ArrowLeft, X, ChevronDown, Check } from 'lucide-react';
import AudienceSubscriptionSuccessModal from './AudienceSubscriptionSuccessModal';

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
  itemDescription = 'Monthly subscription at',
  amount = '#1,000',
  onPaymentSuccess,
}: AudiencePaymentModalProps) {
  const [selectedBank, setSelectedBank] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 900);
  };

  const handleFinishSuccess = () => {
    setShowSuccessModal(false);
    if (onPaymentSuccess) onPaymentSuccess();
    onClose();
  };

  return (
    <>
      {/* ─── Backdrop: Background blur 20px, #A2A1A8 20% overlay (Figma Specs) ─── */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[20px] font-quicksand animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* ─── Modal Container (Frame 2121459695: 625px x 836px, radius 32px) ─── */}
        <div 
          className="w-full max-w-[625px] h-[836px] max-h-[95vh] bg-white rounded-[32px] pt-[32px] px-6 sm:px-[40px] pb-[32px] relative flex flex-col shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right (top: 32px) ─── */}
          <div className="flex items-center justify-between w-full h-[30px] relative shrink-0">
            <button
              type="button"
              onClick={onBack || onClose}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
            </button>

            <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px] font-quicksand m-0">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer"
              title="Close modal"
            >
              <X size={24} strokeWidth={2.5} className="text-[#344053]" />
            </button>
          </div>

          {/* ─── Header Amount Info (Monthly subscription at #1,000) (top: 167px, height: 42px) ─── */}
          <div className="mt-8 sm:mt-[105px] text-center w-full max-w-[202px] mx-auto shrink-0">
            <p className="text-[16px] font-bold text-[#101828] leading-[21px] font-quicksand m-0">
              {itemDescription}
            </p>
            <p className="text-[16px] font-bold text-[#101828] leading-[21px] font-quicksand m-0">
              {amount}
            </p>
          </div>

          {/* ─── Center Content Area: Form (Frame 1000001032: 420px wide) ─── */}
          <form onSubmit={handlePay} className="w-full max-w-[420px] mx-auto mt-6 sm:mt-[67px] flex flex-col shrink-0">
            {/* Form Fields: gap 20px matching Figma Frame 1000000999 */}
            <div className="w-full flex flex-col gap-[20px]">
              {/* 1. Select Bank Dropdown (Frame 1000000996: 420px x 56px) */}
              <div className="relative w-full h-[56px]">
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] outline-none appearance-none cursor-pointer focus:border-[#D4AF37] transition-colors font-quicksand"
                >
                  <option value="" className="text-[rgba(162,161,168,0.8)]">--- Select bank ---</option>
                  <option value="access">Access Bank</option>
                  <option value="gtb">Guaranty Trust Bank (GTB)</option>
                  <option value="zenith">Zenith Bank</option>
                  <option value="firstbank">First Bank of Nigeria</option>
                  <option value="uba">United Bank for Africa (UBA)</option>
                  <option value="kuda">Kuda Microfinance Bank</option>
                  <option value="opay">OPay</option>
                  <option value="palmpay">PalmPay</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#101828]">
                  <ChevronDown size={18} strokeWidth={2} />
                </div>
              </div>

              {/* 2. Enter Card Name (Frame 1000001005: 420px x 56px) */}
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Enter card name"
                className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
              />

              {/* 3. Enter Card Number with Mastercard Logo (Frame 1000001002: 420px x 56px) */}
              <div className="relative w-full h-[56px]">
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
                  className="w-full h-[56px] pl-4 pr-12 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
                />
                {/* Mastercard icon badge (logos:mastercard 20px x 16px, border 0.7px solid #C5CDD0, radius 2px) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[20px] h-[16px] bg-white border border-[#C5CDD0] rounded-[2px] flex items-center justify-center overflow-hidden pointer-events-none">
                  <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="4.5" cy="4.5" r="4.5" fill="#EB001B"/>
                    <circle cx="9.5" cy="4.5" r="4.5" fill="#F79E1B"/>
                  </svg>
                </div>
              </div>

              {/* 4. Expiry Date & CVV Row (Frame 1000001003: 420px x 56px, gap 20px) */}
              <div className="w-full grid grid-cols-2 gap-[20px]">
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
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
                />
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

            {/* 5. Checkbox: Add this card (top: 605px, square checkbox solid 20px x 20px, #D4AF37) */}
            <div className="mt-4 sm:mt-[45px]">
              <label 
                onClick={() => setSaveCard(!saveCard)}
                className="flex items-center gap-[10px] cursor-pointer select-none group w-fit"
              >
                <div className={`w-[20px] h-[20px] rounded-[2px] flex items-center justify-center transition-all ${
                  saveCard ? 'bg-[#D4AF37] text-white shadow-2xs' : 'border border-[rgba(162,161,168,0.5)] group-hover:border-black'
                }`}>
                  {saveCard && <Check size={14} strokeWidth={3} className="text-white" />}
                </div>
                <span className="text-[16px] font-normal leading-[21px] text-[#696F79] group-hover:text-black transition-colors font-quicksand">
                  Add this card
                </span>
              </label>
            </div>

            {/* 6. Pay Action Button (Frame 9720: 420px x 56px, background #D4AF37, radius 6px, top: 688px) */}
            <div className="w-full mt-6 sm:mt-[63px]">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black rounded-[6px] text-[16px] font-medium leading-[21px] font-quicksand transition-all shadow-xs active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-75"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Pay'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Frame 2121459666: Success Confirmation Modal ─── */}
      <AudienceSubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        onBack={() => setShowSuccessModal(false)}
        onFinish={handleFinishSuccess}
      />
    </>
  );
}
