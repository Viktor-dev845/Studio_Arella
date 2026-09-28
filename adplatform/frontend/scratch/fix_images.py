import re

with open('app/ads/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the messy img block with a clean one
start_str = '<div className="w-[154px] h-[154px] bg-slate-100 rounded-[6px] mb-3 overflow-hidden relative">'
end_str = '</div>'
# We will just replace everything between these tags.

def replacer(match):
    return f'{start_str}\n                    <img src={{`https://picsum.photos/seed/ad${{idx}}/300/300`}} alt={{ad.title}} className="w-full h-full object-cover" onError={{(e) => {{ e.currentTarget.style.display = \'none\'; e.currentTarget.parentElement!.style.background = \'#F1F3F4\'; }}}} />\n                  {end_str}'

content = re.sub(
    r'<div className="w-\[154px\] h-\[154px\] bg-slate-100 rounded-\[6px\] mb-3 overflow-hidden relative">.*?</div>',
    replacer,
    content,
    flags=re.DOTALL
)

with open('app/ads/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed images!")
