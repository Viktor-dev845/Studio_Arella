import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{fundStep === 'add-card-success' && ''}", "{fundStep === 'add-card-success' && 'Add a bank card'}")

close_button_regex = re.compile(r"\{fundStep !== 'add-card-success' \? \(\s*<button\s*onClick=\{resetFundModal\}\s*style=\{\{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' \}\}\s*>\s*<svg.*?</svg>\s*</button>\s*\) : <span style=\{\{ width: 32 \}\} />\}", re.DOTALL)

close_button_replacement = '''<button
                            onClick={resetFundModal}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>'''
content = close_button_regex.sub(close_button_replacement, content)


success_view_regex = re.compile(r"\{fundStep === 'add-card-success' && \(\s*<div style=\{\{ textAlign: 'center' \}\}>.*?</Button>\s*</div>\s*\)\}", re.DOTALL)

success_view_replacement = '''{fundStep === 'add-card-success' && (
                        <div className="flex flex-col items-center justify-center w-full" style={{ padding: '60px 0 20px' }}>
                          <div className="relative flex items-center justify-center mb-6" style={{ width: 70, height: 70 }}>
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.1, filter: 'blur(5px)' }} />
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.15, filter: 'blur(5px)' }} />
                            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }} />
                            <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>

                          <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 20, lineHeight: '30px', color: '#16151C', textAlign: 'center', marginBottom: 40, width: '100%', maxWidth: '415px' }}>
                            {fundSuccessMessage || 'Firstbank card added successfully'}
                          </h3>

                          <button 
                            onClick={backToCardsAfterAdd} 
                            style={{ 
                              display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
                              padding: '10px', gap: '10px', width: '100%', maxWidth: '468px', height: '56px', 
                              background: '#D4AF37', borderRadius: '6px', border: 'none', cursor: 'pointer' 
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: 16, lineHeight: '21px', color: '#000000' }}>Finish</span>
                          </button>
                        </div>
                      )}'''
content = success_view_regex.sub(success_view_replacement, content)

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated page.tsx')
