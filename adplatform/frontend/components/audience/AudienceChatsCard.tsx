'use client';

import { useState } from 'react';

interface ChatItem {
  id: string;
  name: string;
  message: string;
  avatar: string;
  isOnline?: boolean;
  nameColor?: string;
  unreadCount?: number;
}

const CHAT_LIST: ChatItem[] = [
  {
    id: '1',
    name: 'Darlene Black',
    message: 'Hey, how is your project?',
    avatar: '/audience/darlene-black.png',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Theresa Steward',
    message: 'Hi, Dmitry! I have a work for you. We',
    avatar: '/audience/theresa-steward.png',
    isOnline: true,
    nameColor: 'text-[#15411F]',
  },
  {
    id: '3',
    name: 'Brandon Wilson',
    message: 'I am Russian and I am learning Engl',
    avatar: '/audience/brandon-wilson.png',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Kyle Fisher',
    message: 'So, It’s up to you!',
    avatar: '/audience/kyle-fisher.png',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Audrey Alexander',
    message: 'When you got it?',
    avatar: '/audience/audrey-alexander.png',
    isOnline: true,
  },
  {
    id: '6',
    name: 'Design Conference',
    message: 'Can you guys help me with it?',
    avatar: '/audience/design-conference.png',
    isOnline: false,
  },
];

export default function AudienceChatsCard({
  onSelectChat,
}: {
  onSelectChat?: (chat: ChatItem) => void;
}) {
  const [activeChatId, setActiveChatId] = useState<string>('4'); // Kyle Fisher selected by default as in Figma

  const handleSelect = (chat: ChatItem) => {
    setActiveChatId(chat.id);
    if (onSelectChat) onSelectChat(chat);
  };

  return (
    <div className="w-[278px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden font-['DM_Sans',sans-serif]">
      {/* ─── Header: CHATS (12px uppercase) ─── */}
      <div className="px-5 py-3.5">
        <h4 className="text-[12px] font-normal text-[#181818] tracking-wider uppercase">
          CHATS
        </h4>
      </div>

      <div className="w-full h-[1px] bg-[#F4F4F4]" />

      {/* ─── Chat Items ─── */}
      <div className="flex flex-col">
        {CHAT_LIST.map((chat) => {
          const isSelected = activeChatId === chat.id;

          return (
            <div key={chat.id} className="flex flex-col">
              <div
                onClick={() => handleSelect(chat)}
                className={`relative flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-50/20' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Active indicator bar on left: width 9.59px, background #D4AF37 */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#D4AF37]" />
                )}

                {/* Avatar with optional online dot */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-[44px] h-[44px] rounded-full object-cover border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-[10px] h-[10px] bg-[#02B033] rounded-full border-2 border-white shadow-xs" />
                  )}
                </div>

                {/* Name & Snippet */}
                <div className="flex-1 min-w-0">
                  <h5
                    className={`text-[14px] font-medium leading-[18px] truncate ${
                      chat.nameColor || 'text-[#181818]'
                    } ${isSelected ? 'opacity-85' : ''}`}
                  >
                    {chat.name}
                  </h5>
                  <p
                    className={`text-[10px] leading-[15px] truncate font-normal text-black/50 ${
                      isSelected ? 'opacity-80' : ''
                    }`}
                  >
                    {chat.message}
                  </p>
                </div>
              </div>

              {/* Row Divider */}
              <div className="w-full h-[1px] bg-[#F4F4F4]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
