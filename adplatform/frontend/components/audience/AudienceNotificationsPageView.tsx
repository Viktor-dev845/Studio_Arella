'use client';

import { useState } from 'react';

export interface NotificationItem {
  id: string;
  avatarText?: string;
  avatarUrl?: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    message: 'Create king replied your comment',
    timeAgo: '2 min ago',
    isUnread: true,
  },
  {
    id: 'notif-2',
    message: 'Create king replied your comment',
    timeAgo: '2 min ago',
    isUnread: true,
  },
  {
    id: 'notif-3',
    message: 'Create king replied your comment',
    timeAgo: '2 min ago',
    isUnread: true,
  },
  {
    id: 'notif-4',
    message: 'Create king replied your comment',
    timeAgo: '3 days ago',
    isUnread: false,
  },
];

export default function AudienceNotificationsPageView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isUnread: !item.isUnread } : item
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isUnread: false })));
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-14 lg:px-[140px] py-8 sm:py-10 font-['DM_Sans',sans-serif]">
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

      {/* ─── Notifications List (Frame 2121459687: gap 40px) ─── */}
      <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[40px] w-full max-w-[1152px]">
        {notifications.map((item) => {
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
        })}
      </div>
    </div>
  );
}
