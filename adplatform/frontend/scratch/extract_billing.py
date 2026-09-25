import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "{/* ─── CREATE CAMPAIGN: STEPS 3+ — BILLING ─── */}"
start_idx = content.find(start_marker)

print(f"Start index: {start_idx}")
if start_idx != -1:
    print(content[start_idx:start_idx+1500])
