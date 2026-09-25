import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_index = content.find("                    {fundStep === 'success' && (")
end_index = content.find("                    {fundStep === 'add-card' && (")

new_success_step = """                    {fundStep === 'success' && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '468px', margin: '0 auto', boxSizing: 'border-box' }}>
                        <div style={{ position: 'relative', width: 70, height: 70, margin: '80px auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ position: 'absolute', inset: -36, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.1, filter: 'blur(5px)', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', opacity: 0.15, filter: 'blur(5px)', borderRadius: '50%' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 32, color: '#FFFFFF' }}>✓</span>
                          </div>
                        </div>
                        
                        <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, color: '#16151C', fontFamily: 'var(--font-dm-sans)', lineHeight: '30px', margin: '40px auto 80px', maxWidth: '415px' }}>
                          Wallet funded with successfully. #{amount ? Number(amount).toLocaleString() : '30, 000'} has been added to your wallet balance
                        </p>

                        <button
                          onClick={resetFundModal}
                          style={{
                            width: '100%', maxWidth: '468px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto'
                          }}
                        >
                          Finish
                        </button>
                      </div>
                    )}

"""

if start_index != -1 and end_index != -1:
    content = content[:start_index] + new_success_step + content[end_index:]
    with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated success block successfully")
else:
    print("Could not find bounds")
