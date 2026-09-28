import re

filepath = r'app\blog\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the plain "Blog" h1 header
block_to_remove = """
          <div className="w-full max-w-[1204px] mt-[20px] mb-[10px] px-[60px] lg:px-[60px]">
            <h1 className="text-[#000000] font-bold text-[24px] tracking-[-0.02em] leading-[40px]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
              Blog
            </h1>
          </div>
"""

content = content.replace(block_to_remove, "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed generic Blog header")
