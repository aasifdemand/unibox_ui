import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Mail, AlertCircle, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';

const ICONS = {
  success: CheckCircle,
  info: Mail,
  warning: AlertCircle,
  error: AlertCircle,
  system: Bell,
};

const COLORS = {
  success: 'emerald',
  info: 'blue',
  warning: 'amber',
  error: 'rose',
  system: 'indigo',
};

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('common.notifications', 'Notifications')} <span>Center</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications.`
              : 'You are entirely caught up on all alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-lg text-metadata bg-orange-50 text-orange-600 border border-orange-100/50">
            Realtime Active
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-sm">
            {/* Search */}
            <div className="mb-3 mt-1 px-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-normal placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="px-3 py-2 mb-1">
              <h3 className="text-metadata text-slate-400">Status Filters</h3>
            </div>

            {[
              { id: 'all', label: 'All Notifications', icon: Bell },
              { id: 'unread', label: 'Unread Only', icon: Mail, badge: unreadCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group mb-1 ${
                  activeTab === tab.id
                    ? 'bg-slate-50 text-slate-900 ring-1 ring-slate-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ltr:mr-3 rtl:ml-3 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-orange-500 group-hover:border-orange-100 border border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                </div>
                <div className="ltr:text-left rtl:text-right flex-1">
                  <p className={`text-sender ${activeTab === tab.id ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'}`}>
                    {tab.label}
                  </p>
                </div>
                {tab.badge > 0 && (
                  <span className={`text-metadata px-2 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Categories */}
            <div className="px-3 py-2 border-t border-slate-100 mt-2 mb-1">
              <h3 className="text-metadata text-slate-400">Categories</h3>
            </div>

            {[
              { id: 'all', label: 'All Categories' },
              { id: 'campaign', label: 'Campaigns' },
              { id: 'reply', label: 'Replies' },
              { id: 'audience', label: 'Audience & Imports' },
              { id: 'system', label: 'System & Alerts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  filterCategory === cat.id
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${filterCategory === cat.id ? 'bg-orange-500' : 'bg-slate-300 group-hover:bg-slate-400'}`}
                />
                <span className={`text-sender ${filterCategory === cat.id ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Mark All Read */}
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white text-metadata text-slate-500 hover:text-orange-600 hover:border-orange-400 transition-all disabled:opacity-40 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[500px] overflow-hidden p-6 md:p-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-5 animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-3 pt-1">
                      <div className="h-4 w-40 bg-slate-200 rounded-md" />
                      <div className="h-3 w-full bg-slate-100 rounded-md" />
                      <div className="h-3 w-28 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-28 px-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
                  <Bell className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No notifications found
                </h3>
                <p className="text-sm font-normal text-slate-400 max-w-sm">
                  There are no alerts matching your current filtering criteria.
                </p>
                {(activeTab !== 'all' || filterCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setFilterCategory('all');
                      setSearchQuery('');
                    }}
                    className="mt-6 px-5 py-2.5 bg-white border border-slate-200 text-orange-600 rounded-lg text-sm font-semibold hover:border-orange-300 hover:bg-orange-50 transition-colors shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {notifications.map((notification) => {
                    const Icon = ICONS[notification.type] || Bell;
                    const color = COLORS[notification.type] || 'indigo';
                    const date = new Date(notification.createdAt);
                    const formattedDate = date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const formattedTime = date.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group relative p-5 md:p-6 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row gap-5 ${
                          !notification.read
                            ? `bg-white border-${color}-200 shadow-sm ring-1 ring-${color}-100`
                            : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        {!notification.read && (
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-${color}-500 rounded-r-full`}
                          />
                        )}

                        <div className="flex gap-4 flex-1 items-start">
                          <div
                            className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center bg-${color}-50 text-${color}-600 ring-1 ring-${color}-100`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 mt-0.5">
                            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                              <h4
                                className={`text-base font-semibold tracking-tight ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span
                                  className={`px-2 py-0.5 rounded bg-${color}-100 text-${color}-700 text-metadata`}
                                >
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-normal text-slate-500 leading-relaxed max-w-2xl mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 text-metadata text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{formattedTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              disabled={markReadMutation.isPending}
                              className="px-4 py-2 sm:w-28 bg-white border border-slate-200 rounded-lg text-metadata text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            disabled={deleteMutation.isPending}
                            className="px-4 py-2 sm:w-28 bg-white border border-slate-200 rounded-lg text-metadata text-slate-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
