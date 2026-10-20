'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Pause, 
  Play, 
  SkipBack, 
  Check, 
  MessageSquare, 
  Send
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface EpisodeItem {
  id: number;
  title: string;
  duration: string;
  description: string;
  completed: boolean;
}

const DEFAULT_EPISODES: EpisodeItem[] = [
  {
    id: 1,
    title: 'Episode 1',
    duration: '00:00 - 05:19',
    description: 'Introduction',
    completed: true,
  },
  {
    id: 2,
    title: 'Episode 2',
    duration: '05:22 - 09:17',
    description: 'Non eget nulla mattis sed. Sapien proin maecenas. eget nulla',
    completed: true,
  },
  {
    id: 3,
    title: 'Episode 3',
    duration: '00:00 - 05:19',
    description: 'Non eget nulla mattis sed. Sapien proin.',
    completed: false,
  },
  {
    id: 4,
    title: 'Episode 4',
    duration: '00:00 - 05:19',
    description: 'Non eget nulla mattis sed. Sapien proin.',
    completed: false,
  },
  {
    id: 5,
    title: 'Episode 5',
    duration: '00:00 - 05:19',
    description: 'Non eget nulla mattis sed. Sapien proin.',
    completed: false,
  },
];

interface AudiencePodcastPlayerViewProps {
  onBackToProfile?: () => void;
  podcastTitle?: string;
}

