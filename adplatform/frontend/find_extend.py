import os

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('{extendTarget && (')
end = content.find('{/* Extend success modal */}')
print(content[start:start+1500])
