'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Search, MoreVertical, Globe, Share2, Heart, Clock } from 'lucide-react';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

const F = theme.font.body;

// Chart Data for timeframe
const CHART_DATA_YEAR = [
  { name: 'Jan', plays: 10, listeners: 8 },
  { name: 'Feb', plays: 20, listeners: 15 },
  { name: 'Mar', plays: 15, listeners: 12 },
  { name: 'Apr', plays: 45, listeners: 35 },
  { name: 'May', plays: 30, listeners: 25 },
  { name: 'Jun', plays: 35, listeners: 30 },
  { name: 'Jul', plays: 40, listeners: 38 },
  { name: 'Aug', plays: 50, listeners: 45 },
  { name: 'Sep', plays: 45, listeners: 40 },
  { name: 'Oct', plays: 60, listeners: 55 },
  { name: 'Nov', plays: 65, listeners: 60 },
  { name: 'Dec', plays: 70, listeners: 65 },
];

const CHART_DATA_MONTH = [
  { name: 'W1', plays: 12, listeners: 9 },
  { name: 'W2', plays: 18, listeners: 14 },
  { name: 'W3', plays: 22, listeners: 17 },
  { name: 'W4', plays: 28, listeners: 22 },
];

const PODCAST_DB: Record<string, { title: string; category: string; host: string }> = {
  '1': { title: 'Undressed', category: 'Personal Growth', host: 'Studio Arella' },
  '2': { title: 'Weak in Your Light', category: 'Leadership', host: 'Studio Arella' },
  '3': { title: 'Sober Reflection', category: 'Mindfulness', host: 'Studio Arella' },
  '4': { title: 'Father And Son', category: 'Family', host: 'Studio Arella' },
  '5': { title: 'Business On', category: 'Business', host: 'Studio Arella' },
};

const TOP_PERFORMING = [
  { title: 'Family life podcast', listeners: '2M active listeners', img: 'https://i.pravatar.cc/100?img=1' },
  { title: 'Growth Lab podcast', listeners: '24 active listeners', img: 'https://i.pravatar.cc/100?img=2' },
  { title: 'Growth Lab', listeners: '34 active listeners', img: 'https://i.pravatar.cc/100?img=3' },
  { title: 'Positioning podcast', listeners: '500k active listeners', img: 'https://i.pravatar.cc/100?img=4' },
  { title: 'Business On', listeners: '200k active listeners', img: 'https://i.pravatar.cc/100?img=5' },
];

const CALENDAR_EVENTS = [
  { title: 'Podcast session', time: '16:00', border: '#10B981' },
  { title: 'Podcast booking', time: '14:00', border: '#F59E0B' },
  { title: 'Podcast booking', time: '13:00', border: '#3B82F6' },
];

