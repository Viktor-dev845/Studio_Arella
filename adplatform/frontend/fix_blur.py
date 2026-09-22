import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# find filter modal block
content = re.sub(
    r'(\{filterModalOpen && \(\s*<div className="fixed inset-0 z-\[100\] flex items-center justify-center bg-\[rgba\(162,161,168,0\.2\)\] )backdrop-blur-\[10px\] (p-4">)',
    r'\1\2',
    content
)

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
