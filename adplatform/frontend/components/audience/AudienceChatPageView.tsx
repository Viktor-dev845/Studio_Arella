'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  isOnline?: boolean;
  onlineDotStyle?: 'solid-green' | 'hollow-green' | 'none';
  nameColor?: string;
  lastOnline?: string;
  sharedMediaCount?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  isRead?: boolean;
  avatar?: string;
  bgColor?: string;
}

const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: '2aeff3a5-c640-49bb-9c54-b20cfcde4932',
    name: 'Darlene Black',
    lastMessage: 'Hey, how is your project?',
    avatar: '/audience/darlene-black.png',
    isOnline: true,
    onlineDotStyle: 'solid-green',
    lastOnline: 'ONLINE NOW',
    sharedMediaCount: 8,
  },
  {
    id: '7b7d0a58-3f58-48c6-8b94-e9b93f278bae',
    name: 'Theresa Steward',
    lastMessage: 'Hi, Dmitry! I have a work for you. We',
    avatar: '/audience/theresa-steward.png',
    isOnline: true,
    onlineDotStyle: 'solid-green',
    nameColor: 'text-[#15411F]',
    lastOnline: 'ONLINE NOW',
    sharedMediaCount: 14,
  },
  {
    id: 'db9c8abc-87b6-45d1-99dd-1eb6d5959b27',
    name: 'Brandon Wilson',
    lastMessage: 'I am Russian and I am learning Engl',
    avatar: '/audience/brandon-wilson.png',
    isOnline: true,
    onlineDotStyle: 'hollow-green',
    lastOnline: 'LAST ONLINE: 1 HOUR AGO',
    sharedMediaCount: 5,
  },
  {
    id: '723ccc51-044c-4509-a32a-e93aaf649248',
    name: 'Kyle Fisher',
    lastMessage: 'So, It’s up to you!',
    avatar: '/audience/kyle-fisher.png',
    isOnline: false,
    onlineDotStyle: 'none',
    lastOnline: 'LAST ONLINE: 4 HOURS AGO',
    sharedMediaCount: 12,
  },
  {
    id: '3ebd44d6-54c1-4e6b-8519-6bc67753f631',
    name: 'Audrey Alexander',
    lastMessage: 'When you got it?',
    avatar: '/audience/audrey-alexander.png',
    isOnline: true,
    onlineDotStyle: 'solid-green',
    lastOnline: 'ONLINE NOW',
    sharedMediaCount: 3,
  },
  {
    id: 'd69c7e9f-c990-4c72-a6d6-02d00794f282',
    name: 'Nermmen Saif',
    lastMessage: 'Great insights on the new soundscape!',
    avatar: '/audience/nermmen-saif.png',
    isOnline: false,
    onlineDotStyle: 'none',
    lastOnline: 'LAST ACTIVE: YESTERDAY',
    sharedMediaCount: 19,
  },
];

