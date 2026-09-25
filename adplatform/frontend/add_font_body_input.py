import os

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'className="w-full pl-11 pr-4 h-[50px] bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] font-light text-gray-900 dark:text-slate-50 placeholder:text-[rgba(22,21,28,0.3)] focus:outline-none focus:border-[#D4AF37] transition-all"'
replacement = 'className="w-full pl-11 pr-4 h-[50px] bg-transparent border border-[rgba(162,161,168,0.5)] rounded-[10px] text-[16px] font-light font-body text-gray-900 dark:text-slate-50 placeholder:text-[rgba(22,21,28,0.3)] focus:outline-none focus:border-[#D4AF37] transition-all"'

if target in content:
    content = content.replace(target, replacement)
    with open('app/bookings/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("replaced input")
else:
    print("target not found")
