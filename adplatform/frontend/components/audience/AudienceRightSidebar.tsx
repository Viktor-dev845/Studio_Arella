'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search,
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  MoreHorizontal,
  Radio,
  X,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

export function XVerifiedBadge({ size = 17, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      viewBox="0 0 22 22" 
      width={size} 
      height={size} 
      aria-label="Verified account" 
      className={`inline-block shrink-0 ${className}`}
    >
      <g>
        <path 
          d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.136 5.485-5.485 1.302 1.293-6.787 6.786z" 
          fill="#1D9BF0" 
        />
      </g>
    </svg>
  );
}

interface CreatorRecommendation {
  id: string;
  name: string;
  handle: string;
  role?: string;
  avatar: string;
  followed?: boolean;
}

interface TrendingTrendItem {
  id: string;
  category: string;
  title: string;
  postCount: string;
  query?: string;
}

interface FeaturedLiveBroadcast {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  verified: boolean;
  status: string;
  participantsCount: number;
  category: string;
}

interface AudienceRightSidebarProps {
  view?: 'feed' | 'trending' | 'bookmarks' | 'profile';
  onFilterChange?: (topics: string[], liveExp: string[]) => void;
  selectedTopics?: string[];
  selectedLiveExp?: string[];
  topicCounts?: Record<string, number>;
  onClearFilters?: () => void;
}

