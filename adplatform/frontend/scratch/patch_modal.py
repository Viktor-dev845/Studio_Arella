import os

path = 'app/campaigns/[id]/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace text
old_text = 'Are you sure you want to cancel this Campaign? Campaign cancelled is non-refundable after 72hrs of booking. Read Studio Arella <span className="text-[#D4AF37]">terms & condition</span>'
new_text = 'Are you sure you want to cancel this campaign? Ad cancelled is non-refundable after 72hrs of booking. Read Studio Arella <span className="text-[#DCA92A]">terms & condition</span>'
content = content.replace(old_text, new_text)

# Replace Yes button background
old_btn = 'className="w-[166px] h-[50px] bg-[#D4AF37] rounded-[6px] flex items-center justify-center \n                      text-[#000000] text-[16px] font-normal hover:bg-[#c9a32c] transition-colors"'
new_btn = 'className="w-[166px] h-[50px] bg-[#DCA92A] rounded-[6px] flex items-center justify-center text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors"'
content = content.replace(old_btn, new_btn)

# Also there's the identical button for "Finish" on the success modal
old_finish = 'className="absolute top-[307px] left-[108.5px] w-[166px] h-[50px] bg-[#D4AF37] rounded-[6px] \n                    text-[#000000] text-[16px] font-normal hover:bg-[#c9a32c] transition-colors flex items-center justify-center"'
new_finish = 'className="absolute top-[307px] left-[108.5px] w-[166px] h-[50px] bg-[#DCA92A] rounded-[6px] text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors flex items-center justify-center"'
content = content.replace(old_finish, new_finish)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

