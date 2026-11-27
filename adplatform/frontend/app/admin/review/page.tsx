'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/components/ui/ToastProvider';
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Calendar,
  Paperclip,
  Layout,
  Star,
  Sun,
  RotateCcw,
  Bell,
  PanelRightClose,
  X,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Eye,
  Clock,
  Check,
} from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api').replace('/api', '');

function getMediaUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface CreativeItem {
  id: string;
  title: string;
  description?: string;
  advertiser_name?: string;
  advertiser_email?: string;
  advertiser_avatar?: string;
  campaign_name?: string;
  file_url?: string | null;
  media_url?: string | null;
  file_type?: string;
  duration_seconds?: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  rejection_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  files_count?: number;
  isMock?: boolean;
  showInlinePreview?: boolean;
}

const REJECTION_PRESETS = [
  'Low video / image resolution',
  'Text is too small or illegible for billboard display',
  'Content policy violation or inappropriate messaging',
  'Incorrect aspect ratio / distorted dimensions',
  'Missing required brand identification or disclaimer',
];

// Subtle architectural wireframe preview SVG data URI matching the Figma card artwork when DB has 0 creatives
const FIGMA_MOCK_PREVIEW =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E4D6B8"/>
      <stop offset="50%" stop-color="#D8C8A7"/>
      <stop offset="100%" stop-color="#C8B48E"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3B322C"/>
      <stop offset="100%" stop-color="#1E1916"/>
    </linearGradient>
  </defs>
  <rect width="600" height="360" fill="url(#paper)"/>
  <g stroke="#8F7E62" stroke-width="1.2" opacity="0.45" fill="none">
    <path d="M0 70 L600 120 M0 160 L600 210 M0 250 L600 300"/>
    <rect x="65" y="45" width="470" height="270" rx="4" stroke-width="1.8"/>
    <rect x="115" y="135" width="110" height="80" rx="2"/>
    <rect x="255" y="150" width="110" height="80" rx="2"/>
    <rect x="395" y="165" width="105" height="80" rx="2"/>
    <line x1="115" y1="135" x2="225" y2="215"/>
    <line x1="225" y1="135" x2="115" y2="215"/>
    <line x1="255" y1="150" x2="365" y2="230"/>
    <line x1="365" y1="150" x2="255" y2="230"/>
    <line x1="395" y1="165" x2="500" y2="245"/>
    <line x1="500" y1="165" x2="395" y2="245"/>
  </g>
  <g transform="rotate(-24 210 130)">
    <rect x="20" y="116" width="290" height="16" rx="3" fill="url(#wood)"/>
    <polygon points="310,116 346,124 310,132" fill="#E3C499"/>
    <polygon points="334,121 346,124 334,127" fill="#1F1B18"/>
    <rect x="16" y="116" width="14" height="16" fill="#C9A34E"/>
  </g>
