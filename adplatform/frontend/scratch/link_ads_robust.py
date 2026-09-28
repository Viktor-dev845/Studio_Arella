import re

with open('app/ads/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the opening div
pattern_open = r'\{ALL_ADS\.map\(\(ad, idx\) => \(\s*<div key=\{idx\} className="flex flex-col w-\[154px\]">'
replacement_open = r'{ALL_ADS.map((ad, idx) => (\n                  <Link href={`/ads/${idx + 1}`} key={idx} className="flex flex-col w-[154px] cursor-pointer hover:opacity-90 transition-opacity">'
content = re.sub(pattern_open, replacement_open, content)

# Replace the closing div
pattern_close = r'<span className=\{`text-\[14px\] \$\{ad\.statusColor\} leading-\[20px\]`\}>\{ad\.status\}</span>\s*</div>'
replacement_close = r'<span className={`text-[14px] ${ad.statusColor} leading-[20px]`}>{ad.status}</span>\n                  </Link>'
content = re.sub(pattern_close, replacement_close, content)

with open('app/ads/page.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Linked Ad items!")
