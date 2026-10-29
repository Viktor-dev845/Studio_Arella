'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Pause, 
  Play, 
  SkipBack, 
  Check 
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
  const [activeTab, setActiveTab] = useState<'overview' | 'discussion'>('discussion');
  const [currentEpisodeId, setCurrentEpisodeId] = useState<number>(1);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(DEFAULT_EPISODES);
  const [progressPercent, setProgressPercent] = useState<number>(16.6); // ~4m 15s into 25m

  // Discussion comments matching Figma Frame 1618873086 (Chukuemeka Azor)
  const [discussionList, setDiscussionList] = useState<Array<{ id: string; author: string; text: string; time: string; avatar: string }>>([
    {
      id: 'd1',
      author: 'Chukuemeka Azor',
      avatar: '/audience/chukuemeka-azor.png',
      text: 'The breakdown of the mobile UI information architecture was eye-opening! Especially the discussion around balancing typography hierarchy with subtle audio feedback loops.',
      time: '2hrs ago',
    },
    {
      id: 'd2',
      author: 'Theresa Steward',
      avatar: '/audience/theresa-steward.png',
      text: 'Loved the practical insights on design systems. Are there going to be downloadable Figma assets or templates shared for this audio companion episode?',
      time: '1hr ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleBack = () => {
    if (onBackToProfile) {
      onBackToProfile();
    } else {
      router.push('/audience');
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
      ...prev,
      {
        id: String(Date.now()),
        author: 'Chukuemeka Azor',
        avatar: '/audience/chukuemeka-azor.png',
        text: newComment.trim(),
        time: 'Just now',
      },
    ]);
    setNewComment('');
    toast('Comment posted to podcast discussion!', 'success');
  };

  return (
    <section className="w-full flex flex-col gap-5 font-quicksand">
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
          className="font-quicksand font-semibold text-[16px] leading-[19px] underline text-[#262626] hover:text-[#D9BA54] transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Back to profile
        </button>
      </div>

      {/* ─── 2. Sub-Header: Zara Design Concept Podcast (Frame 2121459064) ─── */}
      <div className="pt-1">
        <h2 className="font-quicksand font-semibold text-[16px] leading-[19px] underline text-[#262626] m-0">
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
              src="/audience/covers/creative.jpg" 
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

            {/* Center Play/Pause button on hover */}
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

                <span className="font-quicksand font-semibold text-[14px] leading-[24px] tracking-[-0.01em] text-white select-none">
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
          <div className="flex items-center gap-[40px] h-[44px] pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`h-[44px] flex items-center justify-center font-quicksand text-[16px] leading-[24px] tracking-[-0.01em] transition-all cursor-pointer bg-transparent border-0 p-0 ${
                activeTab === 'overview'
                  ? 'font-semibold text-[#D9BA54] border-b-[1.5px] border-[#D9BA54]'
                  : 'font-normal text-[#757575] hover:text-[#333333]'
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`h-[44px] flex items-center justify-center font-quicksand text-[16px] leading-[24px] tracking-[-0.01em] transition-all cursor-pointer bg-transparent border-0 p-0 ${
                activeTab === 'discussion'
                  ? 'font-semibold text-[#D9BA54] border-b-[1.5px] border-[#D9BA54]'
                  : 'font-normal text-[#757575] hover:text-[#333333]'
              }`}
            >
              Discussion
            </button>
          </div>

          {/* D. Tab Content Area */}
          {activeTab === 'overview' ? (
            /* Frame 1618873073: Course Description */
            <div className="flex flex-col gap-2 pt-2 max-w-[530px]">
              <h3 className="font-quicksand text-[18px] font-semibold leading-[24px] tracking-[-0.02em] text-[#333333] m-0">
                Course Description
              </h3>

              <p className="font-quicksand text-[16px] font-normal leading-[24px] tracking-[-0.02em] text-[#757575] m-0">
                Explore the foundational principles of modern digital product design and brand storytelling. In this masterclass series, we break down design systems, user journeys, sound design integration, and how high-growth creators build lasting community connections through interactive audio.
              </p>
            </div>
          ) : (
            /* Frame 1618873087: Discussion List + Input Form */
            <div className="flex flex-col gap-5 pt-1 w-full max-w-[530px]">
              {/* Frame 1618873086: Comments list */}
              <div className="flex flex-col gap-4">
                {discussionList.map((c) => (
                  <div key={c.id} className="flex flex-col gap-1 w-full max-w-[530px]">
                    {/* Frame 1618873055: Avatar + Name + Time */}
                    <div className="flex items-center gap-4">
                      {/* Ellipse 41: 56px x 56px */}
                      <img 
                        src={c.avatar} 
                        alt={c.author} 
                        className="w-[56px] h-[56px] rounded-full object-cover shrink-0 shadow-2xs" 
                      />
                      
                      {/* Frame 1618873054: Name + Time */}
                      <div className="flex flex-col gap-1">
                        <span className="font-quicksand font-medium text-[18px] leading-[24px] tracking-[-0.02em] text-[#333333]">
                          {c.author}
                        </span>
                        <span className="font-quicksand font-normal text-[16px] leading-[24px] tracking-[-0.02em] text-[#757575]">
                          {c.time}
                        </span>
                      </div>
                    </div>

                    {/* Comment text paragraph (width: 530px) */}
                    <p className="font-quicksand font-normal text-[16px] leading-[24px] tracking-[-0.02em] text-[#757575] m-0 pt-0.5">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Frame 1618873075: Input text field (408px) + Send button (106px) */}
              <form onSubmit={handleAddComment} className="flex items-center gap-4 pt-1 w-full max-w-[530px]">
                {/* text field: 408px x 53px */}
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type message . . ."
                  className="w-full sm:w-[408px] h-[53px] px-4 rounded-[8px] bg-white border-0 outline-none font-quicksand text-[16px] leading-[24px] text-[#333333] placeholder:text-[#757575] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] focus:ring-1 focus:ring-[#D9BA54]"
                />

                {/* Frame 1618873058: Send button (106px x 53px) */}
                <button
                  type="submit"
                  className="w-[106px] h-[53px] bg-[#D9BA54] hover:bg-[#c9a73e] active:scale-[0.98] rounded-[8px] flex items-center justify-center font-quicksand font-semibold text-[16px] leading-[21px] tracking-[-0.02em] text-[#000000] transition-all cursor-pointer border-0 shrink-0"
                >
                  Send
                </button>
              </form>
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

          {/* Episodes List (Frame 1618873052: Episodes 1 to 5, gap: 32px) */}
          <div className="flex flex-col gap-8 pt-6">
            {episodes.map((ep) => {
              const isCurrent = currentEpisodeId === ep.id;
              const isGoldHighlight = ep.completed || isCurrent;

              return (
                <div
                  key={ep.id}
                  onClick={() => handleToggleEpisode(ep.id)}
                  className="flex flex-col gap-1 transition-all cursor-pointer group"
                >
                  {/* Top row: Episode Title, Duration & Checkbox (Frame 1618873051) */}
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-[18px] font-medium leading-[24px] tracking-[-0.02em] group-hover:text-[#D9BA54] transition-colors ${
                        isGoldHighlight ? 'text-[#D9BA54]' : 'text-[#333333]'
                      }`}
                    >
                      {ep.title}
                    </span>

                    <div className="flex items-center gap-4">
                      <span 
                        className={`text-[16px] leading-[24px] tracking-[-0.02em] font-medium ${
                          isGoldHighlight ? 'text-[#D9BA54]' : 'text-[#757575]'
                        }`}
                      >
                        {ep.duration}
                      </span>

                      {/* Checkbox (fi-rr-checkbox: 24px x 24px) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCompleted(e, ep.id)}
                        className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          ep.completed 
                            ? 'border-2 border-[#D9BA54] text-[#D9BA54] bg-transparent' 
                            : 'border-2 border-[#757575] text-transparent hover:border-[#333333]'
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