export default function AudiencePodcastPlayerView({
  onBackToProfile,
  podcastTitle = 'Zara Design Concept Podcast',
}: AudiencePodcastPlayerViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'discussion'>('overview');
  const [currentEpisodeId, setCurrentEpisodeId] = useState<number>(1);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(DEFAULT_EPISODES);
  const [progressPercent, setProgressPercent] = useState<number>(16.6); // ~4m 15s into 25m

  // Discussion comments
  const [discussionList, setDiscussionList] = useState<Array<{ id: string; author: string; text: string; time: string; avatar: string }>>([
    {
      id: 'd1',
      author: 'Adam Udochi',
      avatar: '/audience/adam-udochi.png',
      text: 'Great standard breakdown on forensic analysis! Looking forward to episode 3.',
      time: '2 hours ago',
    },
    {
      id: 'd2',
      author: 'Audrey Alexander',
      avatar: '/audience/audrey-alexander.png',
      text: 'The explanation on platea purus in the first half was really clear.',
      time: '5 hours ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleBack = () => {
    if (onBackToProfile) {
      onBackToProfile();
    } else {
      router.push('/audience?view=creator-profile');
    }
  };

  const handleToggleEpisode = (id: number) => {
    setCurrentEpisodeId(id);
    setIsPlaying(true);
    toast(`Playing Episode ${id}`, 'info');
  };

  const handleToggleCompleted = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, completed: !ep.completed } : ep));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setDiscussionList(prev => [
      {
        id: String(Date.now()),
        author: 'Adam Udochi',
        avatar: '/audience/adam-udochi.png',
        text: newComment.trim(),
        time: 'Just now',
      },
      ...prev,
    ]);
    setNewComment('');
    toast('Comment posted to podcast discussion!', 'success');
  };

  return (
    <section className="w-full flex flex-col gap-5 font-['DM_Sans',sans-serif]">
      {/* ─── 1. Header: Back to profile (Frame 2121459063) ─── */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-[#EFEFEF] hover:bg-[#E0E0E0] transition-colors flex items-center justify-center text-[#464646] cursor-pointer shrink-0 shadow-2xs"
          title="Back to profile"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={handleBack}
          className="font-['Urbanist',sans-serif] font-semibold text-[16px] leading-[19px] underline text-[#262626] hover:text-[#D9BA54] transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Back to profile
        </button>
      </div>

      {/* ─── 2. Sub-Header: Zara Design Concept Podcast (Frame 2121459064) ─── */}
      <div className="pt-1">
        <h2 className="font-['Urbanist',sans-serif] font-semibold text-[16px] leading-[19px] underline text-[#262626] m-0">
          {podcastTitle}
        </h2>
      </div>

      {/* ─── 3. Main Player Grid: Left Column 530px + Right Episodes Card 360px ─── */}
      <div className="flex flex-col lg:flex-row items-start gap-8 xl:gap-10 pt-2">
        
        {/* ─── LEFT COLUMN: Media Player + Overview / Discussion (Frame 1618873085: 530px) ─── */}
        <div className="w-full lg:w-[530px] flex flex-col gap-4 shrink-0">
          
          {/* A. Video Container (Frame 1618873038: 530px x 261px, radius 24px 24px 0 0) */}
          <div className="w-full h-[261px] rounded-t-[24px] overflow-hidden relative shadow-sm bg-black group select-none">
            {/* Background Thumbnail Image */}
            <img 
              src="/audience/podcast-video-thumb.png" 
              alt="Podcast Episode Video Thumbnail"
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay (Figma: linear-gradient 0% to 27% black) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 62.5%, rgba(0, 0, 0, 0.45) 85%)',
              }}
            />

            {/* Big Center Play/Pause button on hover */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" fill="currentColor" />}
            </button>

            {/* Bottom Scrubber & Controls (Group 427319003) */}
            <div className="absolute bottom-4 left-6 right-6 flex flex-col gap-2 z-10">
              {/* Progress Bar (Track 459px, height 4px, Red fill) */}
              <div 
                className="w-full h-[4px] bg-[#FFF9F9]/60 rounded-[20px] overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  setProgressPercent(Math.max(2, Math.min(100, clickPos * 100)));
                }}
              >
                <div 
                  className="h-full bg-[#FF0000] rounded-[20px] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Controls Row (Frame 1618873026: Pause + Previous + 00:04:15/02:35:19) */}
              <div className="flex items-center gap-3 pt-0.5 text-white">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer text-white"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProgressPercent(0);
                    toast('Rewound to start', 'info');
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer text-white"
                  title="Previous / Restart"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>

                <span className="font-['DM_Sans',sans-serif] font-semibold text-[14px] leading-[24px] tracking-[-0.01em] text-white select-none">
                  00:04:15/02:35:19
                </span>
              </div>
            </div>
          </div>

          {/* B. Podcast Title & Host Info (Frame 1618873082) */}
          <div className="flex flex-col gap-1 pt-1">
            <h1 className="text-[20px] font-semibold leading-[24px] tracking-[-0.02em] text-[#333333] m-0">
              Audit Design Forensics - A Standard Approach Podcast
            </h1>

            {/* William Joe | Law | 1M monthly listeners */}
            <div className="flex items-center gap-1.5 text-[16px] leading-[24px] tracking-[-0.01em] text-[#757575] font-normal">
              <span>William Joe</span>
              <span>|</span>
              <span>Law</span>
              <span>|</span>
              <span className="text-[#D9BA54] font-medium">1M monthly listeners</span>
            </div>
          </div>

          {/* C. Tabs: Overview vs Discussion (Frame 1618873029) */}
          <div className="flex items-center gap-10 border-b border-gray-200/70 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 text-[16px] leading-[24px] tracking-[-0.01em] transition-all cursor-pointer bg-transparent border-none p-0 ${
                activeTab === 'overview'
                  ? 'font-semibold text-[#D9BA54] border-b-[2px] border-[#D9BA54]'
                  : 'font-normal text-[#757575] hover:text-black'
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`pb-2.5 text-[16px] leading-[24px] tracking-[-0.01em] transition-all cursor-pointer bg-transparent border-none p-0 ${
                activeTab === 'discussion'
                  ? 'font-semibold text-[#D9BA54] border-b-[2px] border-[#D9BA54]'
                  : 'font-normal text-[#757575] hover:text-black'
              }`}
            >
              Discussion
            </button>
          </div>

          {/* D. Tab Content Area (Frame 1618873073) */}
          {activeTab === 'overview' ? (
            <div className="flex flex-col gap-2 pt-1">
              <h3 className="text-[18px] font-medium leading-[24px] tracking-[-0.02em] text-[#333333] m-0">
                Course Description
              </h3>

              <p className="text-[16px] font-normal leading-[24px] tracking-[-0.02em] text-[#757575] m-0">
                Dolor eget eleifend in facilisis aliquam platea purus. Proin faucibus vulputate ipsum morbi enim. Adipiscing pharetra sed massa orci. Adipiscing pharetra sed massa orci.
              </p>
            </div>
          ) : (
            /* Discussion Tab */
            <div className="flex flex-col gap-4 pt-1">
              <h3 className="text-[18px] font-medium leading-[24px] tracking-[-0.02em] text-[#333333] m-0 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#D9BA54]" />
                Listener Discussion ({discussionList.length})
              </h3>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the discussion..."
                  className="flex-1 h-10 px-3.5 rounded-[8px] bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#D9BA54]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#D9BA54] hover:bg-[#c9a73e] text-black font-medium text-xs rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>Post</span>
                </button>
              </form>

              {/* Comments list */}
              <div className="flex flex-col gap-3 mt-1">
                {discussionList.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-[10px] border border-gray-100 shadow-2xs flex items-start gap-3">
                    <img 
                      src={c.avatar} 
                      alt={c.author} 
                      className="w-8 h-8 rounded-full object-cover shrink-0" 
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#181818]">{c.author}</span>
                        <span className="text-[11px] text-gray-400">{c.time}</span>
                      </div>
                      <p className="text-[13px] text-[#464646] m-0 mt-0.5 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ─── RIGHT COLUMN: Podcast Episodes Card (Rectangle 367: 360px x 874px, radius 24px) ─── */}
        <div className="w-full lg:w-[360px] min-h-[560px] lg:min-h-[750px] bg-white rounded-[24px] p-6 sm:p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-start">
          
          {/* Card Header (Frame 1618873040) */}
          <div className="flex flex-col gap-2 pb-6 border-b border-gray-100">
            <h2 className="text-[24px] font-semibold leading-[24px] tracking-[-0.02em] text-[#333333] m-0">
              Podcast Episodes
            </h2>
            <span className="text-[16px] font-normal leading-[24px] tracking-[-0.02em] text-[#757575]">
              Total podcast duration: 2.5 hrs
            </span>
          </div>

          {/* Episodes List (Frame 1618873052: Episodes 1 to 5) */}
          <div className="flex flex-col divide-y divide-gray-100/80 pt-2">
            {episodes.map((ep) => {
              const isCurrent = currentEpisodeId === ep.id;
              const isGoldHighlight = ep.completed || isCurrent;

              return (
                <div
                  key={ep.id}
                  onClick={() => handleToggleEpisode(ep.id)}
                  className={`py-4 sm:py-5 flex flex-col gap-1 transition-all cursor-pointer rounded-[8px] px-2 -mx-2 ${
                    isCurrent ? 'bg-amber-50/40' : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Top row: Episode Title, Duration & Checkbox */}
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-[18px] font-medium leading-[24px] tracking-[-0.02em] ${
                        isGoldHighlight ? 'text-[#D9BA54]' : 'text-[#333333]'
                      }`}
                    >
                      {ep.title}
                    </span>

                    <div className="flex items-center gap-3">
                      <span 
                        className={`text-[16px] leading-[24px] tracking-[-0.02em] font-medium ${
                          isGoldHighlight ? 'text-[#D9BA54]' : 'text-[#757575]'
                        }`}
                      >
                        {ep.duration}
                      </span>

                      {/* Checkbox (fi-rr-checkbox) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCompleted(e, ep.id)}
                        className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          ep.completed 
                            ? 'border-2 border-[#D9BA54] text-[#D9BA54] bg-transparent' 
                            : 'border-2 border-[#757575] text-transparent hover:border-black'
                        }`}
                        title={ep.completed ? "Mark as uncompleted" : "Mark as completed"}
                      >
                        {ep.completed && <Check size={16} strokeWidth={3} className="text-[#D9BA54]" />}
                      </button>
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <p 
                    className={`m-0 leading-[20px] tracking-[-0.02em] ${
                      ep.id === 1 
                        ? 'text-[16px] text-[#757575]' 
                        : 'text-[14px] text-[#757575]'
                    }`}
                  >
                    {ep.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
