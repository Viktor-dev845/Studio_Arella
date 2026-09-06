'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, RotateCcw, Globe, User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface Message {
  id: string;
  sender: 'user' | 'arella';
  text: string;
  timestamp: string;
}

// The API is stateless — we resend the whole conversation as {role, content}
// pairs on every turn, same shape the Anthropic Messages API expects.
function toApiHistory(msgs: Message[]) {
  return msgs.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Arella AI could not respond right now.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    requestReply(nextHistory);
  };

  const handleRegenerate = () => {
    if (isTyping) return;
    // Drop the last Arella reply and re-ask with the same history up to that point.
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
        <div style={{ fontFamily: F, maxWidth: 1040, margin: '0 auto', padding: '16px 24px 32px' }}>
          
          {/* Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#475569',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
            >
              <ChevronLeft size={16} /> Back
            </Link>
            <h1 style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Arella AI Chat
            </h1>
          </div>

          {/* Outer Chat Box Card (Matching Frame 2121459599) */}
          <div
            style={{
              background: '#EAECEF',
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              padding: '32px 36px 24px',
              minHeight: 'calc(100vh - 150px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
            }}
          >
            {/* Conversation Content Area */}
            <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {/* Centered 'Your response' subtitle */}
              <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748B', margin: '0 0 20px', letterSpacing: '0.02em' }}>
                Your response
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {messages.map((m) => {
                  if (m.sender === 'user') {
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* User Circular Avatar */}
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: '#E5E7EB',
                            border: '1px solid #D1D5DB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <User size={18} color="#6B7280" />
                        </div>

                        {/* User Input Bubble with Edit Pencil */}
                        <div
                          style={{
                            flex: 1,
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: 14,
                            padding: '12px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#1E293B',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <span>{m.text}</span>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 2, display: 'flex' }}
                            title="Edit prompt"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Arella AI Globe Avatar */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
                          padding: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 4,
                          boxShadow: '0 2px 6px rgba(99,102,241,0.2)',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: '#FFFFFF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Globe size={16} color="#4F46E5" />
                        </div>
                      </div>

                      {/* AI Response Card Container */}
                      <div
                        style={{
                          flex: 1,
                          background: '#FFFFFF',
                          borderRadius: 20,
                          padding: '28px 32px',
                          border: '1px solid #F1F5F9',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                          fontSize: 13,
                          color: '#334155',
                          lineHeight: 1.7,
                        }}
                      >
                        {m.text.split('\n\n').map((paragraph, idx) => {
                          const match = paragraph.match(/^(\d+\.\s+[^:]+:)([\s\S]*)$/);
                          if (match) {
                            return (
                              <p key={idx} style={{ margin: '0 0 16px', lineHeight: 1.7 }}>
                                <strong style={{ fontWeight: 700, color: '#0F172A' }}>{match[1]}</strong>
                                {match[2]}
                              </p>
                            );
                          }
                          return (
                            <p key={idx} style={{ margin: '0 0 16px', lineHeight: 1.7 }}>
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'pulse 1.5s infinite' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
                        padding: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={16} color="#4F46E5" />
                      </div>
                    </div>
                    <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '12px 20px', fontSize: 12, color: '#64748B', fontWeight: 600, border: '1px solid #F1F5F9' }}>
                      Arella AI is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerate response button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 24,
                    padding: '8px 22px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                    fontFamily: F,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  <RotateCcw size={13} color="#475569" />
                  <span>Regenerate response</span>
                </button>
              </div>

            </div>

            {/* Bottom Input Area & Disclaimer */}
            <div style={{ maxWidth: 760, margin: '20px auto 0', width: '100%' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Chat with Arella"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 22px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: F,
                    color: '#0F172A',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C69A2C'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
                />

                <button
                  type="submit"
                  style={{
                    padding: '12px 34px',
                    background: '#CCA336',
                    color: '#0F172A',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: F,
                    boxShadow: '0 4px 14px rgba(204,163,54,0.25)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#B8922D'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#CCA336'; }}
                >
                  Submit
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: '12px 0 0' }}>
                Free Research Preview. Arella AI may produce inaccurate information about people, places, or facts.
              </p>
            </div>

          </div>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
