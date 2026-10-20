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
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import AudienceMembershipModal from './AudienceMembershipModal';

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
}

export const DEFAULT_DESIGNER_FOLLOWERS: FollowerProfile[] = [
  {
    id: 'f1',
    name: 'Audrey Alexander',
    role: 'Team lead at Google',
    avatar: '/audience/audrey-alexander.png',
  },
  {
    id: 'f2',
    name: 'Kyle Fisher',
    role: 'Product designer at Commandor Corp',
    avatar: '/audience/kyle-fisher.png',
  },
  {
    id: 'f3',
    name: 'Darlene Black',
    role: 'HR-manager, 10 000 connections',
    avatar: '/audience/darlene-black.png',
  },
  {
    id: 'f4',
    name: 'Eduardo Russell',
    role: 'Full stack developer at Yandex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_DESIGNER_FOLLOWING: FollowerProfile[] = [
  {
    id: 'ing1',
    name: 'Audrey Alexander',
    role: 'Team lead at Google',
    avatar: '/audience/audrey-alexander.png',
  },
  {
    id: 'ing2',
    name: 'Kyle Fisher',
    role: 'Product designer at Commandor Corp',
    avatar: '/audience/kyle-fisher.png',
  },
  {
    id: 'ing3',
    name: 'Darlene Black',
    role: 'HR-manager, 10 000 connections',
    avatar: '/audience/darlene-black.png',
  },
  {
    id: 'ing4',
    name: 'Eduardo Russell',
    role: 'Full stack developer at Yandex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'ing5',
    name: 'Audrey Alexander',
    role: 'Team lead at Google',
    avatar: '/audience/audrey-alexander.png',
  },
  {
    id: 'ing6',
    name: 'Kyle Fisher',
    role: 'Product designer at Commandor Corp',
    avatar: '/audience/kyle-fisher.png',
  },
  {
    id: 'ing7',
    name: 'Darlene Black',
    role: 'HR-manager, 10 000 connections',
    avatar: '/audience/darlene-black.png',
  },
  {
    id: 'ing8',
    name: 'Eduardo Russell',
    role: 'Full stack developer at Yandex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
];

const DEFAULT_PODCAST_ITEMS: ShowItem[] = [
  {
    id: 'p1',
    title: 'Zara redesign concept',
    subtitle: 'UX/UI design, 15.07.2019',
    cover: '/audience/podcast-zara.png',
  },
  {
    id: 'p2',
    title: 'SCTHON event brand identity',
    subtitle: 'Graphic design, 03.31.2019',
    cover: '/audience/podcast-scthon.png',
  },
  {
    id: 'p3',
    title: 'Drozd. Brand identity. 2016',
    subtitle: 'Graphic design, 03.04.2016',
    cover: '/audience/podcast-drozd.png',
  },
];

const DEFAULT_FAN_EVENTS: EventClubItem[] = [
  {
    id: 'e1',
    title: 'User experience (UX)',
    count: 6,
    badgeCount: 1,
    avatars: [
      '/audience/adam-udochi.png',
      '/audience/kyle-fisher.png',
      '/audience/brandon-wilson.png',
      '/audience/nermmen-saif.png',
      '/audience/darlene-black.png',
    ],
  },
  {
    id: 'e2',
    title: 'User interface (UI)',
    count: 7,
    badgeCount: 2,
    avatars: [
      '/audience/audrey-alexander.png',
      '/audience/theresa-steward.png',
      '/audience/dylan-field.png',
      '/audience/adam-udochi.png',
      '/audience/kyle-fisher.png',
    ],
  },
  {
    id: 'e3',
    title: 'Brand identity',
    count: 5,
    avatars: [
      '/audience/ryan-roslansky.png',
      '/audience/steve-jobs.png',
      '/audience/nermmen-saif.png',
      '/audience/brandon-wilson.png',
    ],
  },
];

interface AudienceProfilePageViewProps {
  onEditProfileClick?: () => void;
  isVisitor?: boolean;
}

export default function AudienceProfilePageView({
  onEditProfileClick,
  isVisitor,
}: AudienceProfilePageViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const queryMode = searchParams.get('mode');
  const queryView = searchParams.get('view');
  const { toast } = useToast();
  const { user, logout } = useAuthStore();

  const isVisitorInitial = isVisitor !== undefined 
    ? isVisitor 
    : (queryMode === 'visitor' || queryView === 'creator-profile' || queryView === 'creator' || queryView === 'visitor-profile');

  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(isVisitorInitial);
  const [prevVisitorProp, setPrevVisitorProp] = useState(isVisitor);
  if (isVisitor !== prevVisitorProp) {
    setPrevVisitorProp(isVisitor);
    if (isVisitor !== undefined) {
      setIsVisitorMode(isVisitor);
    }
  }

  const [isSubscribed, setIsSubscribed] = useState(false);
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

  const [activeTab, setActiveTab] = useState<'profile' | 'followers' | 'following'>(() => {
    if (queryTab === 'followers') return 'followers';
    if (queryTab === 'following') return 'following';
    return 'profile';
  });

  useEffect(() => {
    if (queryTab === 'followers') setActiveTab('followers');
    else if (queryTab === 'following') setActiveTab('following');
    else if (queryTab === 'profile') setActiveTab('profile');
  }, [queryTab]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Live Followers & Following lists
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(1043);
  const [followingCount, setFollowingCount] = useState<number>(143);
  const [podcasts, setPodcasts] = useState<ShowItem[]>(DEFAULT_PODCAST_ITEMS);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Udo Emmanuel');
      setBio(user.bio || 'Family Life podcast creator for over 5years');
      setLocation(user.location || 'Saint Petersburg, Russian Federation');
      setAbout(
        user.about ||
        "I'm more experienced in eCommerce web projects and mobile banking apps, but also like to work with creative projects, such as landing pages or unusual corporate websites."
      );
      setAvatarUrl(user.avatar || '/audience/adam-udochi.png');
      setBannerUrl(
        user.banner ||
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80'
      );
    }
  }, [user]);

  // Fetch live followers, following, and creator shows from database
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/follows/followers'),
      api.get('/follows/following'),
      api.get('/shows/mine'),
    ]).then(([fRes, ingRes, showsRes]) => {
      if (!isMounted) return;
      if (fRes.status === 'fulfilled' && fRes.value.data?.followers) {
        setFollowers(fRes.value.data.followers);
        if (fRes.value.data.followers.length > 0) {
          setFollowersCount(fRes.value.data.followers.length);
        }
      }
      if (ingRes.status === 'fulfilled' && ingRes.value.data?.following) {
        setFollowing(ingRes.value.data.following);
        if (ingRes.value.data.following.length > 0) {
          setFollowingCount(ingRes.value.data.following.length);
        }
      }
      if (showsRes.status === 'fulfilled' && showsRes.value.data?.shows?.length > 0) {
        const mappedShows: ShowItem[] = showsRes.value.data.shows.map((s: any) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.episode_count || 0} episodes · ${new Date(s.created_at || Date.now()).toLocaleDateString('en-GB')}`,
          cover: s.cover_url || DEFAULT_PODCAST_ITEMS[0].cover,
        }));
        setPodcasts(mappedShows);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleTabChange = (tab: 'profile' | 'followers' | 'following') => {
    setActiveTab(tab);
    router.replace(`/audience?view=profile&tab=${tab}`, { scroll: false });
  };

  const [unfollowedMap, setUnfollowedMap] = useState<Record<string, boolean>>({});

  const handleToggleFollow = async (creatorId: string, creatorName: string) => {
    const isCurrentlyUnfollowed = Boolean(unfollowedMap[creatorId]);
    if (isCurrentlyUnfollowed) {
      setUnfollowedMap((prev) => ({ ...prev, [creatorId]: false }));
      setFollowingCount((prev) => prev + 1);
      toast(`Following ${creatorName}`, 'success');
      try {
        await api.post(`/follows/${creatorId}`);
      } catch (err) {
        console.warn('API follow error:', err);
      }
    } else {
      setUnfollowedMap((prev) => ({ ...prev, [creatorId]: true }));
      setFollowingCount((prev) => Math.max(0, prev - 1));
      toast(`Unfollowed ${creatorName}`, 'info');
      try {
        await api.delete(`/follows/${creatorId}`);
      } catch (err) {
        console.warn('API unfollow error:', err);
      }
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
    <section className="w-full lg:w-[850px] flex flex-col gap-6 font-['DM_Sans',sans-serif]">
      {/* ─── Mode Switcher Pill (Figma Visitor View vs Owner View) ─── */}
      <div className="flex items-center justify-between px-1 -mb-2">
        <div className="flex items-center bg-white p-1 rounded-full border border-gray-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setIsVisitorMode(true)}
            className={`px-3.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              isVisitorMode 
                ? 'bg-[#D9BA54] text-black font-semibold shadow-xs' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Visitor View (Figma)
          </button>
          <button
            type="button"
            onClick={() => setIsVisitorMode(false)}
            className={`px-3.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
              !isVisitorMode 
                ? 'bg-[#D9BA54] text-black font-semibold shadow-xs' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Creator Owner View
          </button>
        </div>
        {isVisitorMode && (
          <span className="text-[11px] text-[#15411F] font-medium hidden sm:inline-block">
            Viewing as Adam Udochi (Audience Member)
          </span>
        )}
      </div>

      {/* ─── 1. Profile Hero Card (Figma: 850px x 360px, radius 4px) ─── */}
      <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 overflow-hidden relative">
        {/* Banner (850px x 180px) */}
        <div className="w-full h-[180px] relative bg-neutral-200 overflow-hidden">
          <img
            src={isVisitorMode ? '/audience/udo-banner.png' : bannerUrl}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />

          {/* Banner Tools Overlay (Upload/Share on left, Tools on right) */}
          <div className="absolute inset-0 p-5 flex items-start justify-between pointer-events-none">
            {/* Upload / Share Button (36px x 36px, radius 4px) */}
            <button
              type="button"
              onClick={isVisitorMode ? handleShareProfile : () => toast('Click Edit Profile to change your cover picture.', 'info')}
              className="w-9 h-9 rounded-[4px] bg-white/90 backdrop-blur-sm shadow-[0px_10px_30px_rgba(113,123,133,0.05)] flex items-center justify-center text-[#181818] hover:bg-white transition-colors pointer-events-auto cursor-pointer"
              title={isVisitorMode ? "Share profile" : "Upload cover"}
            >
              <Upload size={16} />
            </button>

            {/* Right Buttons: Edit profile (owner only) + More (...) */}
            <div className="flex items-center gap-2 pointer-events-auto relative" ref={menuRef}>
              {!isVisitorMode && (
                <button
                  type="button"
                  onClick={() => {
                    if (onEditProfileClick) {
                      onEditProfileClick();
                    } else {
                      router.push('/audience?view=edit-profile');
                    }
                  }}
                  className="h-9 px-4 rounded-[4px] bg-white/90 backdrop-blur-sm shadow-[0px_10px_30px_rgba(113,123,133,0.05)] flex items-center gap-2 text-[12px] font-normal uppercase tracking-wider text-[#181818] hover:bg-white transition-colors cursor-pointer"
                >
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="w-9 h-9 rounded-[4px] bg-white/90 backdrop-blur-sm shadow-[0px_10px_30px_rgba(113,123,133,0.05)] flex items-center justify-center text-[#181818] hover:bg-white transition-colors cursor-pointer"
                title="More options"
              >
                <MoreVertical size={18} />
              </button>

              {/* More Dropdown Menu */}
              {showMoreMenu && (
                <div
                  className="absolute right-0 top-11 w-[200px] bg-white rounded-[10px] shadow-[-4.75px_30px_30px_rgba(184,184,184,0.25)] border border-gray-100 p-4 z-50 flex items-center justify-between animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex flex-col gap-2.5 w-full">
                    {isVisitorMode ? (
                      <>
                        <button
                          type="button"
                          onClick={handleShareProfile}
                          className="text-left text-[14px] font-normal text-[#181818] hover:text-[#D9BA54] transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Share2 size={16} />
                          Share profile
                        </button>
                        <button
                          type="button"
                          onClick={handleShareProfile}
                          className="text-left text-[14px] font-normal text-[#181818] hover:text-[#D9BA54] transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Copy size={16} />
                          Copy profile link
                        </button>
                        <button
                          type="button"
                          onClick={handleReportCreator}
                          className="text-left text-[14px] font-normal text-[#F64A4A] hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
                        >
                          <Flag size={16} />
                          Report creator
                        </button>
                        <button
                          type="button"
                          onClick={handleBlockCreator}
                          className="text-left text-[14px] font-normal text-black/70 hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
                        >
                          <ShieldAlert size={16} />
                          Block creator
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-left text-[15px] font-normal text-[#F64A4A] hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreMenu(false);
                            toast('Account deactivation must be requested through Support.', 'info');
                          }}
                          className="text-left text-[15px] font-normal text-[#000000] hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-2"
                        >
                          <UserX size={16} />
                          Deactivate account
                        </button>
                      </>
                    )}
                  </div>

                  {/* Golden vertical indicator line */}
                  <div className="w-[2px] h-[63px] bg-[#D4AF37]/15 rounded-[10px] relative ml-2 shrink-0">
                    <div className="w-[2px] h-[14px] bg-[#D4AF37] rounded-[20px] absolute top-[9px]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Row: Avatar + Details + Location + CTAs */}
        <div className="px-7 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Circular Avatar (170px x 170px, 10px white border, overlapping banner) */}
            <div className="-mt-[85px] w-[170px] h-[170px] rounded-full border-[10px] border-white overflow-hidden bg-neutral-100 shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative z-10">
              <img
                src={isVisitorMode ? '/audience/udo-emmanuel.png' : avatarUrl}
                alt={isVisitorMode ? 'Udo Emmanuel' : name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name, Tagline & Visitor CTA */}
            <div className="flex flex-col mb-1">
              <h1 className="text-[18px] font-semibold text-[#181818] leading-[23px] m-0">
                {isVisitorMode ? 'Udo Emmanuel' : name}
              </h1>
              <p className="text-[14px] font-normal text-[#181818] leading-[21px] mt-1 m-0">
                {isVisitorMode ? 'Family Life podcast creator for over 5years' : bio}
              </p>

              {/* Primary CTA Button: SUBSCRIBE TO BE A MEMBERED FAN (Figma: 227px x 32px, #D9BA54) */}
              {isVisitorMode && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSubscribed) {
                        toast('You are already subscribed to Udo Emmanuel!', 'info');
                      } else {
                        setShowMembershipModal(true);
                      }
                    }}
                    className={`w-[227px] h-8 rounded-[6px] text-[12px] font-normal uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center shadow-xs font-['DM_Sans',sans-serif] ${
                      isSubscribed 
                        ? 'bg-[#15411F] text-white hover:bg-[#12381a]' 
                        : 'bg-[#D9BA54] text-black hover:bg-[#c9a73e]'
                    }`}
                  >
                    {isSubscribed ? 'MEMBERED FAN ✓' : 'SUBSCRIBE TO BE A MEMBERED FAN'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location on Right (Figma: Saint Petersburg, Russian Federation) */}
          <div className="flex items-center gap-1.5 text-[12px] font-normal text-[#181818] mb-2 self-start md:self-center shrink-0">
            <Navigation size={14} className="text-[#15411F] fill-[#15411F]" />
            <span>{isVisitorMode ? 'Saint Petersburg, Russian Federation' : location}</span>
          </div>
        </div>

        {/* Action Buttons Row: CREATE AN EVENT & GET VERIFIED */}
        {!isVisitorMode && (
          <div className="px-7 pb-6 flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCreateEventModal(true)}
              className="w-[170px] h-8 bg-[#D9BA54] hover:bg-[#c9a73e] text-black text-[12px] font-normal uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer flex items-center justify-center"
            >
              Create an Event
            </button>

            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="w-[170px] h-8 bg-white hover:bg-amber-50/50 border border-[#D9BA54] text-[#D9BA54] text-[12px] font-medium uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer flex items-center justify-center"
            >
              Get Verified
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. Tabs Bar (Figma: 720px wide, PROFILE 50px high, FOLLOWERS/FOLLOWING 40px) ─── */}
      <div className="w-full max-w-[720px] flex items-end border-b border-[#E7E7E7] relative">
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          className={`w-[240px] text-[12px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'profile'
              ? 'h-[50px] bg-[#D9BA54] text-black rounded-t-[6px]'
              : 'h-[40px] bg-white text-[#181818] border border-[#E7E7E7] border-b-0 hover:bg-gray-50'
          }`}
        >
          Profile
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('followers')}
          className={`w-[240px] text-[12px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'followers'
              ? 'h-[50px] bg-[#D9BA54] text-black rounded-t-[6px]'
              : 'h-[40px] bg-white text-[#181818] border border-[#E7E7E7] border-b-0 hover:bg-gray-50'
          }`}
        >
          Followers ({followersCount})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('following')}
          className={`w-[240px] text-[12px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'following'
              ? 'h-[50px] bg-[#D9BA54] text-black rounded-t-[6px]'
              : 'h-[40px] bg-white text-[#181818] border border-[#E7E7E7] border-b-0 hover:bg-gray-50'
          }`}
        >
          Following ({followingCount})
        </button>
      </div>

      {/* ─── 3. Tab Contents ─── */}
      {activeTab === 'profile' ? (
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
                {about}
              </p>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsAboutExpanded((prev) => !prev)}
                className="text-[12px] font-medium uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {isAboutExpanded ? 'See Less' : 'See More'}
              </button>
            </div>
          </div>

          {/* Card B: Podcast (Figma: 850px x 355px, 3 items, Show all (12)) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 p-6 sm:p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[18px] font-semibold text-[#181818] leading-[23px] m-0">
                Podcast
              </h2>
              <span className="text-[18px] font-normal text-[#747474]">
                {Math.min(3, podcasts.length)} of {podcasts.length > 3 ? podcasts.length : 12}
              </span>
            </div>

            {/* 3 Columns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(showAllPodcasts ? podcasts : podcasts.slice(0, 3)).map((pod) => (
                <Link
                  key={pod.id}
                  href={`/podcast`}
                  className="flex flex-col group text-decoration-none"
                >
                  <div className="w-full aspect-[250/160] rounded-[2px] overflow-hidden bg-neutral-100 relative shadow-sm">
                    <img
                      src={pod.cover}
                      alt={pod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-black shadow-md">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-[14px] font-medium text-[#181818] leading-[150%] mt-2.5 mb-0 truncate group-hover:text-[#D9BA54] transition-colors">
                    {pod.title}
                  </h3>
                  <p className="text-[10px] font-light text-[#181818]/70 leading-[150%] m-0 truncate">
                    {pod.subtitle}
                  </p>
                </Link>
              ))}
            </div>

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
                className="text-[12px] font-semibold uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {showAllPodcasts ? 'Show Less' : `Show All (${podcasts.length > 3 ? podcasts.length : 12})`}
              </button>
            </div>
          </div>

          {/* Card C: Fan Club Events (Figma: 850px x 220px, 3 items, Show all (17)) */}
          <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100 p-6 sm:p-7 flex flex-col">
            <h2 className="text-[18px] font-medium text-[#181818] leading-[23px] m-0 mb-5">
              Fan Club Events
            </h2>

            {/* 3 Columns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(showAllEvents ? DEFAULT_FAN_EVENTS : DEFAULT_FAN_EVENTS.slice(0, 3)).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => router.push('/audience?view=live')}
                  className="w-full h-[80px] bg-white border border-[#F4F4F4] rounded-[6px] px-4 py-3 flex flex-col justify-between hover:border-gray-300 transition-colors cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-[#181818] truncate pr-2">
                      {ev.title}
                    </span>
                    <span className="text-[14px] font-semibold text-[#15411F]">
                      {ev.count}
                    </span>
                  </div>

                  {/* Overlapping Avatar Stack */}
                  <div className="flex items-center">
                    {ev.avatars.map((av, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full overflow-hidden border-2 border-white -ml-1.5 first:ml-0 bg-neutral-200 shrink-0"
                      >
                        <img
                          src={av}
                          alt="participant"
                          className="w-full h-full object-cover"
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

            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push('/audience?view=live')}
                className="text-[12px] font-semibold uppercase tracking-wider text-[#D9BA54] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Show All (17)
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'followers' ? (
        /* ─── Followers Tab Content: Frame matching designer screen (850px wide) ─── */
        <div className="w-full bg-white rounded-[4px] shadow-[0px_20px_60px_rgba(241,244,248,0.5)] border border-gray-100/80 p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {(followers.length > 0 ? followers : DEFAULT_DESIGNER_FOLLOWERS).map((f: any) => (
              <div
                key={f.id}
                onClick={() => toast(`Viewing ${f.name}'s profile`, 'info')}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-[52px] h-[52px] rounded-full overflow-hidden shrink-0 bg-neutral-200 shadow-sm border border-black/5">
                  <img
                    src={f.avatar || '/audience/audrey-alexander.png'}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/audience/adam-udochi.png';
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[16px] font-bold text-[#181818] leading-[22px] truncate group-hover:text-[#D9BA54] transition-colors">
                    {f.name}
                  </span>
                  <span className="text-[13px] font-normal text-[#181818] leading-[150%] truncate mt-0.5">
                    {f.role || 'Community Member'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ─── Following Tab Content: Filter line + 2-Column Cards matching Figma specs ─── */
        <div className="flex flex-col gap-6 w-full lg:w-[850px]">
          {/* Filter Divider: Line --- PEOPLE YOU FOLLOW --- Line */}
          <div className="w-full flex items-center justify-between gap-4 py-1">
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
            <span className="text-[12px] font-medium text-[#181818] uppercase tracking-wider whitespace-nowrap px-2 font-['DM_Sans',sans-serif]">
              People you follow
            </span>
            <div className="flex-1 h-[1px] bg-[#E7E7E7]" />
          </div>

          {/* 2-Column Grid of 420px x 95px Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(following.length > 0 ? following : DEFAULT_DESIGNER_FOLLOWING).map((f: any) => {
              const isUnfollowed = Boolean(unfollowedMap[f.id]);
              return (
                <div
                  key={f.id}
                  className="w-full h-[95px] bg-white rounded-[4px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between px-6 py-4 transition-all"
                >
                  {/* Left: Avatar + Details */}
                  <div
                    onClick={() => toast(`Viewing ${f.name}'s profile`, 'info')}
                    className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
                  >
                    <div className="w-[52px] h-[52px] rounded-full overflow-hidden shrink-0 bg-neutral-200 border border-black/5">
                      <img
                        src={f.avatar || '/audience/kyle-fisher.png'}
                        alt={f.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/audience/kyle-fisher.png';
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[14px] font-semibold text-[#181818] leading-[18px] truncate group-hover:text-[#D9BA54] transition-colors">
                        {f.name}
                      </span>
                      <span className="text-[10px] font-normal text-[#181818] leading-[15px] truncate mt-0.5">
                        {f.role || 'Creator'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Unfollow Button (91px x 32px, #D4AF37) */}
                  <button
                    type="button"
                    onClick={() => handleToggleFollow(f.id, f.name)}
                    className={`w-[91px] h-[32px] rounded-[4px] text-[12px] font-normal capitalize transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                      isUnfollowed
                        ? 'bg-white border border-[#D4AF37] text-[#D4AF37] hover:bg-amber-50/50'
                        : 'bg-[#D4AF37] hover:bg-[#c49f2e] text-black'
                    }`}
                  >
                    {isUnfollowed ? 'Follow' : 'Unfollow'}
                  </button>
                </div>
              );
            })}
          </div>
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
                  placeholder="e.g. Saint Petersburg, Russian Federation"
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

      {/* ─── MODAL 2: Get Verified ─── */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#D9BA54] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>

            <h3 className="text-[18px] font-bold text-gray-900 mb-1">
              Studio Arella Creator Verification
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              Verified creators receive the golden checkmark, priority ranking in the Audience feed, and access to ticketed 1View Live Streams.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-700 flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Active account with published podcast content</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Valid contact details and Nigerian bank account linked</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Adheres to Studio Arella Community Guidelines</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={isRequestingVerification}
                className="flex-1 h-11 rounded-lg bg-[#D9BA54] hover:bg-[#c9a73e] text-black text-sm font-bold flex items-center justify-center gap-2"
              >
                {isRequestingVerification ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Create an Event ─── */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-[18px] font-bold text-gray-900">Create Creator Event</h3>
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 mb-5">
              Choose the type of event you want to host for your community.
            </p>

            <div className="flex flex-col gap-3.5 mb-6">
              <div
                onClick={() => {
                  setShowCreateEventModal(false);
                  router.push('/audience?view=live');
                }}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#D9BA54] bg-[#FCFDFD] cursor-pointer transition-all flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D9BA54] flex items-center justify-center shrink-0">
                  <Play size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 m-0">1View Live Audio Stream</h4>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Broadcast a real-time audio event with live fan chat.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  setShowCreateEventModal(false);
                  router.push('/bookings?tab=podcast');
                }}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#D9BA54] bg-[#FCFDFD] cursor-pointer transition-all flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 m-0">Book Studio Arella Recording Time</h4>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Reserve professional audio/video recording session.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateEventModal(false)}
              className="w-full h-11 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: Membership / Subscribe to Creator (Visitor Mode: Frame 2121459693) ─── */}
      <AudienceMembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        creatorName="Udo Emmanuel"
        clubName="Subscribe to follow Udo Emmanuel"
        price="NGN 1,000"
        onSubscribeSuccess={() => {
          setIsSubscribed(true);
          toast('Congratulations! You are now a membered fan of Udo Emmanuel.', 'success');
        }}
      />
    </section>
  );
}
