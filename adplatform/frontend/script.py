import os

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start = 15870
print(content[start:start+4000])
