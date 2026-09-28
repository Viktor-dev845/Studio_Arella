import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for auth state
if 'useAuthStore' not in content:
    content = content.replace(
        "import { theme } from '@/lib/theme';",
        "import { theme } from '@/lib/theme';\nimport { useAuthStore } from '@/store/authStore';\nimport { useState, useEffect } from 'react';"
    )

# Add hooks
hooks = """
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
"""
content = re.sub(
    r'export default function PublicBlogLayout[^\{]*\{\n',
    'export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {\n' + hooks,
    content
)

# Replace the hardcoded buttons with dynamic ones
dynamic_buttons = """
        <div style={{ display: 'flex', gap: 16 }}>
          {mounted && user ? (
            <>
              <Link href="/" style={{
                padding: '10px 20px',
                borderRadius: 6,
                background: '#F1F5F9',
                color: '#0F172A',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Dashboard
              </Link>
              <button onClick={() => { logout(); window.location.reload(); }} style={{
                padding: '10px 20px',
                borderRadius: 6,
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}>
                Sign Out
              </button>
            </>
          ) : mounted ? (
            <Link href="/auth/login" style={{
              padding: '10px 20px',
              borderRadius: 6,
              background: '#D4AF37',
              color: '#121212',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
          ) : null}
        </div>
"""

content = re.sub(
    r'<div style=\{\{ display: \'flex\', gap: 16 \}\}\>[\s\S]*?</header>',
    dynamic_buttons.strip() + '\n      </header>',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PublicBlogLayout to use dynamic auth buttons.")
