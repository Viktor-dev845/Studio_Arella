import os
import re

with open('app/bookings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace state variables
content = content.replace("const [extendAmount, setExtendAmount] = useState('1');", "const [extendDuration, setExtendDuration] = useState('');")
content = content.replace("const [extendUnit, setExtendUnit] = useState<ExtendUnit>('hours');", "const [extendInfo, setExtendInfo] = useState('');")

# Update handleExtend function
old_handle_extend = """  const handleExtend = async () => {
    if (!extendTarget) return;
    const amount = Number(extendAmount);
    if (!amount || amount <= 0) {
      toast('Please enter a valid amount of time', 'error');
      return;
    }
    const additionalMinutes = Math.round(amount * UNIT_MINUTES[extendUnit]);
    const url = extendTarget.type === 'ad'
      ? `/bookings/${extendTarget.id}/extend`
      : `/podcasts/${extendTarget.id}/extend`;

    setExtending(true);
    try {
      const res = await api.put(url, { additional_minutes: additionalMinutes });"""

new_handle_extend = """  const handleExtend = async () => {
    if (!extendTarget) return;
    const match = extendDuration.toLowerCase().match(/(\d+)\s*(m|min|h|hour|hr|d|day|w|week|mo|month)/);
    if (!match) {
      toast('Please specify a valid duration, e.g. "2 hours"', 'error');
      return;
    }
    const num = parseInt(match[1]);
    const unit = match[2];
    let mins = 0;
    if (unit.startsWith('m') && unit !== 'mo' && unit !== 'month' && unit !== 'months') mins = num;
    else if (unit.startsWith('h')) mins = num * 60;
    else if (unit.startsWith('d')) mins = num * 60 * 24;
    else if (unit.startsWith('w')) mins = num * 60 * 24 * 7;
    else if (unit.startsWith('mo')) mins = num * 60 * 24 * 30;

    const additionalMinutes = mins;
    const url = extendTarget.type === 'ad'
      ? `/bookings/${extendTarget.id}/extend`
      : `/podcasts/${extendTarget.id}/extend`;

    setExtending(true);
    try {
      const res = await api.put(url, { additional_minutes: additionalMinutes, additional_info: extendInfo });"""

content = content.replace(old_handle_extend, new_handle_extend)

with open('app/bookings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated handleExtend")
