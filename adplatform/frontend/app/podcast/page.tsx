'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List, Play, ChevronDown, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

const F = theme.font.body;

// Dummy data matching the Figma mockups
const TRENDING_PODCASTS = [
  { id: '1', title: 'Undressed', listeners: '2M active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80', description: 'Deep unfiltered conversations about life, career transitions, and authenticity.' },
  { id: '2', title: 'Weak in Your Light', listeners: '200k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1516280440502-628d02166668?w=400&q=80', description: 'Exploring vulnerability, leadership, and finding strength in adversity.' },
];

const ALL_PODCASTS = [
  { id: '1', title: 'Undressed', listeners: '2M active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80', description: 'Deep unfiltered conversations about life, career transitions, and authenticity.' },
  { id: '2', title: 'Weak in Your Light', listeners: '200k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1516280440502-628d02166668?w=400&q=80', description: 'Exploring vulnerability, leadership, and finding strength in adversity.' },
  { id: '3', title: 'Sober Reflection', listeners: '20k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&q=80', description: 'Mindfulness, intentional living, and daily habits for creators.' },
  { id: '4', title: 'Father And Son', listeners: '2k active listeners', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1583335513577-224b11f385ce?w=400&q=80', description: 'Generational wisdom, family relationships, and personal growth.' },
  { id: '5', title: 'Business On', listeners: 'Liked Songs', episodes: '135 episodes', img: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f922?w=400&q=80', description: 'Actionable business strategies, growth frameworks, and startup tactics.' },
  { id: '6', title: 'Family Life', listeners: '1.4M active listeners', episodes: '94 episodes', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80', description: 'Navigating family, relationships, and balance in a hyperconnected world.' },
  { id: '7', title: 'Growth Lab', listeners: '450k active listeners', episodes: '80 episodes', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', description: 'Experimental marketing and high-velocity business experimentation.' },
  { id: '8', title: 'Positioning', listeners: '320k active listeners', episodes: '62 episodes', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', description: 'Brand positioning, competitive strategy, and market authority.' },
  { id: '9', title: 'Tech Pulse', listeners: '880k active listeners', episodes: '110 episodes', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', description: 'Emerging technology, AI breakthroughs, and digital media architecture.' },
  { id: '10', title: 'Love is All', listeners: '180k active listeners', episodes: '45 episodes', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', description: 'Love, empathy, and emotional intelligence in modern society.' },
];

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

export default function PodcastsPage() {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAll = ALL_PODCASTS.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrending = TRENDING_PODCASTS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PodcastBoardCard = ({ pod }: { pod: typeof ALL_PODCASTS[0] }) => (
    <Link 
      href={`/podcast/${pod.id}`} 
      className="group text-decoration-none flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-200"
    >
      <div className="w-full aspect-square rounded-[16px] overflow-hidden bg-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
        <img 
          src={pod.img} 
          alt={pod.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Play size={16} className="text-[#C69A2C] ml-0.5" fill="#C69A2C" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-900 mb-1 truncate group-hover:text-[#C69A2C] transition-colors">
          {pod.title}
        </p>
        <p className="text-[11px] font-semibold text-slate-500 mb-1">
          {pod.listeners}
        </p>
        <p className="text-[11px] font-bold text-[#C69A2C]">
          {pod.episodes}
        </p>
      </div>
    </Link>
  );

  const PodcastListCard = ({ pod }: { pod: typeof ALL_PODCASTS[0] }) => (
    <Link 
      href={`/podcast/${pod.id}`}
      className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[18px] hover:border-[#C69A2C]/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-slate-100 flex-shrink-0 relative">
          <img src={pod.img} alt={pod.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-slate-900 truncate group-hover:text-[#C69A2C] transition-colors">
            {pod.title}
          </h3>
          <p className="text-[12px] text-slate-500 truncate max-w-[420px] mb-1">
            {pod.description}
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-semibold text-slate-600">{pod.listeners}</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-[#C69A2C]">{pod.episodes}</span>
          </div>
        </div>
      </div>
      <span className="text-[12px] font-bold text-[#C69A2C] px-3.5 py-1.5 rounded-lg bg-[#C69A2C]/10 hover:bg-[#C69A2C] hover:text-white transition-colors">
        Manage &gt;
      </span>
    </Link>
  );

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F }} className="flex flex-col lg:flex-row gap-8 p-6 sm:p-10 max-w-[1360px] mx-auto items-start relative">
          
          {/* ─── LEFT COLUMN (Main Content) ─── */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-8">
            
            {/* Search Bar & View Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-[320px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[12px] text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#C69A2C] transition-colors shadow-sm"
                />
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <button 
                  onClick={() => setViewMode('board')} 
                  className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'board' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid size={14} /> Board View
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List size={14} /> List View
                </button>
              </div>
            </div>

            {/* Trending Topics */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Your trending topics ({filteredTrending.length})
                </h2>
              </div>
              
              {viewMode === 'board' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {filteredTrending.map((pod) => (
                    <PodcastBoardCard key={`trend-${pod.id}`} pod={pod} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTrending.map((pod) => (
                    <PodcastListCard key={`trend-${pod.id}`} pod={pod} />
                  ))}
                </div>
              )}
            </div>

            {/* All Podcasts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-slate-900">
                  All podcasts ({filteredAll.length})
                </h2>
              </div>
              
              {viewMode === 'board' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 row-gap-7">
                  {filteredAll.map((pod) => (
                    <PodcastBoardCard key={`all-${pod.id}`} pod={pod} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredAll.map((pod) => (
                    <PodcastListCard key={`all-${pod.id}`} pod={pod} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="w-full lg:w-[320px] flex flex-col gap-7 flex-shrink-0">
            
            {/* Add a podcast button */}
            <Link 
              href="/podcast/new" 
              className="flex items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] text-[14px] font-bold transition-all shadow-sm hover:shadow-md"
            >
              + Add a podcast
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
