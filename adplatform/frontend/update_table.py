import re

with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_tbody_start = """                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filtered.length === 0 ? ("""

new_tbody_start = """                <tbody className="divide-y divide-[rgba(162,161,168,0.2)]">
                  {filtered.length === 0 ? ("""

content = content.replace(old_tbody_start, new_tbody_start)

old_row = """                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-slate-50">{c.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.adsCount} ad slots active</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                          {c.schedule}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-slate-200">
                          {c.budget.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                          {c.spent.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                          {c.impressions.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(c.status)}`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">"""

new_row = """                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-[16px] px-[24px]">
                          <p className="text-[14px] font-normal text-[#101828]">{c.name}</p>
                          <p className="text-[12px] font-normal text-[rgba(162,161,168,1)] mt-0.5">{c.adsCount} ad slots active</p>
                        </td>
                        <td className="py-[16px] px-[24px] text-[14px] font-normal text-[#101828]">
                          {c.schedule}
                        </td>
                        <td className="py-[16px] px-[24px] text-[14px] font-normal text-[#101828]">
                          {c.budget.toLocaleString()}
                        </td>
                        <td className="py-[16px] px-[24px] text-[14px] font-normal text-[#101828]">
                          {c.spent.toLocaleString()}
                        </td>
                        <td className="py-[16px] px-[24px] text-[14px] font-normal text-[#101828]">
                          {c.impressions.toLocaleString()}
                        </td>
                        <td className="py-[16px] px-[24px]">
                          <span className={`inline-flex items-center px-[8px] py-[2px] rounded-full text-[12px] font-normal ${
                            c.status === 'active' ? 'bg-[#91C600]/10 text-[#91C600]' : 
                            c.status === 'paused' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 
                            'bg-[#FF4E2B]/10 text-[#FF4E2B]'
                          }`}>
                            {STATUS_LABELS[c.status] || c.status}
                          </span>
                        </td>
                        <td className="py-[16px] px-[24px] text-right">"""

if old_row in content:
    content = content.replace(old_row, new_row)
else:
    print("Could not find old row!")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
