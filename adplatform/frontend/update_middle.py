import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The regex searches for the middle section
middle_section_regex = r'({\/\* Middle Section \(2 cards\) \*\/.*?)<\!-- Bottom Section'

new_middle_section = '''{/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Total Transaction */}
              <div className="rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm" style={{ height: '176px', background: 'linear-gradient(95.19deg, rgba(212, 175, 55, 0.1) 29.12%, rgba(126, 84, 0, 0.033) 111.32%, rgba(217, 192, 28, 0.033) 111.32%)', border: '1px solid #D7D7D7' }}>
                <div className="flex flex-col gap-2">
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Total Transaction</h3>
                   <div className="w-[30px] h-[25px] flex items-center justify-center rounded-[8px]" style={{ background: 'rgba(3, 197, 210, 0.2)' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#005055' }}>45</span>
                   </div>
                </div>
                <div className="flex justify-between items-center w-full mt-auto">
                  <button className="flex items-center gap-[10px] w-full max-w-[287px] bg-[#FFFFFF] shadow-sm rounded-[14px] px-[20px] py-[14px] border border-[#F0F0F0] hover:bg-gray-50">
                    <div className="w-[24px] h-[24px] bg-[#E5F9FA] rounded-full flex items-center justify-center">
                      <Download size={14} color="#005055" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#101828' }}>Download transaction history</span>
                  </button>
                </div>
              </div>

              {/* Linked Bank Card */}
              <div className="rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm" style={{ height: '176px', background: 'linear-gradient(95.19deg, rgba(212, 175, 55, 0.1) 29.12%, rgba(126, 84, 0, 0.033) 111.32%, rgba(217, 192, 28, 0.033) 111.32%)', border: '1px solid #D7D7D7' }}>
                <div className="flex justify-between items-start w-full">
                   <div className="flex flex-col gap-2">
                      <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Linked Bank Account</h3>
                      <div className="w-[30px] h-[25px] flex items-center justify-center rounded-[8px]" style={{ background: 'rgba(227, 24, 24, 0.2)' }}>
                         <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#E31818' }}>4</span>
                      </div>
                   </div>
                   
                   {/* Bank Logos */}
                   <div className="flex gap-[12px]">
                      <div className="w-[92px] h-[48px] bg-white border border-[#D7D7D7] rounded-[6px] flex items-center justify-center p-[8px_14px]">
                         <div className="w-[32px] h-[32px] rounded-full bg-[#E35205] border-[2px] border-white flex items-center justify-center text-[8px] text-white font-bold">GTB</div>
                      </div>
                      <div className="w-[92px] h-[48px] bg-white border border-[#D7D7D7] rounded-[6px] flex items-center justify-center p-[8px_14px]">
                         <div className="w-[32px] h-[32px] rounded-full bg-[#60269E] border-[2px] border-white flex items-center justify-center text-[8px] text-white font-bold">POL</div>
                      </div>
                      <div className="w-[92px] h-[48px] bg-white border border-[#D7D7D7] rounded-[6px] flex items-center justify-center p-[8px_14px]">
                         <div className="w-[32px] h-[32px] rounded-full bg-[#005055] border-[2px] border-white flex items-center justify-center text-[8px] text-white font-bold">ACC</div>
                      </div>
                      <div className="w-[92px] h-[48px] bg-white border border-[#D7D7D7] rounded-[6px] flex items-center justify-center p-[8px_14px]">
                         <div className="w-[32px] h-[32px] rounded-full bg-[#5C068C] border-[2px] border-white flex items-center justify-center text-[8px] text-white font-bold">FCMB</div>
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-between items-center w-full mt-auto">
                  <button onClick={() => setShowBemspayModal(true)} className="flex items-center justify-center w-[160px] h-[46px] bg-[#D4AF37] hover:bg-[#c4a130] shadow-sm rounded-[10px] px-[20px] py-[10px]">
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#000000' }}>Link A Bank</span>
                  </button>
                </div>
              </div>

            </div>
            
            {/* Bottom Section'''

start_idx = content.find('{/* Middle Section (2 cards) */}')
if start_idx != -1:
    end_idx = content.find('{/* Bottom Section', start_idx)
    if end_idx != -1:
        new_content = content[:start_idx] + new_middle_section + content[end_idx + 18:]
        with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Replaced middle section successfully.")
    else:
        print("Could not find bottom section")
else:
    print("Could not find middle section")
