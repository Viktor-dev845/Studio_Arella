'use client';

import { ArrowLeft, X, Check } from 'lucide-react';

interface AudienceVerifySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  billingPeriod?: string;
}

export default function AudienceVerifySuccessModal({
  isOpen,
  onClose,
  onBack,
  onFinish,
  billingPeriod = 'monthly',
}: AudienceVerifySuccessModalProps) {
  if (!isOpen) return null;

  const handleFinish = () => {
    if (onFinish) onFinish();
    onClose();
  };

  const getTitle = () => {
    if (billingPeriod === 'yearly') return 'Yearly subscription';
    if (billingPeriod === 'payg') return 'Pay as you go subscription';
    return 'Monthly subscription';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-['DM_Sans',sans-serif] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Frame 2121459666: 625px x 565px, radius 32px) ─── */}
      <div 
        className="w-full max-w-[625px] h-[565px] max-h-[96vh] bg-white rounded-[32px] pt-[32px] px-6 sm:px-[40px] pb-[40px] relative flex flex-col items-center shadow-[0px_20px_60px_rgba(0,0,0,0.2)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right (top: 32px) ─── */}
        <div className="w-full flex items-center justify-between relative h-[30px] shrink-0">
          <button
            type="button"
            onClick={onBack || onClose}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px] font-['DM_Sans',sans-serif] m-0">
            {getTitle()}
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

        {/* ─── Item / Alert - Success (Top: 194px, 70px x 70px) ─── */}
        <div className="mt-[90px] w-[70px] h-[70px] relative flex items-center justify-center">
          {/* Radial soft golden halo matching Figma reference */}
          <div 
            className="absolute -inset-[32px] rounded-full bg-[#D4AF37]/25 blur-[16px] pointer-events-none"
          />

          {/* Outer glow layer: -51.43% spread, opacity 0.1, blur 5px */}
          <div 
            className="absolute -inset-[36px] rounded-full opacity-10 blur-[5px] pointer-events-none"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          />

          {/* Mid glow layer: -28.57% spread, opacity 0.15, blur 5px */}
          <div 
            className="absolute -inset-[20px] rounded-full opacity-15 blur-[5px] pointer-events-none"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          />

          {/* Center 70px Circle */}
          <div 
            className="w-[70px] h-[70px] rounded-full relative flex items-center justify-center shadow-sm"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          >
            {/* White Checkmark Icon */}
            <Check size={26} strokeWidth={2.8} className="text-white" />
          </div>
        </div>

        {/* ─── Headline: Subscription successful. You are now a verified user (Top: 324px) ─── */}
        <div className="mt-[42px] max-w-[274px] text-center">
          <h3 className="text-[20px] font-semibold text-[#16151C] leading-[30px] font-['DM_Sans',sans-serif] m-0">
            Subscription successful.<br />
            You are now a verified user
          </h3>
        </div>

        {/* ─── Action Button: Finish (Frame 9720: 468px x 56px, background #D4AF37, radius 6px) ─── */}
        <div className="w-full max-w-[468px] mt-[48px]">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-[#000000] font-['DM_Sans',sans-serif] font-medium text-[16px] leading-[21px] rounded-[6px] flex items-center justify-center transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
