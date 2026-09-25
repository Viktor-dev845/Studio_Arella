import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the Main Dashboard Layout
main_ui_pattern = r'<div style=\{\{\s*fontFamily:\s*F\s*\}\}\s*className="max-w-\[1360px\].*?\{/\*\s*=+ CREATE CAMPAIGN WIZARD =+\s*\*/\}'

main_ui_replacement = """<div style={{ fontFamily: 'var(--font-dm-sans)' }} className="max-w-[1440px] mx-auto p-6 sm:p-10 flex flex-col relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[20px] font-bold text-[#000000] tracking-tight">Campaign</h1>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[rgba(214,214,214,0.7)] rounded-[20px] text-[12px] font-medium text-[#16151C] shadow-sm">
              <span>Today</span>
              <ChevronDown size={14} className="text-[rgba(0,0,0,0.4)]" />
            </button>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px] mb-[40px]">
            {/* Total Campaigns */}
            <div className="w-full bg-white rounded-[8px] p-[24px] border border-[rgba(214,214,214,0.7)] flex flex-col justify-between gap-[35px]">
              <p className="text-[16px] font-medium text-[#2B2E48] tracking-[0.01em]">Total campaigns</p>
              <div className="flex items-center justify-between w-full">
                <span className="text-[24px] font-medium text-[#2B2E48]">5</span>
                <div className="flex items-center justify-center px-[5px] py-[3px] rounded-[50px] bg-[rgba(11,138,0,0.15)] text-[#0B8A00] text-[14px] font-normal gap-[3px]">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  10.0%
                </div>
              </div>
            </div>

            {/* Total Budget */}
            <div className="w-full bg-white rounded-[8px] p-[24px] border border-[rgba(214,214,214,0.7)] flex flex-col justify-between gap-[35px]">
              <p className="text-[16px] font-medium text-[#2B2E48] tracking-[0.01em]">Total budget (NGN)</p>
              <div className="flex items-center justify-between w-full">
                <span className="text-[24px] font-medium text-[#2B2E48]">#4,500,000.00</span>
                <div className="flex items-center justify-center px-[5px] py-[3px] rounded-[50px] bg-[rgba(11,138,0,0.15)] text-[#0B8A00] text-[14px] font-normal gap-[3px]">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  10.0%
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="w-full bg-white rounded-[8px] p-[24px] border border-[rgba(214,214,214,0.7)] flex flex-col justify-between gap-[35px]">
              <p className="text-[16px] font-medium text-[#2B2E48] tracking-[0.01em]">Total spent</p>
              <div className="flex items-center justify-between w-full">
                <span className="text-[24px] font-medium text-[#2B2E48]">#2,000,000.00</span>
                <div className="flex items-center justify-center px-[5px] py-[3px] rounded-[50px] bg-[rgba(199,16,38,0.15)] text-[#C71026] text-[14px] font-normal gap-[3px]">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                  7.0%
                </div>
              </div>
            </div>

            {/* Total Impressions */}
            <div className="w-full bg-white rounded-[8px] p-[24px] border border-[rgba(214,214,214,0.7)] flex flex-col justify-between gap-[35px]">
              <p className="text-[16px] font-medium text-[#2B2E48] tracking-[0.01em]">Total impressions</p>
              <div className="flex items-center justify-between w-full">
                <span className="text-[24px] font-medium text-[#2B2E48]">1.8M</span>
                <div className="flex items-center justify-center px-[5px] py-[3px] rounded-[50px] bg-[rgba(11,138,0,0.15)] text-[#0B8A00] text-[14px] font-normal gap-[3px]">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  10.0%
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-[24px]">
            <div className="flex items-center gap-[10px]">
              {/* Search */}
              <div className="relative w-[261px] h-[50px]">
                <Search size={20} strokeWidth={1.5} className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#16151C] opacity-40" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-full pl-[44px] pr-[16px] bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] font-light text-[#16151C] placeholder:text-[rgba(22,21,28,0.2)] focus:outline-none"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center justify-center gap-[10px] w-[117px] h-[50px] bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[16px] font-light text-[#16151C]"
              >
                <Filter size={20} strokeWidth={1.5} />
                <span>Filter</span>
              </button>
            </div>
            
            <div className="flex items-center gap-[28px]">
              {/* Create Campaign */}
              <button
                onClick={() => { setWizardStep('details'); setCreateModalOpen(true); }}
                className="w-[179px] h-[40px] bg-[#D4AF37] text-[#000000] rounded-[6px] text-[14px] font-normal capitalize hover:bg-[#b58b24] transition-colors"
              >
                Create New Campaign
              </button>
              
              {/* Export */}
              <button
                onClick={handleExport}
                className="w-[116px] h-[40px] bg-transparent border-[1.5px] border-[#D4AF37] text-[#D4AF37] rounded-[6px] text-[14px] font-normal capitalize hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full rounded-[8px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F4]">
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Campaign info
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Scheduled For
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Budget (NGN)
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Spent (NGN)
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Impressions
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Status
                    </div>
                  </th>
                  <th className="py-[12px] px-[14px] text-[14px] font-normal text-[#7D7D7D] whitespace-nowrap">
                    <div className="flex items-center gap-[6px]">
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-[18px] text-[#A2A1A8] text-[14px] border-b border-[#DCDCDD]">
                      {loadingCampaigns ? 'Loading campaigns...' : 'No campaigns found'}
                    </td>
                  </tr>
                ) : (
                  filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((c) => (
                    <tr key={c.id} className="border-b border-[#DCDCDD] hover:bg-gray-50 transition-colors">
                      <td className="py-[18px] px-[14px] text-[16px] font-normal text-[#2B2E48] tracking-[0.01em]">
                        {c.name}
                      </td>
                      <td className="py-[18px] px-[14px] text-[16px] font-normal text-[#2B2E48] tracking-[0.01em]">
                        {c.schedule}
                      </td>
                      <td className="py-[18px] px-[14px] text-[16px] font-normal text-[#2B2E48] tracking-[0.01em]">
                        {c.budget.toLocaleString()}
                      </td>
                      <td className="py-[18px] px-[14px] text-[16px] font-normal text-[#2B2E48] tracking-[0.01em]">
                        {c.spent.toLocaleString()}
                      </td>
                      <td className="py-[18px] px-[14px] text-[16px] font-normal text-[#2B2E48] tracking-[0.01em]">
                        {c.impressions.toLocaleString()}
                      </td>
                      <td className="py-[18px] px-[14px]">
                        <span className={`text-[16px] font-normal tracking-[0.01em] ${
                          c.status === 'active' ? 'text-[#91C600]' : 
                          c.status === 'paused' || c.status === 'draft' ? 'text-[#D4AF37]' : 
                          'text-[#FF4E2B]'
                        }`}>
                          {STATUS_LABELS[c.status] || c.status}
                        </span>
                      </td>
                      <td className="py-[18px] px-[14px]">
                        <div className="flex items-center gap-3">
                            <Link href={`/campaigns/${c.id}`} className="text-[16px] font-normal text-[#D4AF37] tracking-[0.01em] hover:underline">
                            View
                            </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="w-full mt-[20px] mb-[40px] flex items-center justify-between">
            <div className="flex items-center gap-[20px]">
              <span className="text-[14px] font-light text-[#A2A1A8]">Showing</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="appearance-none bg-white w-[76px] h-[46px] border border-[rgba(162,161,168,0.2)] rounded-[10px] pl-[16px] pr-[32px] text-[14px] font-light text-[#16151C] focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={20} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#16151C] pointer-events-none" />
              </div>
            </div>
            
            <div className="text-[14px] font-light text-[#A2A1A8]">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} out of {filtered.length} records
            </div>
            
            <div className="flex items-center gap-[5px]">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-[35px] h-[36px] flex items-center justify-center text-[#16151C] disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: Math.max(1, Math.ceil(filtered.length / pageSize)) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-[33px] h-[36px] flex items-center justify-center rounded-[50px] text-[14px] font-light ${currentPage === i + 1 ? 'border border-[#D4AF37] text-[#D4AF37]' : 'bg-transparent text-[#16151C]'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filtered.length / pageSize)))}
                disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                className="w-[35px] h-[36px] flex items-center justify-center text-[#16151C] disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================= CREATE CAMPAIGN WIZARD ======================= */}"""

