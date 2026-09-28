import re

filepath = r'lib\api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

fixed_interceptor = """
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Prevent infinite redirect loops on public pages like /blog
      if (!window.location.pathname.startsWith('/blog')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);
"""

# Replace the old interceptor
content = re.sub(
    r'api\.interceptors\.response\.use\([\s\S]*?return Promise\.reject\(err\);\n\s*\}\n\);',
    fixed_interceptor.strip(),
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed lib/api.ts interceptor.")