export default function AudienceRightSidebar({
  view = 'feed',
  onFilterChange,
  selectedTopics = [],
  selectedLiveExp = [],
  topicCounts,
  onClearFilters,
}: AudienceRightSidebarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedCreators, setRecommendedCreators] = useState<CreatorRecommendation[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [togglingFollowId, setTogglingFollowId] = useState<string | null>(null);

  const [trends, setTrends] = useState<TrendingTrendItem[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [showAllCreators, setShowAllCreators] = useState(false);

  const [liveBroadcast, setLiveBroadcast] = useState<FeaturedLiveBroadcast | null>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [showTopicFilters, setShowTopicFilters] = useState(false);

const DEFAULT_RECOMMENDED_CREATORS: CreatorRecommendation[] = [
  {
    id: '0e0d0c45-7c57-40eb-8910-f3d8cc573b99',
    name: 'Audrey Alexander',
    handle: 'audreyalexander',
    avatar: '/audience/audrey-alexander.png',
    role: 'Diplomacy & Political Analyst',
    followed: false,
  },
  {
    id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
    name: 'Darlene Black',
    handle: 'darleneblack',
    avatar: '/audience/darlene-black.png',
    role: 'Relationship Host & Storyteller',
    followed: false,
  },
  {
    id: 'd167c089-35e2-4f25-a627-c7d55f7c713f',
    name: 'Adam Udochi',
    handle: 'adamudochi',
    avatar: '/audience/adam-udochi.png',
    role: 'UI/UX Designer & Producer',
    followed: false,
  },
  {
    id: 'e3101424-a3ac-4a9d-9ea9-3f0d957edf78',
    name: 'Nermmen Saif',
    handle: 'nermmensaif',
    avatar: '/audience/nermmen-saif.png',
    role: 'Design & Media Creator',
    followed: false,
  },
  {
    id: '34debe18-75a3-49d3-9404-d82df7b5cd62',
    name: 'Theresa Steward',
    handle: 'theresasteward',
    avatar: '/audience/theresa-steward.png',
    role: 'Executive Producer',
    followed: false,
  },
  {
    id: 'f4f4d1be-9134-48e4-9789-fc92fc4cb8f4',
    name: 'Kyle Fisher',
    handle: 'kylefisher',
    avatar: '/audience/kyle-fisher.png',
    role: 'Family Counselor',
    followed: false,
  },
];

  // 1. Fetch real creator recommendations from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCreators(true);

    const currentId = user?.id || '';
    fetch(`/api/creators/suggestions?currentUserId=${currentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data.creators) && data.creators.length > 0) {
          setRecommendedCreators(data.creators);
        } else {
          setRecommendedCreators(DEFAULT_RECOMMENDED_CREATORS.filter(c => c.id !== currentId));
        }
      })
      .catch((err) => {
        console.warn('Could not load recommended creators:', err);
        if (isMounted) {
          setRecommendedCreators(DEFAULT_RECOMMENDED_CREATORS.filter(c => c.id !== currentId));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCreators(false);
      });

    return () => { isMounted = false; };
  }, [user?.id]);

  // 2. Fetch real trending topics & hashtags from PostgreSQL backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTrends(true);

    fetch('/api/content/trending')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data.trends) && data.trends.length > 0) {
          setTrends(data.trends);
        }
      })
      .catch((err) => {
        console.warn('Could not load trending topics:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTrends(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 3. Fetch real live broadcast / event from backend
  useEffect(() => {
    let isMounted = true;
    fetch('/api/live/featured')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.live) {
          setLiveBroadcast(data.live);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // 4. Toggle Follow connected directly to PostgreSQL backend
  const handleToggleFollow = async (creatorId: string, creatorName: string) => {
    if (!user) {
      toast('Please sign in to follow creators', 'error');
      router.push('/auth/login');
      return;
    }

    setTogglingFollowId(creatorId);
    const creator = recommendedCreators.find(c => c.id === creatorId);
    const nextState = !creator?.followed;

    // Optimistic UI update
    setRecommendedCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, followed: nextState } : c))
    );

    try {
      const res = await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id }),
      });

      if (!res.ok) {
        throw new Error('Follow toggle failed');
      }

      const data = await res.json();
      toast(data.isFollowing ? `Following ${creatorName}` : `Unfollowed ${creatorName}`, 'info');
      
      // Dispatch follow update event for real-time counts across the app
      window.dispatchEvent(new CustomEvent('follow-changed', { detail: { creatorId, isFollowing: data.isFollowing } }));
    } catch (err) {
      console.error('Follow error:', err);
      // Revert optimistic update
      setRecommendedCreators((prev) =>
        prev.map((c) => (c.id === creatorId ? { ...c, followed: !nextState } : c))
      );
      toast('Could not update follow status. Please try again.', 'error');
    } finally {
      setTogglingFollowId(null);
    }
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/audience?view=trending&q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Clicking a trend filters real posts in audience view
  const handleTrendClick = (trendQuery?: string, trendTitle?: string) => {
    const q = (trendQuery || trendTitle || '').replace('#', '').trim();
    router.push(`/audience?view=trending&q=${encodeURIComponent(q)}`);
  };

  return (
    <aside className="w-full lg:w-[320px] xl:w-[350px] flex flex-col gap-4 shrink-0 relative lg:sticky lg:top-[88px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto no-scrollbar font-quicksand pb-6">
      
      {/* ─── 1. Capsule Search Bar (Connected to Live Search) ─── */}
      <form onSubmit={handleSearchSubmit} className="w-full relative">
        <div className="w-full h-[44px] bg-[#EFF3F4] rounded-full px-4 flex items-center gap-3 border border-transparent focus-within:border-[#1D9BF0] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#1D9BF0] transition-all group">
          <Search size={18} className="text-gray-500 group-focus-within:text-[#1D9BF0] transition-colors shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder:text-gray-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-5 h-5 rounded-full bg-[#0F1419] text-white flex items-center justify-center hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </form>

      {/* ─── 2. "Live on X" (Connected to PostgreSQL live broadcast) ─── */}
      {liveBroadcast && (
        <div 
          onClick={() => router.push(liveBroadcast.id.startsWith('live-default') ? '/audience?view=live' : `/audience?view=live-detail&id=${liveBroadcast.id}`)}
          className="w-full bg-[#F7F9F9] rounded-2xl p-4 border border-gray-100 flex flex-col gap-2 hover:bg-[#F2F5F5] transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[17px] font-extrabold text-gray-950 leading-tight group-hover:text-black">
              Live on X
            </h4>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold tracking-wider uppercase animate-pulse">
              <Radio size={11} className="text-rose-600" />
              LIVE
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-sky-600 shrink-0 flex items-center justify-center text-white text-[11px] font-bold border border-white shadow-2xs">
                <img 
                  src={liveBroadcast.hostAvatar} 
                  alt={liveBroadcast.hostName} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex items-center gap-1 text-[13px] text-gray-900 font-bold truncate">
                <span>{liveBroadcast.hostName}</span>
                {liveBroadcast.verified && <XVerifiedBadge size={14} />}
                <span className="text-gray-500 font-normal text-[12px] ml-0.5">is hosting</span>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full border border-[#E0245E] bg-[#E0245E]/5 text-[#E0245E] text-[11px] font-extrabold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0245E] animate-ping" />
              <span>+{liveBroadcast.participantsCount >= 1000 ? `${(liveBroadcast.participantsCount / 1000).toFixed(1)}K` : liveBroadcast.participantsCount}</span>
            </div>
          </div>

          <p className="text-[14px] font-bold text-gray-950 leading-snug group-hover:text-[#1D9BF0] transition-colors line-clamp-1 mt-0.5">
            {liveBroadcast.title}
          </p>
        </div>
      )}

      {/* ─── 3. "You might like" Card (Real Creators from PostgreSQL) ─── */}
      <div className="w-full bg-[#F7F9F9] rounded-2xl p-4 border border-gray-100 flex flex-col gap-3.5 shadow-2xs">
        <h4 className="text-[18px] sm:text-[19px] font-extrabold text-gray-950 leading-tight">
          You might like
        </h4>

        {isLoadingCreators ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <Loader2 className="animate-spin text-[#1D9BF0]" size={22} />
            <span className="text-xs text-gray-400">Loading recommendations...</span>
          </div>
        ) : recommendedCreators.length === 0 ? (
          <p className="text-[13px] text-gray-500 py-2 font-normal">No suggestions available right now.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {(showAllCreators ? recommendedCreators : recommendedCreators.slice(0, 3)).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2.5">
                <div 
                  onClick={() => {
                    const cid = c.id || encodeURIComponent(c.name);
                    router.push(`/audience?view=creator-profile&creatorId=${cid}`);
                  }}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                  title={`View ${c.name}'s profile`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-black/5">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold text-gray-950 truncate group-hover:underline">
                        {c.name}
                      </span>
                      <XVerifiedBadge size={14} />
                    </div>
                    <span className="text-[12px] text-gray-500 font-normal truncate -mt-0.5">
                      @{c.handle}
                    </span>
                    {c.role && (
                      <span className="text-[11px] text-gray-400 font-light truncate -mt-0.5">
                        {c.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Follow Button connected to PostgreSQL backend */}
                <button
                  type="button"
                  onClick={() => handleToggleFollow(c.id, c.name)}
                  disabled={togglingFollowId === c.id}
                  className={`h-8 px-4 rounded-full text-[12px] font-bold tracking-wide transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                    c.followed
                      ? 'border border-gray-300 bg-white text-[#0F1419] hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                      : 'bg-[#0F1419] hover:bg-[#272C30] text-white shadow-2xs'
                  }`}
                >
                  {togglingFollowId === c.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : c.followed ? (
                    'Following'
                  ) : (
                    'Follow'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {recommendedCreators.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllCreators(!showAllCreators)}
            className="text-[13.5px] text-[#1D9BF0] hover:underline text-left font-normal pt-1 cursor-pointer"
          >
            {showAllCreators ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* ─── 4. "What's trending" Card (Real Tags & Topics from PostgreSQL) ─── */}
      <div className="w-full bg-[#F7F9F9] rounded-2xl p-4 border border-gray-100 flex flex-col gap-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="text-[18px] sm:text-[19px] font-extrabold text-gray-950 leading-tight">
            What&apos;s trending
          </h4>
          <button
            type="button"
            onClick={() => setShowTopicFilters(!showTopicFilters)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            title="Filter topics"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {isLoadingTrends ? (
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <Loader2 className="animate-spin text-[#1D9BF0]" size={22} />
            <span className="text-xs text-gray-400">Loading trends...</span>
          </div>
        ) : trends.length === 0 ? (
          <p className="text-[13px] text-gray-500 py-2 font-normal">No trending topics yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100/80">
            {(showAllTrends ? trends : trends.slice(0, 4)).map((t) => (
              <div 
                key={t.id} 
                onClick={() => handleTrendClick(t.query, t.title)}
                className="py-2.5 flex items-start justify-between gap-2 cursor-pointer group first:pt-1 last:pb-1"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] text-gray-500 font-normal">
                    {t.category}
                  </span>
                  <span className="text-[14.5px] font-bold text-gray-950 leading-tight mt-0.5 group-hover:text-[#1D9BF0] transition-colors truncate">
                    {t.title}
                  </span>
                  <span className="text-[11.5px] text-gray-400 font-normal mt-0.5">
                    {t.postCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 flex items-center justify-center transition-colors shrink-0 -mr-1"
                  title="Options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {trends.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllTrends(!showAllTrends)}
            className="text-[13.5px] text-[#1D9BF0] hover:underline text-left font-normal pt-1 cursor-pointer"
          >
            {showAllTrends ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* ─── 5. Floating Bottom Messages Drawer ─── */}
      <div className="w-full bg-white rounded-2xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col overflow-hidden sticky bottom-0 z-20">
        <button
          type="button"
          onClick={() => setMessagesOpen(!messagesOpen)}
          className="w-full h-[52px] px-4 flex items-center justify-between hover:bg-gray-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare size={19} className="text-gray-700" />
            <span className="text-[15px] font-bold text-gray-900">
              Messages
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            {messagesOpen ? (
              <ChevronDown size={19} />
            ) : (
              <ChevronUp size={19} />
            )}
          </div>
        </button>

        {messagesOpen && (
          <div className="p-4 border-t border-gray-100 bg-white flex flex-col items-center justify-center text-center gap-2 animate-in fade-in duration-100">
            <MessageSquare size={22} className="text-[#1D9BF0] mb-0.5" />
            <p className="text-xs font-semibold text-gray-800">Direct Conversations</p>
            <p className="text-[11px] text-gray-400 max-w-[200px]">Send direct messages to creators and listeners from their profile.</p>
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="mt-1 px-4 py-1.5 rounded-full bg-[#0F1419] hover:bg-[#272C30] text-white text-[12px] font-bold transition-all cursor-pointer"
            >
              Open Chat
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}
