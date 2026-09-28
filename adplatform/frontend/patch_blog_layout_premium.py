import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update header styles
header_replacement = """
      <header style={{ 
        width: '100%', 
        padding: '20px 5%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#0A0A0A',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Link href="/blog">
            <img src="/logo-white.png" alt="Studio Arella Logo" style={{ height: 40, objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Center Categories (Hidden on very small mobile) */}
        <div className="hidden md:flex" style={{ gap: '30px', alignItems: 'center' }}>
          {['HOME', 'BUSINESS', 'CREATORS', 'TECHNOLOGY', 'CULTURE'].map((cat) => (
            <Link key={cat} href={cat === 'HOME' ? '/blog' : `/blog?category=${cat.toLowerCase()}`} style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
"""

content = re.sub(
    r'<header style=\{\{[\s\S]*?<div style=\{\{ display: \'flex\', gap: 16 \}\}\>',
    header_replacement.strip(),
    content
)

# Fix dashboard button contrast for dark header (make it dark grey with white text)
content = content.replace(
    "background: '#F1F5F9',\n                color: '#0F172A',",
    "background: '#262626',\n                color: '#FFFFFF',"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PublicBlogLayout for premium layout")
