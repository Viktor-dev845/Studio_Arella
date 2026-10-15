'use client';

interface AudienceCancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clubName?: string;
}

export default function AudienceCancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
}: AudienceCancelSubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-[28px] p-8 sm:p-10 shadow-2xl flex flex-col items-center justify-center font-['DM_Sans',sans-serif] animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-[20px] sm:text-[24px] font-bold text-[#101828] text-center leading-[30px] sm:leading-[34px] px-2 sm:px-4">
          Are you sure you want to cancel this subscription?
        </h3>

        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-4 w-full mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[160px] h-[52px] rounded-[14px] border border-[#D0D5DD] bg-white text-[#101828] text-[16px] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 max-w-[160px] h-[52px] rounded-[14px] bg-[#D4AF37] text-[#101828] text-[16px] font-medium hover:bg-[#c49f30] transition-colors flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
