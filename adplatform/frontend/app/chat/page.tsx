'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, RotateCcw, User, Sparkles } from 'lucide-react';
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

// Gentle pleasant audio chime on reply completion
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

// Transform history to format expected by backend /api/chat
function toApiHistory(msgs: Message[]) {
  return msgs.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
}

// Inline markdown renderer: renders **bold** segments, list items, and line breaks
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white" style={{ fontFamily: F }}>
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
      text: 'Nice!',
      timestamp: 'Just now',
    },
    {
      id: 'init-a',
      sender: 'arella',
      text: `Artificial Intelligence (AI) offers numerous advantages and has the potential to revolutionize various aspects of our lives. Here are some key advantages of AI:\n\n1. Automation: AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision and consistency. This automation leads to increased productivity and efficiency in various industries.\n\n2. Decision-making: AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis. This ability is particularly useful in complex scenarios where humans may struggle to process large datasets or where quick and accurate decisions are crucial.\n\n3. Improved accuracy: AI algorithms can achieve high levels of accuracy and precision in tasks such as image recognition, natural language processing, and data analysis. They can eliminate human errors caused by fatigue, distractions, or bias, leading to more reliable and consistent results.\n\n4. Continuous operation: AI systems can work tirelessly without the need for breaks, resulting in uninterrupted 24/7 operations. This capability is especially beneficial in applications like customer support chatbots, manufacturing processes, and surveillance systems.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to latest message inside the conversation area
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
      <PageTransition style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
        {/* Full-screen fitting outer wrapper with Quicksand platform font */}
        <div
          style={{
            fontFamily: F,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 24px 20px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Header Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 10,
              flexShrink: 0,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#718096',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: F,
                transition: 'color 0.2s',
              }}
              className="hover:text-black dark:hover:text-white"
            >
              <ChevronLeft size={16} /> Back
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1
                style={{
                  fontFamily: F,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#121212',
                  margin: 0,
                }}
                className="dark:text-white"
              >
                Arella AI Chat
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#D4AF37',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: F,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Sparkles size={10} /> Copilot
              </span>
            </div>
          </div>

          {/* ─── EXACT FIGMA LAYOUT CONTAINER (background: #EAEAEA, border-radius: 20px) ─── */}
          <div
            style={{
              flex: 1,
              width: '100%',
              minHeight: 0,
              background: '#EAEAEA',
              borderRadius: 20,
              padding: '18px 28px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="dark:bg-[#18181B] dark:border dark:border-white/10"
          >
            {/* Centered 'Your response' subtitle */}
            <p
              style={{
                fontFamily: F,
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '26px',
                textAlign: 'center',
                color: '#718096',
                margin: '0 0 10px',
                flexShrink: 0,
              }}
            >
              Your response
            </p>

            {/* ─── CONVERSATION STREAM (SCROLLABLE INSIDE) ─── */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                width: '100%',
                maxWidth: 960,
                margin: '0 auto',
                paddingRight: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {messages.map((m) => {
                if (m.sender === 'user') {
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                      }}
                    >
                      {/* User Avatar (Figma: width 40, height 40, border 1px solid #98989A, border-radius 14px, squircle with gold vector) */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          background: '#FFFFFF',
                          border: '1px solid #98989A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        className="dark:bg-[#202024] dark:border-white/20"
                      >
                        <User size={18} color="#D4AF37" strokeWidth={2.2} />
                      </div>

                      {/* Question Card (Figma: width 940, height 60 / min-height 54, border 1px solid #98989A, border-radius 14px) */}
                      <div
                        style={{
                          flex: 1,
                          minHeight: 54,
                          border: '1px solid #98989A',
                          borderRadius: 14,
                          padding: '12px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          background: 'rgba(255, 255, 255, 0.4)',
                        }}
                        className="dark:bg-white/5 dark:border-white/20"
                      >
                        <span
                          style={{
                            fontFamily: F,
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: 16,
                            lineHeight: '100%',
                            color: '#121212',
                          }}
                          className="dark:text-white"
                        >
                          {m.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEditPrompt(m.text)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#718096',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                          }}
                          className="hover:text-black dark:hover:text-white"
                          title="Edit prompt"
                        >
                          <Pencil size={20} />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      width: '100%',
                    }}
                  >
                    {/* Arella AI Avatar (Figma Asset 3 1: width 40, height 40, border-radius 14px) */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                        boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.12)',
                      }}
                    />

                    {/* Response Card (Figma: width 940, height 474 / auto, background #FFFFFF, box-shadow: 14px 27px 45px 4px rgba(170, 170, 170, 0.2), border-radius 14px) */}
                    <div
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        boxShadow: '14px 27px 45px 4px rgba(170, 170, 170, 0.2)',
                        borderRadius: 14,
                        padding: '24px 28px',
                        fontFamily: F,
                        fontStyle: 'normal',
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: '24px',
                        color: 'rgba(18, 18, 18, 0.75)',
                      }}
                      className="dark:bg-[#1E1E22] dark:text-neutral-200 dark:shadow-none dark:border dark:border-white/10"
                    >
                      {m.text.split('\n\n').map((paragraph, idx) => {
                        const match = paragraph.match(/^(\d+\.\s+[^:]+:)([\s\S]*)$/);
                        if (match) {
                          return (
                            <p key={idx} style={{ margin: '0 0 14px', lineHeight: '24px', fontFamily: F }}>
                              <strong
                                style={{
                                  fontWeight: 700,
                                  color: '#121212',
                                  fontFamily: F,
                                }}
                                className="dark:text-white"
                              >
                                {renderInlineMarkdown(match[1])}
                              </strong>
                              {renderInlineMarkdown(match[2])}
                            </p>
                          );
                        }
                        return (
                          <p key={idx} style={{ margin: '0 0 14px', lineHeight: '24px', fontFamily: F }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      background: 'radial-gradient(circle at 30% 30%, #5CEAEA 0%, #D987EF 30%, #FCB902 60%, #C73FCC 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      animation: 'pulse 1.8s infinite',
                    }}
                  />
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 14,
                      padding: '12px 20px',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: F,
                      color: '#718096',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    }}
                    className="dark:bg-[#1E1E22] dark:text-neutral-300"
                  >
                    <span>Arella AI is thinking</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Action Suggestion Chips */}
              {messages.length <= 3 && !isTyping && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  {quickPrompts.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleSend(q.query)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 20,
                        background: '#FFFFFF',
                        border: '1px solid #98989A',
                        color: '#121212',
                        fontFamily: F,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-[#D4AF37] hover:text-[#D4AF37] dark:bg-[#1E1E22] dark:text-neutral-300 dark:border-white/20"
                    >
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Regenerate Response Button (Figma: width 218px, height 54px, border 1px solid #98989A, border-radius 45px) */}
              {messages.some((m) => m.sender === 'arella') && !isTyping && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 4 }}>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    style={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0px',
                      gap: 10,
                      width: 218,
                      height: 54,
                      border: '1px solid #98989A',
                      borderRadius: 45,
                      background: 'transparent',
                      fontFamily: F,
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: 14,
                      lineHeight: '16px',
                      color: '#98989A',
                      opacity: 0.98,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:bg-neutral-200/50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                  >
                    <RotateCcw size={14} color="#1B2559" className="dark:text-white" />
                    <span>Regenerate response</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── BOTTOM CONTROLS (Figma Frame 2121459100 + Disclaimer) ─── */}
            <div
              style={{
                width: '100%',
                maxWidth: 960,
                margin: '10px auto 0',
                flexShrink: 0,
              }}
            >
              {/* Frame 2121459100 (Input + Submit Button) */}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 20,
                  width: '100%',
                  height: 54,
                }}
              >
                {/* Input (Figma: width 738, height 54, border 1px solid #98989A, border-radius 45px) */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Chat with Arella"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  style={{
                    boxSizing: 'border-box',
                    flex: 1,
                    height: 54,
                    border: '1px solid #98989A',
                    borderRadius: 45,
                    padding: '0 24px',
                    fontFamily: F,
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#121212',
                    background: 'transparent',
                    outline: 'none',
                  }}
                  className="placeholder:text-[#98989A] dark:text-white dark:border-white/30"
                />

                {/* Submit Button (Figma: width 192px, height 54px, background #D4AF37, box-shadow: 0px 21px 27px -10px rgba(170, 170, 170, 0.48), border-radius: 6px) */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0px',
                    width: 192,
                    height: 54,
                    background: '#D4AF37',
                    boxShadow: '0px 21px 27px -10px rgba(170, 170, 170, 0.48)',
                    borderRadius: 6,
                    border: 'none',
                    fontFamily: F,
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: '16px',
                    color: '#000000',
                    cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
                    opacity: !inputText.trim() || isTyping ? 0.6 : 1,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  className="hover:brightness-95 active:scale-98"
                >
                  <span>Submit</span>
                </button>
              </form>

              {/* Free Research Preview. Arella AI may produce inaccurate information about people, places, or facts. */}
              <p
                style={{
                  fontFamily: F,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: '100%',
                  textAlign: 'center',
                  color: '#718096',
                  margin: '8px 0 0',
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
