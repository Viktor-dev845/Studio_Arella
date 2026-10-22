'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';

export interface NotificationItem {
  id: string;
  avatarText?: string;
  avatarUrl?: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    message: 'Darlene Black started following you.',
    avatarUrl: '/audience/darlene-black.png',
    timeAgo: '2 min ago',
    isUnread: true,
  },
  {
    id: 'notif-2',
    message: 'Kyle Fisher scheduled a live experience: Product Design System Architecture.',
    avatarUrl: '/audience/kyle-fisher.png',
    timeAgo: '1 hour ago',
    isUnread: true,
  },
  {
    id: 'notif-3',
    message: 'Your membership payment for UI Design Fan Club was processed successfully.',
    avatarUrl: '/audience/adam-udochi.png',
    timeAgo: 'Yesterday',
    isUnread: false,
  },
  {
    id: 'notif-4',
    message: 'Theresa Steward left a comment on your podcast episode: -Healthy Tracking podcast.',
    avatarUrl: '/audience/theresa-steward.png',
    timeAgo: '2 days ago',
    isUnread: false,
  },
];

export default function AudienceNotificationsPageView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real notifications from backend
  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        const list = res.data?.notifications || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped: NotificationItem[] = list.map((n: any) => ({
            id: n.id,
            message: n.message || n.title || 'New notification',
            timeAgo: formatRelativeTime(n.created_at),
            isUnread: !n.is_read,
          }));
          setNotifications(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not load notifications from API, using default items:', err);
      });
  }, []);

  const handleToggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isUnread: !item.isUnread } : item
      )
    );
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      console.warn('Mark notification read API error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isUnread: false })));
    try {
      await api.put('/notifications/read-all');
    } catch (err) {
      console.warn('Mark all notifications read API error:', err);
    }
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10 font-['DM_Sans',sans-serif]">
      {/* ─── Top Header: Notification Title + Actions ─── */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-[21px] font-medium text-[#3A3A3A] leading-[27px]">
            Notification
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-[13px] font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ─── Notifications List ─── */}
      <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[40px] w-full max-w-[1400px]">
        {isLoading ? (
          /* Sleek Skeleton Loading Cards */
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-full h-[120px] sm:h-[131px] bg-white rounded-[20px] px-6 sm:px-10 md:px-[46px] flex items-center justify-between shadow-[0px_10px_25px_rgba(112,144,176,0.08)] border border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="w-[44px] sm:w-[51px] h-[44px] sm:h-[51px] rounded-full bg-gray-200 shrink-0" />
                <div className="flex flex-col gap-2">
                  <div className="w-48 sm:w-72 h-4 bg-gray-200 rounded-md" />
                  <div className="w-24 h-3 bg-gray-100 rounded-md" />
                </div>
              </div>
              <div className="w-16 h-3 bg-gray-100 rounded-md" />
            </div>
          ))
        ) : notifications.length === 0 ? (
          /* Zero-State: Beautiful Empty Notification Container */
          <div className="w-full bg-white rounded-[20px] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-[0px_10px_25px_rgba(112,144,176,0.08)] border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#3B82F6]">
              <Bell size={26} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[17px] font-semibold text-[#16151C]">No notifications yet</h3>
              <p className="text-[13px] text-gray-500 max-w-sm">
                When creators post, go live, or when you receive tips and replies, they will appear right here.
              </p>
            </div>
          </div>
        ) : (
          notifications.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => handleToggleRead(item.id)}
                className={`relative w-full h-[120px] sm:h-[131px] bg-white rounded-[20px] px-6 sm:px-10 md:px-[46px] flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-[0px_22px_45px_rgba(112,144,176,0.25)] ${
                  item.isUnread
                    ? 'border-l-[2px] border-l-[#3B82F6] shadow-[0px_19px_40px_rgba(112,144,176,0.2)]'
                    : 'border-l border-l-transparent shadow-[0px_10px_25px_rgba(112,144,176,0.1)] opacity-90'
                }`}
              >
                {/* Left Side: Gray Circle Avatar (51px x 51px) + Message */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  {/* Avatar Ellipse 795 */}
                  <div className="w-[44px] sm:w-[51px] h-[44px] sm:h-[51px] rounded-full bg-[#D9D9D9] shrink-0 flex items-center justify-center shadow-xs">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#D9D9D9] to-[#EBEBEB]" />
                    )}
                  </div>

                  {/* Message Text: Urbanist 14px 500 #141414 */}
                  <p className="font-['Urbanist','DM_Sans',sans-serif] font-medium text-[13px] sm:text-[14px] leading-[19px] tracking-[0.02em] text-[#141414] truncate sm:max-w-[500px] md:max-w-[700px]">
                    {item.message}
                  </p>
                </div>

                {/* Right Side: Dot indicator (top right) + Timestamp (bottom right) */}
                <div className="flex flex-col items-end justify-between h-[56px] sm:h-[62px] shrink-0 ml-4">
                  {/* Dot Indicator */}
                  {item.isUnread ? (
                    /* Ellipse 796: Solid Blue Dot (10px x 10px #3B82F6) */
                    <div 
                      className="w-[10px] h-[10px] rounded-full bg-[#3B82F6] shadow-xs" 
                      title="Unread" 
                    />
                  ) : (
                    /* Ellipse 797: Hollow Gray Dot (10px x 10px border 1px solid #A2A9C7) */
                    <div 
                      className="w-[10px] h-[10px] rounded-full border border-[#A2A9C7] bg-transparent" 
                      title="Read" 
                    />
                  )}

                  {/* Timestamp: Urbanist 11px 500 #A2A9C7 */}
                  <span className="font-['Urbanist','DM_Sans',sans-serif] font-medium text-[11px] leading-[25px] text-[#A2A9C7]">
                    {item.timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
