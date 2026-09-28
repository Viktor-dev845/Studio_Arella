import re

filepath = r'middleware.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add book-ad to allowed paths
content = content.replace(
    "url.pathname.startsWith('/blog'); // Allow /blog and /blog/*",
    "url.pathname.startsWith('/blog') ||\n    url.pathname.startsWith('/book-ad');"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated middleware to allow /book-ad")
