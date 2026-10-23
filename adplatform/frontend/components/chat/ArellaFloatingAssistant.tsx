'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  ExternalLink, 
  Mic2, 
  Tv, 
  Wallet, 
  Palette,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import { theme } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';

const F = theme.font.body;

interface Message {
  id: string;
  sender: 'user' | 'arella';
  text: string;
  timestamp: string;
}

// Transform history to format expected by backend /api/chat
function toApiHistory(msgs: Message[]) {
  return msgs.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));
}

// Gentle pleasant chime using Web Audio API
function playChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

// Clean inline markdown renderer: bold, bullet points, linebreaks
function renderChatMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const cleanLine = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;
    
    // Bold segments
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
    const content = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-1">
          <span className="text-[#D4AF37] font-bold mt-1 text-xs">•</span>
          <span className="flex-1">{content}</span>
        </div>
      );
    }

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <p key={lineIdx} className="my-0.5 leading-relaxed">
        {content}
      </p>
    );
  });
}

export default function ArellaFloatingAssistant() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'arella',
      text: `👋 **Hi ${user?.first_name || user?.name?.split(' ')[0] || 'there'}! I'm Arella.**\n\nI'm your AI assistant for Studio Arella. How can I help you today?\n• Book digital LED screen ads at Bems Junction\n• Reserve our 4K soundproof podcast studio\n• Check wallet balance and payments\n• Request custom creative design`,
      timestamp: 'Just now',
    },
  ]);

  // If already on the dedicated /chat page, don't show the floating widget
  const isChatPage = pathname === '/chat';

  // Global event listener to open assistant from anywhere
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setShowTooltip(false);
    };
    window.addEventListener('openArellaAssistant', handleOpen);
    return () => window.removeEventListener('openArellaAssistant', handleOpen);
  }, []);

  // Show proactive greeting bubble after 3 seconds on initial mount
  useEffect(() => {
    if (isChatPage) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, [isChatPage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    { label: 'Book Podcast Studio', icon: Mic2, query: 'How do I book a session in the podcast studio and what are the rates?' },
    { label: 'Screen Ad Rates', icon: Tv, query: 'What are the digital LED screen rates and slot durations at Bems Junction?' },
    { label: 'Wallet & Payments', icon: Wallet, query: 'How do I fund my wallet and what payment methods are supported?' },
    { label: 'Custom Design', icon: Palette, query: 'Can your creative team design an advertisement video or graphic for my business?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    setIsTyping(true);
    setShowTooltip(false);

    try {
      const res = await api.post('/chat', { messages: toApiHistory(nextHistory) });
      const replyText = res.data.reply || "I'm here to help! Could you please elaborate a bit more?";
      const arellaMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'arella',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, arellaMsg]);
      playChime();
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'arella',
        text: "I couldn't connect right now. You can also reach our human support team directly at **support@studioarella.com** or call **08164523926**.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'arella',
        text: `Chat reset! How else can I assist you with your ads or podcast bookings today?`,
        timestamp: 'Just now',
      },
    ]);
  };

  if (isChatPage) return null;

  return (
    <>
      {/* ─── FLOATING ACTION BUTTON (Always Visible, Alive & Pulsing) ─── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Proactive Greeting Speech Bubble Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mb-3 mr-1 relative bg-white border border-gray-200/90 shadow-xl rounded-2xl p-3.5 max-w-[270px] text-left cursor-pointer group"
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    Arella AI Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 -mt-1 -mr-1"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[13px] font-semibold text-gray-800 leading-snug">
                👋 Need help booking an ad slot or the podcast studio?
              </p>
              <span className="text-[11px] font-bold text-amber-600 mt-1 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Chat with me &rarr;
              </span>

              {/* Tooltip pointer tail */}
              <div 
                className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            className="group relative flex items-center gap-3.5 pl-4 pr-5 py-3 rounded-full bg-white border border-gray-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.25)] transition-all duration-300"
            aria-label="Chat with Arella AI Assistant"
          >
            {/* Ambient Aura Pulsing Ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-500 opacity-60 blur-xs group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-pulse" />

            {/* Glowing Orb / Avatar */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <Globe size={16} className="text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {/* Green Online Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Label */}
            <div className="flex flex-col text-left">
              <span className="text-[13.5px] font-extrabold text-gray-900 group-hover:text-black leading-tight flex items-center gap-1.5">
                Chat with Arella
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                  <Sparkles size={8} /> AI
                </span>
              </span>
              <span className="text-[11px] font-medium text-gray-500 leading-tight">
                Studio Assistant • Online
              </span>
            </div>
          </motion.button>
        )}
      </div>

      {/* ─── INTERACTIVE FLOATING AI CHAT DRAWER / WINDOW ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-5 right-5 z-50 bg-white border border-gray-200/90 rounded-[28px] shadow-[0_24px_70px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-[calc(100vw-40px)] sm:w-[540px] h-[720px] max-h-[92vh]' 
                : 'w-[calc(100vw-36px)] sm:w-[410px] h-[600px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="relative px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#FAFAFE] via-white to-[#FDFBF7] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Globe size={20} className="text-indigo-600" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-black text-gray-900 leading-tight">
                      Arella AI
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100/80 text-purple-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={9} /> Assistant
                    </span>
                  </div>
                  <p className="text-[11.5px] text-gray-500 font-medium">
                    Studio Arella Copilot &bull; Always Online
                  </p>
                </div>
              </div>

              {/* Header Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Reset Conversation"
                  aria-label="Reset chat"
                >
                  <RotateCcw size={15} />
                </button>
                <Link
                  href="/chat"
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Open Full Page Chat"
                  aria-label="Open full page chat"
                >
                  <ExternalLink size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors hidden sm:inline-flex"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  aria-label={isExpanded ? 'Collapse window' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors ml-0.5"
                  title="Minimize"
                  aria-label="Minimize chat"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FBFBFA]/60 text-sm">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs ${
                        isUser
                          ? 'bg-black text-white rounded-br-xs font-normal'
                          : 'bg-white border border-gray-200/80 text-gray-800 rounded-bl-xs'
                      }`}
                    >
                      <div className="text-[13.5px] leading-relaxed">
                        {isUser ? m.text : renderChatMarkdown(m.text)}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-700">Arella is thinking</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips (Shown when 2 or fewer messages) */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-white/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
                {quickPrompts.map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.label}
                      type="button"
                      disabled={isTyping}
                      onClick={() => handleSendMessage(q.query)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 text-gray-700 border border-gray-200 text-xs font-semibold transition-all duration-150 flex-shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <Icon size={12} className="text-[#D4AF37]" />
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3.5 border-t border-gray-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Arella anything..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent py-2 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-hidden disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-black transition-all flex-shrink-0 cursor-pointer shadow-xs"
                  aria-label="Send message"
                >
                  <Send size={14} className={inputText.trim() ? 'translate-x-0.5' : ''} />
                </button>
              </form>
              <div className="mt-1.5 text-center">
                <span className="text-[10px] text-gray-400 font-medium">
                  Studio Arella AI &bull; Bems Digital Media Umuahia
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
