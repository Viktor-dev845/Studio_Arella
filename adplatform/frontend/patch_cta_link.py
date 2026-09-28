import re

filepath = r'app\blog\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace href="/" with href="/book-ad" in the Advertising CTA
# It looks like: <Link href="/" className="group flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A]
content = content.replace(
    '<Link href="/" className="group flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]',
    '<Link href="/book-ad" className="group flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated blog CTA link")
