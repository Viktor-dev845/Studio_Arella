import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_prop_start = content.find('const eventPropGetter =')
old_prop_end = content.find('export default function BookingCalendar')
old_prop = content[old_prop_start:old_prop_end]

new_prop = """const PODCAST_COLORS = ['#5DC6E7', '#3776D4', '#3776D5'];
const AD_COLORS = ['#9E1212', '#E75D5D', '#D35DE7', '#F29D38', '#00BF86', '#D35DE7'];

const eventPropGetter = (event: CalEvent) => {
  const isPodcast = event.resource.type === 'podcast';
  
  // Deterministic random color based on event id
  const hash = String(event.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorArray = isPodcast ? PODCAST_COLORS : AD_COLORS;
  const bg = colorArray[hash % colorArray.length];
  
  return {
    style: {
      background: bg,
      color: '#fff',
      border: 'none',
      borderRadius: '0px', // In mockup they are sharp rectangles filling the cell? Or let's use 0px, or 6px
      opacity: event.resource.status === 'cancelled' ? 0.6 : 1,
      padding: 0
    }
  };
};

"""
content = content.replace(old_prop, new_prop)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated eventPropGetter!")
