'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/ui/Animations';
import AudienceNavbar from '@/components/audience/AudienceNavbar';
import AudienceLeftSidebar from '@/components/audience/AudienceLeftSidebar';
import AudienceRightSidebar from '@/components/audience/AudienceRightSidebar';
import AudiencePostComposer from '@/components/audience/AudiencePostComposer';
import AudiencePostCard, { PostData } from '@/components/audience/AudiencePostCard';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const DEFAULT_POSTS: PostData[] = [
  {
    id: 'post-1',
    author: {
      name: 'Adam Udochi',
      role: 'UI/UX Designer',
      avatar: '/audience/adam-udochi.png',
    },
    title: '-Healthy Tracking podcast',
    mediaUrl: '/audience/mockup-sphinx.png',
    duration: '02:35:19',
    currentTime: '00:04:15',
    progressPercent: 28,
    initialLikes: 99,
    initialComments: 8,
  },
  {
    id: 'post-2',
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
    initialLikes: 112,
    initialComments: 14,
  },
];

export default function AudienceHomePage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<PostData[]>(DEFAULT_POSTS);
  const [activeMenu, setActiveMenu] = useState('podcast');

  useEffect(() => {
    // Attempt to load published podcasts from the backend to enrich the feed
    api.get('/podcasts/shows')
      .then((res) => {
        const publishedShows = res.data?.shows || [];
        if (publishedShows.length > 0) {
          const mappedShows: PostData[] = publishedShows.map((s: any) => ({
            id: s.id,
            author: {
              name: s.creator_name || 'Studio Arella Creator',
              role: 'Podcast Host',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
            },
            title: `-${s.title}`,
            mediaUrl: s.cover_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop',
            duration: '01:15:00',
            currentTime: '00:00:00',
            progressPercent: 10,
            initialLikes: 45,
            initialComments: 3,
          }));

          // Merge with default feed items
          setPosts([...mappedShows, ...DEFAULT_POSTS]);
        }
      })
      .catch(() => {
        // Retain default polished posts on error or offline
      });
  }, []);

  const handleCreatePost = (content: string) => {
    const newPost: PostData = {
      id: `custom-${Date.now()}`,
      author: {
        name: user?.name || 'Adam Udochi',
        role: user?.role === 'creator' ? 'Creator' : 'UI/UX Designer',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      },
      title: `-${content}`,
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
      duration: '00:45:00',
      currentTime: '00:00:00',
      progressPercent: 5,
      initialLikes: 1,
      initialComments: 0,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-body">
      {/* ─── Top Audience Navigation Bar ─── */}
      <AudienceNavbar activeNav="home" />

      {/* ─── Main Content Container (3-Column Layout) ─── */}
      <PageTransition>
        <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
            
            {/* 1. Left Sidebar Column (278px) */}
            <AudienceLeftSidebar 
              activeMenu={activeMenu}
              onMenuSelect={(menuId) => setActiveMenu(menuId)}
              onTagSelect={(tag) => console.log('Filtered by hashtag:', tag)}
            />

            {/* 2. Middle Main Column (570px) */}
            <section className="w-full lg:w-[570px] flex-1 max-w-[570px] flex flex-col gap-6">
              {/* Write New Post Box */}
              <AudiencePostComposer 
                onPostSubmit={handleCreatePost}
                onLiveExperienceClick={() => alert('Starting live experience session...')}
              />

              {/* Feed Posts */}
              <div className="flex flex-col gap-6">
                {posts.map((post) => (
                  <AudiencePostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* 3. Right Sidebar Column (278px) */}
            <AudienceRightSidebar />

          </div>
        </main>
      </PageTransition>
    </div>
  );
}
