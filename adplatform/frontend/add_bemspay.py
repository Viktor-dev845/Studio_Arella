import os

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bemspay_modal_code = '''
        {/* ─── MODAL 2: BEMSPAY LINK BANK ─── */}
        <AnimatePresence>
          {showBemspayModal && (
            <>
              <motion.div
                key="bemspay-bd"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBemspayModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
                <motion.div
                  key="bemspay-card"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%', maxWidth: 480, pointerEvents: 'auto' }}
                >
                  <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '40px 32px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', fontFamily: 'var(--font-dm-sans)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    
                    <button
                      onClick={() => setShowBemspayModal(false)}
                      style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-1 mb-[24px]">
                       <div className="relative h-[50px]">
                         <img src="/logo.png" alt="Studio Arella" className="h-full object-contain" />
                       </div>
                    </div>

                    <h2 className="text-center text-[18px] font-medium text-[#101828] mb-[40px] max-w-[250px] leading-snug">
                      This application uses Bemspay to connect your accounts
                    </h2>

                    <div className="flex flex-col gap-[32px] w-full mb-[60px]">
                      <div className="flex gap-[16px]">
                        <div className="w-[24px] h-[24px] flex-shrink-0 text-[#D4AF37]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[16px] font-medium text-[#101828] mb-1">Connect effortlessly</h3>
                          <p className="text-[14px] text-[#667085] leading-relaxed">Bemspay let's you connect your financial account in seconds.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-[16px]">
                        <div className="w-[24px] h-[24px] flex-shrink-0 text-[#D4AF37]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.71277 6.72242C5.66016 7.64417 4.79339 8.76107 4 10C5.52627 12.2592 7.62534 14 10 14C10.7412 14 11.4554 13.8821 12.1332 13.6657M9.22723 9.21959C9.07925 9.4589 9 9.72251 9 10C9 10.5523 9.44772 11 10 11C10.2775 11 10.5411 10.9207 10.7804 10.7728" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 14C15.5263 11.7408 17.6253 10 20 10C19.2066 8.76107 18.3398 7.64417 17.2872 6.72242C15.3533 5.02987 12.7845 4 10 4C9.25877 4 8.54464 4.1179 7.86676 4.33431" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-[16px] font-medium text-[#101828] mb-1">Private</h3>
                          <p className="text-[14px] text-[#667085] leading-relaxed">Bemspay does not sell personal info, and will only use it with your permission.</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[12px] text-center text-[#667085] mb-[20px] max-w-[280px]">
                      By clicking on the button below you agree to Bemspay's <br/>
                      <span className="text-[#101828] font-medium underline cursor-pointer">Terms and Conditions</span>
                    </p>

                    <button 
                      onClick={() => {
                        setShowBemspayModal(false);
                        toast('Bank account linked successfully (mock)', 'success');
                      }}
                      className="w-full h-[50px] bg-[#D4AF37] hover:bg-[#c4a130] rounded-[10px] text-[16px] font-medium text-[#000000] mb-[24px] shadow-sm"
                    >
                      Click to continue
                    </button>
                    
                    <div className="flex items-center justify-center gap-[6px] text-[12px] text-[#98A2B3] font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Secured with Bemspay</span>
                    </div>

                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
'''

if '{/* ─── MODAL 2: BEMSPAY LINK BANK ─── */}' not in content:
    # Inject it right before the closing DashboardLayout
    insert_pos = content.rfind('</DashboardLayout>')
    if insert_pos != -1:
        new_content = content[:insert_pos] + bemspay_modal_code + '\n\n      ' + content[insert_pos:]
        with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Added Bemspay Modal successfully.")
    else:
        print("Could not find closing DashboardLayout")
else:
    print("Bemspay Modal already exists.")
