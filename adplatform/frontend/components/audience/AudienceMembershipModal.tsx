'use client';

import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import AudiencePaymentModal from './AudiencePaymentModal';

interface AudienceMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName?: string;
  price?: string;
  onSubscribeSuccess?: () => void;
}

export default function AudienceMembershipModal({
  isOpen,
  onClose,
  clubName = 'Dylan fan club',
  price = 'NGN 5,215,005.25',
  onSubscribeSuccess,
}: AudienceMembershipModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!isOpen) return null;

  const handleOpenPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    if (onSubscribeSuccess) onSubscribeSuccess();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-['DM_Sans',sans-serif] animate-in fade-in duration-200">
        {/* ─── Modal Container (Frame 2121459664: 625px x 836px, radius 32px) ─── */}
        <div 
          className="w-full max-w-[625px] min-h-[640px] md:h-[836px] bg-white rounded-[32px] p-6 sm:p-10 relative flex flex-col justify-between shadow-[0px_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Top Bar: Back Arrow on left, Close X on right ─── */}
          <div className="flex items-center justify-between w-full pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
              title="Go back"
            >
              <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer"
              title="Close modal"
            >
              <X size={24} strokeWidth={2.5} className="text-[#344053]" />
            </button>
          </div>

          {/* ─── Center Content Area ─── */}
          <div className="flex flex-col items-center flex-1 justify-center -mt-6">
            {/* Header Title: 248px wide, bold 16px, line-height 21px, text-center */}
            <h3 className="w-full max-w-[248px] text-[16px] font-bold text-[#101828] text-center leading-[21px] mb-12 sm:mb-16">
              This is not a free membership platform. Subscribe at #1,000 to get in
            </h3>

            {/* Subscription Option Card (Frame 9721: 468px x 127px, border 1px solid #D7D7D7, radius 16px) */}
            <div className="w-full max-w-[468px] h-[127px] bg-white border border-[#D7D7D7] rounded-[16px] p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h4 className="text-[16px] font-medium text-[#101828] leading-[21px]">
                Subscribe to {clubName}
              </h4>

              <p className="text-[14px] font-medium text-[#101828] leading-[18px]">
                {price}
              </p>
            </div>

            {/* Subscribe Action Button (Frame 9720: 468px x 56px, background #D4AF37, radius 6px) */}
            <div className="w-full max-w-[468px] mt-16 sm:mt-20">
              <button
                type="button"
                onClick={handleOpenPayment}
                className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#c29f31] text-black rounded-[6px] text-[16px] font-medium leading-[21px] transition-all shadow-sm active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Empty spacer for bottom balance */}
          <div className="h-4" />
        </div>
      </div>

      {/* ─── Next Step: Frame 2121459681 Pay with a new card ─── */}
      <AudiencePaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          onClose();
        }}
        onBack={() => setShowPaymentModal(false)}
        title="Pay with a new card"
        itemDescription="3 months Ad space at"
        amount="#300,000"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
