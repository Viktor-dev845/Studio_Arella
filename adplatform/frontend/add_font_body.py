import os

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<table className="w-full text-sm">'
replacement = '<table className="w-full text-sm font-body">'

if target in content:
    content = content.replace(target, replacement)
    with open('app/bookings/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("replaced font-body")
else:
    print("target not found")
