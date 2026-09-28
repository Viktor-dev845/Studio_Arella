import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the logo larger
content = content.replace(
    "style={{ height: 40, flexShrink: 0, objectFit: 'contain' }}",
    "style={{ height: 65, flexShrink: 0, objectFit: 'contain' }}"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated logo size in PublicBlogLayout")
