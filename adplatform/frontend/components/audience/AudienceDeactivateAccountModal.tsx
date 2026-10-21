'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';

interface AudienceDeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  initialStep?: 'confirm' | 'deactivated';
}

export default function AudienceDeactivateAccountModal({
  isOpen,
  onClose,
  onConfirm,
  initialStep = 'confirm',
}: AudienceDeactivateAccountModalProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState<'confirm' | 'deactivated'>(initialStep);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync step with initialStep whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setIsDeactivating(false);
      setIsLoggingOut(false);
    }
  }, [isOpen, initialStep]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeactivating && !isLoggingOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeactivating, isLoggingOut]);

  if (!isOpen) return null;

  // Step 1 -> Step 2 transition
  const handleConfirmDeactivate = async () => {
    setIsDeactivating(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        try {
          await api.delete('/auth/account');
        } catch (apiErr) {
          console.warn('API deactivation note:', apiErr);
        }
      }
      // Advance to the Figma "Account deactivated" popup
      setStep('deactivated');
    } catch (err: any) {
      toast(err?.message || 'Could not deactivate account. Please try again.', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Step 2 final action: Log out completely
  const handleFinalLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast('Your account has been deactivated. You have been logged out.', 'info');
      onClose();
      router.push('/auth/login');
    } catch (err) {
      onClose();
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      {/* Backdrop Click Dismiss */}
      <div 
        className="absolute inset-0" 
        onClick={() => !isDeactivating && !isLoggingOut && onClose()} 
      />

      {step === 'confirm' ? (
        /* ─── STEP 1: Confirmation Filter Popup (383px x 320px, radius 20px) ─── */
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-dialog-title"
          className="relative z-10 w-[383px] h-[320px] bg-white rounded-[20px] shadow-[0px_20px_60px_rgba(0,0,0,0.18)] border border-gray-100/80 flex flex-col items-center justify-between p-5 pt-[88px] pb-[53px] font-['DM_Sans',sans-serif] animate-in zoom-in-95 duration-150"
        >
          {/* Title: 247px x 60px, 20px, 600, color #16151C, line-height 30px */}
          <h2 
            id="deactivate-dialog-title"
            className="w-[247px] text-[20px] font-semibold text-[#16151C] leading-[30px] text-center m-0 select-none"
          >
            Are you sure you want to deactivate your account?
          </h2>

          {/* Buttons Row: No (166px x 50px, border) & Yes (166px x 50px, #D4AF37, radius 6px) */}
          <div className="w-full flex items-center justify-between gap-[11px] px-[0px]">
            {/* Button: No */}
            <button
              type="button"
              disabled={isDeactivating}
              onClick={onClose}
              className="w-[166px] h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-transparent hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center text-[16px] font-normal text-[#16151C] leading-[21px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
            >
              No
            </button>

            {/* Button: Yes */}
            <button
              type="button"
              disabled={isDeactivating}
              onClick={handleConfirmDeactivate}
              className="w-[166px] h-[50px] rounded-[6px] bg-[#D4AF37] hover:bg-[#c9a32c] active:bg-[#b89423] transition-colors flex items-center justify-center text-[16px] font-normal text-[#000000] leading-[21px] cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed select-none"
            >
              {isDeactivating ? (
                <Loader2 size={18} className="animate-spin text-black" />
              ) : (
                'Yes'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ─── STEP 2: Deactivated Success Filter Popup (383px x 433px, radius 20px) ─── */
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivated-dialog-title"
          className="relative z-10 w-[383px] h-[433px] bg-white rounded-[20px] shadow-[0px_20px_60px_rgba(0,0,0,0.18)] border border-gray-100/80 font-['DM_Sans',sans-serif] animate-in zoom-in-95 duration-150 overflow-hidden"
        >
          {/* Top Divider: Line 2 (width: 343px, left: 20px, top: 66px, border: 1px solid rgba(162, 161, 168, 0.1)) */}
          <div 
            className="absolute left-[20px] top-[66px] w-[343px] h-0 border-t border-[rgba(162,161,168,0.1)]"
          />

          {/* Item / Alert - Success: Glowing Badge at top: 94px, center */}
          <div className="absolute top-[94px] left-1/2 -translate-x-1/2 w-[70px] h-[70px] flex items-center justify-center">
            {/* Shape 1 (Outer Blur Glow, opacity: 0.1, blur 5px) */}
            <div 
              className="absolute -inset-[36px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
                opacity: 0.1,
                filter: 'blur(5px)',
              }}
            />

            {/* Shape 2 (Middle Blur Glow, opacity: 0.15, blur 5px) */}
            <div 
              className="absolute -inset-[20px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
                opacity: 0.15,
                filter: 'blur(5px)',
              }}
            />

            {/* Shape 3 (Main Circle: 70px x 70px, radial gradient) */}
            <div 
              className="relative w-[70px] h-[70px] rounded-full flex items-center justify-center shadow-sm"
              style={{
                background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)',
              }}
            >
              {/* iconoir:xmark (28px x 28px, border 1.5px solid #FFFFFF) */}
              <X 
                size={24} 
                strokeWidth={2} 
                className="text-white" 
              />
            </div>
          </div>

          {/* Title: "Account deactivated" (top: 224px, width: 204px, 20px, 600, color #16151C, line-height 30px) */}
          <h2 
            id="deactivated-dialog-title"
            className="absolute top-[224px] left-1/2 -translate-x-1/2 w-[204px] text-[20px] font-semibold text-[#16151C] leading-[30px] text-center m-0 select-none"
          >
            Account deactivated
          </h2>

          {/* Button: "Log out completely" (top: 307px, width: 184px, height: 50px, #D4AF37, radius 6px) */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleFinalLogout}
            className="absolute top-[307px] left-1/2 -translate-x-1/2 w-[184px] h-[50px] rounded-[6px] bg-[#D4AF37] hover:bg-[#c9a32c] active:bg-[#b89423] transition-colors flex items-center justify-center text-[16px] font-normal text-[#000000] leading-[21px] cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {isLoggingOut ? (
              <Loader2 size={18} className="animate-spin text-black" />
            ) : (
              'Log out completely'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
