import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Top Cards
old_cards_pattern = re.compile(r"\{\s*label:\s*'Total campaigns'.*?\}\)\s*\)\}\s*<\/div>", re.DOTALL)

new_cards = """{ label: 'Total campaigns', value: '5', pct: '+10.0%', isDown: false },
                { label: 'Total budget (NGN)', value: '₦4,500,000.00', pct: '+10.0%', isDown: false },
                { label: 'Total spent', value: '₦2,000,000.00', pct: '-7.0%', isDown: true },
                { label: 'Total impressions', value: '1.8M', pct: '+10.0%', isDown: false },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[8px] p-[24px] border border-[rgba(214,214,214,0.7)] h-[150px] flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-[5px]">
                    <p className="text-[16px] font-medium text-[#2B2E48] tracking-[0.01em]">{stat.label}</p>
                    <span className="text-[24px] font-medium text-[#2B2E48]">{stat.value}</span>
                  </div>
                  <div className={`flex w-fit items-center justify-center px-[5px] py-[3px] rounded-[50px] gap-[3px] ${stat.isDown ? 'bg-[rgba(199,16,38,0.15)]' : 'bg-[rgba(11,138,0,0.15)]'}`}>
                    {stat.isDown ? <TrendingDown size={14} className="text-[#C71026]" /> : <TrendingUp size={14} className="text-[#0B8A00]" />}
                    <span className={`text-[14px] font-normal ${stat.isDown ? 'text-[#C71026]' : 'text-[#0B8A00]'}`}>{stat.pct.replace('+', '').replace('-', '')}</span>
                  </div>
                </div>
              ))}
            </div>"""

content = old_cards_pattern.sub(new_cards, content)

# 2. Update Table Headers
old_thead_pattern = re.compile(r"<thead.*?>.*?</thead>", re.DOTALL)
new_thead = """<thead className="bg-[#F1F3F4] text-[#7D7D7D] font-dm-sans h-[50px]">
                    <tr>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left rounded-tl-[8px]">Campaign info</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left">Scheduled For</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left">Budget (NGN)</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left">Spent (NGN)</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left">Impressions</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left">Status</th>
                      <th className="px-[14px] py-[8px] text-[14px] font-normal text-left rounded-tr-[8px]">Action</th>
                    </tr>
                  </thead>"""
content = old_thead_pattern.sub(new_thead, content)

# 3. Update Table Rows
old_tr_pattern = re.compile(r"<tr\s*key=\{c\.id\}\s*className=\"border-b border-\[rgba\(162,161,168,0\.1\)\] hover:bg-slate-50 transition-colors cursor-pointer group\">.*?</tr>", re.DOTALL)
new_tr = """<tr 
                      key={c.id} 
                      className="bg-white border-b border-[#DCDCDD] hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-[14px] py-[18px] text-[16px] text-[#2B2E48] tracking-[0.01em]">
                        {c.name}
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] text-[#2B2E48] tracking-[0.01em]">
                        {new Date(c.created_at).toLocaleDateString('en-GB').replace(/\\//g, '-')} 12PM
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] text-[#2B2E48] tracking-[0.01em]">
                        {c.budget.toLocaleString()}
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] text-[#2B2E48] tracking-[0.01em]">
                        {c.spent.toLocaleString()}
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] text-[#2B2E48] tracking-[0.01em]">
                        {c.impressions.toLocaleString()}
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] tracking-[0.01em]">
                        <span className={`capitalize ${
                          c.status === 'active' ? 'text-[#91C600]' :
                          c.status === 'paused' ? 'text-[#FF4E2B]' :
                          c.status === 'ended' ? 'text-[#FF4E2B]' :
                          c.status === 'cancelled' ? 'text-[#FF4E2B]' :
                          'text-[#D4AF37]'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-[14px] py-[18px] text-[16px] tracking-[0.01em] text-[#D4AF37]">
                        View
                      </td>
                    </tr>"""
content = old_tr_pattern.sub(new_tr, content)

# 4. Update 'Create campaign' button text
content = content.replace(">Create campaign<", ">Create New Campaign<")

# 5. Extract 'card-confirm' from the shared modal arrays
content = content.replace("['card', 'card-confirm', 'wallet', 'otp', 'success'].includes(wizardStep)",
                          "['card', 'wallet', 'otp', 'success'].includes(wizardStep)")

# Remove the old card-confirm block
old_card_confirm_pattern = re.compile(r"\{\s*wizardStep === 'card-confirm' && \(\s*<>\s*<div className=\"flex flex-col gap-3 mb-4\">.*?</>\s*\)\s*\}", re.DOTALL)
content = old_card_confirm_pattern.sub("", content)

