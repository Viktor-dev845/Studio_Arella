import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update card-confirm's button to point to OTP
card_confirm_button_old = """onClick={() => {
                          toast('Payment successful', 'success');
                          setWizardStep('success');
                      }}"""
card_confirm_button_new = """onClick={() => {
                          setWizardStep('otp');
                      }}"""
content = content.replace(card_confirm_button_old, card_confirm_button_new)

# 2. Remove the old OTP block from the legacy modal
# Find: {wizardStep === 'otp' && ( ... )}
# Let's use regex to find the block
old_otp_pattern = re.compile(r"\{\s*wizardStep === 'otp' && \(\s*<>\s*<p className=\"text-center text-\[13px\].*?</div>\s*</>\s*\)\s*\}", re.DOTALL)
content = old_otp_pattern.sub("", content)

# Remove any old header references to otp (Wait, I just replaced it with '' previously but let's make sure it's clean)
content = content.replace("{wizardStep === 'otp' && 'Verify payment'}", "")
content = content.replace("['card', 'wallet', 'otp', 'success'].includes(wizardStep)",
                          "['card', 'wallet', 'success'].includes(wizardStep)")

# 3. Inject the NEW OTP Modal
new_otp_modal = """
          {/* ─── CREATE CAMPAIGN: STEP 4 — OTP (WEMA) ─── */}
          {createModalOpen && wizardStep === 'otp' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div 
                className="bg-[#FFFFFF] rounded-[32px] w-[625px] h-[565px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-[40px] pt-[40px]">
                  <button onClick={() => setWizardStep('card-confirm')} className="text-black hover:opacity-70 transition-opacity">
                    <ArrowLeft size={24} strokeWidth={2} />
                  </button>
                  <span className="text-[20px] font-medium text-black">Pay with Wema card</span>
                  <button onClick={resetWizard} className="text-black hover:opacity-70 transition-opacity">
                    <X size={24} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center w-full px-[60px] pt-[50px]">
                  
                  <div className="w-[372px] flex flex-col items-start gap-[10px] mb-[40px]">
                    <p className="text-[16px] text-[#7D7D7D] font-normal pl-[5px]">Enter code*</p>
                    <div className="flex gap-[20px] w-full justify-between">
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          id={`new-otp-${i}`}
                          value={d}
                          maxLength={1}
                          inputMode="numeric"
                          onChange={(e) => {
                            const v = e.target.value.replace(/\\D/g, '').slice(-1);
                            const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
                            if (v && i < 3) document.getElementById(`new-otp-${i + 1}`)?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpDigits[i] && i > 0) document.getElementById(`new-otp-${i - 1}`)?.focus();
                          }}
                          className={`w-[78px] h-[78px] text-center text-[24px] font-bold rounded-[12px] bg-white focus:outline-none transition-colors ${
                            d ? 'border border-[#D4AF37] text-[#D4AF37]' : 'border border-[rgba(162,161,168,0.5)] text-black focus:border-[#D4AF37]'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="w-full flex justify-end mt-[5px]">
                      <p className="text-[14px] text-[#7D7D7D]">
                        Didn't get code? <button className="text-[#D4AF37] font-medium cursor-pointer ml-1">Resend</button>
                      </p>
                    </div>
                  </div>

                  <p className="text-[20px] font-bold text-black text-center max-w-[480px] leading-[32px] mb-[40px]">
                    To authorize this payment, enter the OTP sent to the email Bems.arella@gmail.com attached to your studio arella account
                  </p>

                  <button
                    onClick={() => {
                        toast('Payment successful', 'success');
                        setWizardStep('success');
                    }}
                    className="w-full h-[54px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] text-[16px] font-medium rounded-[8px] transition-colors"
                  >
                    Pay
                  </button>
                </div>
              </div>
            </div>
          )}
"""
content = content.replace("{/* ─── CREATE CAMPAIGN: STEP 3 — BILLING (NEW DESIGN) ─── */}", new_otp_modal + "\n          {/* ─── CREATE CAMPAIGN: STEP 3 — BILLING (NEW DESIGN) ─── */}")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied OTP updates to page.tsx.")
