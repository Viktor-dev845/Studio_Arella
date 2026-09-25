import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bg-transparent with bg-white dark:bg-[#16151C]
content = content.replace(
    'className="absolute right-0 -top-[62px] w-[117px] h-[50px] flex items-center justify-center gap-[10px] bg-transparent border border-[rgba(162,161,168,0.2)] rounded-[10px] cursor-pointer hover:bg-gray-50 transition-colors z-10"',
    'className="absolute right-0 -top-[62px] w-[117px] h-[50px] flex items-center justify-center gap-[10px] bg-white dark:bg-[#16151C] border border-[rgba(162,161,168,0.2)] rounded-[10px] cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors z-10"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Filter button background!")
