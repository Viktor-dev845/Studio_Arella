import re

filepath = r'app\blog\[id]\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import DashboardLayout from '@/components/layout/DashboardLayout';",
    "import PublicBlogLayout from '@/components/layout/PublicBlogLayout';"
)

content = content.replace(
    "<DashboardLayout>",
    "<PublicBlogLayout>"
)

content = content.replace(
    "</DashboardLayout>",
    "</PublicBlogLayout>"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/blog/[id]/page.tsx")
