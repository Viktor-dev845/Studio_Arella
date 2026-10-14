'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface FilterItem {
  id: string;
  label: string;
  count: number;
}

const TRENDING_TOPICS: FilterItem[] = [
  { id: 'health', label: 'Health', count: 10 },
  { id: 'wealth', label: 'Wealth', count: 10 },
  { id: 'politics', label: 'Politics', count: 10 },
  { id: 'entertainment', label: 'Entertainment', count: 10 },
];

const LIVE_EXPERIENCES: FilterItem[] = [
  { id: 'all', label: 'All', count: 10 },
  { id: 'family', label: 'Family', count: 10 },
  { id: 'business', label: 'Business', count: 10 },
  { id: 'relationship', label: 'Relationship', count: 10 },
  { id: 'marriage', label: 'Marriage', count: 10 },
];

interface AudienceTrendingFiltersCardProps {
  onFilterChange?: (selectedTopics: string[], selectedLiveExp: string[]) => void;
}

export default function AudienceTrendingFiltersCard({
  onFilterChange,
}: AudienceTrendingFiltersCardProps) {
  // Wealth is checked by default as per Figma design
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['wealth']);
  const [selectedLiveExp, setSelectedLiveExp] = useState<string[]>([]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];
      if (onFilterChange) onFilterChange(next, selectedLiveExp);
      return next;
    });
  };

  const toggleLiveExp = (id: string) => {
    setSelectedLiveExp((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];
      if (onFilterChange) onFilterChange(selectedTopics, next);
      return next;
    });
  };

  return (
    <div className="w-full bg-[#FCFDFD] rounded-[16px] p-6 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] border border-gray-100/60 flex flex-col gap-8">
      {/* ─── 1. Trending topics Section ─── */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[20px] font-semibold text-[#666666] leading-snug">
          Trending topics
        </h4>

        <div className="flex flex-col gap-3">
          {TRENDING_TOPICS.map((topic) => {
            const isChecked = selectedTopics.includes(topic.id);
            return (
              <label
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className="flex items-center justify-between cursor-pointer group select-none py-0.5"
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#D4AF37] text-white shadow-sm'
                        : 'border border-[#6C757D] group-hover:border-black/70 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} className="text-white" />}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[16px] transition-colors ${
                      isChecked ? 'text-[#16151C] font-medium' : 'text-[#666666] group-hover:text-black'
                    }`}
                  >
                    {topic.label}
                  </span>
                </div>

                {/* Count Badge */}
                <span className="min-w-[34px] h-[20px] px-2 bg-white text-[#6C757D] text-[15px] font-normal rounded-[12px] flex items-center justify-center border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {topic.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ─── 2. Live experience Section ─── */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[20px] font-semibold text-[#666666] leading-snug">
          Live experience
        </h4>

        <div className="flex flex-col gap-3">
          {LIVE_EXPERIENCES.map((exp) => {
            const isChecked = selectedLiveExp.includes(exp.id);
            return (
              <label
                key={exp.id}
                onClick={() => toggleLiveExp(exp.id)}
                className="flex items-center justify-between cursor-pointer group select-none py-0.5"
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#D4AF37] text-white shadow-sm'
                        : 'border border-[#6C757D] group-hover:border-black/70 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check size={13} strokeWidth={3} className="text-white" />}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[16px] transition-colors ${
                      isChecked ? 'text-[#16151C] font-medium' : 'text-[#666666] group-hover:text-black'
                    }`}
                  >
                    {exp.label}
                  </span>
                </div>

                {/* Count Badge */}
                <span className="min-w-[34px] h-[20px] px-2 bg-white text-[#6C757D] text-[15px] font-normal rounded-[12px] flex items-center justify-center border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {exp.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
