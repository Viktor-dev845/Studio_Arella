'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, RotateCcw, User, Sparkles, Send } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface Message {
  id: string;
  sender: 'user' | 'arella';
  text: string;
  timestamp: string;
}

// Gentle audio chime on completion
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
    gain1.gain.setValueAtTime(0.05, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

// The API is stateless — we resend the whole conversation as {role, content}
// pairs on every turn, same shape the Anthropic Messages API expects.
function toApiHistory(msgs: Message[]) {
  return msgs.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
}

// Inline markdown renderer: renders **bold** segments, list items, and line breaks
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ChatPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-u',
      sender: 'user',
      text: 'Hello Arella!',
      timestamp: 'Just now',
    },
    {
      id: 'init-a',
      sender: 'arella',
      text: `👋 **Hi ${firstName}! I'm Arella, your AI copilot for Studio Arella in Umuahia.**\n\nI can assist you across all our media services:\n\n1. **Digital LED Screen Ads**: Check prime billboard slots, rates, and schedule your video ads at Bems Junction.\n2. **4K Podcast Studio**: Reserve acoustic soundproof studio slots, multi-camera setups, and sound engineer support.\n3. **Wallet & Billing**: Instant wallet funding, receipt verification, and payment monitoring.\n4. **Creative Design Services**: Commission high-converting motion graphics, flyers, and branding tailored for your business.\n\nWhat would you like to explore or book today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: '🎙️ Book Podcast Studio', query: 'How do I book a session in the 4K soundproof podcast studio and what are the available rates?' },
    { label: '📺 Screen Ad Rates', query: 'What are the digital LED screen rates and slot durations at Bems Junction?' },
    { label: '💳 Wallet & Payments', query: 'How do I fund my wallet and what payment methods are supported?' },
    { label: '🎨 Custom Creative Design', query: 'Can your creative team design an advertisement video or graphic for my business?' },
  ];

  const requestReply = async (history: Message[]) => {
    setIsTyping(true);
    try {
      const res = await api.post('/chat', { messages: toApiHistory(history) });
      const reply: Message = {
        id: `${Date.now()}-a`,
        sender: 'arella',
        text: res.data.reply || "I didn't quite catch that — could you try again?",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, reply]);
      playChime();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Arella AI could not respond right now.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    requestReply(nextHistory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleEditPrompt = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const handleRegenerate = () => {
    if (isTyping) return;
    const lastArellaIdx = [...messages].reverse().findIndex((m) => m.sender === 'arella');
    if (lastArellaIdx === -1) return;
    const cutIndex = messages.length - 1 - lastArellaIdx;
    const trimmed = messages.slice(0, cutIndex);
    setMessages(trimmed);
    requestReply(trimmed);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 1040, margin: '0 auto', padding: '16px 20px 32px' }}>
          
          {/* Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors text-xs font-semibold"
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-neutral-900 dark:text-white font-display">
                Arella AI Chat
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#CCA336]/15 text-[#CCA336] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={10} /> Copilot
              </span>
            </div>
          </div>

          {/* Outer Chat Box Card (Matching Figma Frame 2121459599) */}
          <div
            className="bg-[#F1F1F1] dark:bg-[#161618] border border-neutral-200/60 dark:border-white/10"
            style={{
              borderRadius: 24,
              padding: '32px 36px 24px',
              minHeight: 'calc(100vh - 150px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
            }}
          >
            {/* Conversation Content Area */}
            <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Centered 'Your response' subtitle */}
              <p
                className="text-neutral-400 dark:text-neutral-500"
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  margin: '0 0 20px',
                  letterSpacing: '0.02em',
                }}
              >
                Your response
              </p>

              {/* Messages Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {messages.map((m) => {
                  if (m.sender === 'user') {
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* User Circular Avatar */}
                        <div
                          className="bg-white dark:bg-[#202024] border border-neutral-200 dark:border-white/10"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          }}
                        >
                          <User size={18} color="#CCA336" />
                        </div>

                        {/* User Input Bubble with Edit Pencil */}
                        <div
                          className="border border-neutral-300/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-800 dark:text-neutral-200"
                          style={{
                            flex: 1,
                            borderRadius: 24,
                            padding: '12px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          <span>{m.text}</span>
                          <button
                            type="button"
                            onClick={() => handleEditPrompt(m.text)}
                            className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors p-1 rounded-full cursor-pointer"
                            title="Edit prompt in input bar"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Arella AI Signature Radial Orb Avatar */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 4,
                          boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.12)',
                        }}
                      />

                      {/* AI Response Card Container */}
                      <div
                        className="bg-white dark:bg-[#1E1E22] border border-neutral-100 dark:border-white/5 text-[#52525B] dark:text-neutral-300"
                        style={{
                          flex: 1,
                          borderRadius: 20,
                          padding: '30px 34px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                          fontSize: 14,
                          lineHeight: 1.8,
                        }}
                      >
                        {m.text.split('\n\n').map((paragraph, idx) => {
                          const match = paragraph.match(/^(\d+\.\s+[^:]+:)([\s\S]*)$/);
                          if (match) {
                            return (
                              <p key={idx} style={{ margin: '0 0 14px', lineHeight: 1.7 }}>
                                <strong className="font-bold text-neutral-900 dark:text-white">
                                  {renderInlineMarkdown(match[1])}
                                </strong>
                                {renderInlineMarkdown(match[2])}
                              </p>
                            );
                          }
                          return (
                            <p key={idx} style={{ margin: '0 0 14px', lineHeight: 1.7 }}>
                              {renderInlineMarkdown(paragraph)}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Thinking Indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        animation: 'pulse 1.8s infinite',
                      }}
                    />
                    <div
                      className="bg-white dark:bg-[#1E1E22] border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400"
                      style={{
                        borderRadius: 16,
                        padding: '12px 20px',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span>Arella AI is thinking</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CCA336] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CCA336] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CCA336] animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              {messages.length <= 3 && !isTyping && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {quickPrompts.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleSend(q.query)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1E22] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-[#CCA336] hover:text-[#CCA336] text-xs font-semibold transition-all duration-150 shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Regenerate response button — only once there's an actual reply to regenerate */}
              {messages.some((m) => m.sender === 'arella') && !isTyping && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-2 bg-transparent hover:bg-neutral-200/50 dark:hover:bg-white/5 border border-neutral-300 dark:border-white/15 text-neutral-600 dark:text-neutral-400 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Regenerate response</span>
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Input Area & Disclaimer */}
            <div style={{ maxWidth: 760, margin: '20px auto 0', width: '100%' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Chat with Arella (e.g., How much are screen ads at Bems Junction?)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  className="bg-white/80 dark:bg-white/5 border border-neutral-300 dark:border-white/15 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#CCA336] focus:ring-2 focus:ring-[#CCA336]/20 transition-all"
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderRadius: 30,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: F,
                    outline: 'none',
                  }}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  style={{
                    padding: '16px 36px',
                    background: '#CCA336',
                    color: '#000000',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
                    fontFamily: F,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    opacity: !inputText.trim() || isTyping ? 0.6 : 1,
                  }}
                  className="hover:brightness-95 active:scale-98 shadow-sm flex items-center gap-2"
                >
                  <span>Submit</span>
                  <Send size={14} />
                </button>
              </form>

              <p
                className="text-neutral-400 dark:text-neutral-500"
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 500,
                  margin: '12px 0 0',
                }}
              >
                Free Research Preview. Arella AI may produce inaccurate information about people, places, or facts.
              </p>
            </div>

          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
