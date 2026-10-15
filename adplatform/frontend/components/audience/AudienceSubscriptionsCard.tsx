'use client';

import { useState } from 'react';

interface SubscriptionItem {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  isSubscribed: boolean;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-1',
    name: 'Dylan fan club',
    description: 'A place where fun things are discussed......',
    membersCount: 115,
    isSubscribed: true,
  },
  {
    id: 'sub-2',
    name: 'Dylan fan club',
    description: 'A place where fun things are discussed......',
    membersCount: 115,
    isSubscribed: true,
  },
  {
    id: 'sub-3',
    name: 'Dylan fan club',
    description: 'A place where fun things are discussed......',
    membersCount: 115,
    isSubscribed: true,
  },
];

/* Pinwheel radiating logo matching the Figma vectors */
function PinwheelLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg 
      className={`${className} shrink-0`} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pw-sub-tr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E53282" />
          <stop offset="100%" stopColor="#851D7B" />
        </linearGradient>
        <linearGradient id="pw-sub-tl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F08504" />
          <stop offset="100%" stopColor="#E5322D" />
        </linearGradient>
        <linearGradient id="pw-sub-br" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#97BE11" />
          <stop offset="100%" stopColor="#258F2D" />
        </linearGradient>
        <linearGradient id="pw-sub-bl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3AB4E6" />
          <stop offset="100%" stopColor="#004996" />
        </linearGradient>
      </defs>

      {/* Top Left Quadrant (Orange/Red) */}
      <path d="M7 16 C7 11 11 7 16 7" stroke="url(#pw-sub-tl)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 17 C10 13 13 10 17 10" stroke="url(#pw-sub-tl)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 18 C13 15 15 13 18 13" stroke="url(#pw-sub-tl)" strokeWidth="2.4" strokeLinecap="round" />

      {/* Top Right Quadrant (Pink/Purple) */}
      <path d="M24 7 C29 7 33 11 33 16" stroke="url(#pw-sub-tr)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23 10 C27 10 30 13 30 17" stroke="url(#pw-sub-tr)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 13 C25 13 27 15 27 18" stroke="url(#pw-sub-tr)" strokeWidth="2.4" strokeLinecap="round" />

      {/* Bottom Right Quadrant (Lime/Green) */}
      <path d="M33 24 C33 29 29 33 24 33" stroke="url(#pw-sub-br)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M30 23 C30 27 27 30 23 30" stroke="url(#pw-sub-br)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M27 22 C27 25 25 27 22 27" stroke="url(#pw-sub-br)" strokeWidth="2.4" strokeLinecap="round" />

      {/* Bottom Left Quadrant (Cyan/Blue) */}
      <path d="M16 33 C11 33 7 29 7 24" stroke="url(#pw-sub-bl)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17 30 C13 30 10 27 10 23" stroke="url(#pw-sub-bl)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 27 C15 27 13 25 13 22" stroke="url(#pw-sub-bl)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function AudienceSubscriptionsCard() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [confirmUnsubId, setConfirmUnsubId] = useState<string | null>(null);

  const handleToggleSubscribe = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const nextState = !sub.isSubscribed;
          return {
            ...sub,
            isSubscribed: nextState,
            membersCount: nextState ? sub.membersCount + 1 : sub.membersCount - 1,
          };
        }
        return sub;
      })
    );
    setConfirmUnsubId(null);
  };

  return (
    <div className="w-full max-w-[862px] min-h-[580px] bg-white rounded-[18px] p-7 sm:p-9 md:px-10 md:py-9 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/80 flex flex-col gap-8 font-['DM_Sans',sans-serif]">
      {/* ─── Header: 21px font-medium #3A3A3A (Frame 2121459678: Subscriptions) ─── */}
      <h2 className="text-[21px] font-medium text-[#3A3A3A] leading-[27px]">
        Subscriptions
      </h2>

      {/* ─── List of Subscriptions: gap 32px (Frame 2121459677) ─── */}
      <div className="flex flex-col gap-8">
        {subscriptions.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 pb-6 border-b border-gray-100/70 last:border-b-0 last:pb-0"
          >
            {/* Badge: 100px x 28px, background rgba(48, 150, 137, 0.1), radius 8px, text #309689 */}
            <div className="w-fit h-[28px] px-3 bg-[rgba(48,150,137,0.1)] rounded-[8px] flex items-center justify-center">
              <span className="text-[14px] font-normal text-[#309689] leading-[18px]">
                {item.membersCount} members
              </span>
            </div>

            {/* Main Row: Logo + Text on left, Button on right */}
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              {/* Left: Logo (40x40) + Text Block */}
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <PinwheelLogo className="w-10 h-10 shrink-0" />

                <div className="flex flex-col min-w-0">
                  <h3 className="text-[14px] font-semibold text-black leading-[18px] truncate">
                    {item.name}
                  </h3>
                  <p className="text-[10px] font-normal text-black leading-[13px] truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right: Unsubscribe / Subscribe Button (110px x 40px, background #D4AF37, radius 6px) */}
              <button
                type="button"
                onClick={() => handleToggleSubscribe(item.id)}
                className={`w-[110px] h-[40px] rounded-[6px] text-[14px] font-normal font-['Jost',sans-serif] capitalize transition-all shrink-0 shadow-sm active:scale-95 flex items-center justify-center cursor-pointer ${
                  item.isSubscribed
                    ? 'bg-[#D4AF37] text-black/80 hover:bg-[#c39e2e]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
