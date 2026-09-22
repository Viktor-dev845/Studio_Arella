import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Page title
content = content.replace(
    '          <div className="flex items-end justify-between">\n            <div>\n              <h1 className="text-[20px] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Campaigns</h1>',
    '          <div className="flex items-end justify-between">\n            <div>\n              <h1 className="text-[24px] font-medium text-[#101828]">Campaigns</h1>'
)

# Replace the metric cards
old_cards = """          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Campaigns', value: String(campaigns.length) },
              { label: 'Total Budget (NGN)', value: `₦${campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()}` },
              { label: 'Total Spent (NGN)', value: `₦${campaigns.reduce((s, c) => s + c.spent, 0).toLocaleString()}` },
              { label: 'Total Impressions', value: campaigns.reduce((s, c) => s + c.impressions, 0).toLocaleString() },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111111] rounded-[18px] p-5 border border-slate-100 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
              >
                <p className="text-[12.5px] font-bold text-slate-500 dark:text-slate-400 mb-3">{stat.label}</p>
                <span className="text-[24px] font-black text-slate-900 dark:text-slate-50 leading-none">{stat.value}</span>
              </div>
            ))}
          </div>"""

new_cards = """          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total campaigns', value: '5', pct: '+10.0%', isDown: false },
              { label: 'Total budget (NGN)', value: '₦4,500,000.00', pct: '+10.0%', isDown: false },
              { label: 'Total spent', value: '₦2,000,000.00', pct: '-7.0%', isDown: true },
              { label: 'Total impressions', value: '1.8M', pct: '+10.0%', isDown: false },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] p-[24px] border border-[rgba(162,161,168,0.2)] flex flex-col justify-center gap-[16px]"
              >
                <p className="text-[14px] font-normal text-[rgba(162,161,168,1)] leading-[21px]">{stat.label}</p>
                <div className="flex items-center gap-[10px]">
                  <span className="text-[32px] font-semibold text-[#16151C] leading-[48px]">{stat.value}</span>
                  <div className={`flex items-center justify-center px-2 py-1 rounded-[6px] text-[12px] font-normal leading-[18px] ${stat.isDown ? 'bg-[rgba(255,78,43,0.1)] text-[#FF4E2B]' : 'bg-[rgba(145,198,0,0.1)] text-[#91C600]'}`}>
                    {stat.pct}
                  </div>
                </div>
              </div>
            ))}
          </div>"""

if old_cards in content:
    content = content.replace(old_cards, new_cards)
else:
    print("Could not find old cards!")

# Replace Toolbar title
if '<h2 className="text-[17px] font-bold text-slate-900 dark:text-slate-50">All Campaigns</h2>' in content:
    content = content.replace(
        '<h2 className="text-[17px] font-bold text-slate-900 dark:text-slate-50">All Campaigns</h2>',
        '<h2 className="text-[20px] font-medium text-[#101828]">Recently Played</h2>'
    )

# Table Header
old_thead = """                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign Info</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spent (NGN)</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>"""

new_thead = """                <thead>
                  <tr className="border-b border-[rgba(162,161,168,0.2)] bg-[#FDFDFD]">
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Campaign info</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Date</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Budget</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Spent</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Impressions</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828]">Status</th>
                    <th className="py-[16px] px-[24px] text-[16px] font-normal text-[#101828] text-right">Action</th>
                  </tr>
                </thead>"""

if old_thead in content:
    content = content.replace(old_thead, new_thead)
else:
    print("Could not find old thead!")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
