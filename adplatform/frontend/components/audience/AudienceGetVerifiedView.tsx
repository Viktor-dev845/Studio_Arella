'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import AudienceVerifyPaymentModal from './AudienceVerifyPaymentModal';

interface AudienceGetVerifiedViewProps {
  onBackToProfile?: () => void;
  onSelectPlan?: (plan: 'standard' | 'pro', billingCycle: string) => void;
}

export default function AudienceGetVerifiedView({
  onBackToProfile,
  onSelectPlan,
}: AudienceGetVerifiedViewProps) {
  const [billingCycle, setBillingCycle] = useState<'payg' | 'monthly' | 'yearly'>('monthly');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<'Standard' | 'Pro' | null>(null);

  const handleChoosePlan = (plan: 'Standard' | 'Pro') => {
    setSelectedPlanForPayment(plan);
  };

  return (
    <div 
      className="w-full min-h-screen relative flex flex-col items-center overflow-x-hidden font-['DM_Sans',sans-serif]"
      style={{
        backgroundColor: '#050F3A',
        backgroundImage: 'linear-gradient(147.77deg, #3C3706 16.72%, #725E1D 35.68%, #675D1A 53.09%, #7C812C 66.68%)',
      }}
    >
      {/* ─── Inner Container (Max 1366px matching Figma: width: 1366px, height: 1616px) ─── */}
      <div className="w-full max-w-[1366px] flex flex-col items-center px-4 sm:px-8 pt-[70px] sm:pt-[90px] pb-[100px]">
        {/* Friendly Pricing Label */}
        <p className="text-[13px] sm:text-[14px] font-normal tracking-[0.18em] uppercase text-[#FFE9A3] text-center font-['DM_Sans',sans-serif] m-0">
          FRIENDLY PRICING
        </p>

        {/* Main Headline: Get Verified */}
        <h1 className="mt-4 sm:mt-6 text-center text-white font-black text-[52px] sm:text-[67px] leading-[110%] tracking-[-0.03em] font-['DM_Sans',sans-serif] m-0">
          Get<br />Verified
        </h1>

        {/* ─── Billing Cycle Switcher (Group 18: 491px x 50px) ─── */}
        <div className="mt-8 sm:mt-[48px] w-full max-w-[491px] h-[50px] rounded-[100px] border border-[#C8CCDF] p-[3px] flex items-center justify-between select-none bg-black/10 backdrop-blur-xs">
          {/* Pay as you go */}
          <button
            type="button"
            onClick={() => setBillingCycle('payg')}
            className={`flex-1 h-full rounded-[100px] text-[16px] sm:text-[18px] font-medium transition-all cursor-pointer flex items-center justify-center font-['DM_Sans',sans-serif] ${
              billingCycle === 'payg'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'text-[#C8CCDF] hover:text-white'
            }`}
          >
            Pay as you go
          </button>

          {/* Monthly */}
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 h-full rounded-[100px] text-[16px] sm:text-[18px] font-medium transition-all cursor-pointer flex items-center justify-center font-['DM_Sans',sans-serif] ${
              billingCycle === 'monthly'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'text-[#C8CCDF] hover:text-white'
            }`}
          >
            Monthly
          </button>

          {/* Yearly */}
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 h-full rounded-[100px] text-[16px] sm:text-[18px] font-medium transition-all cursor-pointer flex items-center justify-center font-['DM_Sans',sans-serif] ${
              billingCycle === 'yearly'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'text-[#C8CCDF] hover:text-white'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* ─── Pricing Cards Grid (Standard & Pro: 442px x 628px each) ─── */}
        <div className="mt-12 sm:mt-[70px] w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
          {/* ═══════════ CARD 1: Standard Plan ═══════════ */}
          <div className="relative w-full max-w-[442px]">
            {/* Glow effect behind card */}
            <div className="absolute inset-x-8 bottom-6 h-[137px] bg-[#364277] opacity-60 filter blur-[60px] rounded-[24px] pointer-events-none" />

            {/* Main Card Body */}
            <div className="relative w-full min-h-[628px] bg-white rounded-[23px] pt-[40px] px-8 sm:px-[40px] pb-[44px] flex flex-col justify-between shadow-2xl">
              <div>
                {/* Header Row: Badge Icon + Name/Price */}
                <div className="flex items-center gap-5">
                  {/* Standard Badge Icon */}
                  <div className="w-[76px] h-[76px] rounded-full bg-[#FDF8E8] flex items-center justify-center shrink-0 relative">
                    <div className="w-[44px] h-[56px] bg-[#685722] rounded-[12px] relative flex flex-col items-center justify-end p-2 gap-1.5 shadow-sm">
                      <div className="w-5 h-1 bg-[#9C8C57] rounded-full" />
                      <div className="w-3.5 h-1 bg-[#9C8C57] rounded-full opacity-60" />
                      {/* Circle Tag on top */}
                      <div className="absolute -top-2 w-6 h-6 rounded-full bg-[#FFD447] flex items-center justify-center border-2 border-white shadow-xs">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                      </div>
                    </div>
                  </div>

                  {/* Standard Title & Price */}
                  <div className="flex flex-col">
                    <h3 className="text-[20px] font-medium text-[#4E421D] font-['Public_Sans',sans-serif] m-0 leading-[24px]">
                      Standard
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[40px] font-bold text-[#4E421D] font-['Montserrat',sans-serif] leading-[49px]">
                        $12
                      </span>
                      <span className="text-[16px] font-normal text-[#A4A5AA] font-['Montserrat',sans-serif]">
                        /month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-[#ECEDF1] my-7" />

                {/* Feature Checklist */}
                <div className="flex flex-col gap-6">
                  {/* Feature 1 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      5 events creation
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      Monthly engagement payout
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      3,000 maximum participant/event
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 1 Button: Get Started */}
              <button
                type="button"
                onClick={() => handleChoosePlan('standard')}
                className="w-full h-[46px] bg-[#FAF8F1] hover:bg-[#f3eedd] text-[#D4AF37] font-['Public_Sans',sans-serif] font-medium text-[18px] rounded-[10px] flex items-center justify-center transition-colors cursor-pointer mt-8"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* ═══════════ CARD 2: Pro Plan ═══════════ */}
          <div className="relative w-full max-w-[442px]">
            {/* Glow effect behind card */}
            <div className="absolute inset-x-8 bottom-6 h-[137px] bg-[#796A3B] opacity-70 filter blur-[60px] rounded-[24px] pointer-events-none" />

            {/* Main Card Body */}
            <div className="relative w-full min-h-[628px] bg-white rounded-[23px] pt-[40px] px-8 sm:px-[40px] pb-[44px] flex flex-col justify-between shadow-2xl">
              <div>
                {/* Header Row: Badge Icon + Name/Price */}
                <div className="flex items-center gap-5">
                  {/* Pro Badge Icon (Star tag) */}
                  <div className="w-[76px] h-[76px] rounded-full bg-[#FDF8E8] flex items-center justify-center shrink-0 relative">
                    <div className="w-[44px] h-[56px] bg-[#685722] rounded-[12px] relative flex flex-col items-center justify-end p-2 gap-1.5 shadow-sm">
                      <div className="w-5 h-1 bg-[#9C8C57] rounded-full" />
                      <div className="w-3.5 h-1 bg-[#9C8C57] rounded-full opacity-60" />
                      {/* Star Tag on top */}
                      <div className="absolute -top-2 w-6 h-6 rounded-full bg-[#FFD447] flex items-center justify-center border-2 border-white shadow-xs">
                        <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Pro Title & Price */}
                  <div className="flex flex-col">
                    <h3 className="text-[20px] font-medium text-[#4E421D] font-['Public_Sans',sans-serif] m-0 leading-[24px]">
                      Pro
                    </h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[40px] font-bold text-[#4E421D] font-['Montserrat',sans-serif] leading-[49px]">
                        $69
                      </span>
                      <span className="text-[16px] font-normal text-[#A4A5AA] font-['Montserrat',sans-serif]">
                        /month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[1px] bg-[#ECEDF1] my-7" />

                {/* Feature Checklist */}
                <div className="flex flex-col gap-6">
                  {/* Feature 1 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      Unlimited events creation
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      Monthly engagement payout
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      Unlimited number of participant
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-medium text-[#4E421D] font-['Montserrat',sans-serif]">
                      24/7 event run time
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#4F3D03] flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 Button: Schedule Demo */}
              <button
                type="button"
                onClick={() => handleChoosePlan('pro')}
                className="w-full h-[46px] bg-[#D4AF37] hover:bg-[#c29f31] text-[#000000] font-['Public_Sans',sans-serif] font-medium text-[18px] rounded-[10px] flex items-center justify-center transition-colors cursor-pointer mt-8"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bottom Actions (Frame 13084: Get Started + Back to Profile) ─── */}
        <div className="mt-14 sm:mt-[70px] flex flex-col items-center gap-[18px]">
          {/* Frame 9407: Get Started Button (219px x 39px) */}
          <button
            type="button"
            onClick={() => handleChoosePlan('Standard')}
            className="w-[219px] h-[39px] bg-[#D4AF37] hover:bg-[#c29f31] text-black font-['Public_Sans',sans-serif] font-bold text-[18px] rounded-[10px] flex items-center justify-center transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </button>

          {/* Frame 9281: Back to profile */}
          <button
            type="button"
            onClick={onBackToProfile}
            className="text-[#D7DBFF] hover:text-white font-['Public_Sans',sans-serif] font-bold text-[18px] leading-[21px] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Back to profile
          </button>
        </div>

        {/* ─── Payment Modal (Frame 2121459663: 625px x 836px, radius 32px) ─── */}
        <AudienceVerifyPaymentModal
          isOpen={Boolean(selectedPlanForPayment)}
          onClose={() => setSelectedPlanForPayment(null)}
          planName={selectedPlanForPayment || 'Standard'}
          price={selectedPlanForPayment === 'Pro' ? '$69' : '$12'}
          billingPeriod={billingCycle === 'yearly' ? 'yearly' : 'monthly'}
          onPaymentSuccess={() => {
            const plan = selectedPlanForPayment || 'Standard';
            setSelectedPlanForPayment(null);
            if (onSelectPlan) {
              onSelectPlan(plan.toLowerCase() as 'standard' | 'pro', billingCycle);
            }
          }}
        />
      </div>
    </div>
  );
}
