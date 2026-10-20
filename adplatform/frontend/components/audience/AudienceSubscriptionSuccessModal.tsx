'use client';

import { ArrowLeft, X, Check } from 'lucide-react';

interface AudienceSubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  onBack?: () => void;
}

export default function AudienceSubscriptionSuccessModal({
  isOpen,
  onClose,
  onFinish,
  onBack,
}: AudienceSubscriptionSuccessModalProps) {
  if (!isOpen) return null;

  const handleFinish = () => {
    if (onFinish) onFinish();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[20px] font-['DM_Sans',sans-serif] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Frame 2121459691: 625px x 565px, radius 32px) ─── */}
      <div 
        className="w-full max-w-[625px] h-[565px] bg-white rounded-[32px] p-6 sm:px-10 sm:py-8 relative flex flex-col justify-between shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right ─── */}
        <div className="flex items-center justify-between w-full pt-1">
          <button
            type="button"
            onClick={onBack || onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer -ml-2"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px]">
            Pay with card
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer -mr-2"
            title="Close modal"
          >
            <X size={24} strokeWidth={2.5} className="text-[#344053]" />
          </button>
        </div>

        {/* ─── Center Content Area ─── */}
        <div className="flex flex-col items-center flex-1 justify-center -mt-2">
          {/* Radial Glowing Success Circle (Item / Alert - Success: 70px x 70px) */}
          <div className="relative w-[70px] h-[70px] flex items-center justify-center mb-8 sm:mb-9">
            {/* Outer blur glow layer 1 (Shape: -51.43% spread, opacity 0.1, blur 5px) */}
            <div 
              className="absolute -inset-[36px] rounded-full opacity-10 blur-[5px]"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
              }}
            />
            {/* Mid blur glow layer 2 (Shape: -28.57% spread, opacity 0.15, blur 5px) */}
            <div 
              className="absolute -inset-[20px] rounded-full opacity-15 blur-[5px]"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
              }}
            />
            {/* Main Circle with Gold gradient */}
            <div 
              className="w-[70px] h-[70px] rounded-full flex items-center justify-center relative z-10 shadow-sm"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
              }}
            >
              <Check size={28} strokeWidth={3} className="text-white" />
            </div>
          </div>

          {/* Success Message: 483px max, 20px font-semibold #16151C, line-height 30px */}
          <p className="w-full max-w-[483px] text-[20px] font-semibold text-[#16151C] text-center leading-[30px] px-4">
            Subscription successful and you are now a membered fan
          </p>
        </div>

        {/* ─── Action Button: Finish (Frame 9720: 468px x 56px, background #D4AF37, radius 6px) ─── */}
        <div className="w-full max-w-[468px] mx-auto pb-4">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black rounded-[6px] text-[16px] font-medium leading-[21px] transition-all shadow-xs active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
