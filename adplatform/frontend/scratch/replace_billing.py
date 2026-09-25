import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove 'billing' from the shared modal array
content = content.replace("['billing', 'card', 'card-confirm', 'wallet', 'otp', 'success'].includes(wizardStep)",
                          "['card', 'card-confirm', 'wallet', 'otp', 'success'].includes(wizardStep)")

# 2. Extract the wizardStep === 'billing' block from the old modal so we can delete it.
billing_block_pattern = re.compile(r"\{\s*wizardStep === 'billing' && \(\s*<>\s*<p className.*?</>\s*\)\s*\}", re.DOTALL)
content = billing_block_pattern.sub("", content)

# 3. We also need to fix the header in the old modal.
# Old: {wizardStep !== 'billing' && wizardStep !== 'success' ? (
# Let's change it to just {wizardStep !== 'success' ? (
content = content.replace("{wizardStep !== 'billing' && wizardStep !== 'success' ? (", "{wizardStep !== 'success' ? (")

# Old: {wizardStep === 'billing' && 'Billing'}
# Remove it.
content = content.replace("{wizardStep === 'billing' && 'Billing'}", "")

# 4. Inject the completely new Billing modal just before {/* ─── CREATE CAMPAIGN: STEPS 3+ — BILLING ─── */}
new_billing_modal = """
          {/* ─── CREATE CAMPAIGN: STEP 3 — BILLING (NEW DESIGN) ─── */}
          {createModalOpen && wizardStep === 'billing' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div 
                className="bg-[#FFFFFF] rounded-[32px] w-[625px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                style={{ height: '836px', fontFamily: 'var(--font-dm-sans)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-[40px] pt-[40px]">
                  <button onClick={() => setWizardStep('details')} className="text-black hover:opacity-70 transition-opacity">
                    <ArrowLeft size={24} strokeWidth={2} />
                  </button>
                  <span className="text-[20px] font-medium text-black">Billing</span>
                  <button onClick={resetWizard} className="text-black hover:opacity-70 transition-opacity">
                    <X size={24} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center w-full px-[60px] pt-[80px]">
                  <p className="text-[16px] font-bold text-black text-center mb-[40px] leading-[26px]">
                    {billingHeader || '3 months Ad space'} at<br/>
                    #{budgetAmount.toLocaleString()}
                  </p>
                  
                  {/* Pay with card */}
                  <div 
                    onClick={() => setBillingMethod('card')}
                    className={`w-full rounded-[16px] border-[1.5px] p-[24px] mb-[24px] cursor-pointer flex items-center gap-[16px] transition-all ${billingMethod === 'card' ? 'border-[#D4AF37]' : 'border-[rgba(162,161,168,0.2)] hover:border-[#D4AF37]/50'}`}
                  >
                    <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${billingMethod === 'card' ? 'border-[#D4AF37]' : 'border-[rgba(162,161,168,0.4)]'}`}>
                      {billingMethod === 'card' && <div className="w-[10px] h-[10px] bg-[#D4AF37] rounded-full" />}
                    </div>
                    <span className="text-[16px] font-normal text-black">Pay with card</span>
                  </div>

                  {/* Pay from wallet */}
                  <div 
                    onClick={() => setBillingMethod('wallet')}
                    className={`w-full rounded-[16px] border-[1.5px] p-[24px] mb-[40px] cursor-pointer flex flex-col transition-all ${billingMethod === 'wallet' ? 'border-[#D4AF37]' : 'border-[rgba(162,161,168,0.2)] hover:border-[#D4AF37]/50'}`}
                  >
                    <div className="flex items-center justify-between w-full mb-[12px]">
                      <div className="flex items-center gap-[16px]">
                        <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${billingMethod === 'wallet' ? 'border-[#D4AF37]' : 'border-[rgba(162,161,168,0.4)]'}`}>
                          {billingMethod === 'wallet' && <div className="w-[10px] h-[10px] bg-[#D4AF37] rounded-full" />}
                        </div>
                        <span className="text-[16px] font-normal text-black">Pay from wallet</span>
                      </div>
                      <Link href="/finances" className="bg-[#D4AF37]/10 text-[#D4AF37] px-[12px] py-[4px] rounded-[6px] text-[13px] font-normal hover:bg-[#D4AF37]/20 transition-colors">
                        Fund wallet
                      </Link>
                    </div>
                    
                    <div className="pl-[36px] flex items-center justify-between">
                      <div className="flex flex-col gap-[6px]">
                        <span className="text-[13px] text-black">Wallet ID: {user?.id || '23cvo_23759ryi'}</span>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(user?.id || '23cvo_23759ryi'); toast('Wallet ID copied', 'success'); }}
                          className="flex items-center gap-[6px] text-[#D4AF37] text-[12px] font-medium hover:opacity-80 w-fit"
                        >
                          Copy <Copy size={12} />
                        </button>
                      </div>
                      <span className="text-[14px] font-medium text-black">
                        {currency === 'NGN' ? 'NGN' : 'USD'} {walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBillingContinue}
                    className="w-full h-[54px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] text-[16px] font-normal rounded-[8px] transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
"""
content = content.replace("{/* ─── CREATE CAMPAIGN: STEPS 3+ — BILLING ─── */}", new_billing_modal + "\n          {/* ─── CREATE CAMPAIGN: STEPS 3+ — BILLING ─── */}")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied new Billing modal.")
