import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix logo shrinking by adding flexShrink: 0
content = content.replace(
    "style={{ height: 40, objectFit: 'contain' }}",
    "style={{ height: 40, flexShrink: 0, objectFit: 'contain' }}"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed logo styling in PublicBlogLayout")
