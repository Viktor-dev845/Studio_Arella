'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  Users, 
  DollarSign, 
  CalendarCheck, 
  Megaphone, 
  ChevronDown, 
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  role: string;
  credit: string;
  joined: string;
}

interface BookingItem {
  title: string;
  price: string;
  status: string;
  userName: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time range filter
  const [selectedRange, setSelectedRange] = useState('Feb 2023');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Active chart day tooltip (defaulting to Thursday as in Figma design)
  const [activeDayIndex, setActiveDayIndex] = useState(3); // 3 = Thurs

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => null),
      api.get('/admin/bookings?limit=5').catch(() => null)
    ])
      .then(([statsRes, bookingsRes]) => {
        if (statsRes?.data) setStats(statsRes.data);
        if (bookingsRes?.data?.bookings) setRecentBookings(bookingsRes.data.bookings);
      })
      .finally(() => setLoading(false));
  }, []);

  // Figma chart values for Mon - Sun
  const chartDays = [
    { day: 'Mon', value: 50, leads: '1,890' },
    { day: 'Tues', value: 58, leads: '2,150' },
    { day: 'Wed', value: 38, leads: '1,420' },
    { day: 'Thurs', value: 50, leads: '2,678' }, // Active in Figma
    { day: 'Fri', value: 24, leads: '980' },
    { day: 'Sat', value: 38, leads: '1,640' },
    { day: 'Sun', value: 68, leads: '3,100' }
  ];

  // Figma Recent User Registration Table data (with real stats fallback)
  const usersList: UserItem[] = stats?.recent_users?.length > 0
    ? stats.recent_users.slice(0, 4).map((u: any, idx: number): UserItem => ({
        id: `#${u.id?.toString().padStart(6, '0') || (idx % 2 === 0 ? '876364' : '876368')}`,
        email: u.email || 'kaluvic200@gmail.com',
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Advertiser',
        credit: `#${Number(u.credits || 10000).toLocaleString()}`,
        joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '02/11/2026'
      }))
    : [
        { id: '#876364', email: 'kaluvic200@gmail.com', role: 'Advertiser', credit: '#10,000', joined: '02/11/2026' },
        { id: '#876368', email: 'kaluvic200@gmail.com', role: 'Advertiser', credit: '#10,000', joined: '02/11/2026' },
        { id: '#876364', email: 'kaluvic200@gmail.com', role: 'Advertiser', credit: '#10,000', joined: '02/11/2026' },
        { id: '#876368', email: 'kaluvic200@gmail.com', role: 'Advertiser', credit: '#10,000', joined: '02/11/2026' }
      ];

  // Figma Recent Bookings items
  const bookingsList: BookingItem[] = recentBookings.length > 0
    ? recentBookings.slice(0, 3).map((b: any): BookingItem => ({
        title: b.campaign_name ? `${b.booking_type === 'podcast' ? 'Podcast' : 'Campaign'} - ${b.booking_number || b.id}` : `Podcast - pod-19283`,
        price: `#${Number(b.total_cost || 10000).toLocaleString()}`,
        status: b.status === 'confirmed' || b.status === 'active' || b.status === 'completed' ? 'Confirmed' : 'Pending',
        userName: b.user_name || 'Kalu Victor'
      }))
    : [
        { title: 'Podcast - pod-19283', price: '#10,000', status: 'Confirmed', userName: 'Kalu Victor' },
        { title: 'Podcast - pod-19283', price: '#10,000', status: 'Confirmed', userName: 'Kalu Victor' }
      ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-[#06152B]">
      {/* ── TOP HEADER: "Dashboard" + Date Dropdown ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-[26px] font-bold tracking-tight text-[#06152B]">
          Dashboard
        </h1>

        {/* Date Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c9a32c] text-black text-[15px] font-medium rounded-[4px] transition-all cursor-pointer shadow-xs"
          >
            <span>{selectedRange}</span>
            <ChevronDown size={18} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-30">
              {['Feb 2023', 'This Week', 'This Month', 'Last 30 Days', 'All Time'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedRange(option);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                    selectedRange === option ? 'text-[#D4AF37] font-semibold' : 'text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TOP 4 ANALYTICS STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* 1. Total Users */}
        <Link 
          href="/admin/users"
          className="bg-white rounded-[10px] p-5 flex items-center gap-4 border border-slate-100/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(96,92,255,0.18)] flex items-center justify-center text-[#6254FF] shrink-0 group-hover:scale-105 transition-transform">
            <Users size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#06152B] leading-tight">
              {stats?.users ? `${stats.users}+` : '178+'}
            </div>
            <div className="text-sm text-[#788B9A] font-normal mt-0.5">
              Total Users
            </div>
          </div>
        </Link>

        {/* 2. Total Revenue */}
        <Link 
          href="/admin/finances"
          className="bg-white rounded-[10px] p-5 flex items-center gap-4 border border-slate-100/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(47,230,167,0.22)] flex items-center justify-center text-[#2FE5A7] shrink-0 group-hover:scale-105 transition-transform">
            <DollarSign size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#06152B] leading-tight">
              {stats?.revenue ? `#${Number(stats.revenue).toLocaleString()}` : '#70,000'}
            </div>
            <div className="text-sm text-[#788B9A] font-normal mt-0.5">
              Total Revenue
            </div>
          </div>
        </Link>

        {/* 3. All Bookings */}
        <Link 
          href="/admin/bookings"
          className="bg-white rounded-[10px] p-5 flex items-center gap-4 border border-slate-100/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(255,105,180,0.22)] flex items-center justify-center text-[#FF69B4] shrink-0 group-hover:scale-105 transition-transform">
            <CalendarCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#06152B] leading-tight">
              {stats?.bookings ? `${stats.bookings}+` : '190+'}
            </div>
            <div className="text-sm text-[#788B9A] font-normal mt-0.5">
              All Bookings
            </div>
          </div>
        </Link>

        {/* 4. All Campaigns */}
        <Link 
          href="/admin/campaigns"
          className="bg-white rounded-[10px] p-5 flex items-center gap-4 border border-slate-100/80 shadow-xs hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-[rgba(96,92,255,0.18)] flex items-center justify-center text-[#6254FF] shrink-0 group-hover:scale-105 transition-transform">
            <Megaphone size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="text-[22px] font-bold text-[#06152B] leading-tight">
              {stats?.campaigns ? `${stats.campaigns}+` : '12+'}
            </div>
            <div className="text-sm text-[#788B9A] font-normal mt-0.5">
              All Campaigns
            </div>
          </div>
        </Link>
      </div>

      {/* ── MIDDLE ROW: RECENT BOOKINGS SPLINE CHART & ANALYTICS DONUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Bookings Wave Chart */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[10px] p-6 border border-slate-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#06152B]">Recent bookings</h2>
            <button className="text-[#788B9A] hover:text-[#06152B] transition-colors p-1" aria-label="More options">
              <MoreHorizontal size={19} />
            </button>
          </div>

          {/* SVG Wave / Spline Chart */}
          <div className="relative w-full h-[270px]">
            <svg viewBox="0 0 640 250" className="w-full h-full overflow-visible">
              <defs>
                {/* Gradient Fill under the wave */}
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="-0.98%" stopColor="#DEB634" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#C1F8E5" stopOpacity="0.30" />
                </linearGradient>

                {/* Point glow filter */}
                <filter id="dotShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#605BFF" floodOpacity="0.17" />
                </filter>
              </defs>

              {/* Horizontal Grid lines (Y: 100, 80, 60, 40, 20, 0) */}
              {[
                { y: 20, label: '100' },
                { y: 56, label: '80' },
                { y: 92, label: '60' },
                { y: 128, label: '40' },
                { y: 164, label: '20' },
                { y: 200, label: '0' },
              ].map((grid) => (
                <g key={grid.label}>
                  <text 
                    x="24" 
                    y={grid.y + 4} 
                    textAnchor="end" 
                    className="text-[12px] fill-[#788B9A] font-sans font-normal"
                  >
                    {grid.label}
                  </text>
                  <line 
                    x1="40" 
                    y1={grid.y} 
                    x2="630" 
                    y2={grid.y} 
                    stroke="#CFD9E0" 
                    strokeOpacity="0.25" 
                    strokeWidth="1" 
                  />
                </g>
              ))}

              {/* Smooth Area Path under spline */}
              <path
                d="M 40,110 
                   C 70,80 100,150 140,105 
                   C 180,60 210,135 240,135 
                   C 270,135 300,165 340,110 
                   C 380,55 410,180 440,170 
                   C 470,160 500,120 540,125 
                   C 580,130 600,60 630,50 
                   L 630,200 L 40,200 Z"
                fill="url(#waveGradient)"
              />

              {/* Stroke Wave Line */}
              <path
                d="M 40,110 
                   C 70,80 100,150 140,105 
                   C 180,60 210,135 240,135 
                   C 270,135 300,165 340,110 
                   C 380,55 410,180 440,170 
                   C 470,160 500,120 540,125 
                   C 580,130 600,60 630,50"
                fill="none"
                stroke="#DEB634"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points on the wave: Mon, Tues, Wed, Thurs, Fri, Sat, Sun */}
              {[
                { cx: 140, cy: 105, idx: 1 }, // Tues
                { cx: 240, cy: 135, idx: 2 }, // Wed
                { cx: 340, cy: 110, idx: 3 }, // Thurs (Active)
                { cx: 440, cy: 170, idx: 4 }, // Fri
                { cx: 540, cy: 125, idx: 5 }, // Sat
                { cx: 630, cy: 50,  idx: 6 }, // Sun
              ].map((pt) => {
                const isActive = activeDayIndex === pt.idx;
                return (
                  <g 
                    key={pt.idx} 
                    className="cursor-pointer" 
                    onClick={() => setActiveDayIndex(pt.idx)}
                  >
                    {/* Vertical dashed line when active */}
                    {isActive && (
                      <line 
                        x1={pt.cx} 
                        y1={pt.cy} 
                        x2={pt.cx} 
                        y2={200} 
                        stroke="#3A36DB" 
                        strokeDasharray="3 3" 
                        strokeWidth="1.2" 
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="6.5"
                      fill="#06152B"
                      stroke="#FDDD73"
                      strokeWidth="3"
                      filter="url(#dotShadow)"
                      className="transition-transform hover:scale-125"
                    />
                  </g>
                );
              })}

              {/* Active Tooltip Badge on Thursday */}
              {activeDayIndex === 3 && (
                <g transform="translate(340, 50)" className="pointer-events-none">
                  {/* Tooltip Box */}
                  <rect 
                    x="-44" 
                    y="-48" 
                    width="88" 
                    height="54" 
                    rx="10" 
                    fill="#FED757" 
                    filter="drop-shadow(0px 4px 7px rgba(3,2,41,0.07))" 
                  />
                  {/* Downward Pointer Triangle */}
                  <polygon points="0,10 -6,5 6,5" fill="#FED757" />
                  
                  {/* Label: Leads */}
                  <text 
                    x="0" 
                    y="-28" 
                    textAnchor="middle" 
                    fill="#000000" 
                    className="text-[12px] font-sans font-normal"
                  >
                    Leads
                  </text>
                  {/* Value: 2,678 */}
                  <text 
                    x="0" 
                    y="-10" 
                    textAnchor="middle" 
                    fill="#000000" 
                    className="text-[16px] font-sans font-bold"
                  >
                    2,678
                  </text>
                </g>
              )}

              {/* X-Axis Days Labels */}
              {[
                { x: 40, label: 'Mon' },
                { x: 140, label: 'Tues' },
                { x: 240, label: 'Wed' },
                { x: 340, label: 'Thurs' },
                { x: 440, label: 'Fri' },
                { x: 540, label: 'Sat' },
                { x: 630, label: 'Sun' },
              ].map((axis) => (
                <text
                  key={axis.label}
                  x={axis.x}
                  y="225"
                  textAnchor="middle"
                  className="text-[12px] fill-[#788B9A] font-sans font-normal"
                >
                  {axis.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Analytics Donut Chart */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[10px] p-6 border border-slate-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-[#06152B]">Analytics</h2>
            <button className="text-[#06152B] hover:opacity-75 transition-opacity p-1" aria-label="More options">
              <MoreHorizontal size={19} />
            </button>
          </div>

          {/* Donut Chart with Center Text */}
          <div className="relative flex items-center justify-center my-4">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FFFFFF"
                  strokeWidth="15"
                />

                {/* Segment 1: Ad booking (#3A36DB - Deep Blue) 48% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3A36DB"
                  strokeWidth="14"
                  strokeDasharray="115 240"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />

                {/* Segment 2: Campaigns (#2FE6A7 - Mint) 32% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2FE6A7"
                  strokeWidth="14"
                  strokeDasharray="76 240"
                  strokeDashoffset="-120"
                  strokeLinecap="round"
                />

                {/* Segment 3: Podcast booking (#FED757 - Gold) 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FED757"
                  strokeWidth="14"
                  strokeDasharray="48 240"
                  strokeDashoffset="-200"
                  strokeLinecap="round"
                />
              </svg>

              {/* Donut Center text: "80% Transactions" */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[28px] font-bold text-[#06152B] leading-none">
                  80%
                </span>
                <span className="text-[14px] font-medium text-[#06152B] mt-1">
                  Transactions
                </span>
              </div>
            </div>
          </div>

          {/* Legend indicators */}
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#788B9A] pt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-[4px] bg-[#3A36DB]" />
              <span>Ad booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-[4px] bg-[#2FE6A7]" />
              <span>Campaigns</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-[4px] bg-[#FED757]" />
              <span>Podcast booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: RECENT USER REGISTRATION & RECENT BOOKINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent User Registration Table */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[10px] p-6 border border-slate-100/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-medium text-[#06152B]">Recent User Registration</h2>
            <button className="text-[#06152B] hover:opacity-75 transition-opacity p-1" aria-label="More options">
              <MoreHorizontal size={19} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[12px] font-normal text-[#06152B] border-b border-slate-100">
                  <th className="pb-3 font-normal">
                    <span className="inline-flex items-center gap-1">
                      Name <ChevronDown size={12} className="opacity-40" />
                    </span>
                  </th>
                  <th className="pb-3 font-normal">
                    <span className="inline-flex items-center gap-1">
                      Email <ChevronDown size={12} className="opacity-40" />
                    </span>
                  </th>
                  <th className="pb-3 font-normal">
                    <span className="inline-flex items-center gap-1">
                      Role <ChevronDown size={12} className="opacity-40" />
                    </span>
                  </th>
                  <th className="pb-3 font-normal">
                    <span className="inline-flex items-center gap-1">
                      Credit <ChevronDown size={12} className="opacity-40" />
                    </span>
                  </th>
                  <th className="pb-3 font-normal text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {usersList.map((user, idx) => (
                  <tr 
                    key={`${user.id}-${idx}`}
                    className={`text-[12px] transition-colors ${
                      idx % 2 === 1 ? 'bg-[#F1F4FA] rounded-md' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-3 px-2 font-normal text-[#788B9A] whitespace-nowrap rounded-l-md">
                      {user.id}
                    </td>
                    <td className="py-3 px-2 font-normal text-[#788B9A] whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="py-3 px-2 font-normal text-[#788B9A] whitespace-nowrap">
                      {user.role}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 bg-[#D4AF37] text-white text-[12px] font-normal rounded-lg text-center shadow-xs">
                        {user.credit}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-normal text-[#788B9A] text-right whitespace-nowrap rounded-r-md">
                      {user.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Bookings List */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[10px] p-6 border border-slate-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-[#06152B]">Recent Bookings</h2>
              <button className="text-[#06152B] hover:opacity-75 transition-opacity p-1" aria-label="More options">
                <MoreHorizontal size={19} />
              </button>
            </div>

            <div className="space-y-4">
              {bookingsList.map((booking, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-4 border-t border-[#2FE6A7]/15' : ''}`}>
                  <div className="text-[16px] font-medium text-[#06152B] leading-tight">
                    {booking.title}
                  </div>
                  <div className="flex items-center gap-2.5 my-1.5">
                    <span className="text-[16px] font-medium text-[#D4AF37]">
                      {booking.price}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[rgba(152,255,197,0.5)] text-[#07BC56] text-[12px] font-semibold rounded-full leading-none">
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#788B9A]">
                    {booking.userName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/bookings"
            className="mt-5 text-center text-xs font-semibold text-[#D4AF37] hover:underline block"
          >
            View all bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}
