import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the includes block
content = content.replace(
    "['card', 'wallet', 'success'].includes(wizardStep)",
    "['card', 'wallet'].includes(wizardStep)"
)

# 2. Regex remove the old 'otp' and 'success' blocks
old_otp_pattern = re.compile(
    r"\{\s*wizardStep === 'otp' && \(\s*<>\s*<p className=\"text-center text-\[13px\].*?\{verifyingOtp \? 'Verifying\.\.\.' : 'Pay'\}\s*</button>\s*</>\s*\)\s*\}",
    re.DOTALL
)
content = old_otp_pattern.sub("", content)

old_success_pattern = re.compile(
    r"\{\s*wizardStep === 'success' && \(\s*<div className=\"text-center\">\s*<div className=\"w-16 h-16.*?</button>\s*</div>\s*\)\s*\}",
    re.DOTALL
)
content = old_success_pattern.sub("", content)

# Remove stray Verifying... with strange chars in regex? Let's just use a safer string split/replace if possible.
# Actually I see `Verifying?` in the logs which means it's an ellipsis `...` or `…`.
# I'll use a safer regex.
old_otp_pattern_safe = re.compile(
    r"\{\s*wizardStep === 'otp' && \(\s*<>\s*<p className=\"text-center.*?</button>\s*</>\s*\)\s*\}",
    re.DOTALL
)
content = old_otp_pattern_safe.sub("", content)

# 3. Build the new success modal
new_success_modal = """
          {/* ─── CREATE CAMPAIGN: STEP 5 — SUCCESS ─── */}
          {createModalOpen && wizardStep === 'success' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div 
                className="bg-[#FFFFFF] rounded-[32px] w-[625px] h-[565px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-[40px] pt-[40px]">
                  <button onClick={() => setWizardStep('otp')} className="text-black hover:opacity-70 transition-opacity">
                    <ArrowLeft size={24} strokeWidth={2} />
                  </button>
                  <span className="text-[20px] font-medium text-black">Pay with Wema card</span>
                  <button onClick={resetWizard} className="text-black hover:opacity-70 transition-opacity">
                    <X size={24} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center w-full px-[60px] pt-[80px]">
                  
                  {/* Success Icon with Glow */}
                  <div className="relative flex items-center justify-center w-[160px] h-[160px] mb-[40px]">
                    <div className="absolute inset-0 bg-[#D4AF37] opacity-20 rounded-full blur-[20px] filter"></div>
                    <div className="relative w-[84px] h-[84px] bg-[#D4AF37] rounded-full flex items-center justify-center shadow-sm">
                      <Check size={36} className="text-white" strokeWidth={3} />
                    </div>
                  </div>

                  <p className="text-[20px] font-bold text-black text-center max-w-[480px] leading-[32px] mb-[60px]">
                    Payment successful and campaign booked
                  </p>

                  <button
                    onClick={resetWizard}
                    className="w-full h-[54px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] text-[16px] font-medium rounded-[8px] transition-colors"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </div>
          )}
"""

content = content.replace("{/* ─── FILTER POPUP ─── */}", new_success_modal + "\n            {/* ─── FILTER POPUP ─── */}")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied success updates to page.tsx.")