/* Custom Double Blue Check Icon matching Figma Vector border: 1px solid #0275B1 */
function DoubleBlueCheck() {
  return (
    <svg 
      width="16" 
      height="12" 
      viewBox="0 0 16 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path 
        d="M1 6.5L4 9.5L10 2.5" 
        stroke="#0275B1" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M6 6.5L9 9.5L15 2.5" 
        stroke="#0275B1" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export default function AudienceChatPageView() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('723ccc51-044c-4509-a32a-e93aaf649248');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations from backend
  useEffect(() => {
    api.get('/chats/conversations')
      .then((res) => {
        const convos = res.data?.conversations || [];
        if (convos.length > 0) {
          const mapped: ChatContact[] = convos.map((c: any) => ({
            id: c.contact_id,
            name: c.contact_name,
            lastMessage: c.last_message_text || 'Active now',
            avatar: c.contact_avatar || '/audience/adam-udochi.png',
            isOnline: true,
            onlineDotStyle: 'solid-green',
            lastOnline: 'ONLINE NOW',
            sharedMediaCount: 8,
          }));
          // Merge unique contacts
          setContacts((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            const existingFiltered = prev.filter((p) => !ids.has(p.id));
            return [...mapped, ...existingFiltered];
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load conversations from API, using default Figma contacts:', err);
      });
  }, []);

  // 2. Fetch messages for active contact
  useEffect(() => {
    if (!activeContactId) return;
    setIsLoadingMessages(true);
    api.get(`/chats/${activeContactId}/messages`)
      .then((res) => {
        const msgs = res.data?.messages || [];
        const mapped: ChatMessage[] = msgs.map((m: any) => {
          const isMe = m.sender_id === user?.id;
          const date = new Date(m.created_at);
          const time = !isNaN(date.getTime()) 
            ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) 
            : '4:29 PM';
          return {
            id: m.id,
            sender: isMe ? 'me' : 'them',
            text: m.message_text,
            time,
            isRead: m.is_read,
            avatar: isMe ? (user?.avatar || '/audience/adam-udochi.png') : (activeContact?.avatar || '/audience/kyle-fisher.png'),
            bgColor: isMe ? 'bg-[#D4AF37]' : 'bg-[#FCF6E6]',
          };
        });
        setMessages(mapped);
      })
      .catch((err) => {
        console.warn(`Could not load messages for contact ${activeContactId}:`, err);
        setMessages([]);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  }, [activeContactId, user?.id]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[3];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timeString = `${formattedHours}:${minutes} ${ampm}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: textToSend,
      time: timeString,
      isRead: true,
      bgColor: 'bg-[#D4AF37]',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    try {
      await api.post(`/chats/${activeContactId}/messages`, { message: textToSend });
    } catch (err) {
      console.warn('Send direct message API error:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 font-['DM_Sans',sans-serif]">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center items-start">
        
        {/* ─── 1. Left Column: Visitors / Chats List (278px x 560px) ─── */}
        <aside className="w-full lg:w-[278px] min-h-[560px] bg-white rounded-[4px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-gray-100/80 flex flex-col shrink-0 overflow-hidden">
          {/* Header: CHATS (12px uppercase) */}
          <div className="px-5 py-4">
            <h3 className="text-[12px] font-normal text-[#181818] tracking-wider uppercase">
              CHATS
            </h3>
          </div>

          <div className="w-full h-[1px] bg-[#F4F4F4]" />

          {/* Contact Items List */}
          <div className="flex flex-col">
            {contacts.map((contact) => {
              const isSelected = contact.id === activeContactId;

              return (
                <div key={contact.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`relative w-full text-left flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/20' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Active indicator bar on left: 9.59px wide, 80px high, #D4AF37 */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[9.59px] bg-[#D4AF37]" />
                    )}

                    {/* Avatar (49.85px x 52px, radius 26px) with Status Dot */}
                    <div className="relative shrink-0 w-[49.85px] h-[52px]">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className={`w-full h-full rounded-[26px] object-cover ${
                          isSelected ? 'opacity-60' : ''
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Online Status Dot */}
                      {contact.onlineDotStyle === 'solid-green' && (
                        <div className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-[26px] bg-gradient-to-b from-[#02B033] to-[#08A534] border border-white shadow-xs" />
                      )}
                      {contact.onlineDotStyle === 'hollow-green' && (
                        <div className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-[26px] bg-white border-[1.5px] border-[#02B033] shadow-xs" />
                      )}
                    </div>

                    {/* Name & Snippet */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-[14px] font-medium leading-[18px] truncate ${
                          contact.nameColor || 'text-[#181818]'
                        } ${isSelected ? 'opacity-60' : ''}`}
                      >
                        {contact.name}
                      </h4>
                      <p
                        className={`text-[10px] leading-[15px] truncate font-normal mt-0.5 ${
                          contact.id === 'theresa' || contact.id === 'brandon'
                            ? 'bg-gradient-to-r from-[#181818] from-80% to-transparent bg-clip-text text-transparent'
                            : isSelected
                            ? 'text-[#181818] opacity-60'
                            : 'text-[#181818]/50'
                        }`}
                      >
                        {contact.lastMessage}
                      </p>
                    </div>
                  </button>

                  {/* Divider line between rows */}
                  <div className="w-full h-[1px] bg-[#F4F4F4]" />
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── 2. Right Column: Group 48095428 (911px x 868px) ─── */}
        <section className="w-full lg:w-[911px] min-h-[868px] bg-[#FCFDFD] rounded-[18px] p-5 sm:p-7 md:p-8 flex flex-col gap-6 shadow-[0px_0px_2px_rgba(0,0,0,0.06)] border border-gray-100/60">
          {/* Header Title: Chats (DM Sans 21px 500 #3A3A3A) */}
          <h2 className="text-[21px] font-medium text-[#3A3A3A] leading-[27px]">
            Chats
          </h2>

          {/* Inner Chat Box: Rectangle 2 (850px x 655px, rounded 4px, white) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/80 flex flex-col flex-1 overflow-hidden">
            
            {/* Top Bar: Group 5 (850px x 40px) */}
            <div className="w-full h-[52px] px-6 flex items-center justify-between border-b border-[#F4F4F4] text-[12px] font-normal uppercase tracking-wider text-[#181818]">
              {/* Left: Chat with <Name> */}
              <div className="flex items-center gap-2">
                <span className="font-normal text-[#181818]">
                  CHAT WITH {activeContact.name}
                </span>
              </div>

              {/* Middle: Last Online (hidden on mobile) */}
              <div className="hidden sm:block text-[#181818]/60 text-center font-normal">
                {activeContact.lastOnline || 'LAST ONLINE: 4 HOURS AGO'}
              </div>

              {/* Right: Shared media */}
              <div className="flex items-center gap-2 text-[#181818] cursor-pointer hover:opacity-80 transition-opacity">
                <Paperclip size={18} className="text-[#15411F]" strokeWidth={2.2} />
                <span className="font-normal">
                  SHARED MEDIA ({activeContact.sharedMediaCount || 12})
                </span>
              </div>
            </div>

            {/* Messages Area (850px x 521px scrollable stream) */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col gap-5 min-h-[440px] max-h-[560px]">
              {isLoadingMessages ? (
                <div className="flex flex-col gap-5 animate-pulse py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
                    <div className="h-14 w-64 bg-neutral-200 rounded-[4px]" />
                  </div>
                  <div className="flex items-end justify-end gap-3">
                    <div className="h-14 w-72 bg-neutral-200 rounded-[4px]" />
                    <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
                    <div className="h-12 w-48 bg-neutral-200 rounded-[4px]" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-[#181818]/60">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <Send size={24} className="text-[#181818]/40" />
                  </div>
                  <p className="text-[15px] font-medium text-[#181818]">No messages yet</p>
                  <p className="text-[13px] text-[#181818]/60 max-w-[280px] mt-1">
                    Send a message below to start chatting with {activeContact.name}!
                  </p>
                </div>
              ) : (
                <>
                  {/* Centered Date Separator: YESTERDAY, 29 JAN */}
                  <div className="w-full flex items-center justify-center gap-4 my-2">
                    <div className="flex-1 max-w-[302px] h-[1px] bg-[#F4F4F4]" />
                    <span className="text-[12px] font-normal uppercase tracking-wider text-[#181818]/60 shrink-0">
                      yesterday, 29 jan
                    </span>
                    <div className="flex-1 max-w-[302px] h-[1px] bg-[#F4F4F4]" />
                  </div>

                  {/* Render Messages */}
                  {messages.map((msg) => {
                    const isMe = msg.sender === 'me';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} gap-1.5`}
                      >
                        <div className="flex items-end gap-3 max-w-[85%]">
                          {/* Bubble */}
                          <div
                            className={`${
                              msg.bgColor || (isMe ? 'bg-[#D4AF37]' : 'bg-[#FCF6E6]')
                            } rounded-[4px] px-4 py-3 text-[14px] leading-[21px] ${
                              isMe ? 'text-[#000000]' : 'text-[#181818]'
                            } shadow-2xs`}
                          >
                            {msg.text}
                          </div>

                          {/* Avatar for incoming messages */}
                          {!isMe && (
                            <img
                              src={msg.avatar || activeContact.avatar}
                              alt="Sender"
                              className="w-[46px] h-[46px] rounded-[26px] object-cover shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                              }}
                            />
                          )}
                        </div>

                        {/* Timestamp & Read Receipts */}
                        <div
                          className={`flex items-center gap-1.5 text-[10px] text-[#181818]/60 ${
                            isMe ? 'pl-1' : 'pr-[58px]'
                          }`}
                        >
                          {isMe && msg.isRead && <DoubleBlueCheck />}
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Input Bar: Group 4 (850px x 53px) */}
            <form
              onSubmit={handleSendMessage}
              className="w-full min-h-[53px] px-6 py-3 border-t border-[#F4F4F4] flex items-center justify-between gap-4 bg-white"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Write your message"
                className="flex-1 bg-transparent text-[16px] sm:text-[18px] text-[#181818] placeholder:text-[rgba(24,24,24,0.2)] outline-none leading-[23px]"
              />

              <div className="flex items-center gap-4 shrink-0">
                {/* Paperclip */}
                <button
                  type="button"
                  className="text-black opacity-15 hover:opacity-75 transition-opacity p-1 cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip size={24} />
                </button>

                {/* Send Button (32px x 32px, #D4AF37, radius 4px) */}
                <button
                  type="submit"
                  className="w-[32px] h-[32px] bg-[#D4AF37] hover:bg-[#c49f30] text-black rounded-[4px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                  title="Send message"
                >
                  <Send size={15} strokeWidth={2.2} />
                </button>
              </div>
            </form>

          </div>
        </section>

      </div>
    </div>
  );
}
