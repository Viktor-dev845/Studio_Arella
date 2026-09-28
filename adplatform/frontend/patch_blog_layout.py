import re

filepath = r'app\blog\page.tsx'
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

# And remove the "Blog" h1 top margin so it sits nicely in the PublicBlogLayout
content = content.replace(
    '<div className="w-full max-w-[1204px] mt-[40px] mb-[20px] px-[60px] lg:px-[60px]">',
    '<div className="w-full max-w-[1204px] mt-[20px] mb-[10px] px-[60px] lg:px-[60px]">'
)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/blog/page.tsx")
