import re
import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Input style
    content = re.sub(
        r"width: '100%', height: 64, padding: '0 24px', background: '#FFFFFF',\s+border: '1px solid #8692A6', borderRadius: 6, fontSize: 14,",
        r"width: '100%', height: 48, padding: '0 16px', background: '#FFFFFF',\n      border: '1px solid #8692A6', borderRadius: 6, fontSize: 14,",
        content
    )
    
    # Label style
    content = re.sub(
        r"fontSize: 16, fontWeight: 400, color: '#696F79', display: 'block',\s+marginBottom: 8,",
        r"fontSize: 14, fontWeight: 400, color: '#696F79', display: 'block',\n      marginBottom: 6,",
        content
    )
    
    # Title - Register (Create Your Account!)
    content = content.replace("fontSize: 32, fontWeight: 800", "fontSize: 28, fontWeight: 800")
    
    # Subtitle - Register (Getting started is easy)
    content = content.replace("fontSize: 15, color: theme.color.text3", "fontSize: 14, color: theme.color.text3")
    
    # Checkbox text
    content = content.replace("fontSize: 16, color: '#696F79'", "fontSize: 14, color: '#696F79'")
    
    # Main button (Register Account)
    content = content.replace("height: 64, background: '#D4AF37', color: '#121212', borderRadius: 6, fontSize: 16", "height: 48, background: '#D4AF37', color: '#121212', borderRadius: 6, fontSize: 15")
    
    # Main button (Login)
    content = content.replace("height: 64, background: '#D4AF37', color: '#121212', borderRadius: 6, fontSize: 16", "height: 48, background: '#D4AF37', color: '#121212', borderRadius: 6, fontSize: 15")
    
    # Title - Login
    content = content.replace("fontSize: 30, fontWeight: 700", "fontSize: 28, fontWeight: 700")
    
    # Subtitle - Login
    content = content.replace("fontSize: 18, color: '#8692A6'", "fontSize: 15, color: '#8692A6'")

    # Form gap
    content = content.replace("flexDirection: 'column', gap: 24", "flexDirection: 'column', gap: 20")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('app/auth/register/page.tsx')
patch_file('app/auth/login/page.tsx')
print("Successfully patched both auth pages.")
