'use client';

import { useState, useEffect, Suspense } from 'react';
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
import AudiencePremiumCard from '@/components/audience/AudiencePremiumCard';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const FIGMA_PODCAST_FEED_POSTS: PostData[] = [
  {
    id: 'post-feed-1',
    author: {
      name: 'Adam Udochi',
      role: 'UI/UX Designer',
      avatar: '/audience/adam-udochi.png',
    },
    title: '-Healthy Tracking podcast',
    mediaUrl: '/audience/mockup-sphinx.png',
    duration: '02:35:19',
    currentTime: '00:04:15',
    progressPercent: 30,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'gold',
  },
  {
    id: 'post-feed-2',
    author: {
      name: 'Nermmen Saif',
      role: 'Designer creator',
      avatar: '/audience/nermmen-saif.png',
    },
    title: '-Photo is perfect podcast',
    mediaUrl: '/audience/plant-podcast.png',
    duration: '01:42:00',
    currentTime: '00:12:30',
    progressPercent: 35,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'green',
  },
];

const FIGMA_TRENDING_POSTS: PostData[] = [
  {
    id: 'post-trending-1',
    author: {
      name: 'Adam Udochi',
      role: 'UI/UX Designer',
      avatar: '/audience/adam-udochi.png',
    },
    title: '-Wealth servicing podcast',
    mediaUrl: '/audience/mockup-sphinx.png',
    duration: '02:35:19',
    currentTime: '00:04:15',
    progressPercent: 30,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'gold',
  },
  {
    id: 'post-trending-2',
    author: {
      name: 'Nermmen Saif',
      role: 'Designer creator',
      avatar: '/audience/nermmen-saif.png',
    },
    title: '-Trick to wealth creation podcast',
    mediaUrl: '/audience/plant-podcast.png',
    duration: '01:42:00',
    currentTime: '00:12:30',
    progressPercent: 35,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'green',
  },
];

const FIGMA_BOOKMARKS_POSTS: PostData[] = [
  {
    id: 'post-bm-1',
    author: {
      name: 'Adam Udochi',
      role: 'UI/UX Designer',
      avatar: '/audience/adam-udochi.png',
    },
    title: '-Healthy Tracking podcast',
    mediaUrl: '/audience/mockup-sphinx.png',
    duration: '02:35:19',
    currentTime: '00:04:15',
    progressPercent: 30,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'gold',
    isBookmarked: true,
  },
  {
    id: 'post-bm-2',
    author: {
      name: 'Nermmen Saif',
      role: 'Designer creator',
      avatar: '/audience/nermmen-saif.png',
    },
    title: '-Photo is perfect podcast',
    mediaUrl: '/audience/plant-podcast.png',
    duration: '01:42:00',
    currentTime: '00:12:30',
    progressPercent: 35,
    initialLikes: 99,
    initialComments: 8,
    badgeTheme: 'green',
    isBookmarked: true,
  },
];

function AudienceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryView = searchParams.get('view');

  const { user } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<'podcast' | 'trending' | 'memberships' | 'bookmarks' | 'subscriptions' | 'live' | 'live-detail' | string>(() => {
    if (queryView === 'live-detail') return 'live-detail';
    if (queryView === 'live') return 'live';
    if (queryView === 'subscriptions') return 'subscriptions';
    if (queryView === 'bookmarks') return 'bookmarks';
    if (queryView === 'memberships') return 'memberships';
    if (queryView === 'podcast' || queryView === 'feed') return 'podcast';
    return 'trending';
  });

  const getBasePosts = (menu: string) => {
    if (menu === 'bookmarks') return FIGMA_BOOKMARKS_POSTS;
    if (menu === 'podcast') return FIGMA_PODCAST_FEED_POSTS;
    return FIGMA_TRENDING_POSTS;
  };

  const [posts, setPosts] = useState<PostData[]>(() => getBasePosts(activeMenu));

  // Sync menu state when URL query changes
  useEffect(() => {
    if (queryView === 'live-detail') {
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
  }, [queryView]);

  // Update posts when view toggles
  useEffect(() => {
    setPosts(getBasePosts(activeMenu));
  }, [activeMenu]);

  // Enrich with backend podcasts if available
  useEffect(() => {
    api.get('/podcasts/shows')
      .then((res) => {
        const publishedShows = res.data?.shows || [];
        if (publishedShows.length > 0) {
          const currentBase = getBasePosts(activeMenu);
          const mappedShows: PostData[] = publishedShows.map((s: any, idx: number) => ({
            id: s.id,
            author: {
              name: s.creator_name || 'Studio Arella Creator',
              role: 'Podcast Host',
              avatar: s.avatar || (idx % 2 === 0 ? '/audience/adam-udochi.png' : '/audience/nermmen-saif.png'),
            },
            title: `-${s.title}`,
            mediaUrl: s.cover_url || (idx % 2 === 0 ? '/audience/mockup-sphinx.png' : '/audience/plant-podcast.png'),
            duration: '01:15:00',
            currentTime: '00:00:00',
            progressPercent: 10,
            initialLikes: 45,
            initialComments: 3,
            badgeTheme: idx % 2 === 0 ? 'gold' : 'green',
            isBookmarked: activeMenu === 'bookmarks',
          }));

          setPosts([...currentBase, ...mappedShows]);
        }
      })
      .catch(() => {
        // Fall back gracefully to mock Figma posts
      });
  }, [activeMenu]);

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
    }
  };

  const handleCreatePost = (content: string) => {
    const newPost: PostData = {
      id: `custom-${Date.now()}`,
      author: {
        name: user?.name || 'Adam Udochi',
        role: user?.role === 'creator' ? 'Creator' : 'UI/UX Designer',
        avatar: user?.avatar || '/audience/adam-udochi.png',
      },
      title: `-${content}`,
      mediaUrl: '/audience/mockup-sphinx.png',
      duration: '00:45:00',
      currentTime: '00:00:00',
      progressPercent: 5,
      initialLikes: 1,
      initialComments: 0,
      badgeTheme: 'gold',
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-['DM_Sans',sans-serif]">
      {/* ─── Top Audience Navigation Bar (1440px x 76px) ─── */}
      <AudienceNavbar 
        activeNav={activeMenu === 'podcast' ? 'home' : (activeMenu === 'live' || activeMenu === 'live-detail') ? 'video' : null}
        onNavChange={(nav) => {
          if (nav === 'home') {
            handleMenuChange('podcast');
          } else if (nav === 'video') {
            handleMenuChange('live');
          }
        }}
      />

      {/* ─── Main Content Container matching Figma ─── */}
      <PageTransition>
        <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
            
            {/* 1. Left Sidebar Column (278px: Profile Card + Menu + Hashtags) */}
            <AudienceLeftSidebar 
              activeMenu={activeMenu === 'live-detail' ? 'live' : activeMenu}
              onMenuSelect={handleMenuChange}
              onTagSelect={(tag) => console.log('Filtered by hashtag:', tag)}
            />

            {/* 2. Main Content Area */}
            {activeMenu === 'memberships' ? (
              /* ─── Memberships View: Row 1 (Post Composer + Premium Card) + Row 2 (862px Membership Card) ─── */
              <section className="w-full lg:w-[862px] flex flex-col gap-6">
                {/* Row 1: Composer (570px) + Try Premium (278px) */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className="flex-1 max-w-[570px]">
                    <AudiencePostComposer 
                      onPostSubmit={handleCreatePost}
                      onLiveExperienceClick={() => handleMenuChange('live')}
                    />
                  </div>
                  <AudiencePremiumCard />
                </div>

                {/* Row 2: Membership Card (862px wide) */}
                <AudienceMembershipsCard />
              </section>
            ) : activeMenu === 'subscriptions' ? (
              /* ─── Subscriptions View: Frame 2121459680 (862px wide directly at top) ─── */
              <section className="w-full lg:w-[862px] flex flex-col gap-6">
                <AudienceSubscriptionsCard />
              </section>
            ) : activeMenu === 'live-detail' ? (
              /* ─── Live Experience Detail Stream View: Frame 2121459695 (958px wide) ─── */
              <section className="w-full lg:w-[958px] flex flex-col gap-6">
                <AudienceLiveEventDetail onClose={() => handleMenuChange('live')} />
              </section>
            ) : activeMenu === 'live' ? (
              /* ─── Live Experiences View: Frame 2121459680 (862px wide directly at top) ─── */
              <section className="w-full lg:w-[862px] flex flex-col gap-6">
                <AudienceLiveExperiencesCard onJoinEvent={() => handleMenuChange('live-detail')} />
              </section>
            ) : (
              /* ─── Default Feed / Trending / Bookmarks 3-Column Layout ─── */
              <>
                {/* Middle Column (570px: Write New Post + Feed Cards; composer omitted in bookmarks view) */}
                <section className="w-full lg:w-[570px] flex-1 max-w-[570px] flex flex-col gap-6">
                  {activeMenu !== 'bookmarks' && (
                    <AudiencePostComposer 
                      onPostSubmit={handleCreatePost}
                      onLiveExperienceClick={() => handleMenuChange('live')}
                    />
                  )}

                  <div className="flex flex-col gap-6">
                    {posts.map((post) => (
                      <AudiencePostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>

                {/* Right Column (278px: Try Premium + Feed, Trending, or Bookmarks CHATS + Messages) */}
                <AudienceRightSidebar 
                  view={activeMenu === 'bookmarks' ? 'bookmarks' : activeMenu === 'podcast' ? 'feed' : 'trending'}
                />
              </>
            )}

          </div>
        </main>
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
