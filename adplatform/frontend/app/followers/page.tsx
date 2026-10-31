'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { theme } from '@/lib/theme';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FollowersPage() {
  const [tab, setTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, ingRes] = await Promise.all([
        api.get('/follows/followers'),
        api.get('/follows/following')
      ]);
      setFollowers(fRes.data?.followers || []);
      setFollowing(ingRes.data?.following || []);
    } catch (err) {
      console.error('Failed to load followers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFollowToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      if (isCurrentlyFollowing) {
        await api.delete(`/follows/${userId}`);
        toast('Unfollowed', 'info');
      } else {
        await api.post(`/follows/${userId}`);
        toast('Followed successfully', 'success');
      }
      await loadData();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not update follow status', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const newFollowers = followers.filter(f => f.isNew);
  const existingFollowers = followers.filter(f => !f.isNew);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="w-full max-w-[850px] mx-auto pt-[40px] pb-[100px] font-sans px-4">
          <div className="flex items-center justify-between mb-[30px]">
            <h1 className="text-[20px] font-bold text-[#181818] dark:text-white" style={{ fontFamily: 'var(--font-quicksand)' }}>
              Community & Network
            </h1>
            <span className="text-[13px] text-gray-500 dark:text-neutral-400">
              {followers.length} Followers · {following.length} Following
            </span>
          </div>

          {/* Tabs Area */}
          <div className="flex w-full relative h-[50px] items-end" style={{ fontFamily: 'var(--font-quicksand)' }}>
            <button 
              onClick={() => setTab('followers')}
              className={`w-[240px] uppercase text-[12px] font-bold flex items-center justify-center transition-all cursor-pointer ${tab === 'followers' ? 'h-[50px] bg-[#D4AF37] rounded-t-[8px] text-[#000000]' : 'h-[40px] bg-white dark:bg-[#111111] border border-[#E7E7E7] dark:border-white/10 text-[#181818] dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              Followers ({followers.length})
            </button>
            <button 
              onClick={() => setTab('following')}
              className={`w-[240px] uppercase text-[12px] font-bold flex items-center justify-center transition-all cursor-pointer ${tab === 'following' ? 'h-[50px] bg-[#D4AF37] rounded-t-[8px] text-[#000000]' : 'h-[40px] bg-white dark:bg-[#111111] border border-[#E7E7E7] dark:border-white/10 text-[#181818] dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              Following ({following.length})
            </button>
          </div>

          {/* Border Under Tabs */}
          <div className="w-full h-[1px] bg-[#E7E7E7] dark:bg-white/10 mb-6"></div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
              <span className="text-[14px]">Loading community...</span>
            </div>
          ) : tab === 'followers' ? (
            <div style={{ fontFamily: 'var(--font-quicksand)' }}>
              {followers.length === 0 ? (
                <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-[16px] p-12 text-center flex flex-col items-center justify-center max-w-[500px] mx-auto my-8 bg-white dark:bg-[#111111]">
                  <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                    <Users size={26} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1C1C1C] dark:text-white mb-1">No followers yet</h3>
                  <p className="text-[13px] text-gray-500 dark:text-neutral-400 mb-5 max-w-[340px]">
                    When other creators, advertisers, or screen owners follow your profile, they will appear here.
                  </p>
                  <Link
                    href="/audience"
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-semibold text-[13px] rounded-[8px] text-decoration-none transition-colors"
                  >
                    Explore Community
                  </Link>
                </div>
              ) : (
                <>
                  {/* New Followers Section if any */}
                  {newFollowers.length > 0 && (
                    <>
                      <div className="flex items-center gap-[16px] my-[24px]">
                        <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                        <span className="text-[12px] uppercase text-[#181818] font-bold tracking-wide">
                          YOU HAVE <span className="text-[#D4AF37]">{newFollowers.length} NEW FOLLOWER{newFollowers.length === 1 ? '' : 'S'}</span>
                        </span>
                        <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                      </div>

                      <div className="flex flex-col gap-[16px] mb-8">
                        {newFollowers.map((user) => (
                          <div key={user.id} className="w-full min-h-[90px] bg-white dark:bg-[#111111] rounded-[12px] border border-gray-100 dark:border-white/10 shadow-sm flex items-center px-[24px] py-[16px] justify-between">
                            <div className="flex items-center">
                              <div className="w-[50px] h-[50px] rounded-full bg-amber-100 dark:bg-amber-500/20 text-[#D4AF37] font-bold flex items-center justify-center text-[18px] flex-shrink-0 overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name?.[0] || 'U'
                                )}
                              </div>
                              <div className="ml-[16px] flex flex-col">
                                <span className="text-[15px] font-bold text-[#181818] dark:text-white">{user.name}</span>
                                <span className="text-[12px] text-gray-500 dark:text-neutral-400 mt-[1px]">{user.roleLabel || user.role || 'Member'}</span>
                                <span className="text-[11px] text-[#15411F] dark:text-emerald-400 mt-[2px] font-medium">{user.followerCount} followers</span>
                              </div>
                            </div>

                            <button 
                              disabled={actionLoading[user.id]}
                              onClick={() => handleFollowToggle(user.id, user.iFollowBack)}
                              className={`px-4 h-[34px] rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer ${user.iFollowBack ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#D4AF37] text-black hover:bg-[#c9a32c]'}`}
                            >
                              {actionLoading[user.id] ? <Loader2 size={14} className="animate-spin" /> : user.iFollowBack ? 'Following' : 'Follow Back'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* All Followers Divider */}
                  <div className="flex items-center gap-[16px] my-[24px]">
                    <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                    <span className="text-[12px] uppercase text-[#181818] font-bold tracking-wide">ALL FOLLOWERS</span>
                    <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                  </div>

                  {/* Followers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followers.map((user) => (
                      <div key={user.id} className="w-full min-h-[85px] bg-white rounded-[12px] border border-gray-100 shadow-sm flex items-center justify-between px-[20px] py-[14px]">
                        <div className="flex items-center min-w-0">
                          <div className="w-[46px] h-[46px] rounded-full bg-amber-50 text-[#D4AF37] font-bold flex items-center justify-center text-[16px] flex-shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name?.[0] || 'U'
                            )}
                          </div>
                          <div className="ml-[14px] flex flex-col min-w-0">
                            <span className="text-[14px] font-bold text-[#181818] truncate">{user.name}</span>
                            <span className="text-[11px] text-gray-500 truncate">{user.roleLabel || user.role || 'Member'}</span>
                          </div>
                        </div>

                        <button 
                          disabled={actionLoading[user.id]}
                          onClick={() => handleFollowToggle(user.id, user.iFollowBack)}
                          className={`px-3.5 h-[32px] rounded-[6px] text-[11px] font-bold transition-colors cursor-pointer flex-shrink-0 ml-3 ${user.iFollowBack ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#D4AF37] text-black hover:bg-[#c9a32c]'}`}
                        >
                          {actionLoading[user.id] ? <Loader2 size={12} className="animate-spin" /> : user.iFollowBack ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Following Tab */
            <div style={{ fontFamily: 'var(--font-quicksand)' }}>
              {following.length === 0 ? (
                <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-[16px] p-12 text-center flex flex-col items-center justify-center max-w-[500px] mx-auto my-8 bg-white dark:bg-[#111111]">
                  <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                    <UserPlus size={26} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1C1C1C] dark:text-white mb-1">Not following anyone yet</h3>
                  <p className="text-[13px] text-gray-500 dark:text-neutral-400 mb-5 max-w-[340px]">
                    Discover top creators, podcast hosts, and billboard owners in the community.
                  </p>
                  <Link
                    href="/audience"
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b58b24] text-black font-semibold text-[13px] rounded-[8px] text-decoration-none transition-colors"
                  >
                    Explore Creators
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {following.map((user) => (
                    <div key={user.id} className="w-full min-h-[85px] bg-white dark:bg-[#111111] rounded-[12px] border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-between px-[20px] py-[14px]">
                      <div className="flex items-center min-w-0">
                        <div className="w-[46px] h-[46px] rounded-full bg-amber-50 dark:bg-amber-500/20 text-[#D4AF37] font-bold flex items-center justify-center text-[16px] flex-shrink-0 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.[0] || 'U'
                          )}
                        </div>
                        <div className="ml-[14px] flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-[#181818] dark:text-white truncate">{user.name}</span>
                          <span className="text-[11px] text-gray-500 dark:text-neutral-400 truncate">{user.roleLabel || user.role || 'Member'}</span>
                        </div>
                      </div>

                      <button 
                        disabled={actionLoading[user.id]}
                        onClick={() => handleFollowToggle(user.id, true)}
                        className="px-3.5 h-[32px] rounded-[6px] text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer flex-shrink-0 ml-3"
                      >
                        {actionLoading[user.id] ? <Loader2 size={12} className="animate-spin" /> : 'Unfollow'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
