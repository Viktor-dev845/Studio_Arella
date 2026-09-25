with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("value: '₦4,500,000.00'", "value: '#4,500,000.00'")
content = content.replace("value: '₦2,000,000.00'", "value: '#2,000,000.00'")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
