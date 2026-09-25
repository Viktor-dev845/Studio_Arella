import os

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    {showFilter && (
                      <div 
                        className="absolute right-0 top-[60px] z-50 bg-white shadow-2xl p-[24px] flex flex-col"
                        style={{ width: '400px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-body">Filter</h3>
                        
                        {/* Search Input */}
                        <div className="relative mb-8">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                           <input 
                             type="text" 
                             placeholder="Search Employee" 
                             className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-[12px] text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-body font-light placeholder:text-gray-300" 
                           />
                        </div>

                        <h4 className="font-bold text-gray-900 mb-4 text-[16px] font-body">All Ad bookings</h4>
                        <div className="flex items-center gap-8 mb-10">
                           <label className="flex items-center gap-3 cursor-pointer">
                              <div className="w-[20px] h-[20px] rounded-[4px] bg-[#D4AF37] flex items-center justify-center">
                                 <Check size={14} className="text-white" strokeWidth={3} />
                              </div>
                              <span className="text-gray-700 text-[15px] font-body">Status</span>
                           </label>
                           <label className="flex items-center gap-3 cursor-pointer">
                              <div className="w-[20px] h-[20px] rounded-[4px] border border-gray-200 flex items-center justify-center bg-white">
                              </div>
                              <span className="text-gray-700 text-[15px] font-body">By duration</span>
                           </label>
                        </div>

                        <div className="flex gap-4">
                           <button 
                             onClick={() => setShowFilter(false)} 
                             className="flex-1 py-3 bg-white border border-gray-200 rounded-[12px] text-gray-700 font-medium hover:bg-gray-50 transition-colors font-body text-[16px]"
                           >
                              Cancel
                           </button>
                           <button 
                             onClick={() => setShowFilter(false)} 
                             className="flex-1 py-3 bg-[#D4AF37] rounded-[12px] text-[#16151C] font-medium hover:opacity-90 transition-opacity font-body text-[16px]"
                           >
                              Apply
                           </button>
                        </div>
                      </div>
                    )}"""

replacement = """                    {showFilter && (
                      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#16151C]/20 backdrop-blur-[4px]">
                        <div className="bg-white rounded-[20px] p-[32px] flex flex-col w-[420px] shadow-2xl relative font-body animate-in fade-in zoom-in-95 duration-200">
                          
                          <h3 className="text-[20px] font-bold text-[#16151C] mb-[32px]">Filter</h3>
                          
                          {/* Search Input */}
                          <div className="relative mb-[32px]">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                             <input 
                               type="text" 
                               placeholder="Search Employee" 
                               className="w-full h-[50px] pl-11 pr-4 bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] text-gray-900 focus:outline-none focus:border-[#D4AF37] font-body font-light placeholder:text-[rgba(22,21,28,0.3)]" 
                             />
                          </div>

                          <h4 className="font-semibold text-[#16151C] mb-[20px] text-[16px]">
                            {activeTab === 'podcast' ? 'All podcast studio session bookings' : 'All Ad bookings'}
                          </h4>
                          
                          <div className="flex items-center gap-[40px] mb-[40px]">
                             <label className="flex items-center gap-[12px] cursor-pointer">
                                <div className="w-[20px] h-[20px] rounded-[4px] bg-[#D4AF37] flex items-center justify-center">
                                   <Check size={14} className="text-white" strokeWidth={3} />
                                </div>
                                <span className="text-[#16151C] text-[16px] font-light">Status</span>
                             </label>
                             <label className="flex items-center gap-[12px] cursor-pointer">
                                <div className="w-[20px] h-[20px] rounded-[4px] border border-[rgba(162,161,168,0.5)] flex items-center justify-center bg-transparent">
                                </div>
                                <span className="text-[#16151C] text-[16px] font-light">By duration</span>
                             </label>
                          </div>

                          <div className="flex gap-[20px]">
                             <button 
                               onClick={() => setShowFilter(false)} 
                               className="flex-1 h-[48px] bg-transparent border-[1.5px] border-[#D4AF37] rounded-[6px] text-[#D4AF37] font-medium hover:bg-gray-50 transition-colors text-[14px]"
                             >
                                Cancel
                             </button>
                             <button 
                               onClick={() => setShowFilter(false)} 
                               className="flex-1 h-[48px] bg-[#D4AF37] rounded-[6px] text-[#16151C] font-medium hover:opacity-90 transition-opacity text-[14px]"
                             >
                                Apply
                             </button>
                          </div>
                        </div>
                      </div>
                    )}"""

if target in content:
    new_content = content.replace(target, replacement)
    with open('app/bookings/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Replaced successfully')
else:
    print('Target not found')