export default function PodcastDetailPage({ params }: { params: { id: string } }) {
  const podcast = PODCAST_DB[params.id] || { title: 'Undressed', category: 'Creative Audio', host: 'Studio Arella' };
  
  const [timeframe, setTimeframe] = useState<'Year' | 'Month'>('Year');
  const [playingEpId, setPlayingEpId] = useState<number | null>(null);
  const [searchEpisode, setSearchEpisode] = useState('');

  const [episodes, setEpisodes] = useState([
    { id: 1, title: `${podcast.title} - Episode 3: Navigating Turning Points`, date: 'August 17, 2026', duration: '2 min 22 sec', likes: '2.4K', plays: '18.2K', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=120&q=80' },
    { id: 2, title: `${podcast.title} - Episode 2: The Creative Process Unpacked`, date: 'August 13, 2026', duration: '4 min 15 sec', likes: '1.9K', plays: '14.5K', img: 'https://images.unsplash.com/photo-1516280440502-628d02166668?w=120&q=80' },
    { id: 3, title: `${podcast.title} - Episode 1: Pilot & Introductions`, date: 'August 10, 2026', duration: '3 min 40 sec', likes: '3.1K', plays: '25.0K', img: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=120&q=80' },
  ]);

  const filteredEpisodes = episodes.filter(e => 
    e.title.toLowerCase().includes(searchEpisode.toLowerCase())
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-lg text-[11px] font-bold">
          <p className="text-slate-500 mb-1">{label}</p>
          <p className="text-[#C69A2C]">Plays: {payload[0]?.value}K</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F }} className="flex flex-col lg:flex-row gap-8 p-6 sm:p-10 max-w-[1360px] mx-auto items-start relative">
          
          {/* ─── LEFT COLUMN (Main Content) ─── */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link 
                  href="/podcast" 
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-bold text-[13px] transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </Link>
                <div className="w-px h-4 bg-slate-200" />
                <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                  {podcast.title} podcast
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <span>Today</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Active Listeners', value: '3,015', trend: '+11.01%', up: true },
                { label: 'Total Plays', value: '3,671', trend: '-0.03%', up: false },
                { label: 'Followers', value: '3,671', trend: '+15.03%', up: true },
                { label: 'Total Likes', value: '367', trend: '+5.20%', up: true },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-[18px] p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <p className="text-[12.5px] font-bold text-slate-500 mb-3">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-[24px] font-black text-slate-900 leading-none">{stat.value}</span>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {stat.trend} {stat.up ? <FaArrowTrendUp size={9} /> : <FaArrowTrendDown size={9} />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Chart */}
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-slate-100 shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">Recent analytics</h3>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C69A2C]" />
                      <span>Total Plays</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>Active Listeners</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button 
                    onClick={() => setTimeframe('Year')} 
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${timeframe === 'Year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Year
                  </button>
                  <button 
                    onClick={() => setTimeframe('Month')} 
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${timeframe === 'Month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeframe === 'Year' ? CHART_DATA_YEAR : CHART_DATA_MONTH} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPlaysPodcast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C69A2C" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#C69A2C" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}K` : '0'} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="plays" stroke="#C69A2C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlaysPodcast)" activeDot={{ r: 5, fill: '#C69A2C', stroke: '#FFF', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Episodes List Section */}
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-slate-100 shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    All episodes ({filteredEpisodes.length})
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Audio episodes and listener analytics
                  </p>
                </div>

                <div className="relative w-full sm:w-[240px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search episode..."
                    value={searchEpisode}
                    onChange={(e) => setSearchEpisode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[12px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#C69A2C] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {filteredEpisodes.map((ep) => {
                  const isPlaying = playingEpId === ep.id;
                  return (
                    <div 
                      key={ep.id} 
                      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-[16px] border border-slate-100 hover:border-[#C69A2C]/40 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Artwork & Play Button Overlay */}
                        <div className="relative w-12 h-12 rounded-[10px] overflow-hidden bg-slate-100 flex-shrink-0 group">
                          <img src={ep.img} alt={ep.title} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPlayingEpId(isPlaying ? null : ep.id)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity"
                          >
                            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                          </button>
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="text-[13.5px] font-bold text-slate-900 truncate group-hover:text-[#C69A2C] transition-colors">
                            {ep.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" />
                              {ep.duration}
                            </span>
                            <span>•</span>
                            <span>{ep.date}</span>
                            <span>•</span>
                            <span className="text-[#C69A2C] font-bold">{ep.plays} plays</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600 font-semibold">
                              <Heart size={11} className="text-rose-400 fill-rose-400" />
                              {ep.likes}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/podcast/${params.id}/episode/new`}
                          className="text-[12px] font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="w-full lg:w-[320px] flex flex-col gap-7 flex-shrink-0">
            
            {/* Add new episode button */}
            <Link 
              href={`/podcast/${params.id}/episode/new`} 
              className="flex items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] text-[14px] font-bold transition-all shadow-sm hover:shadow-md"
            >
              + Add new episode
            </Link>

            {/* Top Performing Topics */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <p className="text-[14px] font-bold text-slate-900 mb-4">
                Your top performing topics
              </p>
              <div className="flex flex-col gap-3.5">
                {TOP_PERFORMING.map((topic, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={topic.img} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold text-slate-900 truncate mb-0.5">
                        {topic.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {topic.listeners}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Booking Calendar */}
            <div className="bg-white border border-slate-100 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <p className="text-[14px] font-bold text-slate-900 mb-4">
                Recent Podcast Booking Calendar
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-800">Aug 15, Sat</span>
                  <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black">
                    TODAY
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 text-[11px]">
                    &lt;
                  </button>
                  <button className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 text-[11px]">
                    &gt;
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-5">
                {CALENDAR_EVENTS.map((ev, i) => (
                  <div 
                    key={i} 
                    style={{ borderLeftColor: ev.border }} 
                    className="bg-slate-50/70 border border-slate-100 border-l-[3px] rounded-lg p-3"
                  >
                    <p className="text-[12px] font-bold text-slate-900 mb-0.5">{ev.title}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{ev.time}</p>
                  </div>
                ))}
              </div>

              <Link 
                href="/podcast/new" 
                className="block py-2.5 px-4 bg-white border border-[#C69A2C] text-[#C69A2C] hover:bg-[#C69A2C] hover:text-white rounded-[10px] text-[12px] font-bold text-center transition-colors shadow-sm"
              >
                Book podcast slot
              </Link>
              
              <div className="text-center mt-3.5">
                <Link 
                  href="/bookings?tab=calendar" 
                  className="text-[11px] font-bold text-[#C69A2C] hover:underline"
                >
                  See full calendar &gt;
                </Link>
              </div>
            </div>

          </div>

          {/* Floating Widget: Chat with Arella */}
          <div className="fixed bottom-8 right-8 z-30">
            <Link
              href="/chat"
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-5 py-3 rounded-full text-[13px] font-bold flex items-center gap-2.5 transition-all hover:shadow-lg relative group"
            >
              <span>Chat with Arella</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1px] flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Globe size={12} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-slate-200/90 rotate-45"></div>
            </Link>
          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
