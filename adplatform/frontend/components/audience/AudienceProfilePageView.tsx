'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Upload, 
  Edit3, 
  MoreVertical, 
  Navigation, 
  Check, 
  X, 
  Loader2, 
  Plus, 
  Play, 
  Calendar, 
  Users,
  ShieldCheck,
  LogOut,
  UserX,
  Share2,
  Copy,
  Flag,
  ShieldAlert,
  Heart,
  Sparkles,
  ArrowLeft,
  Mail,
  MapPin,
  Pin,
  Bell,
  Search,
  MessageSquare
} from 'lucide-react';
import { XVerifiedBadge } from './AudienceRightSidebar';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import AudienceMembershipModal from './AudienceMembershipModal';
import AudienceLiveEventJoinModal from './AudienceLiveEventJoinModal';
import AudienceCreateEventModal from './AudienceCreateEventModal';
import AudienceSetupAccountModal from './AudienceSetupAccountModal';
import AudienceEventCreatedSuccessModal from './AudienceEventCreatedSuccessModal';
import AudienceGetVerifiedView from './AudienceGetVerifiedView';
import AudienceDeactivateAccountModal from './AudienceDeactivateAccountModal';
import AudienceTipModal from './AudienceTipModal';
import AudiencePostCard, { PostData } from './AudiencePostCard';

interface ShowItem {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
}

interface EventClubItem {
  id: string;
  title: string;
  count: number;
  badgeCount?: number;
  avatars: string[];
}

export interface FollowerProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isFollowing?: boolean;
}

export const DEFAULT_DESIGNER_FOLLOWERS: FollowerProfile[] = [];
export const DEFAULT_DESIGNER_FOLLOWING: FollowerProfile[] = [];

const DEFAULT_PODCAST_ITEMS: ShowItem[] = [];

const DEFAULT_FAN_EVENTS: EventClubItem[] = [
  {
    id: 'e1',
    title: 'User experience (UX)',
    count: 6,
    badgeCount: 1,
    avatars: [],
  },
  {
    id: 'e2',
    title: 'User interface (UI)',
    count: 7,
    badgeCount: 2,
    avatars: [],
  },
  {
    id: 'e3',
    title: 'Brand identity',
    count: 5,
    avatars: [],
  },
];

interface AudienceProfilePageViewProps {
  creatorId?: string;
  onEditProfileClick?: () => void;
  isVisitor?: boolean;
  initialTab?: 'posts' | 'replies' | 'reposts' | 'media' | 'profile' | 'followers' | 'following';
}

