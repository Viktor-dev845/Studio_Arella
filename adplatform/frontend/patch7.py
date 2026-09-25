import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_header_start = content.find('const makeWeekHeader =')
old_header_end = content.find('const CustomEvent =')
old_header = content[old_header_start:old_header_end]

new_header = """const makeWeekHeader = (visibleEvents: CalEvent[]) => function WeekHeader({ date }: { date: Date }) {
  const count = visibleEvents.filter(e => {
    const d = new Date(e.start);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  }).length;
  
  return (
    <div style={{ padding: '12px 4px', width: '100%', borderBottom: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
      <div style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: '#000000', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
        {format(date, 'EEEE MM/dd')}
      </div>
      <div style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: '#666', fontWeight: 400, marginTop: '4px' }}>
        {count} Task(s)
      </div>
    </div>
  );
};

"""
if old_header_start != -1:
    content = content.replace(old_header, new_header)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated header sizes!")
