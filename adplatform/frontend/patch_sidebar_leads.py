import re

filepath = r'components\layout\Sidebar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Users icon import
if 'Users,' in content and 'Mail,' not in content:
    content = content.replace('Users,', 'Users, Mail,')
elif 'LucideIcon' in content and 'Mail' not in content:
    content = content.replace('import {', 'import { Mail,')

# Add Ad Leads to admin links
admin_link_replacement = """
  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: Home },
    { name: 'All Users', href: '/admin/users', icon: Users },
    { name: 'Ad Leads', href: '/admin/leads', icon: Mail },
"""

content = re.sub(
    r'const adminLinks = \[\n\s*\{ name: \'Overview\', href: \'/admin\', icon: Home \},\n\s*\{ name: \'All Users\', href: \'/admin/users\', icon: Users \},',
    admin_link_replacement.strip('\n'),
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Ad Leads to Sidebar")
