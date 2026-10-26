'use client';

interface AudienceLiveEventJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  onSubscribe?: () => void;
  isSubscribed?: boolean;
  eventTitle?: string;
}

export default function AudienceLiveEventJoinModal({
  isOpen,
  onClose,
  onJoin,
  onSubscribe,
  isSubscribed = false,
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

      {/* Modal Dialog (Figma: Filter Popup - 383px x 320px, White background, border-radius: 20px) */}
      <div 
        className="relative z-10 w-full max-w-[383px] h-[320px] bg-white rounded-[20px] px-5 py-[46px] shadow-[0px_20px_60px_rgba(0,0,0,0.12)] flex flex-col justify-between items-center font-quicksand animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {!isSubscribed ? (
          /* State A: Visitor not subscribed -> Frame 858:37255 (To join this event, you need to subscribe...) */
          <>
            <div className="w-[247px] min-h-[120px] flex items-center justify-center">
              <h3 className="font-quicksand font-semibold text-[20px] leading-[30px] text-[#16151C] text-center m-0">
                To join this event, you need to subscribe to be a membered fan of the creator
              </h3>
            </div>

            {/* Buttons Row: Back (166px x 50px, border-radius 10px) + Subscribe (166px x 50px, background #D4AF37, border-radius 6px) */}
            <div className="flex items-center justify-between gap-[11px] w-full">
              <button
                type="button"
                onClick={onClose}
                className="w-[166px] flex-1 h-[50px] bg-white border border-[rgba(162,161,168,0.2)] hover:bg-gray-50 active:scale-[0.98] rounded-[10px] flex items-center justify-center font-quicksand font-normal text-[16px] leading-[21px] text-[#16151C] transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSubscribe) {
                    onSubscribe();
                  }
                }}
                className="w-[166px] flex-1 h-[50px] bg-[#D4AF37] hover:bg-[#c49f2e] active:scale-[0.98] rounded-[6px] flex items-center justify-center font-quicksand font-normal text-[16px] leading-[21px] text-[#000000] transition-all cursor-pointer border-none shadow-2xs"
              >
                Subscribe
              </button>
            </div>
          </>
        ) : (
          /* State B: User is subscribed -> Frame Filter Popup (User experience live event + Back & Join) */
          <>
            <div className="w-[260px] min-h-[120px] flex items-center justify-center">
              <h3 className="font-quicksand font-bold text-[24px] sm:text-[26px] leading-[32px] sm:leading-[35px] text-[#101828] text-center m-0">
                {line1}
                <br />
                event
              </h3>
            </div>

            {/* Buttons Row: Back + Join */}
            <div className="flex items-center justify-between gap-[11px] w-full">
              <button
                type="button"
                onClick={onClose}
                className="w-[166px] flex-1 h-[50px] bg-white border border-[rgba(162,161,168,0.2)] hover:bg-gray-50 active:scale-[0.98] rounded-[10px] flex items-center justify-center font-quicksand font-normal text-[16px] leading-[21px] text-[#16151C] transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onJoin}
                className="w-[166px] flex-1 h-[50px] bg-[#D4AF37] hover:bg-[#c49f2e] active:scale-[0.98] rounded-[6px] flex items-center justify-center font-quicksand font-normal text-[16px] leading-[21px] text-[#000000] transition-all cursor-pointer border-none shadow-2xs"
              >
                Join
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
