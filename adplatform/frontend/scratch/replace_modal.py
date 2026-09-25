import sys

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """          {createModalOpen && wizardStep === 'creative-service-success' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div className="bg-white dark:bg-[#111111] rounded-[24px] w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <div className="px-6 pt-10 pb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C69A2C] flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-white" />
                  </div>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-slate-50 mb-6">Creative service added</p>
                  <button
                    onClick={() => setWizardStep('details')}
                    className="w-full px-6 py-3 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13.5px] font-bold rounded-[10px] transition-all shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}"""

replacement = """          {createModalOpen && wizardStep === 'creative-service-success' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(162,161,168,0.2)] backdrop-blur-[10px] p-4">
              <div className="bg-[#FFFFFF] rounded-[20px] w-[383px] h-[433px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
                <div className="absolute w-[343px] h-[0px] left-[20px] top-[66px] border-t border-[rgba(162,161,168,0.1)]"></div>
                
                <div className="absolute w-[70px] h-[70px] left-[calc(50%-35px)] top-[94px]">
                  <div className="absolute -inset-[36px] opacity-10 blur-[5px] rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }}></div>
                  <div className="absolute -inset-[20px] opacity-15 blur-[5px] rounded-full" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }}></div>
                  <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)' }}>
                    <Check size={32} strokeWidth={2.5} className="text-white" />
                  </div>
                </div>

                <div className="absolute w-full h-[30px] top-[224px] font-semibold text-[20px] leading-[30px] text-center text-[#16151C]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Creative service added
                </div>

                <button
                  onClick={() => setWizardStep('details')}
                  className="absolute w-[166px] h-[50px] left-[calc(50%-83px)] top-[307px] bg-[#D4AF37] rounded-[6px] flex items-center justify-center text-[16px] font-normal text-[#000000] transition-opacity hover:opacity-90"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}"""

if target in content:
    new_content = content.replace(target, replacement)
    with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced modal content.")
else:
    print("Target not found.")
