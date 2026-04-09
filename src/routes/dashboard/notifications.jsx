import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Mail, 
  AlertCircle, 
  Search, 
  Calendar, 
  Inbox,
  Sparkles,
  Check as CheckIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import { useCurrentUser } from '../../hooks/useAuth';
import { formatInTimezone } from '../../utils/date-utils';

const NotificationsPage = () => {
 
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user } = useCurrentUser();
  const userTz = user?.timezone || 'UTC';

  const { data: notificationData, isLoading } = useNotifications({
    category: filterCategory,
    search: searchQuery,
    unreadOnly: activeTab === 'unread' ? 'true' : 'false',
    limit: 100,
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unreadCount || 0;

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAllRead = () => markAllReadMutation.mutate();
  const handleMarkRead = (id) => markReadMutation.mutate(id);
  const handleDelete = (id) => deleteMutation.mutate(id);

  return (
    <div className=" p-4">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="w-6 h-6 text-purple-600" />
            Notifications Center
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications.`
              : "No unread notifications at this time."}
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-40 shadow-sm"
        >
          <CheckIcon className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Simple Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-2">
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:bg-white focus:border-purple-300 outline-none transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 p-1 bg-slate-50 rounded-lg mb-4">
              {[
                { id: 'all', label: 'All', icon: Bell },
                { id: 'unread', label: 'Unread', badge: unreadCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Categories */}
            <nav className="space-y-1">
              {[
                { id: 'all', label: 'All Activities', icon: Inbox },
                { id: 'campaign', label: 'Campaigns', icon: Sparkles },
                { id: 'reply', label: 'Replies', icon: Mail },
                { id: 'audience', label: 'Audience', icon: CheckCircle },
                { id: 'system', label: 'System', icon: AlertCircle },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    filterCategory === cat.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <cat.icon className={`w-4 h-4 ${filterCategory === cat.id ? 'text-purple-600' : 'text-slate-400'}`} />
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Simplified Notification List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center">
              <Inbox className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
              <p className="text-slate-500 text-sm">You are all caught up for this view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`group relative bg-white border rounded-xl p-5 transition-all ${
                      !notification.read
                        ? 'border-purple-200 bg-purple-50/10'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 shrink-0 shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                            {formatInTimezone(notification.createdAt, userTz, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {formatInTimezone(notification.createdAt, userTz, { month: 'short', day: 'numeric' })}
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkRead(notification.id)}
                                className="text-[10px] font-bold text-purple-600 hover:text-purple-800"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-[10px] font-bold text-slate-400 hover:text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
