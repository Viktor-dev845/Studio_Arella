import re

filepath = r'middleware.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a check for static image extensions
new_check = """
  const isStaticImage = /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname);

  // 3. Allow Next.js static assets, API routes, and the Blog itself
  const isAllowedPath = 
    isStaticImage ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/blog'); // Allow /blog and /blog/*
"""

content = re.sub(
    r'// 3\. Allow Next\.js static assets[\s\S]*?url\.pathname\.startsWith\(\'/blog\'\); // Allow /blog and /blog/\*',
    new_check.strip(),
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed middleware to allow static images")
