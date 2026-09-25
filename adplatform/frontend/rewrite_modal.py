import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()


# Replace header
header_start = content.find("                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>")
header_end = content.find("                    {fundStep === 'cards' && (")

new_header = """                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                      <button
                        onClick={() => {
                          if (fundStep === 'confirm' || fundStep === 'otp') setFundStep('cards');
                          else if (fundStep === 'add-card-otp') setFundStep('add-card');
                          else if (fundStep === 'add-card') setFundStep('cards');
                          else resetFundModal();
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      <h2 style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-dm-sans)', color: '#101828', margin: 0, letterSpacing: '-0.01em' }}>
                        {fundStep === 'cards' && 'Fund wallet'}
                        {fundStep === 'confirm' && Fund with  card}
                        {fundStep === 'otp' && 'Verify payment'}
                        {fundStep === 'success' && ''}
                        {fundStep === 'add-card' && 'Add a bank card'}
                        {fundStep === 'add-card-otp' && 'Verify card'}
                        {fundStep === 'add-card-success' && ''}
                      </h2>
                      
                      {fundStep !== 'success' && fundStep !== 'add-card-success' ? (
                        <button
                          onClick={resetFundModal}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#101828', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      ) : <span style={{ width: 32 }} />}
                    </div>

"""

content = content[:header_start] + new_header + content[header_end:]


# Find cards step
start_index = content.find("                    {fundStep === 'cards' && (")
end_index = content.find("                    {fundStep === 'confirm' && (")

new_cards_step = """                    {fundStep === 'cards' && (
                      <div className="flex flex-col items-center">
                        {loadingCards ? (
                          <p style={{ textAlign: 'center', fontSize: 14, color: theme.color.text3, padding: '16px 0' }}>Loading your saved cards...</p>
                        ) : savedCards.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, width: '100%', maxWidth: '468px', marginTop: 10 }}>
                            {savedCards.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => setSelectedCardId(c.id)}
                                style={{
                                  padding: '24px 32px 24px 24px', 
                                  borderRadius: 16, 
                                  cursor: 'pointer',
                                  border: selectedCardId === c.id ? '2px solid #D4AF37' : 1px solid #D7D7D7,
                                  background: '#FFFFFF',
                                  height: '100px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <span style={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                    border: selectedCardId === c.id ? '2px solid #D4AF37' : '2px solid #D7D7D7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#FFFFFF'
                                  }}>
                                    {selectedCardId === c.id && <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DF4308' }} />}
                                  </span>
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                     <p style={{ margin: 0, fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#101828' }}>
                                        Fund with {c.bank || c.card_type || 'card'}
                                     </p>
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, color: '#101828', letterSpacing: '0.02em', opacity: 0.7 }}>
                                         ************{c.last4 || '****'}
                                       </span>
                                       {c.cardholder_name && (
                                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, color: '#101828', letterSpacing: '0.02em', opacity: 0.7 }}>
                                             {c.cardholder_name}
                                          </span>
                                       )}
                                     </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ textAlign: 'center', fontSize: 14, color: theme.color.text3, marginBottom: 40, marginTop: 10 }}>You have no saved cards yet.</p>
                        )}

                        <button
                          type="button"
                          onClick={() => setFundStep('add-card')}
                          style={{ display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#D4AF37', marginBottom: 40 }}
                        >
                          Add a bank card
                        </button>

                        <button 
                          disabled={!selectedCardId} 
                          onClick={() => setFundStep('confirm')}
                          style={{ 
                             width: '100%', maxWidth: '468px', height: '56px', background: '#D4AF37', borderRadius: 8, 
                             border: 'none', cursor: selectedCardId ? 'pointer' : 'not-allowed', 
                             fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500, color: '#000000',
                             opacity: selectedCardId ? 1 : 0.6
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    )}
"""

content = content[:start_index] + new_cards_step + content[end_index:]

# Replace the modal header and container styles
old_container = "maxWidth: 440, pointerEvents: 'auto'"
new_container = "maxWidth: 625, pointerEvents: 'auto', minHeight: '633px'"
content = content.replace(old_container, new_container)

old_inner_div = "background: theme.color.surface, borderRadius: 24, padding: '28px 24px'"
new_inner_div = "background: '#FFFFFF', borderRadius: 32, padding: '32px 32px 64px'"
content = content.replace(old_inner_div, new_inner_div)

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

