import re

with open('app/ads/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import React from 'react';", "import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';")
content = content.replace("import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';", "import { ChevronLeft, ChevronRight, Settings2, Search, Check } from 'lucide-react';")

# 2. Add state to AdsPage
state_injection = """export default function AdsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ live: true, inReview: false, ended: false });

  return ("""
content = content.replace("export default function AdsPage() {\n  return (", state_injection)

# 3. Add onClick to Filter button
filter_btn = """<button className="h-[40px] px-4 flex items-center gap-2 border border-[rgba(162,161,168,0.2)] rounded-[8px] text-[14px] text-[#16151C] hover:bg-slate-50 transition-colors font-medium">"""
filter_btn_new = """<button onClick={() => setShowFilter(true)} className="h-[40px] px-4 flex items-center gap-2 border border-[rgba(162,161,168,0.2)] rounded-[8px] text-[14px] text-[#16151C] hover:bg-slate-50 transition-colors font-medium">"""
content = content.replace(filter_btn, filter_btn_new)

# 4. Add the Modal component right before closing DashboardLayout
modal_jsx = """
      {/* Filter Modal Overlay */}
      <AnimatePresence>
        {showFilter && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-[383px] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex flex-col relative"
              style={{ fontFamily: F }}
            >
              {/* Header */}
              <div className="px-5 pt-[20px] pb-[16px] border-b border-[rgba(162,161,168,0.1)]">
                <h2 className="text-[20px] font-semibold text-[#16151C] leading-[30px]">Filter</h2>
              </div>

              {/* Body */}
              <div className="px-[20px] pt-[24px] pb-[32px] flex flex-col gap-[22px]">
                
                {/* Search Input */}
                <div className="h-[50px] w-full rounded-[10px] border border-[rgba(162,161,168,0.1)] flex items-center px-[16px] gap-[10px]">
                  <Search size={24} className="text-[#16151C]" />
                  <input 
                    type="text" 
                    placeholder="Search Employee" 
                    className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-[rgba(22,21,28,0.2)] text-[#16151C] font-light"
                  />
                </div>

                {/* All Ads bookings */}
                <div className="flex flex-col gap-[16px] mt-2">
                  <h3 className="text-[16px] font-semibold text-[#16151C] leading-[24px]">All Ads bookings</h3>
                  
                  <div className="flex flex-col gap-[16px]">
                    {/* Row 1 */}
                    <div className="flex items-center gap-[30px]">
                      <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, live: !f.live}))}>
                        <div className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center transition-colors ${filters.live ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.2)]'}`}>
                          {filters.live && <Check size={16} strokeWidth={3} className="text-[#16151C]" />}
                        </div>
                        <span className="text-[16px] text-[#16151C] font-light leading-[24px]">Live</span>
                      </label>
                      
                      <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, inReview: !f.inReview}))}>
                        <div className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center transition-colors ${filters.inReview ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.2)]'}`}>
                          {filters.inReview && <Check size={16} strokeWidth={3} className="text-[#16151C]" />}
                        </div>
                        <span className="text-[16px] text-[#16151C] font-light leading-[24px]">In review</span>
                      </label>
                    </div>

                    {/* Row 2 */}
                    <label className="flex items-center gap-[10px] cursor-pointer" onClick={() => setFilters(f => ({...f, ended: !f.ended}))}>
                      <div className={`w-[24px] h-[24px] rounded-[4px] flex items-center justify-center transition-colors ${filters.ended ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-[1.5px] border-[rgba(162,161,168,0.2)]'}`}>
                        {filters.ended && <Check size={16} strokeWidth={3} className="text-[#16151C]" />}
                      </div>
                      <span className="text-[16px] text-[#16151C] font-light leading-[24px]">Ended</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-[20px] pb-[20px] flex items-center justify-between">
                <button 
                  onClick={() => setShowFilter(false)} 
                  className="w-[166px] h-[50px] rounded-[10px] border border-[rgba(162,161,168,0.2)] text-[#16151C] text-[16px] font-normal flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowFilter(false)} 
                  className="w-[166px] h-[50px] rounded-[6px] bg-[#D4AF37] text-[#000000] text-[16px] font-normal flex items-center justify-center hover:bg-[#b58b24] transition-colors"
                >
                  Apply
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
"""

content = content.replace("    </DashboardLayout>", modal_jsx)

with open('app/ads/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal added successfully!")
