import os

path = 'app/campaigns/page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Main Card div
old_div = '            <div className="bg-white dark:bg-[#111111] rounded-[24px] border border-slate-100 dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">'
new_div = '            <div className="bg-white dark:bg-[#111111] rounded-[24px] border border-slate-100 dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden px-4 sm:px-10 pb-10">'

# Since the previous replace with PowerShell might have messed up Windows line endings or similar, we'll do it safely
content = content.replace(old_div, new_div)

# Also let's double check if there are other wrappers like the 4 metric cards row that need stretching.
# The `max-w-[1360px]` was removed successfully earlier (line 372).

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
