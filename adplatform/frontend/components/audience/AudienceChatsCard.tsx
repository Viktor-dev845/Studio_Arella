'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChatItem {
  id: string;
  name: string;
  message: string;
  avatar: string;
  statusType?: 'solid' | 'ring' | 'none';
  nameColor?: string;
  hasGradientSnippet?: boolean;
  isComposite?: boolean;
}

const CHAT_LIST: ChatItem[] = [
  {
    id: '2aeff3a5-c640-49bb-9c54-b20cfcde4932',
    name: 'Darlene Black',
    message: 'Hey, how is your project?',
    avatar: '/audience/darlene-black.png',
    statusType: 'solid',
  },
  {
    id: '7b7d0a58-3f58-48c6-8b94-e9b93f278bae',
    name: 'Theresa Steward',
    message: 'Loved the latest podcast session! Let’s connect.',
    avatar: '/audience/theresa-steward.png',
    statusType: 'solid',
    nameColor: 'text-[#15411F]',
    hasGradientSnippet: true,
  },
  {
    id: 'db9c8abc-87b6-45d1-99dd-1eb6d5959b27',
    name: 'Brandon Wilson',
    message: 'Studio Arella audio screens are performing great.',
    avatar: '/audience/brandon-wilson.png',
    statusType: 'ring',
    hasGradientSnippet: true,
  },
  {
    id: '723ccc51-044c-4509-a32a-e93aaf649248',
    name: 'Kyle Fisher',
    message: 'So, It’s up to you!',
    avatar: '/audience/kyle-fisher.png',
    statusType: 'none',
  },
  {
    id: '3ebd44d6-54c1-4e6b-8519-6bc67753f631',
    name: 'Audrey Alexander',
    message: 'When you got it?',
    avatar: '/audience/audrey-alexander.png',
    statusType: 'solid',
  },
  {
    id: 'design-conference-group',
    name: 'Design Conference',
    message: 'Can you guys help me with it?',
    avatar: '/audience/design-conference.png',
    statusType: 'none',
    isComposite: true,
  },
];

export default function AudienceChatsCard({
  onSelectChat,
}: {
  onSelectChat?: (chat: ChatItem) => void;
}) {
  const router = useRouter();
  // Kyle Fisher active by default as in Figma
  const [activeChatId, setActiveChatId] = useState<string>('723ccc51-044c-4509-a32a-e93aaf649248');

  const handleSelect = (chat: ChatItem) => {
    setActiveChatId(chat.id);
    if (onSelectChat) {
      onSelectChat(chat);
    } else {
      router.push('/audience?view=chats');
    }
  };

  return (
    <div className="w-[278px] min-h-[560px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden font-['DM_Sans',sans-serif]">
      {/* ─── Header: CHATS (12px uppercase) ─── */}
      <div className="px-5 py-4">
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
                className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-50/20' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Active indicator bar on left: width 9.59px, background #D4AF37 */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-[9.6px] bg-[#D4AF37]" />
                )}

                {/* Avatar with optional online dot or composite avatar */}
                <div className="relative shrink-0">
                  {chat.isComposite ? (
                    <div className="w-[44px] h-[44px] rounded-full overflow-hidden border border-gray-100 grid grid-cols-2 grid-rows-2">
                      <img src="/audience/darlene-black.png" alt="" className="w-full h-full object-cover" />
                      <img src="/audience/kyle-fisher.png" alt="" className="w-full h-full object-cover" />
                      <img src="/audience/theresa-steward.png" alt="" className="w-full h-full object-cover" />
                      <img src="/audience/brandon-wilson.png" alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className={`w-[44px] h-[44px] rounded-full object-cover border border-gray-100 transition-opacity ${
                        isSelected ? 'opacity-60' : ''
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/audience/darlene-black.png';
                      }}
                    />
                  )}

                  {/* Online dot: solid green or hollow ring */}
                  {chat.statusType === 'solid' && (
                    <div className="absolute bottom-0 right-0 w-[9px] h-[9px] bg-gradient-to-b from-[#02B033] to-[#08A534] rounded-full border border-white shadow-xs" />
                  )}
                  {chat.statusType === 'ring' && (
                    <div className="absolute bottom-0 right-0 w-[9px] h-[9px] bg-white border-[1.5px] border-[#02B033] rounded-full shadow-xs" />
                  )}
                </div>

                {/* Name & Snippet */}
                <div className={`flex-1 min-w-0 ${isSelected ? 'opacity-60' : ''}`}>
                  <h5
                    className={`text-[14px] font-medium leading-[18px] truncate ${
                      chat.nameColor || 'text-[#181818]'
                    }`}
                  >
                    {chat.name}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-300 inline-block shrink-0" />
                    <p
                      className={`text-[10px] leading-[15px] truncate font-normal ${
                        chat.hasGradientSnippet
                          ? 'bg-gradient-to-r from-[#181818] via-[#181818]/90 to-transparent bg-clip-text text-transparent'
                          : 'text-[#181818]/50'
                      }`}
                    >
                      {chat.message}
                    </p>
                  </div>
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

