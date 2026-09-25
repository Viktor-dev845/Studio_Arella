import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_index = content.find("                    {fundStep === 'confirm' && (")
end_index = content.find("                    {fundStep === 'otp' && (")

new_confirm_step = """                    {fundStep === 'confirm' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: '420px', marginTop: 10 }}>
                          <input
                            placeholder="Enter amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                          <input
                            placeholder="Card holder's name"
                            value={confirmCardForm.name}
                            onChange={(e) => setConfirmCardForm({ ...confirmCardForm, name: e.target.value })}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ position: 'relative', width: '100%', height: 56 }}>
                            <input
                              placeholder="Card number"
                              value={confirmCardForm.number}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, number: e.target.value })}
                              style={{ 
                                width: '100%', height: '100%', padding: '16px 50px 16px 16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box', letterSpacing: '0.02em'
                              }}
                            />
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 24, height: 16, display: 'flex', alignItems: 'center' }}>
                              <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#EB001B"/>
                                <circle cx="16" cy="8" r="8" fill="#F79E1B"/>
                                <path d="M12 14.5C10.5 13.1 9.5 10.7 9.5 8C9.5 5.3 10.5 2.9 12 1.5C13.5 2.9 14.5 5.3 14.5 8C14.5 10.7 13.5 13.1 12 14.5Z" fill="#FF5F00"/>
                              </svg>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                            <input
                              placeholder="Expiry date (MM/YY)"
                              value={confirmCardForm.expiry}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, expiry: e.target.value })}
                              style={{ 
                                flex: 1, height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                            <input
                              placeholder="CVV"
                              value={confirmCardForm.cvv}
                              onChange={(e) => setConfirmCardForm({ ...confirmCardForm, cvv: e.target.value })}
                              style={{ 
                                flex: 1, height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                fontFamily: 'var(--font-dm-sans)', fontSize: 17, fontWeight: 300, color: '#101828',
                                outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={handleFundWithSavedCard}
                          disabled={paying}
                          style={{
                            width: '100%', maxWidth: '420px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', marginTop: 100, marginBottom: 20
                          }}
                        >
                          {paying ? 'Funding...' : 'Fund wallet'}
                        </button>
                      </div>
                    )}
"""

content = content[:start_index] + new_confirm_step + content[end_index:]

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

