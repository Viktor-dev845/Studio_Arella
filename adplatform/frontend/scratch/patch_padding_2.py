import os
import re

path = 'app/campaigns/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Main Card div (regex to ignore exact whitespace/newlines)
# We are looking for: <div className="bg-white ... overflow-hidden"> right after Main Card: Toolbar + Table
pattern = r'({\/\* Main Card: Toolbar \+ Table \*\/}\s*<div className="bg-white dark:bg-\[#111111\] rounded-\[24px\] border border-slate-100 dark:border-white/10 shadow-\[0_2px_16px_rgba\(0,0,0,0\.03\)\] overflow-hidden)(")'
replacement = r'\1 px-4 sm:px-[40px] pb-10\2'

content = re.sub(pattern, replacement, content)

# Also let's update the Toolbar search/filter div padding to align. Wait, if we add padding to the Main Card, they inherit it naturally.
# BUT we also need to make sure the table has full width or we adjust it.
# Wait, if we add px-4 sm:px-10 to the Main Card, the table header will have that padding around it. In the screenshot, the table header does NOT have padding on its own.
# The table background goes right to the padding boundary.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
