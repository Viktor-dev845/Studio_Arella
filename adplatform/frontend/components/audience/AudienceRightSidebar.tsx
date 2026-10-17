'use client';

import { useState } from 'react';
import { 
  Check, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  Plus 
} from 'lucide-react';
import AudiencePremiumCard from './AudiencePremiumCard';
import AudienceChatsCard from './AudienceChatsCard';

interface CreatorItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  followed: boolean;
}

const INITIAL_CREATORS: CreatorItem[] = [
  {
    id: '723ccc51-044c-4509-a32a-e93aaf649248',
    name: 'Kyle Fisher',
    role: 'Product Designer',
    avatar: '/audience/kyle-fisher.png',
    followed: true,
  },
  {
    id: 'd69c7e9f-c990-4c72-a6d6-02d00794f282',
    name: 'Nermmen Saif',
    role: 'Sound Designer',
    avatar: '/audience/nermmen-saif.png',
    followed: false,
  },
  {
    id: '7b7d0a58-3f58-48c6-8b94-e9b93f278bae',
    name: 'Theresa Steward',
    role: 'Brand Strategist',
    avatar: '/audience/theresa-steward.png',
    followed: false,
  },
];

interface TopicItem {
  id: string;
  label: string;
  count: number;
  checked: boolean;
}

const INITIAL_TRENDING_TOPICS: TopicItem[] = [
  { id: 'health', label: 'Health', count: 10, checked: false },
  { id: 'wealth', label: 'Wealth', count: 10, checked: true }, // Checked in Figma with #D4AF37
  { id: 'politics', label: 'Politics', count: 10, checked: false },
  { id: 'entertainment', label: 'Entertainment', count: 10, checked: false },
];

const INITIAL_LIVE_EXPERIENCES: TopicItem[] = [
  { id: 'all', label: 'All', count: 10, checked: false },
  { id: 'family', label: 'Family', count: 10, checked: false },
  { id: 'business', label: 'Business', count: 10, checked: false },
  { id: 'relationship', label: 'Relationship', count: 10, checked: false },
  { id: 'marriage', label: 'Marriage', count: 10, checked: false },
];

interface AudienceRightSidebarProps {
  view?: 'feed' | 'trending' | 'bookmarks';
  onFilterChange?: (topics: string[], liveExp: string[]) => void;
}