new_content = re.sub(main_ui_pattern, main_ui_replacement, content, flags=re.DOTALL)


creative_service_pattern = r"\{createModalOpen && wizardStep === 'creative-service' && \([\s\S]*?\}\s*className=\"w-full py-\[15px\] bg-\[#D4AF37\][^\n]*\n\s*Add service\n\s*</button>\n\s*</div>\n\s*</div>\n\s*</div>\n\s*\)\}"

creative_service_replacement = """{createModalOpen && wizardStep === 'creative-service' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              <div className="bg-white rounded-[24px] w-full max-w-[620px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="flex items-center justify-between px-[30px] pt-[30px] pb-[10px]">
                  <button onClick={() => setWizardStep('details')} className="text-[#000000]">
                    <ArrowLeft size={24} />
                  </button>
                  <span className="text-[20px] font-medium text-[#000000]">Campaign creative services</span>
                  <button onClick={resetWizard} className="text-[#000000]">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="px-[60px] pt-[30px] pb-[60px] flex flex-col gap-[30px]">
                  <div className="relative">
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-[20px] py-[15px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] text-[16px] text-[#000000] focus:outline-none appearance-none"
                      style={{ color: serviceType ? '#000000' : 'rgba(0,0,0,0.4)' }}
                    >
                      <option value="" disabled>Select creative services</option>
                      {CREATIVE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.4)] pointer-events-none" />
                  </div>

                  <textarea
                    placeholder="Describe your campaign creative brief"
                    value={serviceBrief}
                    onChange={(e) => setServiceBrief(e.target.value)}
                    rows={4}
                    className="w-full px-[20px] py-[15px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] text-[16px] text-[#000000] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none resize-none"
                  />
                  
                  <div className="flex flex-col gap-[15px]">
                    <p className="text-[16px] font-normal text-[#000000]">Or upload Ad creative brief</p>
                    <div className="w-full border border-dashed border-[#D4AF37] rounded-[10px] py-[30px] flex flex-col items-center justify-center gap-[10px] cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="w-[48px] h-[48px] bg-[#D4AF37] rounded-[10px] flex items-center justify-center mb-[5px]">
                        <Upload size={20} className="text-white" />
                      </div>
                      <p className="text-[14px] font-normal text-[#000000]">
                        Drag & Drop or <span className="text-[#185C37]">choose file</span> to upload
                      </p>
                      <p className="text-[12px] font-normal text-[#000000] opacity-30">
                        Supported formats : jpeg, png, pdf
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWizardStep('creative-service-success');
                    }}
                    className="w-full py-[15px] bg-[#D4AF37] hover:bg-[#c29e30] text-[#000000] text-[16px] font-medium rounded-[8px] mt-[10px] transition-colors"
                  >
                    Add service
                  </button>
                </div>
              </div>
            </div>
          )}"""

new_content = re.sub(creative_service_pattern, creative_service_replacement, new_content, flags=re.DOTALL)

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated app/campaigns/page.tsx successfully!")
