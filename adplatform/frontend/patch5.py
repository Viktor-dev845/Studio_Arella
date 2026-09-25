import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("style={{ fontFamily: F }}", "style={{ fontFamily: F, position: 'relative' }}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added relative position")
