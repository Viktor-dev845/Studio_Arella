'use client';

import { X as XIcon } from 'lucide-react';

interface AudienceSubscriptionCancelledModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export default function AudienceSubscriptionCancelledModal({
  isOpen,
  onClose,
  onFinish,
}: AudienceSubscriptionCancelledModalProps) {
  if (!isOpen) return null;

  const handleFinish = () => {
    if (onFinish) onFinish();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] font-['DM_Sans',sans-serif] animate-in fade-in duration-200">
      {/* ─── Modal Dialog (Filter Popup 383px x 433px, radius 20px) ─── */}
      <div 
        className="w-full max-w-[383px] h-[433px] bg-white rounded-[20px] relative flex flex-col items-center shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Line 2: width 343px, top 66px, rgba(162, 161, 168, 0.1) */}
        <div className="absolute top-[66px] left-[20px] right-[20px] h-[1px] bg-[rgba(162,161,168,0.1)]" />

        {/* Item / Alert - Cancelled (top: 94px, 70px x 70px) */}
        <div className="absolute top-[94px] w-[70px] h-[70px] flex items-center justify-center">
          {/* Outer glow layer 1 (Shape -51.43%, opacity 0.1, blur 5px) */}
          <div 
            className="absolute -inset-[36px] rounded-full opacity-10 blur-[5px]"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          />

          {/* Mid glow layer 2 (Shape -28.57%, opacity 0.15, blur 5px) */}
          <div 
            className="absolute -inset-[20px] rounded-full opacity-15 blur-[5px]"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          />

          {/* Main Circle (70px x 70px) */}
          <div 
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center shadow-md relative z-10"
            style={{
              background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
            }}
          >
            {/* iconoir:xmark (28px x 28px, white stroke) */}
            <XIcon size={28} strokeWidth={2} className="text-white" />
          </div>
        </div>

        {/* Subscription cancelled text (top: 224px, 20px font-semibold #16151C) */}
        <h3 className="absolute top-[224px] w-full text-center text-[20px] font-semibold leading-[30px] text-[#16151C]">
          Subscription cancelled
        </h3>

        {/* Finish Button (top: 307px, 166px x 50px, background #D4AF37, radius 6px) */}
        <button
          type="button"
          onClick={handleFinish}
          className="absolute top-[307px] w-[166px] h-[50px] bg-[#D4AF37] hover:bg-[#c49f30] text-black rounded-[6px] text-[16px] font-normal leading-[21px] transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
