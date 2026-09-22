import re
with open('app/book/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "step === 'card' && (" in line:
        start_idx = i
    if "step === 'otp' && (" in line:
        end_idx = i - 1
        break

while lines[end_idx].strip() == '' or lines[end_idx].strip() == '}':
    end_idx -= 1
# Include the )}
end_idx += 1

replacement = """                {step === 'card' && (
                  <div className="w-full max-w-[420px] flex flex-col items-center h-full mx-auto relative">
                    <p className="text-center text-[16px] font-bold text-[#101828] mb-12">
                      {durationCount} {durationUnit === 'hourly' ? 'hours' : durationUnit === 'weekly' ? 'weeks' : 'months'} Ad space at<br/>
                      {formatCurrency(totalCost, currency, rates)}
                    </p>
                    
                    {selectedPaymentMethod === 'card' ? (
                      <div className="w-full space-y-[24px] mb-[40px]">
                        {/* Select bank */}
                        <div className="relative w-full">
                          <select className="w-full h-[56px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-[16px] text-[17px] text-[rgba(162,161,168,0.8)] font-light outline-none focus:border-[#D4AF37] appearance-none cursor-pointer">
                            <option value="" disabled selected>--- Select bank ---</option>
                            <option value="gtb" className="text-black">GTB</option>
                            <option value="wema" className="text-black">Wema</option>
                            <option value="access" className="text-black">Access</option>
                          </select>
                          <ChevronDown size={24} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16151C] pointer-events-none" />
                        </div>

                        {/* Enter card name */}
                        <div className="w-full">
                          <input placeholder="Enter card name" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full h-[56px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-[16px] text-[17px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>

                        {/* Enter card number */}
                        <div className="relative w-full">
                          <input placeholder="Enter card number" value={cardForm.number} onChange={(e) => setCardForm({...cardForm, number: e.target.value})} className="w-full h-[56px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-[16px] text-[17px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-[20px] h-[16px] relative flex items-center justify-center border border-[#C5CDD0] rounded-[2px] bg-[#FFFFFF] overflow-hidden">
                              <div className="w-[9px] h-[9px] rounded-full bg-[#EB001B] absolute left-[0.5px] mix-blend-multiply opacity-90" />
                              <div className="w-[9px] h-[9px] rounded-full bg-[#F79E1B] absolute right-[0.5px] mix-blend-multiply opacity-90" />
                            </div>
                          </div>
                        </div>

                        {/* Expiry and CVV */}
                        <div className="flex gap-[20px]">
                          <input placeholder="Expiry date (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})} className="w-full h-[56px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-[16px] text-[17px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})} className="w-full h-[56px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-[16px] text-[17px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-[20px] mb-[68px]">
                        <input placeholder="Enter amount" className="w-full h-[60px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-4 text-[16px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        <input placeholder="Lilian Okoro" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full h-[60px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-4 text-[16px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        <div className="relative w-full">
                          <input placeholder="**** **** **** 0493" value={cardForm.number} onChange={(e) => setCardForm({...cardForm, number: e.target.value})} className="w-full h-[60px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-4 text-[16px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-[30px] h-[20px] relative flex items-center justify-center border rounded-[2px] bg-white overflow-hidden p-0.5">
                              <div className="w-[12px] h-[12px] rounded-full bg-[#EA001B] absolute left-1 mix-blend-multiply opacity-90" />
                              <div className="w-[12px] h-[12px] rounded-full bg-[#F79E1B] absolute right-1 mix-blend-multiply opacity-90" />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-[20px]">
                          <input placeholder="Expiry date (MM/YY)" value={cardForm.expiry} onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})} className="w-full h-[60px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-4 text-[16px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                          <input placeholder="CVV" value={cardForm.cvv} onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})} className="w-full h-[60px] rounded-[10px] border border-[rgba(162,161,168,0.2)] bg-[#FFFFFF] px-4 text-[16px] text-[#16151C] font-light outline-none focus:border-[#D4AF37] placeholder:text-[rgba(162,161,168,0.8)]" />
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === 'card' && (
                      <div className="w-full flex items-center gap-[10px] mb-[64px]">
                        <div className="w-[20px] h-[20px] relative rounded-[4px] flex items-center justify-center bg-[#D4AF37] border border-[#D4AF37] cursor-pointer">
                           <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                        </div>
                        <span className="text-[16px] font-normal text-[#696F79]">Add this card</span>
                      </div>
                    )}

                    <div className="w-full mt-auto mb-8">
                      <button onClick={handlePayCard} disabled={paying} className="w-full h-[56px] bg-[#D4AF37] hover:bg-[#b58b24] text-[#000000] rounded-[6px] text-[16px] font-medium transition-colors flex items-center justify-center gap-2">
                        {paying && <div className="w-4 h-4 border-2 border-[rgba(0,0,0,0.3)] border-t-black rounded-full animate-spin" />}
                        {paying ? 'Processing...' : 'Pay'}
                      </button>
                    </div>
                  </div>
                )}
"""

lines[start_idx:end_idx+1] = [replacement]

with open('app/book/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
