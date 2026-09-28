import re

filepath = r'components\layout\Sidebar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add FileText to lucide-react imports if not there
if 'FileText' not in content.split('lucide-react')[0]:
    content = content.replace(
        "import { LayoutDashboard, Wallet, User as UserIcon, Monitor, LogOut, ChevronRight, Bookmark, Clock, Megaphone, CalendarCheck, Shield, Mic, Search, ChevronDown, DollarSign, Paintbrush, Film } from 'lucide-react';",
        "import { LayoutDashboard, Wallet, User as UserIcon, Monitor, LogOut, ChevronRight, Bookmark, Clock, Megaphone, CalendarCheck, Shield, Mic, Search, ChevronDown, DollarSign, Paintbrush, Film, FileText } from 'lucide-react';"
    )
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added FileText to imports.")
else:
    print("FileText already imported.")
