import os
import re

path = 'app/campaigns/[id]/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Yes button
pattern_yes = r'(<button\s+onClick=\{\(\) => setModalState\(\'success\'\)\}\s+className="w-\[166px\] h-\[50px\]) bg-\[#D4AF37\] rounded-\[6px\] flex items-center justify-center\s+text-\[#000000\] text-\[16px\] font-normal hover:bg-\[#c9a32c\] transition-colors"'
replacement_yes = r'\1 bg-[#DCA92A] rounded-[6px] flex items-center justify-center text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors"'
content = re.sub(pattern_yes, replacement_yes, content)

# Fix Finish button
pattern_finish = r'(<button\s+onClick=\{\(\) => \{\s+setModalState\(\'none\'\);\s+router.push\(\'/campaigns\'\);\s+\}\}\s+className="absolute top-\[307px\] left-\[108\.5px\] w-\[166px\] h-\[50px\]) bg-\[#D4AF37\] rounded-\[6px\]\s+text-\[#000000\] text-\[16px\] font-normal hover:bg-\[#c9a32c\] transition-colors flex items-center justify-center"'
replacement_finish = r'\1 bg-[#DCA92A] rounded-[6px] text-[#000000] text-[16px] font-normal hover:opacity-90 transition-colors flex items-center justify-center"'
content = re.sub(pattern_finish, replacement_finish, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
