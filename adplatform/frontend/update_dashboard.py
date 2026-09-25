import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change grid-cols-2 to grid-cols-3
old_grid = '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">'
new_grid = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
content = content.replace(old_grid, new_grid)

# 2. Update the "Add A Bank Card" button action
old_button = '<button onClick={() => setShowLinkBankModal(true)} className="flex items-center justify-center w-full max-w-[287px] bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px]">'
new_button = '<button onClick={() => { setShowFundModal(true); setFundStep(\'add-card\'); }} className="flex items-center justify-center w-full max-w-[287px] bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px]">'
content = content.replace(old_button, new_button)

# 3. Add the new Dedicated Account card after Linked Bank Card
linked_card_end = '</div>\n                </div>\n              </div>'
search_str = '{/* Mastercard circles placeholder */}'
if search_str in content:
    # Find the end of the Linked Bank Card div
    idx = content.find(linked_card_end, content.find(search_str))
    if idx != -1:
        insert_idx = idx + len(linked_card_end)
        new_card = """

              {/* Dedicated Account Card */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Dedicated Account</h3>
                </div>
                
                {!hasReservedAccount ? (
                  <>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#667085', lineHeight: 1.4, marginTop: '8px' }}>
                      Generate a dedicated bank account number to easily fund your wallet via direct transfer.
                    </p>
                    <button onClick={() => setShowReservedModal(true)} className="mt-auto flex items-center justify-center w-full bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#FFFFFF' }}>Generate Account</span>
                    </button>
                  </>
                ) : (
                  <div className="mt-[12px] flex flex-col gap-[8px] flex-1 justify-center">
                    <div className="flex justify-between items-center bg-[#F9FAFB] p-[10px] rounded-[10px] border border-[#F0F0F0]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#667085' }}>Bank</span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{dedicatedBank || 'Wema Bank'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F9FAFB] p-[10px] rounded-[10px] border border-[#F0F0F0]">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#667085' }}>Account</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '13px', color: '#101828' }}>{dedicatedAcct}</span>
                        <button onClick={() => navigator.clipboard.writeText(dedicatedAcct)} className="text-[#D4AF37] hover:text-[#b99830]" title="Copy">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 mt-1">
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#667085' }}>{balance?.reserved_account_name || `Studio Arella / ${user?.name || 'Creator'}`}</span>
                    </div>
                  </div>
                )}
              </div>"""
        content = content[:insert_idx] + new_card + content[insert_idx:]

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated page.tsx with Dedicated Account UI")
