'use client';

import { X } from 'lucide-react';

interface AudienceEventCreatedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  title?: string;
}

export default function AudienceEventCreatedSuccessModal({
  isOpen,
  onClose,
  onFinish,
  title = 'Event created',
}: AudienceEventCreatedSuccessModalProps) {
  if (!isOpen) return null;

  const handleFinish = () => {
    if (onFinish) onFinish();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[10px] font-quicksand animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Filter Popup: 383px x 433px, radius 20px) ─── */}
      <div 
        className="w-full max-w-[383px] h-[433px] bg-white rounded-[20px] relative flex flex-col items-center shadow-[0px_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Line 2: width 343px, left 20px, top 66px */}
        <div className="absolute top-[66px] left-[20px] right-[20px] h-[1px] bg-[rgba(162,161,168,0.1)]" />

        {/* Item / Alert - Success: 70px x 70px, top 94px */}
        <div className="absolute top-[94px] left-1/2 -translate-x-1/2 w-[70px] h-[70px] flex items-center justify-center">
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
            {/* iconoir:xmark: 28px x 28px, border 1.5px solid #FFFFFF */}
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <X size={18} className="text-white" strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Event created: top 224px, 20px font, semi-bold */}
        <h3 className="absolute top-[224px] left-1/2 -translate-x-1/2 w-full text-center text-[20px] font-semibold text-[#16151C] leading-[30px] font-quicksand m-0">
          {title}
        </h3>

        {/* Finish Button: top 307px, 166px x 50px, background #D4AF37, radius 6px */}
        <button
          type="button"
          onClick={handleFinish}
          className="absolute top-[307px] left-1/2 -translate-x-1/2 w-[166px] h-[50px] bg-[#D4AF37] hover:bg-[#c29f31] text-[#000000] font-quicksand text-[16px] font-normal leading-[21px] rounded-[6px] flex items-center justify-center transition-all active:scale-[0.98] shadow-xs cursor-pointer"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
