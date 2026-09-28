import re

filepath = r'components\layout\PublicBlogLayout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing hooks
if 'const [mounted, setMounted]' not in content:
    content = content.replace(
        "export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {\n  return (",
        "export default function PublicBlogLayout({ children }: { children: React.ReactNode }) {\n  const { user, logout } = useAuthStore();\n  const [mounted, setMounted] = useState(false);\n  useEffect(() => setMounted(true), []);\n\n  return ("
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed hooks in PublicBlogLayout")
