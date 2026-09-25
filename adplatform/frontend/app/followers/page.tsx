'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { theme } from '@/lib/theme';

export default function FollowersPage() {
  const [tab, setTab] = useState<'followers' | 'following'>('followers');

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="w-full max-w-[850px] mx-auto pt-[40px] pb-[100px] font-sans">
          <h1 className="text-[14px] font-semibold text-[#181818] mb-[40px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Followers</h1>

          {/* Tabs Area */}
          <div className="flex w-full relative h-[50px] items-end" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <button 
              onClick={() => setTab('followers')}
              className={`w-[240px] uppercase text-[12px] flex items-center justify-center transition-all ${tab === 'followers' ? 'h-[50px] bg-[#D4AF37] rounded-t-[4px] text-[#000000]' : 'h-[40px] bg-white border border-[#E7E7E7] text-[#181818]'}`}
            >
              Followers
            </button>
            <button 
              onClick={() => setTab('following')}
              className={`w-[240px] uppercase text-[12px] flex items-center justify-center transition-all ${tab === 'following' ? 'h-[50px] bg-[#D4AF37] rounded-t-[4px] text-[#000000]' : 'h-[40px] bg-white border border-[#E7E7E7] text-[#181818]'}`}
            >
              Following
            </button>
          </div>

          {/* Gradient Under Tabs */}
          <div className="w-full h-[50px] border-t border-[#E7E7E7]" style={{ background: 'linear-gradient(180deg, rgba(255, 252, 241, 0.8) 0%, rgba(255, 252, 241, 0) 100%)' }}></div>

          {tab === 'followers' && (
            <div style={{ fontFamily: 'var(--font-dm-sans)' }}>
              {/* New Followers Divider */}
              <div className="flex items-center gap-[16px] my-[30px]">
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                <span className="text-[12px] uppercase text-[#181818] font-medium tracking-wide">
                  YOU HAVE <span className="text-[#D4AF37]">2 NEW FOLLOWERS</span>
                </span>
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
              </div>

              {/* New Followers List */}
              <div className="flex flex-col gap-[20px]">
                
                {/* Brandon Wilson */}
                <div className="w-full min-h-[95px] bg-white rounded-[4px] flex items-center px-[30px] py-[20px] relative">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     {/* Placeholder image for Brandon */}
                     <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Brandon Wilson" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col w-[160px]">
                    <span className="text-[14px] font-semibold text-[#181818]">Brandon Wilson</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Senior UX designer</span>
                    <span className="text-[10px] text-[#15411F] mt-[2px]">623 followers</span>
                  </div>
                  
                  <div className="ml-[40px] flex items-center gap-[16px] flex-1">
                    <div className="w-[2px] h-[42px] bg-[#D4AF37]"></div>
                    <p className="text-[10px] text-[#181818]/60 max-w-[300px] leading-[150%]">
                      Hey, I saw your works. I like it! Can we do something together? Or maybe you have project for podcast at the moment?
                    </p>
                  </div>

                  <button className="w-[91px] h-[32px] bg-[#D4AF37] rounded-[4px] text-[12px] text-[#000000]">
                    Follow
                  </button>
                </div>

                {/* Theresa Steward */}
                <div className="w-full min-h-[95px] bg-white rounded-[4px] flex items-center px-[30px] py-[20px] relative">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Theresa Steward" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col w-[160px]">
                    <span className="text-[14px] font-semibold text-[#181818]">Theresa Steward</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">iOS developer</span>
                    <span className="text-[10px] text-[#15411F] mt-[2px]">481 followers</span>
                  </div>

                  <div className="flex-1"></div>

                  <button className="w-[91px] h-[32px] bg-[#D4AF37] rounded-[4px] text-[12px] text-[#000000]">
                    Follow
                  </button>
                </div>

              </div>

              {/* Your Followers Divider */}
              <div className="flex items-center gap-[16px] mt-[60px] mb-[30px]">
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
                <span className="text-[12px] uppercase text-[#181818] font-medium tracking-wide">YOUR FOLLOWES</span>
                <div className="flex-1 h-[1px] bg-[#E7E7E7]"></div>
              </div>

              {/* Old Followers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[20px]">
                
                {/* Audrey Alexander */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80" alt="Audrey Alexander" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Audrey Alexander</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Team lead at Google</span>
                  </div>
                </div>

                {/* Kyle Fisher */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Kyle Fisher" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Kyle Fisher</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Product designer at Commandor Corp</span>
                  </div>
                </div>

                {/* Darlene Black */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Darlene Black" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Darlene Black</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">HR-manager, 10 000 connections</span>
                  </div>
                </div>

                {/* Eduardo Russell */}
                <div className="w-full h-[95px] bg-white rounded-[4px] flex items-center px-[30px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" alt="Eduardo Russell" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-[16px] flex flex-col">
                    <span className="text-[14px] font-semibold text-[#181818]">Eduardo Russell</span>
                    <span className="text-[10px] text-[#181818] mt-[2px]">Full stack developer at Yandex</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {tab === 'following' && (
            <div className="flex items-center justify-center h-[200px] text-[#181818]/60 text-[14px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
               You are not following anyone yet.
            </div>
          )}

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
