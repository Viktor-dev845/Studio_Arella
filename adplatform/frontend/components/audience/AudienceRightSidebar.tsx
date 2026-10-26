'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Users 
} from 'lucide-react';
import AudiencePremiumCard from './AudiencePremiumCard';
import AudienceChatsCard from './AudienceChatsCard';
import api from '@/lib/api';

interface CreatorItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  followed: boolean;
}

const INITIAL_CREATORS: CreatorItem[] = [];

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
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorItem[]>(INITIAL_CREATORS);
  const [trendingTopics, setTrendingTopics] = useState<TopicItem[]>(INITIAL_TRENDING_TOPICS);
  const [liveExperiences, setLiveExperiences] = useState<TopicItem[]>(INITIAL_LIVE_EXPERIENCES);
  const [messagesOpen, setMessagesOpen] = useState(false);

  useEffect(() => {
    api.get('/follows/following')
      .then((res) => {
        const following = res.data?.following || [];
        if (following.length > 0) {
          setCreators(
            following.map((f: any) => ({
              id: f.id,
              name: f.name,
              role: f.roleLabel || f.role || 'Creator',
              avatar: f.avatar || '',
              followed: true,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

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
    <aside className="w-full lg:w-[300px] xl:w-[340px] flex flex-col gap-6 shrink-0 relative lg:sticky lg:top-[92px] lg:self-start lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto no-scrollbar font-quicksand pb-6">
      {/* ─── 1. Try Premium for Free Card ─── */}
      <AudiencePremiumCard />

      {/* ─── 2. Conditional Body: Bookmarks (CHATS) vs Trending Filters vs Feed Creators ─── */}
      {view === 'bookmarks' ? (
        <AudienceChatsCard />
      ) : view === 'trending' ? (
        /* ─── Trending Topics & Live Experience ─── */
        <div className="w-full min-h-[505px] bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.08),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/70 flex flex-col gap-8">
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
                    <span className="font-quicksand text-[13px] text-[#6C757D] font-normal">
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
                    <span className="font-quicksand text-[13px] text-[#6C757D] font-normal">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Creators You May Like Card */}
          <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col">
            <h4 className="text-[16px] font-semibold text-[#212121] mb-2">
              Creators you may like
            </h4>

            {creators.length === 0 ? (
              <div className="py-7 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-amber-50/80 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37] mb-3 shadow-2xs">
                  <Users size={22} strokeWidth={1.8} />
                </div>
                <h5 className="text-[14px] font-semibold text-[#181818]">
                  No suggested creators yet
                </h5>
                <p className="text-[12px] text-gray-500 mt-1 max-w-[210px] leading-relaxed">
                  Community creators and podcast hosts will appear here as they share audio experiences.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 mt-2">
                  {creators.map((creator) => (
                    <div key={creator.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {creator.avatar ? (
                          <img 
                            src={creator.avatar} 
                            alt={creator.name} 
                            className="w-[38px] h-[38px] rounded-full object-cover shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-[38px] h-[38px] rounded-full bg-[#FAF5E6] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[#D4AF37] text-xs shrink-0">
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                        )}
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
                    onClick={() => router.push('/audience?view=trending')}
                    className="text-[12px] font-semibold text-[#15411F] hover:underline transition-all cursor-pointer"
                  >
                    See All
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Memberships Card */}
          <div className="w-full bg-[#FCFDFD] rounded-[16px] p-5 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col gap-3">
            <h5 className="text-[14px] font-semibold text-[#181818]">
              Creator Memberships
            </h5>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              Support creators, access backstage audio sessions, and participate in exclusive live community lounges.
            </p>
            <button
              type="button"
              onClick={() => router.push('/audience?view=memberships')}
              className="flex items-center gap-2 pt-1 text-[13px] font-semibold text-[#8B7322] hover:text-[#5c4c15] transition-colors cursor-pointer w-fit"
            >
              <Plus size={15} strokeWidth={2.2} />
              <span>Explore memberships</span>
            </button>
          </div>
        </>
      )}

      {/* ─── 3. Floating Bottom Messages Drawer ─── */}
      <div className="w-full bg-white rounded-t-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] border border-b-0 border-gray-100 flex flex-col overflow-hidden sticky bottom-0 z-20">
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

          {/* Right: Chevron */}
          <div className="flex items-center gap-3">
            {messagesOpen ? (
              <ChevronDown size={20} strokeWidth={1.8} className="text-[#666666]" />
            ) : (
              <ChevronUp size={20} strokeWidth={1.8} className="text-[#666666]" />
            )}
          </div>
        </button>

        {/* Collapsible Messages Popover */}
        {messagesOpen && (
          <div className="p-5 border-t border-gray-100 bg-white flex flex-col items-center justify-center text-center gap-1.5">
            <MessageSquare size={24} className="text-gray-300 mb-1" />
            <p className="text-xs font-semibold text-gray-800">No active messages</p>
            <p className="text-[11px] text-gray-400 max-w-[200px]">Conversations with creators and listeners will appear here.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
