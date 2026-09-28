import os

path = r'..\backend\src\controllers\authController.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the validation check
old_validation = """    if (!first_name || !last_name || !email || !password || !phone) {
      res.status(400).json({ message: 'First name, last name, email, password, and phone are required' });
      return;
    }"""

new_validation = """    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({ message: 'First name, last name, email, and password are required' });
      return;
    }"""

content = content.replace(old_validation, new_validation)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