export default function AudienceProfilePageView({
  creatorId,
  onEditProfileClick,
  isVisitor,
  initialTab,
}: AudienceProfilePageViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const queryMode = searchParams.get('mode');
  const queryView = searchParams.get('view');
  const queryCreatorId = searchParams.get('creatorId');
  const { toast } = useToast();
  const { user, logout } = useAuthStore();

  const [dismissVerifiedBanner, setDismissVerifiedBanner] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  const targetCreatorId = creatorId || queryCreatorId || '';
  const isViewingOtherCreator = Boolean(targetCreatorId && targetCreatorId !== user?.id);

  const isVisitorInitial = isVisitor !== undefined 
    ? isVisitor 
    : (isViewingOtherCreator || queryMode === 'visitor' || queryView === 'creator-profile' || queryView === 'creator' || queryView === 'visitor-profile');

  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(isVisitorInitial);
  const [prevVisitorProp, setPrevVisitorProp] = useState(isVisitor);
  if (isVisitor !== prevVisitorProp) {
    setPrevVisitorProp(isVisitor);
    if (isVisitor !== undefined) {
      setIsVisitorMode(isVisitor);
    }
  }

  const querySubscribed = searchParams.get('subscribed');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (querySubscribed === 'true') return true;
    if (querySubscribed === 'false') return false;
    // In visitor mode, default to false so visitor sees the subscription CTA & subscription prompt
    if (isVisitorInitial) return false;
    return true;
  });
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast('Creator profile link copied to clipboard!', 'success');
    }
  };

  const handleReportCreator = () => {
    setShowMoreMenu(false);
    toast('Creator report submitted to Trust & Safety team. Thank you.', 'info');
  };

  const handleBlockCreator = () => {
    setShowMoreMenu(false);
    toast('Creator has been blocked.', 'info');
  };

  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'reposts' | 'media' | 'profile' | 'followers' | 'following'>(() => {
    if (queryTab === 'replies') return 'replies';
    if (queryTab === 'reposts') return 'reposts';
    if (queryTab === 'media') return 'media';
    if (queryTab === 'followers') return 'followers';
    if (queryTab === 'following') return 'following';
    if (queryTab === 'profile') return 'profile';
    if (initialTab) return initialTab;
    return 'posts';
  });

  useEffect(() => {
    if (queryTab === 'posts') setActiveTab('posts');
    else if (queryTab === 'replies') setActiveTab('replies');
    else if (queryTab === 'reposts') setActiveTab('reposts');
    else if (queryTab === 'media') setActiveTab('media');
    else if (queryTab === 'followers') setActiveTab('followers');
    else if (queryTab === 'following') setActiveTab('following');
    else if (queryTab === 'profile') setActiveTab('profile');
  }, [queryTab]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(() => {
    const queryModal = searchParams.get('modal');
    return queryModal === 'get-verified' || queryModal === 'verify' || queryModal === 'pricing';
  });
  const [showCreateEventModal, setShowCreateEventModal] = useState<boolean>(() => {
    const queryModal = searchParams.get('modal');
    return queryModal === 'create-event' || queryModal === 'create';
  });
  const [showSetupAccountModal, setShowSetupAccountModal] = useState<boolean>(() => {
    const queryModal = searchParams.get('modal');
    return queryModal === 'setup-account' || queryModal === 'bank-account';
  });
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(() => {
    const queryModal = searchParams.get('modal');
    return queryModal === 'event-created' || queryModal === 'event-success' || queryModal === 'created';
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState<boolean>(() => {
    const queryModal = searchParams.get('modal');
    return queryModal === 'deactivate' || queryModal === 'deactivate-account' || queryModal === 'account-deactivated' || queryModal === 'deactivated';
  });
  const [pendingCreatedEvent, setPendingCreatedEvent] = useState<any>(null);

  useEffect(() => {
    const queryModal = searchParams.get('modal');
    if (queryModal === 'get-verified' || queryModal === 'verify' || queryModal === 'pricing') {
      setShowVerifyModal(true);
    } else if (queryModal === 'create-event' || queryModal === 'create') {
      setShowCreateEventModal(true);
    } else if (queryModal === 'setup-account' || queryModal === 'bank-account') {
      setShowSetupAccountModal(true);
    } else if (queryModal === 'event-created' || queryModal === 'event-success' || queryModal === 'created') {
      setShowSuccessModal(true);
    } else if (queryModal === 'deactivate' || queryModal === 'deactivate-account' || queryModal === 'account-deactivated' || queryModal === 'deactivated') {
      setShowDeactivateModal(true);
    }
  }, [searchParams]);

  const [selectedEventForModal, setSelectedEventForModal] = useState<EventClubItem | null>(() => {
    const queryModal = searchParams.get('modal');
    const queryEvent = searchParams.get('event');
    if (queryModal === 'live-event' || queryModal === 'filter-popup' || queryEvent) {
      return DEFAULT_FAN_EVENTS[0];
    }
    return null;
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  // Edit form state with dynamic user defaults
  const [name, setName] = useState(user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'Creator');
  const [handle, setHandle] = useState(user?.handle || (user?.name ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'creator'));
  const [role, setRole] = useState(user?.creator_niche || (user?.role === 'creator' ? 'Creator' : 'Studio Insider'));
  const [bio, setBio] = useState(user?.bio || 'Audio creator & storyteller on Studio Arella.');
  const [location, setLocation] = useState(user?.location || 'Lagos, Nigeria');
  const [joinedDate, setJoinedDate] = useState('October 2026');
  const [about, setAbout] = useState(
    user?.about || 'Welcome to my creator space on Studio Arella. Follow along for podcasts, audio recordings, and screen campaigns.'
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [bannerUrl, setBannerUrl] = useState(user?.banner || '');

  // Creator posts feed & follow state
  const [creatorPosts, setCreatorPosts] = useState<PostData[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isFollowingCreator, setIsFollowingCreator] = useState<boolean>(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState<boolean>(false);

  // Live Followers, Following, Social Proof, Replies, and Reposts
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [socialProof, setSocialProof] = useState<{ users: any[]; count: number; isMutual: boolean }>({
    users: [],
    count: 0,
    isMutual: false,
  });
  const [creatorReplies, setCreatorReplies] = useState<any[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);
  const [creatorReposts, setCreatorReposts] = useState<PostData[]>([]);
  const [isLoadingReposts, setIsLoadingReposts] = useState<boolean>(false);
  const [podcasts, setPodcasts] = useState<ShowItem[]>(DEFAULT_PODCAST_ITEMS);
  const [fanEvents, setFanEvents] = useState<EventClubItem[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch creator profile or own profile data directly from PostgreSQL API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProfile(true);

    const profileId = targetCreatorId || user?.id;

    if (profileId) {
      // 1. Fetch Creator Profile via dedicated direct Next.js API route
      fetch(`/api/creators/${profileId}?currentUserId=${user?.id || ''}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load creator');
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          const c = data.creator || {};
          setName(c.name || 'Creator');
          setHandle(c.handle || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'creator'));
          setRole(c.creator_niche || (c.role === 'creator' ? 'Podcasts' : 'Creator'));

          const creatorFallbackBios: Record<string, string> = {
            'Darlene Black': 'Podcast Host & Storyteller. Passionate about modern marriage, relationship wisdom, emotional intimacy, and family vitality. Host of Modern Marriage & Relationship Wisdom.',
            'Audrey Alexander': 'Diplomacy & Political Analyst. Exploring African economic diplomacy, foreign policy shifts, and strategic multilateral trade alliances.',
            'Adam Udochi': 'UI/UX Designer & Producer. High-conviction angel investing and venture syndicates creating African financial breakthroughs.',
            'Nermmen Saif': 'Design & Media Creator. Proven investment frameworks, digital cashflow models, and modern wealth-building playbooks.',
            'Theresa Steward': 'Executive Producer & Talent Recruiter. Scaling programmatic DOOH billboard networks and emerging studio brands.',
            'Kyle Fisher': 'Family Counselor & Educator. Navigating generational conversations, household resilience, and parenting legacies.',
            'Brandon Wilson': 'Cultural Historian & Music Curator. Exploring highlife traditions, folklore, and the authentic rhythms of Umuahia.'
          };

          const rawBio = c.bio && c.bio.trim() !== 'Audio creator & broadcaster' && c.bio.trim() !== 'Creator' ? c.bio : '';
          const resolvedBio = rawBio || creatorFallbackBios[c.name] || 'Creator & broadcaster on Studio Arella. Follow along for podcasts, audio recordings, and screen campaigns.';
          setBio(resolvedBio);
          setAbout(resolvedBio);

          setLocation(c.location || 'Lagos, Nigeria');
          setAvatarUrl(c.avatar || '');
          setBannerUrl(c.banner_url || c.banner || '');
          setFollowersCount(data.stats?.followersCount ?? 0);
          setFollowingCount(data.stats?.followingCount ?? 0);
          setIsFollowingCreator(Boolean(data.isFollowing));
          setCreatorPosts(data.posts || []);
          if (data.socialProof) {
            setSocialProof(data.socialProof);
          }
          if (c.created_at) {
            setJoinedDate(new Date(c.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
          }
        })
        .catch((err) => {
          console.warn('Could not fetch creator profile:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingProfile(false);
        });

      // 2. Fetch live events/shows from backend
      fetch(`/api/creators/${profileId}/events`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && Array.isArray(data.events)) {
            setFanEvents(data.events);
          }
        })
        .catch(() => {});
    } else {
      setIsLoadingProfile(false);
    }

    return () => {
      isMounted = false;
    };
  }, [targetCreatorId, isViewingOtherCreator, user]);

  // Tab change dynamic backend loader
  useEffect(() => {
    const profileId = targetCreatorId || user?.id;
    if (!profileId) return;

    if (activeTab === 'replies') {
      setIsLoadingReplies(true);
      fetch(`/api/creators/${profileId}/replies`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.replies)) {
            setCreatorReplies(data.replies);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingReplies(false));
    } else if (activeTab === 'reposts') {
      setIsLoadingReposts(true);
      fetch(`/api/creators/${profileId}/reposts`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.reposts)) {
            setCreatorReposts(data.reposts);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingReposts(false));
    } else if (activeTab === 'followers') {
      fetch(`/api/creators/${profileId}/followers?viewerId=${user?.id || ''}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.followers)) {
            setFollowers(data.followers);
          }
        })
        .catch(() => {});
    } else if (activeTab === 'following') {
      fetch(`/api/creators/${profileId}/following?viewerId=${user?.id || ''}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.following)) {
            setFollowing(data.following);
          }
        })
        .catch(() => {});
    }
  }, [activeTab, targetCreatorId, user?.id]);

  // Close more menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab: 'posts' | 'replies' | 'reposts' | 'media' | 'profile' | 'followers' | 'following') => {
    setActiveTab(tab);
    const viewParam = isViewingOtherCreator ? 'creator-profile' : 'profile';
    const creatorParam = isViewingOtherCreator ? `&creatorId=${targetCreatorId}` : '';
    router.replace(`/audience?view=${viewParam}${creatorParam}&tab=${tab}`, { scroll: false });
  };

  const handleToggleFollowTargetCreator = async () => {
    if (!user) {
      toast('Please sign in to follow creators', 'error');
      router.push('/auth/login');
      return;
    }
    if (isTogglingFollow) return;
    setIsTogglingFollow(true);

    const nextFollowState = !isFollowingCreator;
    setIsFollowingCreator(nextFollowState);
    setFollowersCount((prev) => (nextFollowState ? prev + 1 : Math.max(0, prev - 1)));
    toast(
      nextFollowState ? `You are now following ${name}` : `Unfollowed ${name}`,
      nextFollowState ? 'success' : 'info'
    );

    try {
      const res = await fetch(`/api/creators/${targetCreatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowingCreator(data.isFollowing);
        setFollowersCount(data.followersCount);
      }
    } catch (err) {
      console.warn('Follow request error:', err);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const [unfollowedMap, setUnfollowedMap] = useState<Record<string, boolean>>({});
  const [followerStatusMap, setFollowerStatusMap] = useState<Record<string, boolean>>({});

  const handleToggleFollowerItem = async (id: string, targetName: string) => {
    if (!user) {
      toast('Please sign in to follow users', 'error');
      router.push('/auth/login');
      return;
    }
    const isCurrentlyFollowing = Boolean(followerStatusMap[id]);
    const next = !isCurrentlyFollowing;
    setFollowerStatusMap((prev) => ({ ...prev, [id]: next }));
    toast(next ? `Following ${targetName}` : `Unfollowed ${targetName}`, next ? 'success' : 'info');

    try {
      await fetch(`/api/creators/${id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id }),
      });
    } catch (err) {
      console.warn('API follow error:', err);
    }
  };

  const handleToggleFollow = async (creatorId: string, creatorName: string) => {
    if (!user) {
      toast('Please sign in to follow creators', 'error');
      router.push('/auth/login');
      return;
    }
    const isCurrentlyUnfollowed = Boolean(unfollowedMap[creatorId]);
    if (isCurrentlyUnfollowed) {
      setUnfollowedMap((prev) => ({ ...prev, [creatorId]: false }));
      setFollowingCount((prev) => prev + 1);
      toast(`Following ${creatorName}`, 'success');
    } else {
      setUnfollowedMap((prev) => ({ ...prev, [creatorId]: true }));
      setFollowingCount((prev) => Math.max(0, prev - 1));
      toast(`Unfollowed ${creatorName}`, 'info');
    }

    try {
      await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id }),
      });
    } catch (err) {
      console.warn('API follow error:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.put('/auth/profile', {
        name,
        bio,
        location,
        about,
        avatar: avatarUrl,
      });
      useAuthStore.getState().checkAuth();
      toast('Profile updated successfully', 'success');
      setShowEditModal(false);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast('Verification request submitted! Our team will review your account.', 'success');
      setShowVerifyModal(false);
    } catch {
      toast('Could not submit verification request.', 'error');
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const handleUpgradePro = async () => {
    setIsUpgradingPro(true);
    try {
      await api.post('/creator/pro/upgrade', { auto_renew: true });
      useAuthStore.getState().checkAuth();
      toast('🎉 Congratulations! You are now a Creator Pro with full monetization & 85% revenue earnings.', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Could not upgrade to Creator Pro.', 'error');
    } finally {
      setIsUpgradingPro(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast('Signed out successfully', 'info');
      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    }
  };

  return (
    <section className="flex-1 w-full min-w-0 flex flex-col gap-5 font-quicksand">
      {/* ─── 1. Profile Hero Card (X / Twitter Structure) ─── */}
      <div className="w-full bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
        {/* Sticky Top Bar matching X / Twitter */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 flex items-center justify-between px-4 sm:px-6 py-2 border-b border-gray-100">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/audience');
                }
              }}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer text-gray-800 shrink-0"
              title="Back"
            >
              <ArrowLeft size={19} />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[17px] sm:text-[18px] font-bold text-gray-950 leading-tight truncate m-0 font-quicksand">
                  {name}
                </h2>
                <XVerifiedBadge size={16} />
              </div>
              <span className="text-[12px] text-gray-500 font-normal leading-tight font-quicksand">
                {creatorPosts.length} {creatorPosts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>

          {/* Right side quick actions (Search + Share) matching X header */}
          <div className="flex items-center gap-1 text-gray-700">
            <button
              type="button"
              onClick={() => router.push('/audience?view=trending')}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer text-gray-700"
              title="Search"
            >
              <Search size={17} />
            </button>
            <button
              type="button"
              onClick={handleShareProfile}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer text-gray-700"
              title="Share profile"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Banner (Full Bleed Hero Header) */}
        <div className="w-full h-[185px] sm:h-[220px] relative bg-neutral-900 overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Profile Banner"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#2B2E48] via-[#1E2033] to-[#12131C] flex items-center justify-center">
              <span className="text-white/20 font-bold tracking-widest text-lg uppercase select-none">Studio Arella</span>
            </div>
          )}

          {/* Banner Tools Overlay (Upload cover for profile owner) */}
          {!isVisitorMode && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              <button
                type="button"
                onClick={() => toast('Click Edit Profile below to change your cover picture.', 'info')}
                className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Change cover"
              >
                <Upload size={13} />
                <span>Change cover</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Info Header Container (X / Twitter style) */}
        <div className="px-5 sm:px-8 pb-5 pt-0 relative flex flex-col gap-3 font-quicksand">
          
          {/* Top Row: Avatar on left overlapping banner, Action Buttons on right */}
          <div className="flex items-end justify-between gap-4 -mt-[65px] sm:-mt-[80px] relative z-10 flex-wrap sm:flex-nowrap">
            {/* Circular Avatar (130px mobile, 150px desktop) */}
            <div className="w-[125px] h-[125px] sm:w-[150px] sm:h-[150px] rounded-full border-[5px] sm:border-[6px] border-white overflow-hidden bg-neutral-100 shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-extrabold flex items-center justify-center text-4xl uppercase select-none">
                  {name ? name.charAt(0) : 'C'}
                </div>
              )}
            </div>

            {/* Action Buttons Aligned on Top-Right (Clean X / Twitter Style) */}
            <div className="flex items-center gap-2 pb-1 self-end relative" ref={menuRef}>
              {/* More (...) Button */}
              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="More options"
              >
                <MoreVertical size={17} />
              </button>

              {/* More Dropdown Menu */}
              {showMoreMenu && (
                <div
                  className="absolute right-0 top-11 w-[220px] bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 select-none font-quicksand"
                >
                  {isVisitorMode ? (
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowTipModal(true);
                        }}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Heart size={16} className="text-[#D4AF37]" />
                        <span>Tip @{handle}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowMembershipModal(true);
                        }}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sparkles size={16} className="text-[#D4AF37]" />
                        <span>Become a Membered Fan</span>
                      </button>
                      <div className="w-full h-[1px] bg-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Share2 size={16} />
                        <span>Share profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShareProfile}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Copy size={16} />
                        <span>Copy link to profile</span>
                      </button>
                      <div className="w-full h-[1px] bg-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={handleReportCreator}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Flag size={16} />
                        <span>Report @{handle}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBlockCreator}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserX size={16} />
                        <span>Block @{handle}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          if (onEditProfileClick) onEditProfileClick();
                          else setShowEditModal(true);
                        }}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowVerifyModal(true);
                        }}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sparkles size={16} className="text-[#1D9BF0]" />
                        <span>Get Verified</span>
                      </button>
                      <Link
                        href="/finances?tab=creator"
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <span>Earnings & Payouts</span>
                      </Link>
                      <div className="w-full h-[1px] bg-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Log out</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowDeactivateModal(true);
                        }}
                        className="px-4 py-2.5 text-left text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert size={16} />
                        <span>Deactivate account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Message (Chat) Circle Button - Matching X */}
              {isViewingOtherCreator && (
                <button
                  type="button"
                  onClick={() => router.push(`/chat?recipient=${encodeURIComponent(name)}`)}
                  className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title={`Message ${name}`}
                >
                  <Mail size={17} />
                </button>
              )}

              {/* Bell / Notification Button - Matching X */}
              {isViewingOtherCreator && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNotified((prev) => !prev);
                    toast(isNotified ? `Notifications turned off for @${handle}` : `You will be notified of new posts from @${handle}`, 'info');
                  }}
                  className={`w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs ${
                    isNotified ? 'text-[#1D9BF0] border-[#1D9BF0]' : 'text-gray-800'
                  }`}
                  title={isNotified ? 'Turn off notifications' : 'Turn on notifications'}
                >
                  <Bell size={17} className={isNotified ? 'fill-[#1D9BF0]' : ''} />
                </button>
              )}

              {/* Follow / Following Black Pill Button - Matching X */}
              {isVisitorMode ? (
                isViewingOtherCreator && (
                  <button
                    type="button"
                    onClick={handleToggleFollowTargetCreator}
                    disabled={isTogglingFollow}
                    className={`h-9 px-6 rounded-full text-[13px] font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center font-quicksand shadow-xs ${
                      isFollowingCreator
                        ? 'border border-gray-300 bg-white text-[#0F1419] group hover:border-red-500 hover:bg-red-50 hover:text-red-600'
                        : 'bg-[#0F1419] hover:bg-[#272C30] text-white'
                    }`}
                  >
                    {isFollowingCreator ? (
                      <>
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:inline">Unfollow</span>
                      </>
                    ) : (
                      <span>Follow</span>
                    )}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onEditProfileClick) onEditProfileClick();
                    else setShowEditModal(true);
                  }}
                  className="h-9 px-5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-[13px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Edit3 size={15} />
                  <span>Edit profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Name, Handle, Bio, Metadata, and Follower Counts (X / Twitter Structure) */}
          <div className="flex flex-col mt-1">
            {/* Name + Verified Blue Badge (Matching X) */}
            <div className="flex items-center gap-1.5">
              <h1 className="text-[21px] sm:text-[23px] font-extrabold text-gray-950 leading-tight m-0 font-quicksand flex items-center gap-1.5">
                <span>{name}</span>
                <XVerifiedBadge size={20} />
              </h1>
            </div>

            {/* Handle */}
            <div className="flex items-center gap-2 text-[14px] text-gray-500 font-normal mt-0.5 font-quicksand">
              <span>@{handle}</span>
            </div>

            {/* ─── X (TWITTER) STYLE BIO PARAGRAPH ─── */}
            <p className="text-[14.5px] text-gray-900 leading-relaxed font-normal mt-3 mb-1 max-w-2xl whitespace-pre-line font-quicksand">
              {bio}
            </p>

            {/* Metadata Row: Location + Joined Date (with Chevron) */}
            <div className="flex items-center gap-4 text-[13.5px] text-gray-500 font-normal mt-2.5 flex-wrap font-quicksand">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-gray-400" />
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <Calendar size={15} className="text-gray-400" />
                <span>Joined {joinedDate} &gt;</span>
              </div>
            </div>

            {/* Followers / Following Stats Row (Clickable) */}
            <div className="flex items-center gap-5 text-[14px] mt-3 pt-0.5 font-quicksand">
              <button
                type="button"
                onClick={() => handleTabChange('following')}
                className="hover:underline cursor-pointer flex items-center gap-1.5 bg-transparent border-none p-0"
              >
                <span className="font-bold text-gray-950">{followingCount.toLocaleString()}</span>
                <span className="text-gray-500">Following</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('followers')}
                className="hover:underline cursor-pointer flex items-center gap-1.5 bg-transparent border-none p-0"
              >
                <span className="font-bold text-gray-950">{followersCount.toLocaleString()}</span>
                <span className="text-gray-500">Followers</span>
              </button>
            </div>

            {/* Social Proof Subtext (Connected to Real Database Users) */}
            {socialProof.users && socialProof.users.length > 0 && (
              <div className="flex items-center gap-2.5 text-[12.5px] text-gray-500 font-normal mt-2.5 font-quicksand">
                <div className="flex items-center -space-x-1.5 shrink-0">
                  {socialProof.users.slice(0, 3).map((u: any, i: number) => (
                    <div key={u.id || i} className="w-5 h-5 rounded-full overflow-hidden border border-white bg-neutral-200 shadow-2xs">
                      <img src={u.avatar || '/audience/adam-udochi.png'} alt={u.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="truncate">
                  {socialProof.isMutual ? 'Followed by ' : 'Followers include '}
                  <span className="font-semibold text-gray-900">{socialProof.users[0]?.name}</span>
                  {socialProof.users.length > 1 && (
                    <>
                      {', '}
                      <span className="font-semibold text-gray-900">{socialProof.users[1]?.name}</span>
                    </>
                  )}
                  {socialProof.count > 2 && (
                    <span>{`, and ${socialProof.count - 2} ${socialProof.isMutual ? 'others you follow' : 'others'}`}</span>
                  )}
                </span>
              </div>
            )}

            {/* ─── INLINE "GET VERIFIED" CALLOUT BANNER (Exact Match from Screenshot) ─── */}
            {!dismissVerifiedBanner && (
              <div className="mt-4 p-4 rounded-2xl bg-[#E8F8F0] border border-[#C6EFDA] flex items-start justify-between gap-3 relative transition-all animate-in fade-in">
                <div className="flex flex-col gap-1 max-w-lg">
                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-950">
                    <span>@{user?.handle || (user?.name ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'Uncle_vick27')}, you aren&apos;t verified yet</span>
                    <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">✓</span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-normal">
                    Get Verified like @{handle} to stand out and get boosted reach.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(true)}
                    className="mt-2 w-fit px-4 py-1.5 rounded-full bg-[#0F1419] hover:bg-[#272C30] text-white text-[13px] font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Get Verified
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissVerifiedBanner(true)}
                  className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500 hover:text-black transition-colors shrink-0"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── 2. Flat Underline Tabs Bar (Exact X / Twitter Style) ─── */}
        <div className="w-full flex items-center border-t border-b border-gray-200 mt-3 font-quicksand bg-white">
          {[
            { key: 'posts', label: 'Posts' },
            { key: 'replies', label: 'Replies' },
            { key: 'reposts', label: 'Reposts' },
            { key: 'media', label: 'Media' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key as any)}
                className="flex-1 py-3.5 px-3 text-center relative hover:bg-gray-50/80 transition-colors cursor-pointer group"
              >
                <span
                  className={`text-[15px] transition-colors ${
                    isActive ? 'font-bold text-gray-950' : 'font-medium text-gray-500 group-hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </span>
                {/* Active Indicator Bar (X Blue) */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. Tab Contents ─── */}
      {activeTab === 'posts' ? (
        <div className="flex flex-col gap-4 w-full">
          {isLoadingProfile ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-gray-100 shadow-2xs">
              <Loader2 className="animate-spin text-[#1D9BF0]" size={28} />
              <p className="text-[13px] text-gray-500 font-medium">Loading {name}&apos;s posts...</p>
            </div>
          ) : creatorPosts.length === 0 ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border border-gray-100 shadow-2xs">
              <Sparkles size={26} className="text-[#1D9BF0] mb-1" />
              <h4 className="text-[16px] font-semibold text-[#181818]">No posts published yet</h4>
              <p className="text-[13px] text-gray-500 max-w-sm">
                {isViewingOtherCreator
                  ? `${name} hasn't published any podcasts, videos, or posts yet.`
                  : 'You have not published any posts yet. Start sharing podcasts and updates with your audience!'}
              </p>
            </div>
          ) : (
            creatorPosts.map((post, idx) => (
              <AudiencePostCard 
                key={post.id} 
                post={post} 
                isPinned={idx === 0 && isViewingOtherCreator}
              />
            ))
          )}
        </div>
      ) : activeTab === 'replies' ? (
        <div className="flex flex-col gap-4 w-full">
          {isLoadingReplies ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-gray-100 shadow-2xs">
              <Loader2 className="animate-spin text-[#1D9BF0]" size={28} />
              <p className="text-[13px] text-gray-500 font-medium">Loading replies from database...</p>
            </div>
          ) : creatorReplies.length === 0 ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border border-gray-100 shadow-2xs">
              <MessageSquare size={26} className="text-gray-400 mb-1" />
              <h4 className="text-[16px] font-semibold text-[#181818]">No replies yet</h4>
              <p className="text-[13px] text-gray-500 max-w-sm">
                When @{handle} participates in discussions or replies to episodes, they will show up here.
              </p>
            </div>
          ) : (
            creatorReplies.map((reply) => (
              <div 
                key={reply.id} 
                className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs flex flex-col gap-3 font-quicksand hover:border-gray-200 transition-colors"
              >
                {/* Replying to Context Bar */}
                {reply.postTitle && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 border-b border-gray-50 pb-2.5">
                    <span>Replying to</span>
                    <span 
                      onClick={() => reply.postId && router.push(`/audience?view=podcast-player&id=${reply.postId}`)}
                      className="font-bold text-[#1D9BF0] hover:underline cursor-pointer truncate max-w-sm"
                    >
                      {reply.postTitle}
                    </span>
                  </div>
                )}
                
                {/* Reply Author & Body */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0 border border-black/5">
                    <img 
                      src={reply.author?.avatar || '/audience/adam-udochi.png'} 
                      alt={reply.author?.name || 'Author'} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[14px] font-bold text-gray-950 truncate">{reply.author?.name}</span>
                      <XVerifiedBadge size={14} />
                      <span className="text-[12px] text-gray-400">
                        · {new Date(reply.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-900 leading-relaxed mt-1 font-normal whitespace-pre-line">
                      {reply.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'reposts' ? (
        <div className="flex flex-col gap-4 w-full">
          {isLoadingReposts ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-gray-100 shadow-2xs">
              <Loader2 className="animate-spin text-[#1D9BF0]" size={28} />
              <p className="text-[13px] text-gray-500 font-medium">Loading reposts from database...</p>
            </div>
          ) : creatorReposts.length === 0 ? (
            <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border border-gray-100 shadow-2xs">
              <Sparkles size={26} className="text-gray-400 mb-1" />
              <h4 className="text-[16px] font-semibold text-[#181818]">No reposts yet</h4>
              <p className="text-[13px] text-gray-500 max-w-sm">
                When @{handle} reposts or quotes content from other creators, they will show up here.
              </p>
            </div>
          ) : (
            creatorReposts.map((post) => (
              <AudiencePostCard key={post.id} post={post} />
            ))
          )}
        </div>
      ) : activeTab === 'media' ? (
        <div className="flex flex-col gap-4 w-full">
          {(() => {
            const mediaPosts = creatorPosts.filter((p) => Boolean(p.mediaUrl));
            return mediaPosts.length === 0 ? (
              <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 border border-gray-100 shadow-2xs">
                <Play size={26} className="text-gray-400 mb-1" />
                <h4 className="text-[16px] font-semibold text-[#181818]">No media yet</h4>
                <p className="text-[13px] text-gray-500 max-w-sm">
                  Photos, podcast audio covers, and video episodes shared by @{handle} will be displayed here.
                </p>
              </div>
            ) : (
              mediaPosts.map((post) => (
                <AudiencePostCard key={post.id} post={post} />
              ))
            );
          })()}
        </div>
      ) : activeTab === 'profile' ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Card A: About (Figma: 850px x 170px, box-shadow) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#181818] leading-[23px] m-0 mb-3">
                About
              </h2>
              <p
                className={`text-[14px] font-normal text-[#181818] leading-[150%] m-0 transition-all ${
                  isAboutExpanded ? '' : 'line-clamp-2'
                }`}
              >
                {isVisitorMode 
                  ? "I'm more experienced in eCommerce web projects and mobile banking apps, but also like to work with creative projects, such as landing pages or unusual corporate websites." 
                  : about}
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsAboutExpanded((prev) => !prev)}
                className="text-[12px] font-medium uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {isAboutExpanded ? 'SEE LESS' : 'SEE MORE'}
              </button>
            </div>
          </div>

          {/* Card B: Podcast you followed (Figma: 850px x 355px, 3 items, Show all (12)) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 p-6 sm:p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[18px] font-semibold text-[#181818] leading-[23px] m-0 font-quicksand">
                Podcast you followed
              </h2>
              <span className="text-[18px] font-normal text-[#747474] font-quicksand">
                {podcasts.length} {podcasts.length === 1 ? 'show' : 'shows'}
              </span>
            </div>

            {/* Podcasts Grid or Empty State */}
            {podcasts.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-[4px] border border-dashed border-gray-200">
                <p className="text-[14px] font-medium text-gray-700 m-0 mb-1">No podcasts followed yet</p>
                <p className="text-[12px] text-gray-400 m-0 mb-4 max-w-xs">Explore podcasts and shows produced across the community.</p>
                <button
                  type="button"
                  onClick={() => router.push('/podcast')}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2b] text-black text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer"
                >
                  Explore Shows
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {(showAllPodcasts ? podcasts : podcasts.slice(0, 3)).map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => {
                      router.push(`/audience?view=podcast-player&title=${encodeURIComponent(pod.title)}`);
                    }}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="w-full aspect-[250/160] rounded-[2px] overflow-hidden bg-neutral-900 relative shadow-sm">
                      {pod.cover ? (
                        <img
                          src={pod.cover}
                          alt={pod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                          <Play size={24} className="text-[#D4AF37]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-black shadow-md">
                          <Play size={18} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-[14px] font-medium text-[#181818] leading-[150%] mt-2.5 mb-0 truncate group-hover:text-[#D9BA54] transition-colors font-quicksand">
                      {pod.title}
                    </h3>
                    <p className="text-[10px] font-light text-[#181818]/70 leading-[150%] m-0 truncate font-quicksand">
                      {pod.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {podcasts.length > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (podcasts.length > 3) {
                      setShowAllPodcasts((prev) => !prev);
                    } else {
                      router.push('/podcast');
                    }
                  }}
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0 font-quicksand"
                >
                  {podcasts.length > 3 ? (showAllPodcasts ? 'SHOW LESS' : `SHOW ALL (${podcasts.length})`) : 'EXPLORE MORE SHOWS'}
                </button>
              </div>
            )}
          </div>

          {/* Card C: Fan club events you joined (Figma: 850px x 220px, 3 items, Show all (17)) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 p-6 sm:p-7 flex flex-col">
            <h2 className="text-[18px] font-medium text-[#181818] leading-[23px] m-0 mb-5 font-quicksand">
              Fan club events you joined
            </h2>

            {/* Fan Club Events Grid or Empty State */}
            {fanEvents.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-[4px] border border-dashed border-gray-200">
                <p className="text-[14px] font-medium text-gray-700 m-0 mb-1">No fan club events joined yet</p>
                <p className="text-[12px] text-gray-400 m-0 mb-4 max-w-xs">Host or join live audio spaces and fan gatherings.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(true)}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f2b] text-black text-[12px] font-semibold rounded-[6px] transition-colors cursor-pointer"
                >
                  Create Live Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {(showAllEvents ? fanEvents : fanEvents.slice(0, 3)).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventForModal(ev)}
                    className="w-full h-[80px] bg-white border border-[#F4F4F4] rounded-[6px] px-4 py-3 flex flex-col justify-between hover:border-gray-300 transition-colors cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-medium text-[#181818] truncate pr-2 group-hover:text-[#D9BA54] transition-colors">
                        {ev.title}
                      </span>
                      <span className="text-[14px] font-semibold text-[#15411F]">
                        {ev.count}
                      </span>
                    </div>

                    {/* Overlapping Avatar Stack */}
                    <div className="flex items-center">
                      {(ev.avatars || []).map((av, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full overflow-hidden border-2 border-white -ml-1.5 first:ml-0 bg-neutral-200 shrink-0"
                        >
                          <img
                            src={av}
                            alt="participant"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      ))}
                      {ev.badgeCount && (
                        <div className="w-6 h-6 rounded-full bg-[#0275B1] text-white text-[10px] font-semibold -ml-1.5 border-2 border-white flex items-center justify-center shrink-0">
                          +{ev.badgeCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fanEvents.length > 3 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  {showAllEvents ? 'SHOW LESS' : `SHOW ALL (${fanEvents.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'followers' ? (
        /* ─── Followers Tab Content: Filter line + 2-Column Cards matching Figma specs ─── */
        <div className="flex flex-col gap-6 w-full lg:w-[850px] font-quicksand">
          {/* Filter Divider: Line (310px) --- YOUR FOLLOWERS --- Line (310px) */}
          <div className="w-full flex items-center justify-between gap-4 py-1">
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
            <span className="text-[12px] font-medium text-[#181818] uppercase tracking-wider whitespace-nowrap px-2 font-quicksand">
              your followers
            </span>
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
          </div>

          {/* Grid of Followers */}
          {followers.length === 0 ? (
            <div className="w-full bg-white rounded-[4px] p-10 text-center flex flex-col items-center justify-center gap-2 border border-gray-100 shadow-2xs">
              <Users size={24} className="text-gray-400 mb-1" />
              <h4 className="text-[15px] font-semibold text-[#181818]">No followers yet</h4>
              <p className="text-[12px] text-gray-500 max-w-sm">When users follow your creator profile, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followers.map((f) => {
                const isFollowing = followerStatusMap[f.id] ?? Boolean(f.isFollowing);
                return (
                  <div
                    key={f.id}
                    className="w-full h-[95px] bg-white rounded-[4px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between px-6 py-4 transition-all"
                  >
                    <div
                      onClick={() => toast(`Viewing ${f.name}'s profile`, 'info')}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                    >
                      {f.avatar ? (
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden shrink-0 bg-neutral-200 border border-black/5">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-extrabold flex items-center justify-center shrink-0 border border-black/5 text-base uppercase">
                          {f.name ? f.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[14px] font-semibold text-[#181818] leading-[18px] truncate group-hover:text-[#D9BA54] transition-colors font-quicksand">
                          {f.name}
                        </span>
                        <span className="text-[10px] font-normal text-[#181818] leading-[15px] truncate mt-0.5 font-quicksand">
                          {f.role || 'Member'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollowerItem(f.id, f.name)}
                      className="w-[91px] h-[32px] bg-[#D4AF37] hover:bg-[#c49f2e] text-black rounded-[4px] text-[12px] font-normal capitalize transition-colors cursor-pointer shrink-0 flex items-center justify-center font-quicksand"
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ─── Following Tab Content: Filter line + 2-Column Cards matching Figma specs ─── */
        <div className="flex flex-col gap-6 w-full lg:w-[850px]">
          {/* Filter Divider: Line --- PEOPLE YOU FOLLOW --- Line */}
          <div className="w-full flex items-center justify-between gap-4 py-1">
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
            <span className="text-[12px] font-medium text-[#181818] uppercase tracking-wider whitespace-nowrap px-2 font-quicksand">
              People you follow
            </span>
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
          </div>

          {/* Grid of Following */}
          {following.length === 0 ? (
            <div className="w-full bg-white rounded-[4px] p-10 text-center flex flex-col items-center justify-center gap-2 border border-gray-100/80 shadow-2xs">
              <Users size={24} className="text-gray-400 mb-1" />
              <h4 className="text-[15px] font-semibold text-[#181818]">Not following anyone yet</h4>
              <p className="text-[12px] text-gray-500 max-w-sm">Follow creators to stay up to date with their podcasts and live streams.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {following.map((f: any) => {
                const isUnfollowed = Boolean(unfollowedMap[f.id]);
                return (
                  <div
                    key={f.id}
                    className="w-full h-[95px] bg-white rounded-[4px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 flex items-center justify-between pl-[24px] sm:pl-[30px] pr-[24px] py-4 transition-all"
                  >
                    <div
                      onClick={() => toast(`Viewing ${f.name}'s profile`, 'info')}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                    >
                      {f.avatar ? (
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden shrink-0 bg-neutral-200 border border-black/5">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#E8C170] to-[#D4AF37] text-black font-extrabold flex items-center justify-center shrink-0 border border-black/5 text-base uppercase">
                          {f.name ? f.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[14px] font-semibold text-[#181818] leading-[18px] truncate group-hover:text-[#D9BA54] transition-colors">
                          {f.name}
                        </span>
                        <span className="text-[10px] font-normal text-[#181818] leading-[15px] truncate mt-0.5">
                          {f.role || 'Creator'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(f.id, f.name)}
                      className={`w-[91px] h-[32px] rounded-[4px] text-[12px] font-normal capitalize transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                        isUnfollowed
                          ? 'bg-white border border-[#D4AF37] text-[#D4AF37] hover:bg-amber-50/50'
                          : 'bg-[#D4AF37] hover:bg-[#c49f2e] text-black'
                      }`}
                    >
                      {isUnfollowed ? 'Follow' : 'Following'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL 1: Edit Profile ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-[540px] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-[18px] font-bold text-gray-900">Edit Creator Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#D9BA54]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                  Headline / Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#D9BA54]"
                  placeholder="e.g. Family Life podcast creator for over 5years"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#D9BA54]"
                  placeholder="e.g. Umuahia, Abia State"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">
                  About
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#D9BA54] resize-none"
                  placeholder="Write a short summary about your creative projects and journey"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 h-11 rounded-lg bg-[#D9BA54] hover:bg-[#c9a73e] text-black text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Get Verified Screen (Figma: 1366px x 1616px) ─── */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto animate-in fade-in duration-200">
          <AudienceGetVerifiedView
            onBackToProfile={() => setShowVerifyModal(false)}
            onSelectPlan={(plan, cycle) => {
              setShowVerifyModal(false);
              toast(`Selected ${plan} plan on ${cycle} billing. Redirecting...`, 'success');
            }}
          />
        </div>
      )}

      {/* ─── MODAL 3: Create Creator Event (Figma Filter Popup: 1026px x 980px) ─── */}
      <AudienceCreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onProceedToAccountSetup={(newEvent) => {
          setShowCreateEventModal(false);
          setPendingCreatedEvent(newEvent);
          setShowSetupAccountModal(true);
        }}
        onEventCreated={(newEvent) => {
          toast(`Event "${newEvent.title}" created successfully!`, 'success');
        }}
      />

      {/* ─── MODAL 3.5: Set Up Escrow Bank Account (Figma Frame 2121459663: 625px x 733px, radius 32px) ─── */}
      <AudienceSetupAccountModal
        isOpen={showSetupAccountModal}
        onClose={() => setShowSetupAccountModal(false)}
        onBack={() => {
          setShowSetupAccountModal(false);
          setShowCreateEventModal(true);
        }}
        onFinish={(_bankDetails) => {
          setShowSetupAccountModal(false);
          setShowSuccessModal(true);
        }}
      />

      {/* ─── MODAL 3.6: Event Created Success Modal (Figma Filter Popup: 383px x 433px, radius 20px) ─── */}
      <AudienceEventCreatedSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onFinish={() => {
          const title = pendingCreatedEvent?.title || 'User experience (UX)';
          toast(`Event "${title}" published and live on your profile!`, 'success');
        }}
      />

      {/* ─── MODAL 4: Membership / Subscribe to Creator (Visitor Mode: Frame 2121459693) ─── */}
      <AudienceMembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        creatorName={name || 'Creator'}
        clubName={`Subscribe to follow ${name || 'Creator'}`}
        price="NGN 1,000"
        onSubscribeSuccess={() => {
          setIsSubscribed(true);
          toast(`Congratulations! You are now a membered fan of ${name || 'Creator'}.`, 'success');
        }}
      />

      {/* ─── MODAL 5: Live Event Join Modal / Filter Popup (Figma: Filter Popup) ─── */}
      <AudienceLiveEventJoinModal
        isOpen={Boolean(selectedEventForModal)}
        onClose={() => setSelectedEventForModal(null)}
        isSubscribed={isSubscribed}
        eventTitle={selectedEventForModal?.title || 'User experience (UX)'}
        onSubscribe={() => {
          setSelectedEventForModal(null);
          setShowMembershipModal(true);
        }}
        onJoin={() => {
          const eventTitle = selectedEventForModal?.title || 'User experience live event';
          setSelectedEventForModal(null);
          toast(`Joining ${eventTitle}...`, 'success');
          router.push('/audience?view=live');
        }}
      />

      {/* ─── MODAL 6: Deactivate Account Filter Popup (Figma: 383px x 320px & 383px x 433px) ─── */}
      <AudienceDeactivateAccountModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        initialStep={
          searchParams.get('modal') === 'account-deactivated' || searchParams.get('modal') === 'deactivated'
            ? 'deactivated'
            : 'confirm'
        }
      />

      {/* ─── MODAL 7: Tip Creator Modal ─── */}
      <AudienceTipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={targetCreatorId || user?.id || ''}
        creatorName={name || 'Creator'}
        creatorRole={bio || 'Creator'}
        creatorAvatar={avatarUrl}
      />
    </section>
  );
}