export default function AudienceRightSidebar({
  view = 'trending',
  onFilterChange,
}: AudienceRightSidebarProps) {
  const [creators, setCreators] = useState<CreatorItem[]>(INITIAL_CREATORS);
  const [trendingTopics, setTrendingTopics] = useState<TopicItem[]>(INITIAL_TRENDING_TOPICS);
  const [liveExperiences, setLiveExperiences] = useState<TopicItem[]>(INITIAL_LIVE_EXPERIENCES);
  const [messagesOpen, setMessagesOpen] = useState(false);

  const toggleFollow = (id: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, followed: !c.followed } : c))
    );
  };

  const toggleTrending = (id: string) => {
    const updated = trendingTopics.map((t) =>
      t.id === id ? { ...t, checked: !t.checked } : t
    );
    setTrendingTopics(updated);
    if (onFilterChange) {
      onFilterChange(
        updated.filter((t) => t.checked).map((t) => t.id),
        liveExperiences.filter((l) => l.checked).map((l) => l.id)
      );
    }
  };

  const toggleLive = (id: string) => {
    const updated = liveExperiences.map((l) =>
      l.id === id ? { ...l, checked: !l.checked } : l
    );
    setLiveExperiences(updated);
    if (onFilterChange) {
      onFilterChange(
        trendingTopics.filter((t) => t.checked).map((t) => t.id),
        updated.filter((l) => l.checked).map((l) => l.id)
      );
    }
  };

  return (
    <aside className="w-full lg:w-[278px] flex flex-col gap-6 shrink-0 relative font-['DM_Sans',sans-serif]">
      {/* ─── 1. Try Premium for Free Card ─── */}
      <AudiencePremiumCard />

      {/* ─── 2. Conditional Body: Bookmarks (CHATS) vs Trending Filters vs Feed Creators ─── */}
      {view === 'bookmarks' ? (
        <AudienceChatsCard />
      ) : view === 'trending' ? (
        /* ─── Trending Topics & Live Experience (Frame 1618873129: 278px x 505px) ─── */
        <div className="w-[278px] min-h-[505px] bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-8">
          {/* Section A: Trending Topics */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[20px] font-semibold text-[#666666] leading-[26px]">
              Trending topics
            </h4>

            <div className="flex flex-col gap-3">
              {trendingTopics.map((topic) => (
                <div 
                  key={topic.id}
                  onClick={() => toggleTrending(topic.id)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Custom Checkbox */}
                    {topic.checked ? (
                      <div className="w-[18px] h-[18px] bg-[#D4AF37] rounded-[4px] flex items-center justify-center text-white shadow-sm">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-[16px] h-[16px] border border-[#6C757D] rounded-[4px] group-hover:border-black transition-colors" />
                    )}
                    <span className={`text-[16px] leading-[21px] transition-colors ${
                      topic.checked ? 'text-black font-medium' : 'text-[#666666] group-hover:text-black'
                    }`}>
                      {topic.label}
                    </span>
                  </div>

                  {/* Badge: 34px x 20px, white pill, gray/600 text "10" */}
                  <div className="w-[34px] h-[20px] bg-white rounded-[12px] flex items-center justify-center border border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
                    <span className="font-['Inter',sans-serif] text-[13px] text-[#6C757D] font-normal">
                      {topic.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Live Experience */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[20px] font-semibold text-[#666666] leading-[26px]">
              Live experience
            </h4>

            <div className="flex flex-col gap-3">
              {liveExperiences.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleLive(item.id)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Custom Checkbox */}
                    {item.checked ? (
                      <div className="w-[18px] h-[18px] bg-[#D4AF37] rounded-[4px] flex items-center justify-center text-white shadow-sm">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-[16px] h-[16px] border border-[#6C757D] rounded-[4px] group-hover:border-black transition-colors" />
                    )}
                    <span className={`text-[16px] leading-[21px] transition-colors ${
                      item.checked ? 'text-black font-medium' : 'text-[#666666] group-hover:text-black'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Badge: 34px x 20px, white pill, gray/600 text "10" */}
                  <div className="w-[34px] h-[20px] bg-white rounded-[12px] flex items-center justify-center border border-gray-100 shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
                    <span className="font-['Inter',sans-serif] text-[13px] text-[#6C757D] font-normal">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─── Default Feed: Creators You May Like + Memberships ─── */
        <>
          {/* Creators You May Like Card */}
          <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60">
            <h4 className="text-[16px] font-semibold text-[#212121] mb-4">
              Creators you may like
            </h4>

            <div className="flex flex-col gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-[38px] h-[38px] rounded-full object-cover shrink-0 border border-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <h5 className="text-[13px] font-semibold text-[#212121] truncate">
                        {creator.name}
                      </h5>
                      <p className="text-[11px] text-gray-500 truncate font-light">
                        {creator.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(creator.id)}
                    className={`w-[66px] h-[30px] rounded-[8px] text-[12px] font-medium transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                      creator.followed
                        ? 'bg-[#15411F] text-white border border-[#15411F]'
                        : 'bg-white text-[#15411F] border border-[#15411F] hover:bg-[#15411F]/5'
                    }`}
                  >
                    {creator.followed ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full h-[1px] bg-[#DFDFDF] my-4" />

            <div className="text-center">
              <button 
                type="button" 
                className="text-[12px] font-semibold text-[#15411F] hover:underline transition-all cursor-pointer"
              >
                See All
              </button>
            </div>
          </div>

          {/* Memberships / Pages Card */}
          <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                <img 
                  src="/audience/figma-logo.png" 
                  alt="Figma" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal truncate">
                Design podcast membership
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 cursor-pointer group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                  <img 
                    src="/audience/rocket-logo.png" 
                    alt="Rocket" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal truncate">
                  UI Design membership
                </span>
              </div>
              <span className="min-w-[28px] h-[16px] px-1 bg-[#FF1930] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shrink-0">
                +99
              </span>
            </div>

            <div className="flex items-center gap-3 cursor-pointer group pt-1">
              <div className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center shrink-0 group-hover:border-black transition-colors">
                <Plus size={14} className="text-gray-500 group-hover:text-black" />
              </div>
              <span className="text-[14px] text-[#666666] group-hover:text-black transition-colors font-normal">
                Join memberships
              </span>
            </div>
          </div>
        </>
      )}

      {/* ─── 3. Floating Bottom Messages Drawer (Chat: 278px x 56px) ─── */}
      <div className="w-[278px] bg-white rounded-t-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-b-0 border-gray-100 flex flex-col overflow-hidden sticky bottom-0 z-20">
        <button
          type="button"
          onClick={() => setMessagesOpen(!messagesOpen)}
          className="w-full h-[56px] px-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors cursor-pointer"
        >
          {/* Left: Chat Icon + Messages Text */}
          <div className="flex items-center gap-3">
            <MessageSquare size={22} strokeWidth={1.8} className="text-[#666666]" />
            <span className="text-[16px] font-normal text-[#666666] leading-[21px]">
              Messages
            </span>
          </div>

          {/* Right: Badge "6" + Chevron */}
          <div className="flex items-center gap-3">
            <div className="w-[16px] h-[16px] bg-[#FF1930] border-2 border-white rounded-[8px] flex items-center justify-center text-white text-[10px] font-['Roboto',sans-serif] font-normal shadow-sm">
              6
            </div>
            {messagesOpen ? (
              <ChevronDown size={20} strokeWidth={1.8} className="text-[#666666]" />
            ) : (
              <ChevronUp size={20} strokeWidth={1.8} className="text-[#666666]" />
            )}
          </div>
        </button>

        {/* Collapsible Messages Popover */}
        {messagesOpen && (
          <div className="p-3.5 border-t border-gray-100 bg-white flex flex-col gap-2 max-h-[220px] overflow-y-auto">
            <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                NU
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Nermmen Saif</p>
                <p className="text-[11px] text-gray-500 truncate">Great discussion on the wealth podcast!</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-600">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Studio Arella Team</p>
                <p className="text-[11px] text-gray-500 truncate">Your ad slot booking is confirmed.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