</svg>
`);

const DEFAULT_FIGMA_CREATIVES: CreativeItem[] = [
  {
    id: 'mock-pending-1',
    title: 'Cloth Launch Event',
    advertiser_name: 'Kalu Victor',
    advertiser_email: 'kaluvictor23@gmail.com',
    status: 'pending',
    file_type: 'image',
    duration_seconds: 30,
    created_at: '2026-10-10T12:36:00Z',
    files_count: 2,
    isMock: true,
    showInlinePreview: false,
  },
  {
    id: 'mock-pending-2',
    title: 'Cloth Launch Event',
    advertiser_name: 'Kalu Victor',
    advertiser_email: 'kaluvictor23@gmail.com',
    status: 'pending',
    file_type: 'video',
    duration_seconds: 30,
    created_at: '2026-10-10T12:36:00Z',
    files_count: 2,
    isMock: true,
    showInlinePreview: false,
  },
  {
    id: 'mock-approved-1',
    title: 'Cloth Launch Event',
    advertiser_name: 'Kalu Victor',
    advertiser_email: 'kaluvictor23@gmail.com',
    status: 'approved',
    file_url: FIGMA_MOCK_PREVIEW,
    file_type: 'image',
    duration_seconds: 30,
    created_at: '2026-10-10T12:36:00Z',
    files_count: 2,
    isMock: true,
    showInlinePreview: true,
  },
  {
    id: 'mock-rejected-1',
    title: 'Cloth Launch Event',
    advertiser_name: 'Kalu Victor',
    advertiser_email: 'kaluvictor23@gmail.com',
    status: 'rejected',
    file_type: 'image',
    duration_seconds: 15,
    rejection_reason: 'Text is too small or illegible for billboard display',
    created_at: '2026-10-10T12:36:00Z',
    files_count: 2,
    isMock: true,
    showInlinePreview: false,
  },
  {
    id: 'mock-rejected-2',
    title: 'Cloth Launch Event',
    advertiser_name: 'Kalu Victor',
    advertiser_email: 'kaluvictor23@gmail.com',
    status: 'rejected',
    file_url: FIGMA_MOCK_PREVIEW,
    file_type: 'image',
    duration_seconds: 30,
    rejection_reason: 'Incorrect aspect ratio / distorted dimensions',
    created_at: '2026-10-10T12:36:00Z',
    files_count: 2,
    isMock: true,
    showInlinePreview: true,
  },
];

function formatSubmittedTimestamp(dateStr?: string) {
  if (!dateStr) return '10/10/2026 12:36PM';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '10/10/2026 12:36PM';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
}

export default function AdminReviewPage() {
  const [queue, setQueue] = useState<CreativeItem[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter popup controls (Figma Filter Popup specification)
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [activeColumnFilters, setActiveColumnFilters] = useState<string[]>([]);
  const [draftColumnFilters, setDraftColumnFilters] = useState<string[]>(['pending']);

  const FILTER_OPTIONS = [
    { key: 'pending', label: 'Pending review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All creatives' },
  ];

  const openFilterPopup = () => {
    setDraftColumnFilters(activeColumnFilters.length > 0 ? [...activeColumnFilters] : ['pending']);
    setFilterSearch('');
    setFilterOpen(true);
  };

  const toggleDraftFilter = (key: string) => {
    setDraftColumnFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleApplyFilter = () => {
    setActiveColumnFilters([...draftColumnFilters]);
    setFilterOpen(false);
  };

  // Card 3-dot menu
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  // Review modal state
  const [selected, setSelected] = useState<CreativeItem | null>(null);
  const [reason, setReason] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ads/review-queue');
      const liveQueue: CreativeItem[] = res.data?.queue || [];
      if (liveQueue.length > 0) {
        setQueue(liveQueue);
        setUsingMockData(false);
      } else {
        setQueue(DEFAULT_FIGMA_CREATIVES);
        setUsingMockData(true);
      }
    } catch {
      setQueue(DEFAULT_FIGMA_CREATIVES);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (ad: CreativeItem, decision: 'approved' | 'rejected', customReason?: string) => {
    const finalReason = (customReason ?? reason).trim();
    if (decision === 'rejected' && !finalReason) {
      toast('A rejection reason is required when rejecting a creative', 'error');
      return;
    }

    setReviewing(ad.id);

    if (ad.isMock || usingMockData) {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === ad.id
            ? {
                ...item,
                status: decision,
                rejection_reason: decision === 'approved' ? null : finalReason,
                reviewed_at: new Date().toISOString(),
              }
            : item
        )
      );
      toast(
        decision === 'approved'
          ? 'Creative approved! (Preview mode)'
          : 'Creative rejected with feedback. (Preview mode)',
        'success'
      );
      setSelected(null);
      setReason('');
      setReviewing(null);
      return;
    }

    try {
      await api.put(`/ads/${ad.id}/review`, {
        decision,
        rejection_reason: decision === 'approved' ? '' : finalReason,
      });
      toast(
        decision === 'approved'
          ? 'Creative approved! Advertiser was notified.'
          : 'Creative rejected. Advertiser was notified with feedback.',
        'success'
      );
      setSelected(null);
      setReason('');
      fetchQueue();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Review action failed', 'error');
    } finally {
      setReviewing(null);
    }
  };

  const filteredCreatives = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = queue.filter((ad) => {
      if (!q) return true;
      return (
        (ad.title || '').toLowerCase().includes(q) ||
        (ad.advertiser_name || '').toLowerCase().includes(q) ||
        (ad.advertiser_email || '').toLowerCase().includes(q) ||
        (ad.campaign_name || '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return tb - ta;
    });
  }, [queue, search]);

  const allColumns = useMemo(
    () => [
      {
        key: 'pending',
        title: 'Pending Review',
        items: filteredCreatives.filter((ad) => ad.status === 'pending'),
      },
      {
        key: 'approved',
        title: 'Approved',
        items: filteredCreatives.filter((ad) => ad.status === 'approved'),
      },
      {
        key: 'rejected',
        title: 'Rejected',
        items: filteredCreatives.filter((ad) => ad.status === 'rejected'),
      },
      {
        key: 'all',
        title: 'All Creatives',
        items: filteredCreatives,
      },
    ],
    [filteredCreatives]
  );

  const columns = useMemo(() => {
    if (activeColumnFilters.length === 0) return allColumns;
    return allColumns.filter((col) => activeColumnFilters.includes(col.key));
  }, [allColumns, activeColumnFilters]);

  const activeFilterCount = activeColumnFilters.length;

  const visibleFilterOptions = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    if (!q) return FILTER_OPTIONS;
    return FILTER_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [filterSearch]);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-[#06152B] font-sans">
      {/* ── TOP HEADER / BREADCRUMB BAR (Figma SnowUI Specification) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2.5 text-xs text-[#000000]/60">
          <button className="p-1 hover:text-[#06152B] transition-colors" title="Toggle Sidebar">
            <Layout size={16} />
          </button>
          <button className="p-1 hover:text-[#06152B] transition-colors" title="Favorites">
            <Star size={16} />
          </button>
          <span className="text-[#000000]/40">/</span>
          <Link href="/admin" className="text-[#000000] font-medium hover:underline">
            Admin
          </Link>
          <span className="text-[#000000]/40">/</span>
          <span className="text-[#000000]/40">Review Queue</span>
          <span className="text-[#000000]/40">/</span>
          <span className="text-[#000000] font-medium">Default</span>
        </div>

        {/* Right: Search Pill & Quick Icons */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="relative flex items-center bg-black/5 rounded-full px-3 py-1.5 w-44 md:w-56">
            <Search size={14} className="text-[#000000]/40 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-[#06152B] placeholder:text-[#000000]/40"
            />
            <kbd className="hidden sm:inline-block text-[10px] text-[#000000]/40 border border-black/10 rounded px-1 ml-1 font-mono">
              /
            </kbd>
          </div>

          <div className="flex items-center gap-2 text-[#000000]/70">
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Theme">
              <Sun size={16} />
            </button>
            <button
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="Refresh Queue"
              onClick={fetchQueue}
            >
              <RotateCcw size={16} />
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Notifications">
              <Bell size={16} />
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors" title="Toggle Panel">
              <PanelRightClose size={16} />
            </button>
            <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              A
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE HEADER: TITLE + FILTER BUTTON + SEARCH INPUT (Matches Figma Layout) ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-[#06152B] leading-tight tracking-tight">
            Ad Creative Review
          </h1>
          {usingMockData && !loading && (
            <p className="text-[11px] text-[#788B9A] mt-1">
              Showing design preview cards (no advertiser creatives submitted yet)
            </p>
          )}
        </div>

        {/* Right-aligned Filter button stacked above Search input */}
        <div className="flex flex-col sm:items-end gap-3">
          {/* Gold Filter Button */}
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={() => setActiveColumnFilters([])}
                className="text-xs font-medium text-[#788B9A] hover:text-[#06152B] underline cursor-pointer"
              >
                Show all columns
              </button>
            )}
            <button
              onClick={openFilterPopup}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#FED757] hover:bg-[#fecb2e] text-[#06152B] text-[13px] font-medium rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 min-w-[118px]"
            >
              <span>Filter</span>
              <SlidersHorizontal size={14} className="stroke-[2.2]" />
              {activeFilterCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-[#06152B] text-white text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* White Search Box */}
          <div className="relative flex items-center bg-white border border-[#DDDDE8]/90 rounded-lg px-3.5 py-2 w-full sm:w-[230px] shadow-2xs focus-within:border-[#D4AF37] transition-colors">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-[#06152B] placeholder:text-[#788B9A]"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : (
              <Search size={14} className="text-[#06152B]/70 ml-2 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* ── 4-COLUMN KANBAN BOARD (Pending Review | Approved | Rejected | All Creatives) ── */}
      {loading ? (
        <div className="flex gap-6 overflow-x-auto pb-6">
          {['Pending Review', 'Approved', 'Rejected', 'All Creatives'].map((colTitle) => (
            <div key={colTitle} className="w-[337px] shrink-0 space-y-5">
              <h2 className="text-[20px] font-bold text-[#06152B] leading-7">{colTitle}</h2>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white border-[0.5px] border-[#DDDDE8] rounded-[4px] p-5 space-y-4 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-full pt-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 items-start">
          {columns.map((col) => (
            <div key={col.key} className="w-[337px] shrink-0 flex flex-col gap-5">
              {/* Column Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-[#06152B] leading-[28px] tracking-tight">
                  {col.title}
                </h2>
                <span className="text-[11px] font-semibold text-[#788B9A] bg-white border border-[#DDDDE8] px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>

              {/* Cards Stack */}
              {col.items.length === 0 ? (
                <div className="bg-white/70 border border-dashed border-[#DDDDE8] rounded-[4px] p-8 text-center">
                  <p className="text-xs font-medium text-[#788B9A]">
                    No creatives in {col.title.toLowerCase()}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {col.items.map((ad, idx) => {
                    const cardMenuKey = `${col.key}-${ad.id}-${idx}`;
                    const isMenuOpen = openMenuKey === cardMenuKey;
                    const mediaUrl = getMediaUrl(ad.file_url || ad.media_url);
                    const isVideo = ad.file_type === 'video' || mediaUrl.toLowerCase().endsWith('.mp4');
                    const isPending = ad.status === 'pending';

                    // Match Figma visual rhythm: show inline preview whenever real media exists, or on Figma preview cards flagged with showInlinePreview
                    const shouldShowMedia = Boolean(mediaUrl) && (ad.isMock ? Boolean(ad.showInlinePreview) : true);
                    const filesCount = ad.files_count ?? (mediaUrl ? 2 : 1);
                    const advertiserInitial = (ad.advertiser_name || 'K')[0].toUpperCase();

                    return (
                      <div
                        key={`${col.key}-${ad.id}-${idx}`}
                        className="bg-white border-[0.5px] border-[#DDDDE8] rounded-[4px] p-5 flex flex-col gap-4 hover:border-[#D4AF37]/70 hover:shadow-sm transition-all relative"
                      >
                        {/* Row 1: Title & Vertical 3-dot Menu */}
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            onClick={() => {
                              setSelected(ad);
                              setReason(ad.rejection_reason || '');
                            }}
                            className="text-[16px] font-medium leading-[21px] text-[#788B9A] truncate cursor-pointer hover:text-[#06152B] transition-colors"
                            title={ad.title}
                          >
                            {ad.title || 'Untitled Creative'}
                          </h3>

                          <div className="relative shrink-0">
                            <button
                              onClick={() => setOpenMenuKey(isMenuOpen ? null : cardMenuKey)}
                              className="p-1 text-[#1E293B] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              aria-label="Creative actions"
                            >
                              <MoreVertical size={17} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-[#DDDDE8] py-1 z-30 text-left">
                                <button
                                  onClick={() => {
                                    setSelected(ad);
                                    setReason(ad.rejection_reason || '');
                                    setOpenMenuKey(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs text-[#06152B] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye size={13} className="text-[#D4AF37]" />
                                  <span>{isPending ? 'Review Creative' : 'View Details'}</span>
                                </button>
                                {ad.status !== 'approved' && (
                                  <button
                                    onClick={() => {
                                      setOpenMenuKey(null);
                                      handleDecision(ad, 'approved');
                                    }}
                                    className="w-full px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check size={13} />
                                    <span>Quick Approve</span>
                                  </button>
                                )}
                                {ad.status !== 'rejected' && (
                                  <button
                                    onClick={() => {
                                      setSelected(ad);
                                      setReason(ad.rejection_reason || '');
                                      setOpenMenuKey(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <XCircle size={13} />
                                    <span>Reject with Reason</span>
                                  </button>
                                )}
                                {mediaUrl && !mediaUrl.startsWith('data:') && (
                                  <a
                                    href={mediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenMenuKey(null)}
                                    className="w-full px-3.5 py-2 text-xs text-[#788B9A] hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <ExternalLink size={13} />
                                    <span>Open Raw Media</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Row 2: Advertiser Name & Gold Email */}
                        <div className="space-y-0.5 text-[13px] leading-[18px]">
                          <div className="text-[#788B9A]">
                            Advertiser:{' '}
                            <span className="font-semibold text-[#06152B]">
                              {ad.advertiser_name || 'Kalu Victor'}
                            </span>
                          </div>
                          <div className="text-[12.5px] text-[#D4AF37] truncate">
                            {ad.advertiser_email || 'kaluvictor23@gmail.com'}
                          </div>
                        </div>

                        {/* Row 3: Optional Media Preview Image / Video (180px height matching Figma) */}
                        {shouldShowMedia && (
                          <div
                            onClick={() => {
                              setSelected(ad);
                              setReason(ad.rejection_reason || '');
                            }}
                            className="w-full h-[180px] rounded-[4px] bg-[#D9D9D9] overflow-hidden relative cursor-pointer group"
                          >
                            {isVideo ? (
                              <>
                                <video
                                  src={mediaUrl}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                                  <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                    <Film size={20} className="text-[#06152B]" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={ad.title || 'Creative preview'}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            )}
                          </div>
                        )}

                        {/* Row 4: Overlapping Gold-Bordered Avatar Group & Gold Action Button */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {/* Overlapping 40px Avatars (Figma: border 1px solid #FED757, margin -12px) */}
                          <div className="flex items-center -space-x-3">
                            <div className="w-10 h-10 rounded-full border border-[#FED757] bg-[#FCE7F3] overflow-hidden flex items-center justify-center text-xs font-bold text-[#9D174D] relative z-10 shrink-0 shadow-2xs">
                              {ad.advertiser_avatar ? (
                                <img
                                  src={getMediaUrl(ad.advertiser_avatar)}
                                  alt={ad.advertiser_name || 'Advertiser'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{advertiserInitial}</span>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full border border-[#FED757] bg-[#FEF3C7] overflow-hidden flex items-center justify-center text-xs font-bold text-[#92400E] relative z-0 shrink-0 shadow-2xs">
                              <img
                                src="/admin/admin-avatar.png"
                                alt="Reviewer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </div>

                          {/* Gold Action Pill Button ("Review" for pending, "View details" for approved/rejected) */}
                          <button
                            onClick={() => {
                              setSelected(ad);
                              setReason(ad.rejection_reason || '');
                            }}
                            className="px-3 py-1 bg-[#FED757] hover:bg-[#f5c731] text-[#06152B] text-[12px] font-medium leading-4 rounded-[4px] transition-all cursor-pointer active:scale-95"
                          >
                            {isPending && col.key === 'pending' ? 'Review' : 'View details'}
                          </button>
                        </div>

                        {/* Row 5: Footer Metadata (Calendar Submitted Date & Files Count) */}
                        <div className="flex items-center justify-between gap-2 pt-1 text-[12px] text-[#788B9A]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Calendar size={15} className="text-[#FED757] shrink-0 stroke-[2.2]" />
                            <span className="truncate">
                              Submitted {formatSubmittedTimestamp(ad.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Paperclip size={14} className="text-[#FED757] shrink-0 stroke-[2.2]" />
                            <span>
                              {filesCount} {filesCount === 1 ? 'File' : 'Files'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: REVIEW & MEDIA INSPECTION ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#DDDDE8] max-h-[92vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-[#06152B]">
                    {selected.title || 'Untitled Creative'}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      selected.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selected.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#FED757]/30 text-[#8A6D0B]'
                    }`}
                  >
                    {selected.status === 'pending' ? 'Pending Review' : selected.status}
                  </span>
                </div>
                <p className="text-xs text-[#788B9A] mt-1">
                  Submitted by <strong className="text-[#06152B]">{selected.advertiser_name || 'Kalu Victor'}</strong> (
                  <span className="text-[#D4AF37]">{selected.advertiser_email || 'kaluvictor23@gmail.com'}</span>)
                  {selected.campaign_name ? ` · Campaign: ${selected.campaign_name}` : ''}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Media Preview Box */}
            {getMediaUrl(selected.file_url || selected.media_url) ? (
              <div className="bg-[#0d1117] rounded-xl p-2.5 flex items-center justify-center min-h-[220px] max-h-[340px] overflow-hidden border border-slate-200 relative">
                {selected.file_type === 'video' ||
                (selected.file_url || selected.media_url || '').toLowerCase().endsWith('.mp4') ? (
                  <video
                    src={getMediaUrl(selected.file_url || selected.media_url)}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[320px] rounded-lg"
                  />
                ) : (
                  <img
                    src={getMediaUrl(selected.file_url || selected.media_url)}
                    alt={selected.title}
                    className="max-w-full max-h-[320px] object-contain rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="bg-[#F1F4FA] rounded-xl p-8 text-center space-y-2 border border-dashed border-[#DDDDE8]">
                <ImageIcon size={28} className="mx-auto text-[#788B9A]" />
                <p className="text-xs text-[#788B9A]">
                  No media preview file attached to this creative record
                </p>
              </div>
            )}

            {/* Metadata Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#F1F4FA] rounded-xl text-xs text-[#788B9A]">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#D4AF37]" />
                  <span>Submitted {formatSubmittedTimestamp(selected.created_at)}</span>
                </span>
                {selected.duration_seconds && (
                  <span className="px-2 py-0.5 bg-white rounded border border-[#DDDDE8] text-[#06152B] font-semibold">
                    {selected.duration_seconds}s duration
                  </span>
                )}
                <span className="px-2 py-0.5 bg-white rounded border border-[#DDDDE8] text-[#06152B] font-semibold uppercase">
                  {selected.file_type || 'image'}
                </span>
              </div>
              {getMediaUrl(selected.file_url || selected.media_url) &&
                !getMediaUrl(selected.file_url || selected.media_url).startsWith('data:') && (
                  <a
                    href={getMediaUrl(selected.file_url || selected.media_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#06152B] font-semibold hover:text-[#D4AF37] transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Open Raw File</span>
                  </a>
                )}
            </div>

            {/* Existing Rejection Note */}
            {selected.status === 'rejected' && selected.rejection_reason && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Previous Rejection Reason: </span>
                  <span>{selected.rejection_reason}</span>
                </div>
              </div>
            )}

            {/* Quick Feedback Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#788B9A] uppercase tracking-wider block">
                Quick Rejection Feedback Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border text-left transition-all cursor-pointer ${
                      reason === preset
                        ? 'bg-[#FED757]/25 border-[#D4AF37] text-[#06152B] font-semibold'
                        : 'bg-slate-50 border-slate-200 text-[#788B9A] hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Feedback Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#788B9A] uppercase tracking-wider block">
                Rejection Feedback Note{' '}
                <span className="font-normal normal-case text-slate-400">(required when rejecting)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Provide clear feedback so the advertiser can revise and resubmit their creative..."
                className="w-full px-3.5 py-2.5 border border-[#DDDDE8] rounded-xl text-xs text-[#06152B] outline-none focus:border-[#D4AF37] resize-y"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                disabled={reviewing === selected.id}
                onClick={() => handleDecision(selected, 'rejected')}
                className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle size={15} />
                <span>{reviewing === selected.id ? 'Processing...' : 'Reject Creative'}</span>
              </button>

              <button
                type="button"
                disabled={reviewing === selected.id}
                onClick={() => handleDecision(selected, 'approved')}
                className="flex-1 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={15} />
                <span>{reviewing === selected.id ? 'Processing...' : 'Approve Creative'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="w-full py-2 border border-slate-200 text-[#788B9A] hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel & Close
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: FILTER POPUP (Exact Figma Specification: 383x433px, #FFFFFF, radius 20px) ── */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          className="fixed inset-0 bg-black/15 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[383px] min-h-[433px] bg-white rounded-[20px] p-5 shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 font-sans"
          >
            <div>
              {/* Title: Filter */}
              <h2 className="text-[20px] font-semibold leading-[30px] text-[#16151C]">
                Filter
              </h2>

              {/* Line 2 Divider */}
              <div className="w-full border-t border-[rgba(162,161,168,0.1)] mt-4 mb-7" />

              {/* Search Filter Input (343x50px, radius 10px) */}
              <div className="flex items-center gap-[10px] h-[50px] px-4 border border-[rgba(162,161,168,0.1)] rounded-[10px] focus-within:border-[#FED757] transition-colors">
                <Search size={22} className="text-[#16151C] shrink-0 stroke-[1.7]" />
                <input
                  type="text"
                  placeholder="Search filter"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-[16px] font-light leading-6 text-[#16151C] placeholder:text-[rgba(22,21,28,0.2)]"
                />
              </div>

              {/* Section: All Ad creatives */}
              <div className="mt-5 space-y-4">
                <h3 className="text-[16px] font-semibold leading-6 text-[#16151C]">
                  All Ad creatives
                </h3>

                {/* 2-Column Checkbox Grid */}
                {visibleFilterOptions.length === 0 ? (
                  <p className="text-sm font-light text-[#788B9A] py-2">
                    No matching filter options
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-[30px] gap-y-[12px]">
                    {visibleFilterOptions.map((opt) => {
                      const isChecked = draftColumnFilters.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => toggleDraftFilter(opt.key)}
                          className="flex items-center gap-[10px] text-left cursor-pointer group select-none"
                        >
                          <span
                            className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'bg-[#FED757] border border-[#FED757]'
                                : 'bg-white border-[1.5px] border-[rgba(162,161,168,0.2)] group-hover:border-[#FED757]'
                            }`}
                          >
                            {isChecked && <Check size={14} className="text-white stroke-[2.8]" />}
                          </span>
                          <span className="text-[16px] font-light leading-6 text-[#16151C] whitespace-nowrap">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Buttons: Cancel (166x50px) & Apply (166x50px, #FED757) */}
            <div className="flex items-center gap-[11px] pt-10">
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex-1 h-[50px] bg-white hover:bg-slate-50 border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[16px] font-normal leading-[21px] text-[#16151C] flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyFilter}
                className="flex-1 h-[50px] bg-[#FED757] hover:bg-[#fecb2e] rounded-[6px] text-[16px] font-normal leading-[21px] text-[#000000] flex items-center justify-center transition-colors cursor-pointer active:scale-[0.98]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
