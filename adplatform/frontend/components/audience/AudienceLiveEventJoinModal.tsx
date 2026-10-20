'use client';

interface AudienceLiveEventJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  eventTitle?: string;
}

export default function AudienceLiveEventJoinModal({
  isOpen,
  onClose,
  onJoin,
  eventTitle = 'User experience (UX)',
}: AudienceLiveEventJoinModalProps) {
  if (!isOpen) return null;

  // Split title matching Figma layout: "User experience live" on line 1, "event" on line 2
  const cleanTitle = (eventTitle || 'User experience').replace(/\s*\(.*?\)/, '').trim();
  const line1 = cleanTitle.toLowerCase().endsWith('event')
    ? cleanTitle.slice(0, -5).trim()
    : cleanTitle.toLowerCase().endsWith('live')
    ? cleanTitle
    : `${cleanTitle} live`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Blurred Backdrop Overlay matching Figma Frame Overlay: rgba(162, 161, 168, 0.2), backdrop-filter: blur(10px) */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{
          background: 'rgba(162, 161, 168, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose} 
      />

      {/* Modal Dialog (Figma: Filter Popup - 383px x auto, White background, border-radius: 20px) */}
      <div 
        className="relative z-10 w-full max-w-[383px] bg-white rounded-[20px] pt-12 pb-9 px-8 shadow-[0px_20px_60px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center font-['DM_Sans',sans-serif] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title: 24px DM Sans Bold */}
        <h3 className="font-['DM_Sans',sans-serif] font-bold text-[24px] sm:text-[26px] leading-[32px] sm:leading-[35px] text-[#101828] text-center m-0 max-w-[280px]">
          {line1}
          <br />
          event
        </h3>

        {/* Buttons Row (Back + Join: 166px x 50px each, gap 14px, radius 8px) */}
        <div className="flex items-center justify-center gap-3.5 w-full mt-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[50px] bg-white border border-[#E7E7E7] hover:bg-gray-50 active:scale-[0.98] rounded-[8px] flex items-center justify-center font-['DM_Sans',sans-serif] font-medium text-[16px] leading-[21px] text-[#101828] transition-all cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onJoin}
            className="flex-1 h-[50px] bg-[#D4AF37] hover:bg-[#c49f2e] active:scale-[0.98] rounded-[8px] flex items-center justify-center font-['DM_Sans',sans-serif] font-medium text-[16px] leading-[21px] text-[#000000] transition-all cursor-pointer border-none shadow-2xs"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