# Remove any old header references to card-confirm (we can just leave it since the modal doesn't trigger, but let's be clean)
content = content.replace("{wizardStep === 'card-confirm' && `Pay with ${savedCards.find((c) => c.id === selectedCardId)?.bank || savedCards.find((c) => c.id === selectedCardId)?.card_type || 'card'} card`}", "")


# 6. Inject the NEW card-confirm Modal
new_card_confirm_modal = """
          {/* ─── CREATE CAMPAIGN: STEP 3 — CARD CONFIRM (WEMA) ─── */}
          {createModalOpen && wizardStep === 'card-confirm' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div 
                className="bg-[#FFFFFF] rounded-[32px] w-[625px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col"
                style={{ height: '836px', fontFamily: 'var(--font-dm-sans)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-[40px] pt-[40px]">
                  <button onClick={() => setWizardStep('card')} className="text-black hover:opacity-70 transition-opacity">
                    <ArrowLeft size={24} strokeWidth={2} />
                  </button>
                  <span className="text-[20px] font-medium text-black">Pay with Wema card</span>
                  <button onClick={resetWizard} className="text-black hover:opacity-70 transition-opacity">
                    <X size={24} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center w-full px-[60px] pt-[80px]">
                  <p className="text-[16px] font-bold text-black text-center mb-[60px] leading-[26px]">
                    {billingHeader || '3 months Ad space'} at<br/>
                    #{budgetAmount.toLocaleString()}
                  </p>
                  
                  <div className="w-full flex flex-col gap-[20px]">
                    <input 
                      type="text" 
                      placeholder="Enter amount" 
                      className="w-full h-[54px] px-[20px] rounded-[12px] border border-[rgba(162,161,168,0.2)] text-[16px] text-black focus:outline-none focus:border-[#D4AF37] placeholder:text-[rgba(22,21,28,0.3)] font-light"
                    />
                    
                    <input 
                      type="text" 
                      placeholder="Lilian Okoro" 
                      className="w-full h-[54px] px-[20px] rounded-[12px] border border-[rgba(162,161,168,0.2)] text-[16px] text-black focus:outline-none focus:border-[#D4AF37] placeholder:text-[rgba(22,21,28,0.3)] font-light"
                    />
                    
                    <div className="relative w-full">
                      <input 
                        type="text" 
                        placeholder="**** **** **** 0493" 
                        className="w-full h-[54px] px-[20px] rounded-[12px] border border-[rgba(162,161,168,0.2)] text-[16px] text-black focus:outline-none focus:border-[#D4AF37] placeholder:text-[rgba(22,21,28,0.3)] font-light pr-[50px]"
                      />
                      <div className="absolute right-[20px] top-[17px] w-[24px] h-[20px] flex items-center justify-center">
                        <div className="w-[12px] h-[12px] bg-[#EB001B] rounded-full absolute left-0 z-10 opacity-90"></div>
                        <div className="w-[12px] h-[12px] bg-[#F79E1B] rounded-full absolute left-[8px] z-0 opacity-90"></div>
                      </div>
                    </div>

                    <div className="flex w-full gap-[20px]">
                      <input 
                        type="text" 
                        placeholder="Expiry date (02/28)" 
                        className="w-full h-[54px] px-[20px] rounded-[12px] border border-[rgba(162,161,168,0.2)] text-[16px] text-black focus:outline-none focus:border-[#D4AF37] placeholder:text-[rgba(22,21,28,0.3)] font-light"
                      />
                      <input 
                        type="text" 
                        placeholder="346" 
                        className="w-full h-[54px] px-[20px] rounded-[12px] border border-[rgba(162,161,168,0.2)] text-[16px] text-black focus:outline-none focus:border-[#D4AF37] placeholder:text-[rgba(22,21,28,0.3)] font-light"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        toast('Payment successful', 'success');
                        setWizardStep('success');
                    }}
                    className="w-full h-[54px] mt-[60px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] text-[16px] font-normal rounded-[8px] transition-colors"
                  >
                    Pay
                  </button>
                </div>
              </div>
            </div>
          )}
"""
content = content.replace("{/* ─── CREATE CAMPAIGN: STEP 3 — BILLING (NEW DESIGN) ─── */}", new_card_confirm_modal + "\n          {/* ─── CREATE CAMPAIGN: STEP 3 — BILLING (NEW DESIGN) ─── */}")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied layout updates to page.tsx.")
