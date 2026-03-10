import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, Mail, AlertCircle, Search, Filter, Trash2, Calendar, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '../../hooks/useNotifications';

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
    const [activeTab, setActiveTab] = useState('all'); // all, unread
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: notificationData, isLoading } = useNotifications({
        category: filterCategory,
        search: searchQuery,
        unreadOnly: activeTab === 'unread' ? 'true' : 'false',
        limit: 100, // Fetch up to 100 recent for the page view
    });

    const notifications = notificationData?.notifications || [];
    const unreadCount = notificationData?.unreadCount || 0;

    const markReadMutation = useMarkNotificationRead();
    const markAllReadMutation = useMarkAllNotificationsRead();
    const deleteMutation = useDeleteNotification();

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    const handleMarkRead = (id) => {
        markReadMutation.mutate(id);
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    return (
        <div className="max-w-400 mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Page Header (Match Settings Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                        {t('common.notifications', 'Notifications')} <span className="text-gradient ms-4">Center</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread system interactions.`
                            : 'You are entirely caught up on all alerts.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-500/5">
                        Realtime Active
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Navigation Sidebar (Match Settings Style) */}
                <aside className="lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 p-2.5 rounded-[2.5rem] shadow-2xl shadow-slate-900/5">
                        <div className="mb-4 mt-2 px-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-11 pr-4 bg-white/60 border border-slate-200/60 rounded-xl text-xs font-bold placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="px-4 py-2 border-b border-slate-200/40 mb-2">
                            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                                Status Filters
                            </h3>
                        </div>

                        {[
                            { id: 'all', label: 'All Notifications', icon: Bell },
                            { id: 'unread', label: 'Unread Only', icon: Mail, badge: unreadCount },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center p-3.5 rounded-[1.75rem] transition-all duration-300 group mb-1 ${activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100'
                                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                    }`}
                            >
                                <div
                                    className={`p-2.5 rounded-2xl ltr:mr-4 rtl:ml-4 transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:border-blue-100'
                                        }`}
                                >
                                    <tab.icon className="w-4.5 h-4.5" />
                                </div>
                                <div className="ltr:text-left rtl:text-right flex-1">
                                    <p className={`font-black tracking-tight text-xs uppercase ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {tab.label}
                                    </p>
                                </div>
                                {tab.badge > 0 && (
                                    <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}

                        <div className="px-4 py-2 border-b border-t border-slate-200/40 my-2 mt-4">
                            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                                Categories
                            </h3>
                        </div>

                        {[
                            { id: 'all', label: 'All Categories' },
                            { id: 'campaign', label: 'Campaigns' },
                            { id: 'reply', label: 'Replies' },
                            { id: 'audience', label: 'Audience & Imports' },
                            { id: 'system', label: 'System & Alerts' },
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-[1.75rem] transition-all duration-300 group ${filterCategory === cat.id
                                    ? 'bg-slate-50 text-slate-800 font-black'
                                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${filterCategory === cat.id ? 'bg-slate-800' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                                <span className="text-xs uppercase tracking-tight font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0 || markAllReadMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-[2rem] border-2 border-slate-200/60 bg-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-white transition-all disabled:opacity-50 shadow-xl shadow-slate-900/5"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark all as read
                    </button>
                </aside>

                {/* Content Area (Match Settings Style) */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 rounded-[3rem] shadow-2xl shadow-slate-900/5 min-h-[500px] overflow-hidden p-6 md:p-8">

                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-32 px-6 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-white/60 text-slate-300 rounded-[2.5rem] shadow-xl shadow-slate-900/5 flex items-center justify-center mb-8 border border-slate-100">
                                    <Bell className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-3">
                                    No notifications found
                                </h3>
                                <p className="text-sm font-bold text-slate-400 max-w-sm">
                                    There are no alerts matching your current filtering criteria.
                                </p>
                                {(activeTab !== 'all' || filterCategory !== 'all' || searchQuery) && (
                                    <button
                                        onClick={() => { setActiveTab('all'); setFilterCategory('all'); setSearchQuery(''); }}
                                        className="mt-8 px-8 py-4 bg-white border border-slate-200 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {notifications.map((notification) => {
                                        const Icon = ICONS[notification.type] || Bell;
                                        const color = COLORS[notification.type] || 'indigo';
                                        const date = new Date(notification.createdAt);
                                        const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                        const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`group relative p-6 md:p-8 rounded-[2rem] border transition-all duration-300 flex flex-col sm:flex-row gap-6 ${!notification.read
                                                    ? `bg-white border-${color}-200 shadow-xl shadow-${color}-900/5 ring-1 ring-${color}-100`
                                                    : 'bg-white/60 border-slate-200/60 hover:bg-white hover:border-slate-300/60 shadow-md shadow-slate-900/5'
                                                    }`}
                                            >
                                                {!notification.read && (
                                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-${color}-500 rounded-r-lg`} />
                                                )}

                                                <div className="flex gap-5 flex-1 items-start">
                                                    <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center bg-${color}-50 text-${color}-600 ring-1 ring-${color}-100 shadow-inner`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 mt-1">
                                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                                            <h4 className={`text-lg font-black tracking-tight ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <span className={`px-2.5 py-1 rounded-[0.5rem] bg-${color}-100 text-${color}-700 text-[9px] font-black uppercase tracking-widest leading-none`}>
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[13px] font-bold text-slate-500 leading-relaxed max-w-2xl mb-4">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formattedDate}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{formattedTime}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 pt-5 sm:pt-0 shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(notification.id)}
                                                            disabled={markReadMutation.isPending}
                                                            className="px-5 py-2.5 sm:w-32 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-white transition-all shadow-xs"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="px-5 py-2.5 sm:w-32 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-xs"
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
