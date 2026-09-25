import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_index = content.find("                    {fundStep === 'add-card' && (")
end_index = content.find("                    {fundStep === 'add-card-otp' && (")

new_add_card_step = """                    {fundStep === 'add-card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: '420px', margin: '30px 0 60px' }}>
                          
                          <div style={{ position: 'relative', width: '100%' }}>
                            <select
                              value={newCardForm.bank || ''}
                              onChange={(e) => setNewCardForm({ ...newCardForm, bank: e.target.value })}
                              style={{ 
                                width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                color: newCardForm.bank ? '#101828' : 'rgba(162, 161, 168, 0.8)', 
                                fontSize: 17, fontFamily: 'var(--font-dm-sans)', appearance: 'none', fontWeight: 300 
                              }}
                            >
                              <option value="" disabled hidden>--- Select bank ---</option>
                              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          <input
                            placeholder="Card holder's name"
                            value={newCardForm.name}
                            onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
                            style={{ 
                              width: '100%', height: 56, padding: '16px', borderRadius: 10, 
                              border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                              color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' 
                            }}
                          />

                          <div style={{ position: 'relative', width: '100%' }}>
                            <input
                              placeholder="Card number"
                              value={newCardForm.number}
                              onChange={(e) => setNewCardForm({ ...newCardForm, number: e.target.value })}
                              style={{ 
                                width: '100%', height: 56, padding: '16px 80px 16px 16px', borderRadius: 10, 
                                border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', 
                                color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' 
                              }}
                            />
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                              <div style={{ width: 20, height: 16, background: '#FFFFFF', border: '0.7px solid #C5CDD0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                <svg width="14" height="5" viewBox="0 0 14 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5.09995 0L3.34995 4.33333H2.24995L1.34995 0.733333C1.29995 0.466667 1.09995 0.333333 0.799951 0.266667L0 0.0666666V0H1.69995C1.99995 0 2.29995 0.2 2.34995 0.533333L2.79995 2.8L4.14995 0H5.09995ZM10 2.93333C10 1.93333 8.59995 1.86667 8.59995 1.33333C8.59995 1.2 8.74995 1 9.04995 0.933333C9.19995 0.933333 9.64995 0.866667 10.0999 1.06667L10.2999 0.2C10.0999 0.133333 9.69995 0 9.34995 0C8.29995 0 7.54995 0.533333 7.54995 1.46667C7.54995 2.13333 8.14995 2.46667 8.59995 2.73333C9.09995 2.93333 9.29995 3.13333 9.29995 3.33333C9.29995 3.66667 8.84995 3.86667 8.59995 3.86667C8.09995 3.86667 7.74995 3.66667 7.49995 3.53333L7.29995 4.4C7.54995 4.53333 7.99995 4.6 8.49995 4.6C9.59995 4.6 10 4.06667 10 2.93333ZM12.7 4.53333H13.75L13.1 0.266667H12.2C11.95 0.266667 11.75 0.4 11.65 0.6L10 4.53333H11.1L11.3 3.86667H12.6L12.7 4.53333ZM11.6 3.06667L12.1 1.6L12.45 3.06667H11.6ZM7.04995 0.266667H6.04995L5.44995 4.53333H6.44995L7.04995 0.266667Z" fill="#1B2E86"/>
                                </svg>
                              </div>
                              <div style={{ width: 20, height: 16, background: '#FFFFFF', border: '0.7px solid #C5CDD0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#EB001B"/>
                                  <circle cx="9.5" cy="4.5" r="4.5" fill="#F79E1B"/>
                                  <path d="M7 8.25C8.03553 7.52554 8.7 6.0964 8.7 4.5C8.7 2.9036 8.03553 1.47446 7 0.75C5.96447 1.47446 5.3 2.9036 5.3 4.5C5.3 6.0964 5.96447 7.52554 7 8.25Z" fill="#FF5F00"/>
                                </svg>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                            <input
                              placeholder="Expiry date (MM/YY)"
                              value={newCardForm.expiry}
                              onChange={(e) => setNewCardForm({ ...newCardForm, expiry: e.target.value })}
                              style={{ width: '100%', flex: 1, height: 56, padding: '16px', borderRadius: 10, border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' }}
                            />
                            <input
                              placeholder="CVV"
                              value={newCardForm.cvv}
                              onChange={(e) => setNewCardForm({ ...newCardForm, cvv: e.target.value })}
                              style={{ width: '100%', flex: 1, height: 56, padding: '16px', borderRadius: 10, border: '1px solid rgba(162, 161, 168, 0.2)', background: '#FFFFFF', color: '#101828', fontSize: 17, fontFamily: 'var(--font-dm-sans)', fontWeight: 300, boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleAddCard}
                          disabled={addingCard}
                          style={{
                            width: '100%', maxWidth: '420px', height: 56, background: '#D4AF37',
                            borderRadius: 6, border: 'none', cursor: addingCard ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 500,
                            color: '#000000', margin: '0 auto', alignSelf: 'center'
                          }}
                        >
                          {addingCard ? 'Adding...' : 'Add card'}
                        </button>
                      </div>
                    )}
"""

if start_index != -1 and end_index != -1:
    content = content[:start_index] + new_add_card_step + content[end_index:]
    
    # Also fix state initialization to make the select placeholder work:
    content = content.replace(
        "const [newCardForm, setNewCardForm] = useState({ bank: BANKS[0], name: '', number: '', expiry: '', cvv: '' });",
        "const [newCardForm, setNewCardForm] = useState({ bank: '', name: '', number: '', expiry: '', cvv: '' });"
    )

    with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated add-card step successfully")
else:
    print("Could not find bounds")
