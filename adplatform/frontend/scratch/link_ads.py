import re

with open('app/ads/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """{ALL_ADS.map((ad, idx) => (
                  <div key={idx} className="flex flex-col w-[154px]">
                    <div className="w-[154px] h-[154px] bg-slate-100 rounded-[6px] mb-3 overflow-hidden relative">"""

new_block = """{ALL_ADS.map((ad, idx) => (
                  <Link href={`/ads/${idx + 1}`} key={idx} className="flex flex-col w-[154px] cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="w-[154px] h-[154px] bg-slate-100 rounded-[6px] mb-3 overflow-hidden relative">"""

content = content.replace(old_block, new_block)

# Since we replaced `<div key={idx}...>` with `<Link...>`, we need to close `<Link>` instead of `</div>`
# Wait, let's just use regex to accurately find the closing div of that element.
# The structure is:
# <div key={idx}...>
#   <div ...><img>...</div>
#   <h3>...</h3>
#   <p>...</p>
#   <span>...</span>
# </div>
# I'll just use regex to replace the specific closing div after the span.

span_line = """<span className={`text-[14px] ${ad.statusColor} leading-[20px]`}>{ad.status}</span>
                  </div>"""

span_line_new = """<span className={`text-[14px] ${ad.statusColor} leading-[20px]`}>{ad.status}</span>
                  </Link>"""

content = content.replace(span_line, span_line_new)

with open('app/ads/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Linked Ad items!")
