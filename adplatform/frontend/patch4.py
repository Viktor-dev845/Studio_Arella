import os

filepath = 'components/calendar/BookingCalendar.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the inline Filter button section
start_idx = content.find('{/* Legend */}')
end_idx = content.find('{loading ? (')

new_legend = """
        {/* Filter button positioned absolutely to match Figma */}
        <button
          onClick={() => setFilterModalOpen(true)}
          className="absolute right-0 -top-[70px] w-[117px] h-[50px] flex items-center justify-center gap-[10px] bg-transparent border border-[rgba(162,161,168,0.2)] rounded-[10px] cursor-pointer hover:bg-gray-50 transition-colors z-10"
        >
          <Filter size={20} className="text-[#16151C]" />
          <span className="font-body font-light text-[16px] text-[#16151C]">Filter</span>
        </button>

"""
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_legend + content[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Filter button!")
else:
    print("Could not find Legend or loading marker")
