import re

filepath = r'components\layout\Sidebar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add FileText right before the closing bracket of lucide-react import
content = re.sub(r'(\}\s*from\s*[\'"]lucide-react[\'"])', r',\n  FileText\n\1', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Properly added FileText to imports.")
