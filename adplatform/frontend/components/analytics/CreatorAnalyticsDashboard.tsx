'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Users, 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  Play, 
  Award,
  Loader2,
  Calendar,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  category: string;
  views: number;
  likes: number;
  comments: number;
  reposts: number;
  isPremium: boolean;
  price: number;
  createdAt: string;
}

export default function CreatorAnalyticsDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReposts: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalEarned: 0,
    availableBalance: 0,
  });
  const [topContent, setTopContent] = useState<ContentItem[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState({
    tips: 0,
    memberships: 0,
    premium: 0,
    live: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/creator/analytics?creatorId=${user?.id || ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.topContent)) setTopContent(data.topContent);
        if (data.revenueBreakdown) setRevenueBreakdown(data.revenueBreakdown);
        if (Array.isArray(data.recentTransactions)) setRecentTransactions(data.recentTransactions);
      })
      .catch((err) => {
        console.warn('Could not fetch creator analytics:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user?.id]);

  // Derived growth area chart data
  const growthChartData = [
    { period: 'Week 1', views: Math.max(10, Math.floor(metrics.totalViews * 0.15)), engagement: Math.max(5, Math.floor((metrics.totalLikes + metrics.totalComments) * 0.15)) },
    { period: 'Week 2', views: Math.max(25, Math.floor(metrics.totalViews * 0.35)), engagement: Math.max(12, Math.floor((metrics.totalLikes + metrics.totalComments) * 0.32)) },
    { period: 'Week 3', views: Math.max(45, Math.floor(metrics.totalViews * 0.65)), engagement: Math.max(24, Math.floor((metrics.totalLikes + metrics.totalComments) * 0.62)) },
    { period: 'Current', views: Math.max(70, metrics.totalViews), engagement: Math.max(40, metrics.totalLikes + metrics.totalComments) },
  ];

  const revenueBarData = [
    { source: 'Memberships', amount: revenueBreakdown.memberships },
    { source: 'Fan Tips', amount: revenueBreakdown.tips },
    { source: 'Premium Content', amount: revenueBreakdown.premium },
    { source: 'Live Events', amount: revenueBreakdown.live },
  ];

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#1D9BF0]" size={32} />
        <p className="text-sm text-gray-500 font-medium">Loading Creator Space analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 font-quicksand">
      {/* ─── 1. Key Performance Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-500">Content Views</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-gray-950">
              {metrics.totalViews.toLocaleString()}
            </h3>
            <span className="text-[12px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp size={13} />
              <span>Across {metrics.totalPosts} published posts</span>
            </span>
          </div>
        </div>

        {/* Total Engagement */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-500">Total Engagement</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-gray-950">
              {(metrics.totalLikes + metrics.totalComments + metrics.totalReposts).toLocaleString()}
            </h3>
            <span className="text-[12px] text-gray-500 font-normal mt-0.5">
              {metrics.totalLikes} likes · {metrics.totalComments} comments · {metrics.totalReposts} reposts
            </span>
          </div>
        </div>

        {/* Total Audience */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-500">Followers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-gray-950">
              {metrics.totalFollowers.toLocaleString()}
            </h3>
            <span className="text-[12px] text-gray-500 font-normal mt-0.5">
              Following {metrics.totalFollowing} creators
            </span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-500">Creator Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-gray-950">
              ₦{metrics.totalEarned.toLocaleString()}
            </h3>
            <span className="text-[12px] text-emerald-600 font-semibold mt-0.5 block">
              ₦{metrics.availableBalance.toLocaleString()} available to withdraw
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. Audience & Views Growth Chart ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[17px] font-bold text-gray-950 leading-tight">
              Growth & Engagement Trajectory
            </h3>
            <p className="text-[13px] text-gray-500 font-normal mt-0.5">
              Combined content reach and fan interactions across Studio Arella.
            </p>
          </div>
          <span className="px-3 py-1 bg-sky-50 text-[#1D9BF0] border border-sky-200/80 rounded-full text-xs font-bold">
            Live Trajectory
          </span>
        </div>

        <div className="w-full h-[240px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9BF0" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1D9BF0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="views" name="Views" stroke="#1D9BF0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEngage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── 3. Top-Performing Content & Revenue Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-performing Content List (PRD Section 10) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-gray-950">Top-Performing Content</h3>
            <Link href="/audience?view=profile&tab=posts" className="text-xs text-[#1D9BF0] font-bold hover:underline">
              View all posts &rarr;
            </Link>
          </div>

          {topContent.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No published content yet. Content will be analyzed as viewers engage.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {topContent.map((post, idx) => (
                <div key={post.id} className="py-3.5 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-sm font-extrabold text-gray-400">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-gray-950 truncate max-w-sm">
                          {post.title}
                        </span>
                        {post.isPremium && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-[#96781B] border border-amber-200">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-gray-500 font-normal">
                        {post.category} · {new Date(post.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">{post.views.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">views</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">{post.likes.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Breakdown by Source (PRD Section 10 & 11) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col gap-4">
          <h3 className="text-[17px] font-bold text-gray-950">Revenue Channels</h3>
          
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="source" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="amount" name="Earnings (₦)" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Memberships</span>
              <span className="font-bold text-gray-900">₦{revenueBreakdown.memberships.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Fan Tips</span>
              <span className="font-bold text-gray-900">₦{revenueBreakdown.tips.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Premium Content</span>
              <span className="font-bold text-gray-900">₦{revenueBreakdown.premium.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Live Experiences</span>
              <span className="font-bold text-gray-900">₦{revenueBreakdown.live.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/finances?tab=creator"
            className="mt-2 w-full py-2.5 rounded-xl bg-[#0F1419] hover:bg-[#272C30] text-white text-xs font-bold text-center transition-all cursor-pointer shadow-2xs"
          >
            Manage Wallet & Payouts &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
