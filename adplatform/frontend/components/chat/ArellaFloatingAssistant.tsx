'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/lib/theme';

const F = theme.font.body;

export default function ArellaFloatingAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  // If already on the dedicated /chat screen, don't show the floating launcher
  const isChatPage = pathname === '/chat';

  // Global event listener so any button dispatching 'openArellaAssistant' smoothly navigates to /chat
  useEffect(() => {
    const handleOpen = () => {
      router.push('/chat');
    };
    window.addEventListener('openArellaAssistant', handleOpen);
    return () => window.removeEventListener('openArellaAssistant', handleOpen);
  }, [router]);

  // Show proactive welcoming bubble after 2.5s on initial mount
  useEffect(() => {
    if (isChatPage || hasDismissed) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isChatPage, hasDismissed]);

  if (isChatPage) return null;

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there';

  const handleClick = () => {
    setShowTooltip(false);
    router.push('/chat');
  };

  return (
    <div
      className="chat-fab-widget fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none"
      style={{ fontFamily: F }}
    >
      {/* ─── PROACTIVE SPEECH BUBBLE TOOLTIP ─── */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto mb-3 max-w-[calc(100vw-32px)] sm:max-w-[310px] bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-white/10 rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] relative group"
          >
            <div className="flex items-start gap-2.5">
              {/* Signature Orb Icon */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
                  boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.12)',
                }}
                className="shrink-0 mt-0.5"
              />

              <div className="flex-1 cursor-pointer" onClick={handleClick}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[12px] font-bold text-neutral-900 dark:text-white">
                    Arella AI Assistant
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11.5px] text-neutral-600 dark:text-neutral-300 leading-snug">
                  Hi <strong>{firstName}</strong>! Need help booking screen ads or reserving our podcast studio?
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#CCA336] group-hover:underline">
                  <span>Open AI Chat</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Close Tooltip Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  setHasDismissed(true);
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 -mr-1 -mt-1 rounded-full transition-colors"
                aria-label="Dismiss greeting"
              >
                <X size={14} />
              </button>
            </div>

            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 right-6 sm:right-8 w-3 h-3 bg-white dark:bg-[#18181B] border-r border-b border-neutral-200/90 dark:border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING LAUNCHER PILL BUTTON ─── */}
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        className="pointer-events-auto group relative flex items-center gap-2.5 p-2 sm:pl-3.5 sm:pr-4 sm:py-2.5 rounded-full bg-white dark:bg-[#161618] border border-neutral-200/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(204,163,54,0.28)] transition-all duration-300 cursor-pointer"
        aria-label="Open Arella AI Chat"
      >
        {/* Ambient Pulsing Aura */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#5CEAEA] via-[#D987EF] to-[#FCB902] opacity-40 blur-xs group-hover:opacity-90 transition-opacity duration-300 -z-10 animate-pulse" />

        {/* Signature UX Orb Avatar with Live Pulse */}
        <div className="relative shrink-0">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
              boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
            }}
            className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          />
          {/* Live Active Pulse Dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-[#161618]" />
          </span>
        </div>

        {/* Text Affordance (Hidden on mobile phones, visible on tablet/desktop) */}
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="chat-fab-label text-[13.5px] font-extrabold text-neutral-900 dark:text-white leading-tight">
              Chat with Arella
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-[#CCA336]/20 text-[#CCA336] text-[9.5px] font-black uppercase tracking-wider">
              <Sparkles size={8} /> AI
            </span>
          </div>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
            Studio Assistant &bull; Online
          </span>
        </div>
      </motion.button>
    </div>
  );
}
