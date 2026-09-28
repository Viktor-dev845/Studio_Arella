import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'src="/logo-black.png"',
    'src="/logo.png"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PublicBlogLayout logo src")
