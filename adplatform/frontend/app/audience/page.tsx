'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/ui/Animations';
import AudienceNavbar from '@/components/audience/AudienceNavbar';
import AudienceLeftSidebar from '@/components/audience/AudienceLeftSidebar';
import AudienceRightSidebar from '@/components/audience/AudienceRightSidebar';
import AudiencePostComposer from '@/components/audience/AudiencePostComposer';
import AudiencePostCard, { PostData } from '@/components/audience/AudiencePostCard';
import AudienceMembershipsCard from '@/components/audience/AudienceMembershipsCard';
import AudienceSubscriptionsCard from '@/components/audience/AudienceSubscriptionsCard';
import AudienceLiveExperiencesCard from '@/components/audience/AudienceLiveExperiencesCard';
import AudienceLiveEventDetail from '@/components/audience/AudienceLiveEventDetail';
import AudienceChatPageView from '@/components/audience/AudienceChatPageView';
import AudienceNotificationsPageView from '@/components/audience/AudienceNotificationsPageView';
import AudienceProfilePageView from '@/components/audience/AudienceProfilePageView';
import AudienceEditProfilePageView from '@/components/audience/AudienceEditProfilePageView';
import AudiencePodcastPlayerView from '@/components/audience/AudiencePodcastPlayerView';
import AudiencePremiumCard from '@/components/audience/AudiencePremiumCard';
import AudienceGetVerifiedView from '@/components/audience/AudienceGetVerifiedView';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const DEFAULT_FEED_POSTS: PostData[] = [
  {
    id: 'post-1',
    author: {
      id: 'd167c089-35e2-4f25-a627-c7d55f7c713f',
      name: 'Adam Udochi',
      role: 'UI/UX Designer & Producer',
      avatar: '/audience/adam-udochi.png',
      tier: 'pro',
    },
    title: 'Private Equity & Angel Investing in Africa',
    description: 'How high-conviction syndicates and venture angels back founders creating continent-wide financial breakthroughs.',
    category: 'Wealth',
    tags: ['#wealth', '#business', '#investing', '#equity'],
    mediaUrl: '/audience/covers/wealth.jpg',
    duration: '02:35:19',
    currentTime: '00:04:15',
    progressPercent: 30,
    initialLikes: 148,
    initialComments: 12,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-2',
    author: {
      id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
      name: 'Darlene Black',
      role: 'Podcast Host & Storyteller',
      avatar: '/audience/darlene-black.png',
      tier: 'pro',
    },
    title: 'Holistic Health & Vitality Tracking',
    description: 'Integrating bio-markers, functional sleep hygiene, and daily nutritional protocols for peak mental clarity.',
    category: 'Health',
    tags: ['#health', '#wellness', '#vitality', '#nutrition'],
    mediaUrl: '/audience/covers/health.jpg',
    duration: '01:35:19',
    currentTime: '00:04:15',
    progressPercent: 20,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-3',
    author: {
      id: 'e3101424-a3ac-4a9d-9ea9-3f0d957edf78',
      name: 'Nermmen Saif',
      role: 'Design & Media Creator',
      avatar: '/audience/nermmen-saif.png',
      tier: 'pro',
    },
    title: 'Tricks to Modern Wealth Creation',
    description: 'Proven investment frameworks, modern capital allocation, and digital cashflow models for new age wealth builders.',
    category: 'Wealth',
    tags: ['#wealth', '#finance', '#investing'],
    mediaUrl: '/audience/covers/wealth.jpg',
    duration: '01:42:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 85,
    initialComments: 14,
    badgeTheme: 'green',
    isBookmarked: false,
    isPremium: true,
    isUnlocked: false,
    price: 1500,
  },
  {
    id: 'post-4',
    author: {
      id: '0e0d0c45-7c57-40eb-8910-f3d8cc573b99',
      name: 'Audrey Alexander',
      role: 'Diplomacy & Political Analyst',
      avatar: '/audience/audrey-alexander.png',
      tier: 'free',
    },
    title: 'Global Diplomacy & African Geopolitics',
    description: 'An in-depth analysis of African economic diplomacy, foreign policy shifts, and strategic multilateral trade alliances.',
    category: 'Politics',
    tags: ['#politics', '#diplomacy', '#geopolitics', '#governance'],
    mediaUrl: '/audience/covers/politics.jpg',
    duration: '01:47:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 112,
    initialComments: 23,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-5',
    author: {
      id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
      name: 'Brandon Wilson',
      role: 'Cultural Historian',
      avatar: '/audience/brandon-wilson.png',
      tier: 'free',
    },
    title: 'The Voices of Umuahia: Heritage & Culture',
    description: 'Celebrated highlife musicians, oral historians, and cultural curators explore folklore, rhythms, and modern African music.',
    category: 'Entertainment',
    tags: ['#entertainment', '#culture', '#music', '#umuahia'],
    mediaUrl: '/audience/covers/culture.jpg',
    duration: '01:28:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 218,
    initialComments: 34,
    badgeTheme: 'green',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-6',
    author: {
      id: '34debe18-75a3-49d3-9404-d82df7b5cd62',
      name: 'Theresa Steward',
      role: 'Executive Producer & Talent Recruiter',
      avatar: '/audience/theresa-steward.png',
      tier: 'pro',
    },
    title: 'Scaling Emerging Media & Digital Billboards',
    description: 'Strategic playbook for modern media partners on monetizing outdoor DOOH networks, programmatic displays, and studio brands.',
    category: 'Business',
    tags: ['#business', '#billboards', '#marketing', '#media'],
    mediaUrl: '/audience/covers/media.jpg',
    duration: '01:15:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 142,
    initialComments: 19,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-7',
    author: {
      id: 'f4f4d1be-9134-48e4-9789-fc92fc4cb8f4',
      name: 'Kyle Fisher',
      role: 'Family Counselor & Educator',
      avatar: '/audience/kyle-fisher.png',
      tier: 'free',
    },
    title: 'Building Generational Family Legacies',
    description: 'Navigating inter-generational conversations, parenting values, family wealth, and creating lasting household resilience.',
    category: 'Family',
    tags: ['#family', '#parenting', '#legacy'],
    mediaUrl: '/audience/covers/relationship.jpg',
    duration: '01:23:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 58,
    initialComments: 8,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
  {
    id: 'post-8',
    author: {
      id: '3a9555f6-fa47-47ef-aa88-f19d80a90e6e',
      name: 'Darlene Black',
      role: 'Relationship & Marriage Coach',
      avatar: '/audience/darlene-black.png',
      tier: 'pro',
    },
    title: 'Modern Marriage & Relationship Wisdom',
    description: 'Honest, vulnerable conversations on emotional intimacy, resolving partnership conflicts, and flourishing together in love.',
    category: 'Relationship',
    tags: ['#relationship', '#marriage', '#family', '#communication'],
    mediaUrl: '/audience/covers/relationship.jpg',
    duration: '01:32:00',
    currentTime: '00:00:00',
    progressPercent: 0,
    initialLikes: 91,
    initialComments: 17,
    badgeTheme: 'gold',
    isBookmarked: false,
    isPremium: false,
    isUnlocked: true,
  },
];

const DEFAULT_BOOKMARKED_POSTS: PostData[] = [
  DEFAULT_FEED_POSTS[0],
  DEFAULT_FEED_POSTS[1],
];

function AudienceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryView = searchParams.get('view');

  const { user, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  const [activeMenu, setActiveMenu] = useState<'podcast' | 'trending' | 'memberships' | 'bookmarks' | 'subscriptions' | 'live' | 'live-detail' | 'chats' | 'notifications' | 'profile' | 'creator-profile' | 'podcast-player' | 'edit-profile' | 'settings' | 'get-verified' | string>(() => {
    if (queryView === 'get-verified' || queryView === 'verify' || queryView === 'pricing') return 'get-verified';
    if (queryView === 'podcast-player' || queryView === 'podcast-detail' || queryView === 'episode') return 'podcast-player';
    if (queryView === 'creator-profile' || queryView === 'creator' || queryView === 'visitor-profile') return 'creator-profile';
    if (queryView === 'login-history' || queryView === 'change-password' || queryView === 'edit-profile' || queryView === 'settings') return 'edit-profile';
    if (queryView === 'profile') return 'profile';
    if (queryView === 'notifications') return 'notifications';
    if (queryView === 'chats' || queryView === 'messages') return 'chats';
    if (queryView === 'live-detail') return 'live-detail';
    if (queryView === 'live') return 'live';
    if (queryView === 'subscriptions') return 'subscriptions';
    if (queryView === 'bookmarks') return 'bookmarks';
    if (queryView === 'memberships') return 'memberships';
    if (queryView === 'podcast' || queryView === 'feed') return 'podcast';
    if (queryView === 'trending') return 'trending';
    return 'podcast';
  });

  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLiveExp, setSelectedLiveExp] = useState<string[]>([]);

  // Sync menu state when URL query changes without cascading effect
  const [prevQueryView, setPrevQueryView] = useState(queryView);
  if (queryView !== prevQueryView) {
    setPrevQueryView(queryView);
    if (queryView === 'get-verified' || queryView === 'verify' || queryView === 'pricing') {
      setActiveMenu('get-verified');
    } else if (queryView === 'podcast-player' || queryView === 'podcast-detail' || queryView === 'episode') {
      setActiveMenu('podcast-player');
    } else if (queryView === 'creator-profile' || queryView === 'creator' || queryView === 'visitor-profile') {
      setActiveMenu('creator-profile');
    } else if (queryView === 'login-history' || queryView === 'change-password' || queryView === 'edit-profile' || queryView === 'settings') {
      setActiveMenu('edit-profile');
    } else if (queryView === 'profile') {
      setActiveMenu('profile');
    } else if (queryView === 'notifications') {
      setActiveMenu('notifications');
    } else if (queryView === 'chats' || queryView === 'messages') {
      setActiveMenu('chats');
    } else if (queryView === 'live-detail') {
      setActiveMenu('live-detail');
    } else if (queryView === 'live') {
      setActiveMenu('live');
    } else if (queryView === 'subscriptions') {
      setActiveMenu('subscriptions');
    } else if (queryView === 'bookmarks') {
      setActiveMenu('bookmarks');
    } else if (queryView === 'memberships') {
      setActiveMenu('memberships');
    } else if (queryView === 'podcast' || queryView === 'feed') {
      setActiveMenu('podcast');
    } else if (queryView === 'trending') {
      setActiveMenu('trending');
    }
  }

  // Fetch live posts from Creator Space API for the active view with resilient fallbacks
  useEffect(() => {
    let isMounted = true;
    let url = '/content/feed';
    if (activeMenu === 'bookmarks') {
      url = '/content/bookmarks';
    } else if (activeMenu === 'trending') {
      url = '/content/feed?view=trending';
    }

    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        let feedPosts: Record<string, unknown>[] = [];
        
        // 1. Try external backend API
        try {
          const res = await api.get(url);
          feedPosts = res.data?.posts || [];
        } catch {
          // 2. If Render backend returns 404 / error, try internal Next.js direct DB route
          try {
            const fallbackUrl = `/api/content/feed${activeMenu === 'trending' ? '?view=trending' : ''}`;
            const directRes = await fetch(fallbackUrl);
            if (directRes.ok) {
              const data = await directRes.json();
              feedPosts = data?.posts || [];
            }
          } catch {
            feedPosts = [];
          }
        }

        if (!isMounted) return;

        if (feedPosts.length > 0) {
          const mapped: PostData[] = feedPosts.map((p: Record<string, unknown>) => {
            const authorObj = (typeof p.author === 'object' && p.author !== null ? p.author : {}) as Record<string, unknown>;
            const authorName = (authorObj.name as string) || (p.author_name as string) || 'Adam Udochi';
            const authorRole = (authorObj.role as string) || (p.author_role as string) || 'Creator';
            const authorAvatar = (authorObj.avatar as string) || (p.author_avatar as string) || '/audience/adam-udochi.png';
            const authorTier = (authorObj.tier as string) || (p.author_tier as string) || 'pro';
            const cleanTitle = String(p.title || 'Studio Podcast').replace(/^[-–—\s]+/, '');

            return {
              id: String(p.id),
              author: {
                id: (authorObj.id as string) || (p.author_id as string) || (p.creator_id as string) || '',
                name: authorName,
                role: authorRole,
                avatar: authorAvatar,
                tier: authorTier,
              },
              title: cleanTitle,
              description: (p.description as string) || '',
              mediaUrl: (p.mediaUrl as string) || (p.cover_url as string) || (p.media_url as string) || '',
              duration: (p.duration_text as string) || '01:15:00',
              currentTime: '00:04:15',
              progressPercent: 30,
              initialLikes: typeof p.initialLikes === 'number'
                ? p.initialLikes
                : (parseInt(String(p.likes_count ?? p.initialLikes ?? 0), 10) || 0),
              initialComments: typeof p.initialComments === 'number'
                ? p.initialComments
                : (parseInt(String(p.comments_count ?? p.initialComments ?? 0), 10) || 0),
              badgeTheme: p.badge_theme === 'green' ? 'green' : 'gold',
              isBookmarked: activeMenu === 'bookmarks' ? true : Boolean(p.is_bookmarked ?? p.isBookmarked),
              hasLiked: Boolean(p.has_liked ?? p.hasLiked),
              isPremium: Boolean(p.is_premium ?? p.isPremium),
              isUnlocked: p.is_unlocked !== undefined ? Boolean(p.is_unlocked) : (p.isUnlocked !== undefined ? Boolean(p.isUnlocked) : !p.is_premium),
              price: parseFloat(String(p.price)) || 0,
              category: (p.category as string) || 'General',
              tags: Array.isArray(p.tags) ? p.tags : [],
            };
          });
          setPosts(mapped);
        } else {
          // 3. Fall back to rich Figma seeded posts so the space is never accidentally blank
          if (activeMenu === 'bookmarks') {
            setPosts(DEFAULT_BOOKMARKED_POSTS);
          } else {
            setPosts(DEFAULT_FEED_POSTS);
          }
        }
      } catch {
        if (isMounted) {
          setPosts(activeMenu === 'bookmarks' ? DEFAULT_BOOKMARKED_POSTS : DEFAULT_FEED_POSTS);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [activeMenu]);

  // Real-time topic and live experience filter
  const filteredPosts = useMemo(() => {
    const hasTopicFilter = selectedTopics.length > 0;
    const hasLiveFilter = selectedLiveExp.length > 0 && !selectedLiveExp.includes('all');

    if (!hasTopicFilter && !hasLiveFilter) {
      return posts;
    }

    return posts.filter((post) => {
      const postCat = (post.category || '').toLowerCase();
      const postTitle = (post.title || '').toLowerCase();
      const postDesc = (post.description || '').toLowerCase();
      const postTags = (post.tags || []).map((t) => t.toLowerCase());

      const matchesTopic = !hasTopicFilter || selectedTopics.some((topic) => {
        const t = topic.toLowerCase();
        return (
          postCat.includes(t) ||
          postTags.some((tag) => tag.includes(t)) ||
          postTitle.includes(t) ||
          postDesc.includes(t) ||
          (t === 'entertainment' && (postCat.includes('culture') || postCat.includes('music') || postCat.includes('creative') || postCat.includes('art'))) ||
          (t === 'politics' && (postCat.includes('diplomacy') || postCat.includes('policy') || postCat.includes('politic') || postCat.includes('governance')))
        );
      });

      const matchesLive = !hasLiveFilter || selectedLiveExp.some((exp) => {
        const e = exp.toLowerCase();
        return (
          postCat.includes(e) ||
          postTags.some((tag) => tag.includes(e)) ||
          postTitle.includes(e) ||
          postDesc.includes(e) ||
          (e === 'marriage' && postCat.includes('relationship')) ||
          (e === 'relationship' && postCat.includes('marriage'))
        );
      });

      return matchesTopic && matchesLive;
    });
  }, [posts, selectedTopics, selectedLiveExp]);

  // Dynamic counts for each topic and live experience
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {
      health: 0,
      wealth: 0,
      politics: 0,
      entertainment: 0,
      all: posts.length,
      family: 0,
      business: 0,
      relationship: 0,
      marriage: 0,
    };

    posts.forEach((post) => {
      const cat = (post.category || '').toLowerCase();
      const title = (post.title || '').toLowerCase();
      const desc = (post.description || '').toLowerCase();
      const tags = (post.tags || []).map((t) => t.toLowerCase());

      const check = (keywords: string[]) =>
        keywords.some(
          (k) =>
            cat.includes(k) ||
            tags.some((t) => t.includes(k)) ||
            title.includes(k) ||
            desc.includes(k)
        );

      if (check(['health', 'vitality', 'wellness', 'nutrition'])) counts.health++;
      if (check(['wealth', 'finance', 'invest', 'equity', 'cashflow'])) counts.wealth++;
      if (check(['politic', 'diplomacy', 'governance', 'policy'])) counts.politics++;
      if (check(['entertain', 'culture', 'music', 'art', 'cinema', 'storytelling'])) counts.entertainment++;
      if (check(['family', 'parenting', 'household'])) counts.family++;
      if (check(['business', 'media', 'billboard', 'startup'])) counts.business++;
      if (check(['relationship', 'marriage', 'love', 'intimacy'])) {
        counts.relationship++;
        if (check(['marriage'])) counts.marriage++;
      }
    });

    return counts;
  }, [posts]);

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === 'podcast') {
      router.push('/audience?view=podcast', { scroll: false });
    } else if (menuId === 'trending') {
      router.push('/audience?view=trending', { scroll: false });
    } else if (menuId === 'memberships') {
      router.push('/audience?view=memberships', { scroll: false });
    } else if (menuId === 'bookmarks') {
      router.push('/audience?view=bookmarks', { scroll: false });
    } else if (menuId === 'subscriptions') {
      router.push('/audience?view=subscriptions', { scroll: false });
    } else if (menuId === 'live') {
      router.push('/audience?view=live', { scroll: false });
    } else if (menuId === 'live-detail') {
      router.push('/audience?view=live-detail', { scroll: false });
    } else if (menuId === 'chats' || menuId === 'messages') {
      router.push('/audience?view=chats', { scroll: false });
    } else if (menuId === 'notifications') {
      router.push('/audience?view=notifications', { scroll: false });
    } else if (menuId === 'profile') {
      router.push('/audience?view=profile', { scroll: false });
    } else if (menuId === 'creator-profile') {
      router.push('/audience?view=creator-profile', { scroll: false });
    } else if (menuId === 'podcast-player' || menuId === 'podcast-detail') {
      router.push('/audience?view=podcast-player', { scroll: false });
    } else if (menuId === 'edit-profile' || menuId === 'settings') {
      router.push('/audience?view=edit-profile', { scroll: false });
    } else if (menuId === 'login-history') {
      router.push('/audience?view=login-history', { scroll: false });
    } else if (menuId === 'change-password') {
      router.push('/audience?view=change-password', { scroll: false });
    }
  };

  const handleCreatePost = async (content: string) => {
    const authorName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'You';
    const authorRole = user?.role === 'screen_owner' 
      ? 'Media Partner' 
      : user?.role === 'admin' 
      ? 'Administrator' 
      : user?.role === 'creator'
      ? (user.creator_niche || 'Creator')
      : 'Studio Insider';
    const authorAvatar = user?.avatar || '';

    const tempPost: PostData = {
      id: `post-${Date.now()}`,
      author: {
        name: authorName,
        role: authorRole,
        avatar: authorAvatar,
      },
      title: content,
      mediaUrl: '',
      initialLikes: 0,
      initialComments: 0,
      badgeTheme: 'gold',
    };
    setPosts((prev) => [tempPost, ...prev]);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let createdPostId: string | null = null;

      // 1. Direct Next.js serverless route -> Supabase PostgreSQL
      try {
        const directRes = await fetch('/api/content', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: content,
            content_type: 'post',
            description: '',
            userId: user?.id,
          }),
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData?.post?.id) {
            createdPostId = String(directData.post.id);
          }
        }
      } catch {
        // Fallback to external API
      }

      // 2. Fallback to external backend API if needed
      if (!createdPostId) {
        const res = await api.post('/content', {
          title: content,
          contentType: 'post',
          description: '',
          userId: user?.id,
        });
        if (res.data?.post?.id) {
          createdPostId = String(res.data.post.id);
        }
      }

      if (createdPostId) {
        setPosts((prev) =>
          prev.map((p) => (p.id === tempPost.id ? { ...p, id: createdPostId! } : p))
        );
      }
    } catch (err) {
      console.warn('API post creation failed, kept local post:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F7F7] flex flex-col font-quicksand">
      {/* ─── Top Audience Navigation Bar (1440px x 76px) ─── */}
      <AudienceNavbar 
        activeNav={
          activeMenu === 'notifications'
            ? 'notifications'
            : activeMenu === 'chats' 
            ? 'messages' 
            : (activeMenu === 'profile' || activeMenu === 'creator-profile' || activeMenu === 'edit-profile' || activeMenu === 'settings')
            ? 'profile'
            : activeMenu === 'podcast' 
            ? 'home' 
            : (activeMenu === 'live' || activeMenu === 'live-detail') 
            ? 'video' 
            : null
        }
        onNavChange={(nav) => {
          if (nav === 'home') {
            handleMenuChange('podcast');
          } else if (nav === 'video') {
            handleMenuChange('live');
          } else if (nav === 'messages') {
            handleMenuChange('chats');
          } else if (nav === 'notifications') {
            handleMenuChange('notifications');
          } else if (nav === 'profile') {
            handleMenuChange('profile');
          }
        }}
      />

      {/* ─── Main Content Container matching Figma ─── */}
      <PageTransition className="flex-1 w-full flex flex-col">
        {activeMenu === 'notifications' ? (
          /* ─── Dedicated Notifications Screen (1440px x 1024px: Frame 2121459687) ─── */
          <main className="w-full">
            <AudienceNotificationsPageView />
          </main>
        ) : activeMenu === 'chats' ? (
          /* ─── Dedicated Chats Screen (1440px x 1024px: Visitors 278px + Chat 911px) ─── */
          <main className="w-full">
            <AudienceChatPageView />
          </main>
        ) : (activeMenu === 'get-verified' || activeMenu === 'verify') ? (
          /* ─── Dedicated Get Verified Pricing Screen (1366px x 1616px) ─── */
          <main className="w-full">
            <AudienceGetVerifiedView 
              onBackToProfile={() => handleMenuChange('creator-profile')}
            />
          </main>
        ) : (
          <main className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-4 lg:py-6 flex-1 w-full">
            <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start w-full">
              
              {/* 1. Left Sidebar Column (278px: Profile Card + Menu + Hashtags) */}
              <AudienceLeftSidebar 
                activeMenu={
                  activeMenu === 'live-detail' 
                    ? 'live' 
                    : (activeMenu === 'edit-profile' || activeMenu === 'settings') 
                    ? 'settings' 
                    : activeMenu
                }
                onMenuSelect={handleMenuChange}
                onTagSelect={(tag) => console.log('Filtered by hashtag:', tag)}
              />

            {/* 2. Main Content Area */}
            {activeMenu === 'edit-profile' || activeMenu === 'settings' ? (
              /* ─── Edit Profile / Settings View: Frame 2121459220 etc. (866px wide matching Figma) ─── */
              <div className="flex-1 w-full min-w-0 pb-16">
                <AudienceEditProfilePageView 
                  onBackToProfile={() => handleMenuChange('profile')} 
                  initialSubView={
                    queryView === 'login-history' 
                      ? 'login-history' 
                      : queryView === 'change-password' 
                      ? 'change-password' 
                      : 'profile'
                  }
                />
              </div>
            ) : activeMenu === 'podcast-player' ? (
              /* ─── Visitor's View of Creator Podcast Episode Player (530px player + 360px episodes card) ─── */
              <div className="flex-1 w-full min-w-0 pb-16">
                <AudiencePodcastPlayerView 
                  podcastTitle={searchParams.get('title') || 'Zara Design Concept Podcast'}
                  onBackToProfile={() => handleMenuChange('creator-profile')}
                />
              </div>
            ) : (activeMenu === 'profile' || activeMenu === 'creator-profile') ? (
              /* ─── Profile View: Frame 2121459585 (850px wide container matching Figma) ─── */
              <div className="flex-1 w-full min-w-0 pb-16">
                <AudienceProfilePageView 
                  isVisitor={activeMenu === 'creator-profile' || queryView === 'creator-profile' || queryView === 'creator' || queryView === 'visitor-profile' || searchParams.get('mode') === 'visitor'}
                  onEditProfileClick={() => handleMenuChange('edit-profile')} 
                />
              </div>
            ) : activeMenu === 'memberships' ? (
              /* ─── Memberships View: Row 1 (Post Composer + Premium Card) + Row 2 (Membership Card) ─── */
              <section className="flex-1 w-full min-w-0 flex flex-col gap-6 pb-16">
                {/* Row 1: Composer + Try Premium */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className="flex-1 min-w-0">
                    <AudiencePostComposer 
                      onPostSubmit={handleCreatePost}
                      onLiveExperienceClick={() => handleMenuChange('live')}
                    />
                  </div>
                  <AudiencePremiumCard className="w-full md:w-[280px] lg:w-[320px]" />
                </div>

                {/* Row 2: Membership Card */}
                <AudienceMembershipsCard />
              </section>
            ) : activeMenu === 'subscriptions' ? (
              /* ─── Subscriptions View ─── */
              <section className="flex-1 w-full min-w-0 flex flex-col gap-6 pb-16">
                <AudienceSubscriptionsCard />
              </section>
            ) : activeMenu === 'live-detail' ? (
              /* ─── Live Experience Detail Stream View ─── */
              <section className="flex-1 w-full min-w-0 flex flex-col gap-6 pb-16">
                <AudienceLiveEventDetail onClose={() => handleMenuChange('live')} />
              </section>
            ) : activeMenu === 'live' ? (
              /* ─── Live Experiences View ─── */
              <section className="flex-1 w-full min-w-0 flex flex-col gap-6 pb-16">
                <AudienceLiveExperiencesCard onJoinEvent={() => handleMenuChange('live-detail')} />
              </section>
            ) : (
              /* ─── Default Feed / Trending / Bookmarks 3-Column Layout ─── */
              <>
                {/* Middle Column: Write New Post + Feed Cards; composer omitted in bookmarks view */}
                <section className="flex-1 w-full min-w-0 flex flex-col gap-6 pb-20">
                  {activeMenu !== 'bookmarks' && (
                    <AudiencePostComposer 
                      onPostSubmit={handleCreatePost}
                      onLiveExperienceClick={() => handleMenuChange('live')}
                    />
                  )}

                  <div className="flex flex-col gap-6">
                    {isLoadingPosts ? (
                      <div className="flex flex-col gap-6 animate-pulse">
                        {[1, 2].map((i) => (
                          <div key={i} className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-neutral-200 shrink-0" />
                              <div className="flex flex-col gap-2 flex-1">
                                <div className="h-4 w-32 bg-neutral-200 rounded" />
                                <div className="h-3 w-20 bg-neutral-200 rounded" />
                              </div>
                            </div>
                            <div className="h-44 w-full bg-neutral-200 rounded-[12px]" />
                            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : filteredPosts.length === 0 ? (
                      <div className="bg-white rounded-[16px] p-12 text-center shadow-sm border border-gray-100/80 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                          <span className="text-2xl">
                            {posts.length === 0 ? '🎙️' : '🔍'}
                          </span>
                        </div>
                        <h4 className="text-[17px] font-semibold text-[#181818]">
                          {posts.length === 0 
                            ? (activeMenu === 'bookmarks'
                                ? 'No saved bookmarks yet'
                                : activeMenu === 'trending'
                                ? 'No trending podcasts right now'
                                : 'No podcasts published yet')
                            : 'No podcasts found matching this topic'}
                        </h4>
                        <p className="text-[13px] text-[#181818]/60 max-w-[340px] mt-1.5 leading-relaxed">
                          {posts.length === 0 
                            ? (activeMenu === 'bookmarks'
                                ? 'Click the bookmark icon on any podcast card in the feed to save episodes here for later listening.'
                                : activeMenu === 'trending'
                                ? 'Trending audio content will appear here as listeners tune in and engage.'
                                : 'Be the first to share an audio experience with your community!')
                            : 'Try selecting another genre or click below to reset your filters and see all podcasts.'}
                        </p>
                        {posts.length > 0 && (selectedTopics.length > 0 || (selectedLiveExp.length > 0 && !selectedLiveExp.includes('all'))) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopics([]);
                              setSelectedLiveExp([]);
                            }}
                            className="mt-4 px-4 py-2 bg-[#D4AF37] hover:bg-[#b89528] text-white rounded-full text-[13px] font-semibold shadow-sm transition-all cursor-pointer"
                          >
                            View All Podcasts
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <AudiencePostCard key={post.id} post={post} />
                      ))
                    )}
                  </div>
                </section>

                {/* Right Column (278px: Try Premium + Feed, Trending, or Bookmarks CHATS + Messages) */}
                <AudienceRightSidebar 
                  view={activeMenu === 'bookmarks' ? 'bookmarks' : activeMenu === 'podcast' ? 'feed' : 'trending'}
                  selectedTopics={selectedTopics}
                  selectedLiveExp={selectedLiveExp}
                  topicCounts={topicCounts}
                  onFilterChange={(topics, liveExp) => {
                    setSelectedTopics(topics);
                    setSelectedLiveExp(liveExp);
                  }}
                  onClearFilters={() => {
                    setSelectedTopics([]);
                    setSelectedLiveExp([]);
                  }}
                />
              </>
            )}

          </div>
        </main>
      )}
    </PageTransition>
    </div>
  );
}

export default function AudienceHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F7]" />}>
      <AudienceContent />
    </Suspense>
  );
}
