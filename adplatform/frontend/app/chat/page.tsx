'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Pencil, RotateCcw, Globe, User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';

interface Message {
  id: string;
  sender: 'user' | 'arella';
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Nice!',
      timestamp: 'Just now'
    },
    {
      id: '2',
      sender: 'arella',
      text: `Artificial Intelligence (AI) offers numerous advantages and has the potential to revolutionize various aspects of our lives. Here are some key advantages of AI:\n\n1. Automation: AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision and consistency. This automation leads to increased productivity and efficiency in various industries.\n\n2. Decision-making: AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis. This ability is particularly useful in complex scenarios where humans may struggle to process large datasets or where quick and accurate decisions are crucial.\n\n3. Improved accuracy: AI algorithms can achieve high levels of accuracy and precision in tasks such as image recognition, natural language processing, and data analysis. They can eliminate human errors caused by fatigue, distractions, or bias, leading to more reliable and consistent results.\n\n4. Continuous operation: AI systems can work tirelessly without the need for breaks, resulting in uninterrupted 24/7 operations. This capability is especially beneficial in applications like customer support chatbots, manufacturing processes, and surveillance systems.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const arellaReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'arella',
        text: `Thanks for your inquiry! Studio Arella AI is designed to help you optimize your podcast reach, plan ad slots, and grow your audience seamlessly. Feel free to ask about bookings, audience analytics, or campaign recommendations!`,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, arellaReply]);
      setIsTyping(false);
    }, 800);
  };

  const handleRegenerate = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="font-body max-w-5xl mx-auto p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link 
              href="/dashboard"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 font-semibold text-[13px] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </Link>
            <h1 className="text-[16px] font-bold text-gray-900 ml-1">Arella AI Chat</h1>
          </div>

          {/* Chat Container Card */}
          <div className="bg-[#F1F3F5] rounded-[24px] p-6 sm:p-10 border border-gray-200/70 shadow-sm flex flex-col justify-between min-h-[calc(100vh-210px)]">
            
            {/* Conversation Flow */}
            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-4">
              <p className="text-center text-[12px] font-semibold text-gray-500 mb-6">Your response</p>

              <div className="space-y-6">
                {messages.map((m) => {
                  if (m.sender === 'user') {
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300/80 flex items-center justify-center text-gray-700 flex-shrink-0 shadow-sm">
                          <User size={16} />
                        </div>
                        <div className="flex-1 bg-white border border-gray-200/80 rounded-[14px] px-5 py-3.5 flex items-center justify-between text-[13px] font-medium text-gray-800 shadow-sm">
                          <span>{m.text}</span>
                          <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors p-1" title="Edit">
                            <Pencil size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1.5px] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <Globe size={15} className="text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-[20px] p-7 sm:p-8 text-[13px] text-gray-700 leading-[1.7] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        {m.text.split('\n\n').map((paragraph, idx) => {
                          const match = paragraph.match(/^(\d+\.\s+[^:]+:)([\s\S]*)$/);
                          if (match) {
                            return (
                              <p key={idx} className="mb-4 last:mb-0">
                                <strong className="font-bold text-gray-900">{match[1]}</strong>
                                {match[2]}
                              </p>
                            );
                          }
                          return (
                            <p key={idx} className="mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[1.5px] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <Globe size={15} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-[16px] px-5 py-3 text-xs text-gray-500 font-medium shadow-sm">
                      Arella AI is thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Regenerate Response Button */}
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:shadow"
                >
                  <RotateCcw size={13} className="text-gray-600" />
                  <span>Regenerate response</span>
                </button>
              </div>
            </div>

            {/* Bottom Input Area & Disclaimer */}
            <div className="max-w-3xl mx-auto w-full pt-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Chat with Arella"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-white border border-gray-300 rounded-[14px] text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C69A2C] transition-colors shadow-sm"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#C69A2C] hover:bg-[#b58b24] text-white text-[13px] font-bold rounded-[12px] transition-colors shadow-sm whitespace-nowrap"
                >
                  Submit
                </button>
              </form>

              <p className="text-center text-[11px] text-gray-400 font-medium mt-3">
                Free Research Preview. Arella AI may produce inaccurate information about people, places, or facts.
              </p>
            </div>

          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
