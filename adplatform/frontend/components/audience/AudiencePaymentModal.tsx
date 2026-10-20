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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[20px] font-['DM_Sans',sans-serif] animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* ─── Modal Container (Frame 2121459692: 625px x 836px, radius 32px) ─── */}
        <div 
          className="w-full max-w-[625px] h-[836px] max-h-[95vh] bg-white rounded-[32px] p-6 sm:p-10 relative flex flex-col justify-between shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right ─── */}
          <div className="flex items-center justify-between w-full pt-1 px-1">
            <button
              type="button"
              onClick={onBack || onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
            </button>

            <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px] font-['DM_Sans',sans-serif] m-0">
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

          {/* ─── Center Content Area: Form (Frame 1000001032: 420px wide) ─── */}
          <form onSubmit={handlePay} className="flex flex-col items-center flex-1 justify-center max-w-[420px] w-full mx-auto my-2">
            {/* Header Amount Info (Monthly subscription at #1,000) */}
            <div className="text-center mb-7 sm:mb-8">
              <p className="text-[16px] font-bold text-[#101828] leading-[21px] font-['DM_Sans',sans-serif] m-0">
                {itemDescription}
              </p>
              <p className="text-[16px] font-bold text-[#101828] leading-[21px] font-['DM_Sans',sans-serif] m-0">
                {amount}
              </p>
            </div>

            {/* Form Fields: gap 20px / 24px matching Figma Frame 1000000999 */}
            <div className="w-full flex flex-col gap-5">
              {/* 1. Select Bank Dropdown (Frame 1000000996) */}
              <div className="relative w-full">
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] outline-none appearance-none cursor-pointer focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
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

              {/* 2. Enter Card Name (Frame 1000001005) */}
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Enter card name"
                className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
              />

              {/* 3. Enter Card Number with Mastercard Logo (Frame 1000001002) */}
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
                  className="w-full h-[56px] pl-4 pr-14 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
                {/* Mastercard icon badge (logos:mastercard 20px x 16px, border 0.7px solid #C5CDD0) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[22px] h-[16px] bg-white border border-[#C5CDD0] rounded-[2px] flex items-center justify-center overflow-hidden pointer-events-none shadow-2xs">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#EB001B]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#F79E1B] opacity-90" />
                  </div>
                </div>
              </div>

              {/* 4. Expiry Date & CVV Row (Frame 1000001003) */}
              <div className="w-full grid grid-cols-2 gap-5">
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
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="CVV"
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
              </div>

              {/* 5. Checkbox: Add this card (square checkbox solid 20px x 20px, #D4AF37) */}
              <label 
                onClick={() => setSaveCard(!saveCard)}
                className="flex items-center gap-3 pt-1 cursor-pointer select-none group w-fit"
              >
                <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all ${
                  saveCard ? 'bg-[#D4AF37] text-white shadow-2xs' : 'border border-[rgba(162,161,168,0.5)] group-hover:border-black'
                }`}>
                  {saveCard && <Check size={14} strokeWidth={3} className="text-white" />}
                </div>
                <span className="text-[16px] font-normal leading-[21px] text-[#696F79] group-hover:text-black transition-colors font-['DM_Sans',sans-serif]">
                  Add this card
                </span>
              </label>
            </div>

            {/* 6. Pay Action Button (Frame 9720: 420px x 56px, background #D4AF37, radius 6px) */}
            <div className="w-full mt-7 sm:mt-8">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black rounded-[6px] text-[16px] font-medium leading-[21px] font-['DM_Sans',sans-serif] transition-all shadow-xs active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-75"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
