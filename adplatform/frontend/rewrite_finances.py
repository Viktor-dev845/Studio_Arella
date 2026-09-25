import sys

def main():
    with open('app/finances/page.tsx.bak', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    part1 = lines[:349]
    part3 = lines[1140:] # Skip the </div>
    
    jsx = """
      <DashboardLayout>
        <PageTransition>
          <div className="flex flex-col gap-[32px] pb-[60px] max-w-[1080px] mx-auto w-full mt-6">
            
            {/* Header */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: '24px', lineHeight: '31px', color: '#101828' }}>
                Wallet
              </h1>
            </div>

            {/* Top 3 Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Wallet Balance */}
              <div 
                className="relative rounded-[16px] overflow-hidden p-4 flex flex-col justify-between"
                style={{ 
                  height: '134px',
                  background: 'linear-gradient(rgba(138, 158, 82, 0.9), rgba(138, 158, 82, 0.9)), url(/beautiful-abstract-seamless-pattern-design_174506-1310.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet size={16} color="white" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                    Wallet Balance
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '24px', color: '#FFFFFF' }}>
                    NGN 15,000
                  </div>
                  <button 
                    onClick={openFundModal}
                    className="bg-white rounded-[11.8px] shadow-sm flex justify-center items-center px-[17px] py-[12px]"
                  >
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '13.6px', color: '#101828' }}>
                      Fund wallet
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 2: Total Spent */}
              <div 
                className="relative rounded-[16px] overflow-hidden p-4 flex flex-col justify-between"
                style={{ 
                  height: '134px',
                  background: 'linear-gradient(rgba(212, 175, 55, 0.9), rgba(212, 175, 55, 0.9)), url(/depositphotos_5836112-stock-illustration-seamless-pattern.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingDown size={16} color="white" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#FFFFFF' }}>
                    Total Spent
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-auto">
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '24px', color: '#FFFFFF' }}>
                    NGN 25,000
                  </div>
                  <button className="bg-white rounded-[11.8px] shadow-sm flex justify-center items-center px-[17px] py-[12px]">
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '13.6px', color: '#101828' }}>
                      View spending insight
                    </span>
                  </button>
                </div>
              </div>

              {/* Card 3: Special Offer */}
              <div 
                className="relative rounded-[15px] overflow-hidden p-4"
                style={{ 
                  height: '134px',
                  backgroundColor: '#524007',
                }}
              >
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '12.6px', color: '#FFFFFF', marginBottom: '8px' }}>
                  Special Offer: Book Ad slot from #1,000/min
                </div>
                <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '9px', color: '#D5E0ED', maxWidth: '140px', lineHeight: '150%' }}>
                  Instant digital screen activation across high-traffic prime Lagos studios
                </div>
                
                <div className="absolute right-2 top-2 w-[80px] h-[100px] flex justify-center items-center">
                   <div className="w-[60px] h-[80px] bg-white/10 rounded-[6px] border border-white/20 backdrop-blur-md flex flex-col items-center justify-center p-1 transform rotate-6">
                      <div className="w-full h-[20px] bg-white rounded-[4px] mb-1"></div>
                      <span className="text-[4px] text-white/70 text-center leading-tight">Our billboard stand is in a strategic location...</span>
                   </div>
                </div>

                <button 
                  className="absolute bottom-4 left-4 bg-[#FBFF79] rounded-[6px] px-[17px] py-[8px]"
                  style={{ boxShadow: '0px 0px 7px rgba(251, 255, 121, 0.32)' }}
                >
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: '9.4px', color: '#051235', textTransform: 'uppercase' }}>
                    BOOK AD SLOT
                  </span>
                </button>
              </div>
            </div>

            {/* Middle Section (2 cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Total Transaction */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Total Transaction</h3>
                   <div className="w-[30px] h-[25px] flex items-center justify-center rounded-[8px] mt-[10px]" style={{ background: 'rgba(3, 197, 210, 0.2)' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#005055' }}>45</span>
                   </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <button className="flex items-center gap-[10px] w-full max-w-[287px] bg-[#FFFFFF] shadow-sm rounded-[14px] px-[20px] py-[14px] border border-[#F0F0F0] hover:bg-gray-50">
                    <div className="w-[24px] h-[24px] bg-[#E5F9FA] rounded-full flex items-center justify-center">
                      <Download size={14} color="#005055" />
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#101828' }}>Download transaction history</span>
                  </button>
                </div>
              </div>

              {/* Linked Bank Card */}
              <div className="bg-white rounded-[24px] p-[24px] flex flex-col justify-between relative shadow-sm border border-[#F0F0F0]" style={{ height: '176px' }}>
                <div>
                   <h3 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '18px', color: '#101828' }}>Linked Bank Card</h3>
                   <div className="w-[30px] h-[25px] flex items-center justify-center rounded-[8px] mt-[10px]" style={{ background: 'rgba(227, 24, 24, 0.2)' }}>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#E31818' }}>3</span>
                   </div>
                </div>
                
                <div className="flex justify-between items-center w-full">
                  <button onClick={() => setShowLinkBankModal(true)} className="flex items-center justify-center w-full max-w-[287px] bg-[#101828] hover:bg-[#1a2538] shadow-sm rounded-[14px] px-[20px] py-[14px]">
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '16px', color: '#FFFFFF' }}>Add A Bank Card</span>
                  </button>
                  
                  {/* Mastercard circles placeholder */}
                  <div className="flex relative items-center h-[50px] w-[90px]">
                     <div className="w-[44px] h-[44px] rounded-full bg-[#EA001B]/80 mix-blend-multiply absolute right-[40px]"></div>
                     <div className="w-[44px] h-[44px] rounded-full bg-[#FFA200]/80 mix-blend-multiply absolute right-[20px]"></div>
                     <div className="w-[44px] h-[44px] rounded-full border-2 border-[#101828]/10 right-[0px] absolute"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Section: Transaction Table */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#F0F0F0] overflow-hidden w-full overflow-x-auto">
               
               {/* Table Header Area */}
               <div className="flex items-center justify-between px-[24px] py-[24px] border-b border-[#F0F0F0]" 
                    style={{ background: 'linear-gradient(95.19deg, #D4AF37 29.12%, rgba(126, 84, 0, 0.33) 111.32%, rgba(217, 192, 28, 0.33) 111.32%)' }}>
                  
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: '16px', color: '#FFFFFF', marginBottom: '4px' }}>Transaction history</h2>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#FFFFFF' }}>View your transaction history</p>
                  </div>

                  <div className="flex items-center gap-[16px]">
                    <button className="flex items-center gap-[10px] text-white">
                       <Download size={20} />
                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px' }}>Generate transaction statement</span>
                    </button>
                    <button className="flex items-center gap-[10px] text-white ml-[20px]">
                       <TrendingUp size={20} />
                       <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px' }}>View spending insight</span>
                    </button>
                    <button className="w-[24px] h-[24px] border border-white rounded-[5px] flex items-center justify-center text-white ml-[10px]">
                       <span className="text-[14px] leading-none mb-2">...</span>
                    </button>
                  </div>
               </div>

               {/* Table */}
               <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                   <tr className="bg-white border-b border-[#F0F0F0]">
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Service</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Account</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Ref</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>No. of Transactions</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Estimated income</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Status</th>
                     <th className="px-[24px] py-[16px] text-[#5F6D7E] font-medium text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Campaign</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-[#E35205] rounded-full border-2 border-white absolute left-0 z-20 flex items-center justify-center text-[8px] text-white font-bold">GTB</div>
                           <div className="w-[24px] h-[24px] bg-[#005055] rounded-full border-2 border-white absolute left-[12px] z-10 flex items-center justify-center text-[8px] text-white font-bold">ACC</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>5</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 28,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 197, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>SUCCESSFUL</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Campaign</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-[#E35205] rounded-full flex items-center justify-center text-[8px] text-white font-bold">GTB</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>2</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 55,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 36, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>PENDING</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Campaign</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[80px]">
                           <div className="w-[24px] h-[24px] bg-[#60269E] rounded-full border-2 border-white absolute left-0 z-30 flex items-center justify-center text-[8px] text-white font-bold">POL</div>
                           <div className="w-[24px] h-[24px] bg-[#005055] rounded-full border-2 border-white absolute left-[12px] z-20 flex items-center justify-center text-[8px] text-white font-bold">ACC</div>
                           <div className="w-[24px] h-[24px] bg-[#5C068C] rounded-full border-2 border-white absolute left-[24px] z-10 flex items-center justify-center text-[8px] text-white font-bold">FCMB</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>50</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 2,550,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(243, 184, 164, 0.2)', color: '#E31818', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>FAILED</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Ad</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-[#60269E] rounded-full flex items-center justify-center text-[8px] text-white font-bold">POL</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>10</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 258,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 197, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>SUCCESSFUL</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Studio session</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-[#005055] rounded-full border-2 border-white absolute left-0 z-20 flex items-center justify-center text-[8px] text-white font-bold">ACC</div>
                           <div className="w-[24px] h-[24px] bg-[#FF0000] rounded-full border-2 border-white absolute left-[12px] z-10 flex items-center justify-center text-[8px] text-white font-bold">ZEN</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>6</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 128,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 197, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>SUCCESSFUL</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Studio session</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-[#5C068C] rounded-full flex items-center justify-center text-[8px] text-white font-bold">FCMB</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>4</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 218,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 36, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>PENDING</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                   <tr className="border-b border-[#F0F0F0] bg-white">
                     <td className="px-[24px] py-[12px]">
                       <div className="flex flex-col">
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>Podcast sponsorship wave</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '14px', color: '#5F6D7E' }}>Ad</span>
                       </div>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <div className="flex items-center relative h-[24px] w-[50px]">
                           <div className="w-[24px] h-[24px] bg-gray-200 rounded-full flex items-center justify-center text-[8px] text-gray-500 font-bold">BNK</div>
                        </div>
                     </td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>23f1335thu_o9</td>
                     <td className="px-[24px] py-[12px] text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>1</td>
                     <td className="px-[24px] py-[12px]" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 500, fontSize: '14px', color: '#101828' }}>NGN 33,000</td>
                     <td className="px-[24px] py-[12px]">
                        <span className="px-[10px] py-[3px] rounded-full" style={{ background: 'rgba(3, 36, 210, 0.2)', color: '#005055', fontFamily: 'var(--font-dm-sans)', fontSize: '10.7px' }}>PENDING</span>
                     </td>
                     <td className="px-[24px] py-[12px]">
                        <button className="w-[24px] h-[24px] flex items-center justify-center text-[#5F6D7E]">
                           <span className="text-[14px] leading-none rotate-90 font-bold tracking-widest -mt-2">...</span>
                        </button>
                     </td>
                   </tr>

                 </tbody>
               </table>
               
               {/* Pagination Footer */}
               <div className="flex items-center justify-between px-[24px] py-[12px] gap-[10px] bg-white">
                 <button className="px-3 py-1 text-[#5F6D7E] text-[14px] flex items-center gap-1 border border-[#F0F0F0] rounded-[5px]">
                    <ChevronLeft size={16} /> Previous
                 </button>
                 <div className="flex items-center gap-2 text-[14px] text-[#5F6D7E]">
                    <span className="w-[30px] h-[30px] flex items-center justify-center rounded-[5px] bg-[#F0F0F0] text-black">1</span>
                    <span className="w-[30px] h-[30px] flex items-center justify-center">2</span>
                    <span className="w-[30px] h-[30px] flex items-center justify-center">3</span>
                    <span className="w-[30px] h-[30px] flex items-center justify-center">4</span>
                    <span className="w-[30px] h-[30px] flex items-center justify-center">5</span>
                 </div>
                 <button className="px-3 py-1 text-[#5F6D7E] text-[14px] flex items-center gap-1 border border-[#F0F0F0] rounded-[5px]">
                    Next <ChevronRight size={16} />
                 </button>
               </div>
               
            </div>

          </div>
"""
    
    with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(part1)
        f.write(jsx + "\n")
        f.writelines(part3)

if __name__ == '__main__':
    main()
