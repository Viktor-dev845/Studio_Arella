import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update header title for 'otp' step
content = content.replace(
    "{fundStep === 'otp' && 'Verify payment'}",
    "{fundStep === 'otp' && Pay with  card}"
)

start_index = content.find("                    {fundStep === 'otp' && (")
end_index = content.find("                    {fundStep === 'success' && (")

new_otp_step = """                    {fundStep === 'otp' && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '492px', margin: '0 auto', boxSizing: 'border-box' }}>
                        
                        <div style={{ alignSelf: 'center', width: '100%', maxWidth: '415px', marginTop: 30, position: 'relative' }}>
                          <p style={{ fontSize: 16, color: '#696F79', fontFamily: 'var(--font-dm-sans)', margin: '0 0 16px 0', alignSelf: 'flex-start' }}>Enter code*</p>
                          
                          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                            {otpDigits.map((d, i) => (
                              <input
                                key={i}
                                id={und-otp-}
                                value={d}
                                maxLength={1}
                                inputMode="numeric"
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '').slice(-1);
                                  const next = [...otpDigits]; next[i] = v; setOtpDigits(next);
                                  if (v && i < 3) document.getElementById(und-otp-)?.focus();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                                      const prev = document.getElementById(und-otp-);
                                      if (prev) {
                                          prev.focus();
                                          const next = [...otpDigits]; next[i - 1] = ''; setOtpDigits(next);
                                      }
                                  }
                                }}
                                style={{
                                  width: 70, height: 66, boxSizing: 'border-box', textAlign: 'center', 
                                  fontSize: 24, fontWeight: 600, color: '#D4AF37', fontFamily: 'var(--font-dm-sans)', 
                                  borderRadius: 8, 
                                  border: d ? '1px solid #D4AF37' : '1px solid rgba(134, 146, 166, 0.5)', 
                                  background: '#FFFFFF', outline: 'none'
                                }}
                              />
                            ))}
                          </div>
                          
                          <p style={{ textAlign: 'right', margin: '16px 0 0 0', fontSize: 12, fontFamily: 'var(--font-dm-sans)', color: '#696F79' }}>
                            Didn’t get code? <button type="button" onClick={() => toast("If you didn't receive a code, please try paying again.", 'info')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#D4AF37', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }}>Resend</button>
                          </p>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#16151C', fontFamily: 'var(--font-dm-sans)', lineHeight: '30px', margin: '60px 0 80px', padding: '0 10px' }}>
                          To authorize this payment, enter the OTP sent to the email <strong>{user?.email || 'Bems.arella@gmail.com'}</strong> attached to your studio arella account
                        </p>

                        <button
                          onClick={handleSubmitFundOtp}
                          disabled={verifyingOtp}
                          style={{
                            width: '100%', maxWidth: '468px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: verifyingOtp ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto', alignSelf: 'center'
                          }}
                        >
                          {verifyingOtp ? 'Verifying...' : 'Pay'}
                        </button>
                      </div>
                    )}
"""

content = content[:start_index] + new_otp_step + content[end_index:]

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

