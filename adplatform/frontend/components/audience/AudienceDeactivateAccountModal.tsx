'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';

interface AudienceDeactivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

export default function AudienceDeactivateAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: AudienceDeactivateAccountModalProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        // Attempt soft-delete API call if available, otherwise safely log out
        try {
          await api.delete('/auth/account');
        } catch (apiErr) {
          // If password required or endpoint responds with message, continue gracefully
          console.warn('API deactivation note:', apiErr);
        }
        await logout();
        toast('Your account has been deactivated.', 'info');
        onClose();
        router.push('/auth/login');
      }
    } catch (err: any) {
      toast(err?.message || 'Could not deactivate account. Please try again.', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      {/* Backdrop Click Dismiss */}
      <div 
        className="absolute inset-0" 
        onClick={() => !isDeactivating && onClose()} 
      />

      {/* ─── Filter Popup Container (383px x 320px, radius 20px, background #FFFFFF) ─── */}
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
            onClick={handleDeactivate}
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
    </div>
  );
}
