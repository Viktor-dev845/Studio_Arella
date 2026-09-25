import os
import re

filepath = 'components/calendar/BookingCalendar.module.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace border colors
content = re.sub(r'var\(--border-2\)', '#DEDEDE', content)

# Change header border-bottom
content = content.replace('border-bottom: 2px solid #DEDEDE;', 'border-bottom: 1px solid #DEDEDE;')

# Day bg border
content = content.replace('border-left: 1px solid #DEDEDE;', 'border-left: 1px solid #DEDEDE;')

# The user's CSS uses a border around EACH header cell
header_cell_css = """
.calendar :global(.rbc-header) {
  background: transparent;
  border-bottom: 1px solid #DEDEDE;
  border-left: 1px solid #DEDEDE !important;
  border-right: 1px solid #DEDEDE !important;
  color: var(--text-3);
  font-size: 11px;
  font-weight: 800;
  text-transform: none;
  letter-spacing: normal;
  padding: 0;
  height: auto;
}
"""
content = re.sub(r'\.calendar :global\(\.rbc-header\) \{.*?\n\}', header_cell_css.strip(), content, flags=re.DOTALL)

# time gutter cells
time_gutter_css = """
.calendar :global(.rbc-time-gutter .rbc-timeslot-group) {
  border-bottom: 1px solid #DEDEDE;
  border-right: 1px solid #DEDEDE;
  border-left: 1px solid #DEDEDE;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar :global(.rbc-time-gutter .rbc-label) {
  color: #000000;
  font-size: 20px;
  font-weight: 400;
  font-family: var(--font-body);
  padding: 0 10px;
}
"""
content += time_gutter_css

content = content.replace('border-bottom: 1px dashed var(--surface-2);', 'border-bottom: 1px solid #DEDEDE;')
content = content.replace('border-left: 1px dashed #DEDEDE;', 'border-left: 1px solid #DEDEDE;')
content = content.replace('border-top: 1px solid #DEDEDE;', 'border-top: 1px solid #DEDEDE;')
content = content.replace('border-radius: 8px !important;', 'border-radius: 0px !important;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CSS!")
