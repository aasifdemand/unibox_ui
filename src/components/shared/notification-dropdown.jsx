import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Mail, AlertCircle, X, ChevronRight, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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

const NotificationDropdown = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data: notificationData } = useNotifications({ limit: 10 });
    const notifications = notificationData?.notifications || [];
    const unreadCount = notificationData?.unreadCount || 0;

    const markReadMutation = useMarkNotificationRead();
    const markAllReadMutation = useMarkAllNotificationsRead();
    const deleteMutation = useDeleteNotification();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        markAllReadMutation.mutate();
    };

    const removeNotification = (e, id) => {
        e.stopPropagation();
        deleteMutation.mutate(id);
    };

    const markAsRead = (id, isRead) => {
        if (!isRead) {
            markReadMutation.mutate(id);
        }
    };

    const navigateToAll = () => {
        setIsOpen(false);
        navigate('/dashboard/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 relative ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-300">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute top-full ltr:-right-2 rtl:-left-2 mt-2 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl shadow-slate-800/10 border border-slate-100 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                                    {t('common.notifications', 'Notifications')}
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-black tracking-widest text-blue-700">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={markAllAsRead}
                                    title="Mark all as read"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/settings')}
                                    title="Notification settings"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 px-6 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">You're all caught up!</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        No new notifications
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => {
                                        const Icon = ICONS[notification.type] || Bell;
                                        const color = COLORS[notification.type] || 'indigo';
                                        const date = new Date(notification.createdAt);
                                        const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => markAsRead(notification.id, notification.read)}
                                                className={`group relative p-4 flex gap-4 transition-colors hover:bg-slate-50/50 cursor-pointer ${!notification.read ? 'bg-blue-50/10' : ''
                                                    }`}
                                            >
                                                {!notification.read && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-lg" />
                                                )}
                                                <div
                                                    className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center bg-${color}-50 text-${color}-600`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex justify-between items-start gap-2 mb-1">
                                                        <h4
                                                            className={`text-sm font-bold truncate ${!notification.read ? 'text-slate-900' : 'text-slate-700'
                                                                }`}
                                                        >
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                                                            {formattedTime}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => removeNotification(e, notification.id)}
                                                    className="absolute right-4 top-4 w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={navigateToAll}
                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-white hover:shadow-sm transition-all group"
                            >
                                {t('common.view_all_notifications', 'View All Notifications')}
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${i18n.dir() === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
