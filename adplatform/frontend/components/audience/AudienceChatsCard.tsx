'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import api from '@/lib/api';

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

const CHAT_LIST: ChatItem[] = [];

export default function AudienceChatsCard({
  onSelectChat,
}: {
  onSelectChat?: (chat: ChatItem) => void;
}) {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>(CHAT_LIST);
  const [activeChatId, setActiveChatId] = useState<string>('');

  useEffect(() => {
    api.get('/chats/conversations')
      .then((res) => {
        const convos = res.data?.conversations || [];
        if (convos.length > 0) {
          const mapped: ChatItem[] = convos.map((c: any) => ({
            id: c.contact_id,
            name: c.contact_name,
            message: c.last_message || 'Started a conversation',
            avatar: c.contact_avatar || '',
            statusType: 'solid',
          }));
          setChats(mapped);
          setActiveChatId(mapped[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (chat: ChatItem) => {
    setActiveChatId(chat.id);
    if (onSelectChat) {
      onSelectChat(chat);
    } else {
      router.push('/audience?view=chats');
    }
  };

  return (
    <div className="w-full min-h-[560px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden font-['DM_Sans',sans-serif]">
      {/* ─── Header: CHATS (12px uppercase) ─── */}
      <div className="px-5 py-4">
        <h4 className="text-[12px] font-normal text-[#181818] tracking-wider uppercase">
          CHATS
        </h4>
      </div>

      <div className="w-full h-[1px] bg-[#F4F4F4]" />

      {/* ─── Chat Items ─── */}
      <div className="flex flex-col flex-1">
        {chats.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-amber-50/80 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] mb-3 shadow-2xs">
              <MessageSquare size={20} strokeWidth={1.8} />
            </div>
            <h5 className="text-[14px] font-semibold text-[#181818]">
              No active chats
            </h5>
            <p className="text-[12px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">
              Direct messages with creators and listeners will appear here.
            </p>
          </div>
        ) : (
          chats.map((chat) => {
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
        })
      )}
      </div>
    </div>
  );
}

