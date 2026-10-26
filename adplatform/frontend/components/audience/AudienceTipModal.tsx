'use client';

import { useState } from 'react';
import { X, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';

interface AudienceTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorRole?: string;
  creatorAvatar?: string;
  contentId?: string;
  onTipSuccess?: (amount: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function AudienceTipModal({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorRole = 'Creator',
  creatorAvatar,
  contentId,
  onTipSuccess,
}: AudienceTipModalProps) {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const tipAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const creatorShare = tipAmount > 0 ? (tipAmount * 0.85).toFixed(0) : '0';
  const platformFee = tipAmount > 0 ? (tipAmount * 0.15).toFixed(0) : '0';

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorId) {
      toast('Creator not found', 'error');
      return;
    }
    if (tipAmount < 100) {
      toast('Minimum tip amount is ₦100', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/creator/tips', {
        creator_id: creatorId,
        content_id: contentId || null,
        amount: tipAmount,
        message: message.trim() || undefined,
      });

      setIsSuccess(true);
      if (onTipSuccess) onTipSuccess(tipAmount);
      toast(`You successfully tipped ₦${tipAmount.toLocaleString()} to ${creatorName}!`, 'success');
    } catch (err: any) {
      console.error('Failed to send tip:', err);
      toast(err.response?.data?.error || 'Could not process tip. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setMessage('');
    setCustomAmount('');
    setSelectedAmount(1000);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-quicksand animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div 
        className="w-full max-w-[480px] bg-white rounded-[28px] p-6 sm:p-8 relative flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <Heart size={18} className="fill-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">Send a Tip</h3>
              <p className="text-xs text-gray-500">Support your favorite Nigerian creator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Thank You for Supporting!</h4>
            <p className="text-sm text-gray-600 max-w-sm mt-2">
              Your tip of <span className="font-bold text-gray-900">₦{tipAmount.toLocaleString()}</span> has been delivered directly to <span className="font-semibold text-gray-900">{creatorName}</span>'s wallet.
            </p>
            <div className="mt-4 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200 text-xs text-emerald-800 font-medium">
              85% (₦{creatorShare}) credited directly to creator
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-8 px-8 py-3 bg-[#D4AF37] hover:bg-[#c49f2b] text-black font-semibold rounded-xl transition-all shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
            {/* Creator Badge */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white shadow-sm"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                  {creatorName ? creatorName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{creatorName}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#8c711a]">CREATOR</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{creatorRole}</p>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Select Tip Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = !customAmount && selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm scale-102'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount */}
              <div className="mt-3 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                  ₦
                </span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="Or enter custom amount (e.g. 3000)"
                  className="w-full h-11 pl-8 pr-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Encouraging Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Add a personal note (optional)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Love your podcasts! Keep inspiring Nigeria 🚀"
                maxLength={140}
                className="w-full h-11 px-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
              />
            </div>

            {/* Revenue Split Transparency Notice (85% Creator / 15% Studio Arella) */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <Sparkles size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Studio Arella Fair Revenue Guarantee</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  <span className="font-bold">85% (₦{Number(creatorShare).toLocaleString()})</span> goes directly to {creatorName}. 15% (₦{Number(platformFee).toLocaleString()}) covers payment processing and creator tools.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || tipAmount < 100}
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#c49f2b] text-black font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart size={16} className="fill-black" />
                  <span>Send ₦{tipAmount.toLocaleString()} Tip</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
