import re

filepath = r'components\layout\Sidebar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "{ href: '/admin/finances', label: 'Revenue', icon: DollarSign },",
    "{ href: '/admin/finances', label: 'Revenue', icon: DollarSign },\n  { href: '/admin/blog', label: 'Blog Manager', icon: FileText },"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Sidebar.tsx to include Blog Manager for admins.")
