import re
import os

filepath = 'app/globals.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}"""

new_block = """html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text-1);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  zoom: 0.9; /* Global 10% scale down to match 1440px Figma designs on smaller screens */
}"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully added zoom: 0.9 to globals.css")
else:
    print("Could not find the exact block to replace.")
