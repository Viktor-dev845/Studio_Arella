import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const CustomToolbar = (toolbar: any) => {')
end_idx = content.find('export default function BookingCalendar')

new_chunk = """const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      {/* Today | Back | Next */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D9D9D9', borderRadius: '10px', overflow: 'hidden', padding: '10px', gap: '10px' }}>
        <button onClick={goToCurrent} style={{ width: '149px', height: '60px', fontSize: '24px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Today</button>
        <div style={{ width: '1px', height: '60px', background: '#D9D9D9' }} />
        <button onClick={goToBack} style={{ width: '149px', height: '60px', fontSize: '24px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Back</button>
        <div style={{ width: '1px', height: '60px', background: '#D9D9D9' }} />
        <button onClick={goToNext} style={{ width: '149px', height: '60px', fontSize: '24px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Next</button>
      </div>

      {/* Date-Range */}
      <div style={{ fontSize: '24px', fontFamily: 'var(--font-body)', color: '#000000', fontWeight: 400 }}>
        {toolbar.label}
      </div>

      {/* Month | Week | Day */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D9D9D9', borderRadius: '10px', overflow: 'hidden', padding: '10px', gap: '10px' }}>
        {['month', 'week', 'day'].map(v => (
          <button
            key={v}
            onClick={() => toolbar.onView(v)}
            style={{
              width: '149px', height: '60px', fontSize: '24px', fontFamily: 'var(--font-body)',
              textTransform: 'capitalize', border: 'none', borderRadius: '8px', cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              background: toolbar.view === v ? '#D4AF37' : 'transparent',
              color: toolbar.view === v ? '#FFFFFF' : '#000000',
            }}
            onMouseOver={e => {
              if (toolbar.view !== v) e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseOut={e => {
              if (toolbar.view !== v) e.currentTarget.style.background = 'transparent';
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

const makeWeekHeader = (visibleEvents: CalEvent[]) => function WeekHeader({ date }: { date: Date }) {
  const count = visibleEvents.filter(e => {
    const d = new Date(e.start);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  }).length;
  return (
    <div style={{ padding: '20px 10px', width: '100%', borderBottom: 'none' }}>
      <div style={{ fontSize: '20px', fontFamily: 'var(--font-body)', color: '#000000', fontWeight: 400, textAlign: 'center' }}>
        {format(date, 'EEEE MM/dd')}<br/>{count} Task(s)
      </div>
    </div>
  );
};

const CustomEvent = ({ event }: { event: CalEvent }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px', height: '100%', overflow: 'hidden' }}>
      <div style={{ fontSize: '16px', fontFamily: 'var(--font-body)', fontWeight: 400, color: '#FFFFFF', lineHeight: '21px' }}>
        {format(event.start, 'hh:mm a')} - {format(event.end, 'hh:mm a')} {event.title}
      </div>
    </div>
  );
};

const PODCAST_COLORS = ['#5DC6E7', '#3776D4', '#3776D5'];
const AD_COLORS = ['#9E1212', '#E75D5D', '#D35DE7', '#F29D38', '#00BF86', '#D35DE7'];

const eventPropGetter = (event: CalEvent) => {
  const isPodcast = event.resource.type === 'podcast';
  const hash = String(event.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorArray = isPodcast ? PODCAST_COLORS : AD_COLORS;
  const bg = colorArray[hash % colorArray.length];
  
  return {
    style: {
      background: bg,
      color: '#fff',
      border: 'none',
      borderRadius: '0px',
      opacity: event.resource.status === 'cancelled' ? 0.6 : 1,
      padding: '4px'
    }
  };
};

"""

content = content[:start_idx] + new_chunk + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Safely updated BookingCalendar.tsx!")
