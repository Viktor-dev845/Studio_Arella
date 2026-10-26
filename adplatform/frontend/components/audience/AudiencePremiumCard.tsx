'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

export default function AudiencePremiumCard({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('studio_arella_dismiss_premium_card') === 'true';
      setIsDismissed(dismissed);
    }
  }, []);

  // 1. Hide if user already has Pro / VIP / Creator status
  const isAlreadyPremium = 
    user?.creator_tier === 'pro' || 
    Boolean(user?.is_creator && user?.creator_verified) || 
    user?.creator_tier === 'vip' ||
    Boolean(user?.pro_subscription_expires_at);

  if (isAlreadyPremium || isDismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_arella_dismiss_premium_card', 'true');
    }
    toast('Card dismissed. You can always explore VIP passes in your profile settings.', 'info');
  };

  const handleOpenTrial = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast('Please sign in to activate your 1-month free VIP pass.', 'info');
      router.push('/auth/login?redirect=/audience');
      return;
    }
    setShowTrialModal(true);
  };

  const handleActivateTrial = async () => {
    setActivating(true);
    try {
      // 30 days trial activation
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      if (user) {
        setUser({
          ...user,
          creator_tier: 'pro',
          pro_subscription_expires_at: expiresAt,
        });
      }
      setShowTrialModal(false);
      toast('🎉 VIP Pass activated! Enjoy 1 month of ad-free streaming & exclusive creator live experiences.', 'success');
    } catch {
      toast('Could not activate free trial. Please try again.', 'error');
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <div 
        className={`w-full min-h-[168px] rounded-[18px] p-5 relative overflow-hidden bg-gradient-to-br from-[#1E1E1E] to-[#121212] text-white shadow-md border border-white/10 shrink-0 cursor-pointer group flex flex-col justify-between font-quicksand transition-all hover:border-[#D4AF37]/40 ${className}`}
        onClick={handleOpenTrial}
        title="Try Studio Arella Premium for free"
      >
        {/* Subtle gold glow behind card */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20 uppercase flex items-center gap-1">
              <Sparkles size={11} className="text-[#D4AF37]" />
              VIP PASS
            </span>
            <span className="text-[11px] text-gray-400 font-normal">1 month free</span>
          </div>

          {/* Dismiss button [✕] */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss this card"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="my-1.5 relative z-10">
          <h3 className="text-[15px] font-bold text-white leading-tight flex items-center gap-1.5">
            Studio Arella Premium
          </h3>
          <p className="text-[11px] text-gray-300 mt-1 leading-snug">
            Ad-free podcast streaming & exclusive creator live experiences.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={handleOpenTrial}
            className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-[10px] transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            Try Free
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/audience?view=get-verified');
            }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-[10px] border border-white/10 transition-all cursor-pointer"
            title="View all plans"
          >
            Plans
          </button>
        </div>
      </div>

      {/* ─── Modern VIP Pass Trial Activation Modal ─── */}
      {showTrialModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-quicksand"
          onClick={() => setShowTrialModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#161616] border border-[#D4AF37]/30 text-white rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background luxury gradient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Activate VIP Pass</h3>
                  <p className="text-xs text-amber-200/80 font-medium">1 Month Free Access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrialModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Benefit Bullets */}
            <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3.5 relative z-10 text-xs text-gray-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Zero audio advertisements across all community & studio podcasts</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Full access to creator exclusive live streams & private stages</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Studio Audio HD streaming quality & priority comment ranking</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>No credit card required upfront • Cancel or downgrade anytime</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 relative z-10 pt-1">
              <button
                type="button"
                disabled={activating}
                onClick={handleActivateTrial}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#c29f31] hover:to-[#d4ae47] text-black font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {activating ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Start 1 Month Free</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTrialModal(false);
                  router.push('/audience?view=get-verified');
                }}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Or explore annual & creator plans
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
