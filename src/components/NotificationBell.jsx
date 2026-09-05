import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, BellOff, Check } from 'lucide-react';
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from '../api';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('unread');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      const count = res.data.unread_count ?? res.data.count ?? 0;
      setUnreadCount(count);
    } catch (e) {
      console.error("Error fetching notification count:", e);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = tab === 'unread' ? { unread_only: 'true' } : {};
      const res = await getNotifications(params);
      const items = res.data.notifications || [];
      setNotifications(items);
      if (res.data.unread_count !== undefined) {
        setUnreadCount(res.data.unread_count);
      }
      if (res.data.total_all !== undefined) {
        setTotalCount(res.data.total_all);
      } else if (res.data.total !== undefined) {
        setTotalCount(res.data.total);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, tab]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error marking notification read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all cursor-pointer focus:outline-none"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content 
          className="w-88 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col font-sans animate-in fade-in-50 zoom-in-95 duration-150"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          
          {/* Bachs-style Tabs with counters */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/60 border-b border-slate-100">
            <button 
              onClick={() => setTab('unread')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                tab === 'unread' 
                  ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500">Unread</div>
              <div className={`text-lg font-bold ${tab === 'unread' ? 'text-indigo-700' : 'text-slate-800'}`}>
                {unreadCount}
              </div>
            </button>

            <button 
              onClick={() => setTab('all')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                tab === 'all' 
                  ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500">All</div>
              <div className={`text-lg font-bold ${tab === 'all' ? 'text-indigo-700' : 'text-slate-800'}`}>
                {totalCount || notifications.length}
              </div>
            </button>
          </div>
          
          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <BellOff className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  When bulk operations or events complete, they will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div 
                    key={n.id} 
                    className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors relative flex flex-col gap-1 ${
                      isUnread ? 'bg-indigo-50/30' : ''
                    }`}
                    onClick={() => isUnread && handleMarkRead(n.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>

                    {n.message && (
                      <p className="text-xs text-slate-600 leading-relaxed m-0 pl-3">
                        {n.message}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
