import os

filepath = 'components/calendar/BookingCalendar.module.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('font-size: 20px;', 'font-size: 13px;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CSS sizes!")
