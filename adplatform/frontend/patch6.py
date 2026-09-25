import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace sizes in CustomToolbar
old_toolbar_start = content.find('const CustomToolbar = (toolbar: any) => {')
old_toolbar_end = content.find('const makeWeekHeader')
old_toolbar = content[old_toolbar_start:old_toolbar_end]

new_toolbar = """const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      {/* Today | Back | Next */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D9D9D9', borderRadius: '10px', overflow: 'hidden', padding: '6px', gap: '6px' }}>
        <button onClick={goToCurrent} style={{ padding: '0 24px', height: '40px', fontSize: '15px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Today</button>
        <div style={{ width: '1px', height: '24px', background: '#D9D9D9' }} />
        <button onClick={goToBack} style={{ padding: '0 24px', height: '40px', fontSize: '15px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Back</button>
        <div style={{ width: '1px', height: '24px', background: '#D9D9D9' }} />
        <button onClick={goToNext} style={{ padding: '0 24px', height: '40px', fontSize: '15px', fontFamily: 'var(--font-body)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Next</button>
      </div>

      {/* Date-Range */}
      <div style={{ fontSize: '18px', fontFamily: 'var(--font-body)', color: '#000000', fontWeight: 600 }}>
        {toolbar.label}
      </div>

      {/* Month | Week | Day */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D9D9D9', borderRadius: '10px', overflow: 'hidden', padding: '6px', gap: '6px' }}>
        {['month', 'week', 'day'].map(v => (
          <button
            key={v}
            onClick={() => toolbar.onView(v)}
            style={{
              padding: '0 24px', height: '40px', fontSize: '15px', fontFamily: 'var(--font-body)',
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

"""
content = content.replace(old_toolbar, new_toolbar)

# Make sure filter button top is aligned properly since the toolbar height is reduced
# Previously it was -top-[70px]. Let's make it -top-[62px] or just align it better.
# Actually -top-[64px] should be fine. Wait, the exact top offset depends on the tab row.
content = content.replace('-top-[70px]', '-top-[62px]')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BookingCalendar.tsx with scaled down dimensions")
