import re

filepath = r'app\blog\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Author Avatar
author_html = """
                        <div className="flex items-center gap-4 text-gray-300 text-base font-semibold tracking-wide mt-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black overflow-hidden border-2 border-gray-500 shadow-md flex items-center justify-center p-1.5">
                               <img src="/logo-white.png" alt="Author" className="w-full h-full object-contain opacity-90" />
                            </div>
                            <span>{featured.authorName || 'Studio Arella'}</span>
                          </div>
                          <span className="text-gray-500">•</span>
"""
content = re.sub(
    r'<div className="flex items-center gap-4 text-gray-300 text-base font-semibold tracking-wide">\s*<span>\{featured\.authorName \|\| \'Studio Arella\'\}</span>\s*<span className="text-gray-500">•</span>',
    author_html.strip(),
    content
)

# 2. Hover Lift Effects (Sidebar)
content = content.replace(
    'className="group flex gap-5 items-center bg-white/40 p-3 rounded-sm hover:bg-white/80 transition-colors shadow-sm backdrop-blur-md"',
    'className="group flex gap-5 items-center bg-white/40 p-3 rounded-sm hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm backdrop-blur-md"'
)

# 2b. Hover Lift Effects (Grid)
content = content.replace(
    'className="group flex flex-col gap-5 bg-white/40 p-4 rounded-sm hover:bg-white/80 transition-colors shadow-sm backdrop-blur-md"',
    'className="group flex flex-col gap-5 bg-white/40 p-4 rounded-sm hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm backdrop-blur-md"'
)


# 3. Ad CTA in Sidebar
ad_cta_html = """
                      </div>
                      
                      {/* Advertising CTA */}
                      <Link href="/" className="group flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-6 rounded-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 shadow-lg border border-[#D4AF37]/20 relative overflow-hidden mt-2 shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                        <h4 className="text-[#D4AF37] font-bold text-[19px] mb-2 text-center z-10 uppercase tracking-widest drop-shadow-md">Grow Your Business</h4>
                        <p className="text-gray-300 text-[14px] text-center mb-5 z-10 leading-relaxed max-w-[250px]">Advertise on Umuahia's premier digital screen. Book a slot instantly.</p>
                        <span className="bg-[#D4AF37] text-black text-[13px] font-bold px-5 py-2.5 rounded-sm z-10 group-hover:bg-white transition-colors shadow-md">Book Ad Slot &rarr;</span>
                      </Link>
                    </div>

                  </div>
"""

content = re.sub(
    r'                      </div>\n                    </div>\n\n                  </div>',
    ad_cta_html.lstrip('\n'),
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/blog/page.tsx with CTA, hover lifts, and avatars")
