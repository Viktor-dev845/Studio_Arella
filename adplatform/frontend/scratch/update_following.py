import re

with open('app/followers/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

following_content = """{tab === 'following' && (
            <div style={{ fontFamily: 'var(--font-quicksand)' }}>
              {/* Following Divider */}
              <div className="flex items-center gap-[16px] mt-[40px] mb-[30px]">
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                <span className="text-[12px] uppercase text-[#181818] font-medium tracking-wide">FOLLOWING</span>
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
              </div>

              {/* Following Grid (8 items) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[20px]">
                
                {/* Audrey Alexander */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80" alt="Audrey Alexander" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Audrey Alexander</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Team lead at Google</span>
                  </div>
                </div>

                {/* Kyle Fisher */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Kyle Fisher" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Kyle Fisher</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Product designer at Commandor Corp</span>
                  </div>
                </div>

                {/* Darlene Black */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Darlene Black" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Darlene Black</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">HR-manager, 10 000 connections</span>
                  </div>
                </div>

                {/* Eduardo Russell */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" alt="Eduardo Russell" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Eduardo Russell</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Full stack developer at Yandex</span>
                  </div>
                </div>

                {/* Audrey Alexander (Repeated) */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80" alt="Audrey Alexander" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Audrey Alexander</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Team lead at Google</span>
                  </div>
                </div>

                {/* Kyle Fisher (Repeated) */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Kyle Fisher" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Kyle Fisher</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Product designer at Commandor Corp</span>
                  </div>
                </div>

                {/* Darlene Black (Repeated) */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Darlene Black" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Darlene Black</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">HR-manager, 10 000 connections</span>
                  </div>
                </div>

                {/* Eduardo Russell (Repeated) */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px] shadow-sm">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" alt="Eduardo Russell" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Eduardo Russell</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Full stack developer at Yandex</span>
                  </div>
                </div>

              </div>
            </div>
          )}"""

pattern = r"\{tab === 'following' && \(\s*<div[^>]*>\s*You are not following anyone yet\.\s*</div>\s*\)\}"
new_content = re.sub(pattern, following_content, content, flags=re.DOTALL)

with open('app/followers/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced following state.")
