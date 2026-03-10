import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

// =========================
// FETCH NOTIFICATIONS
// =========================
const fetchNotifications = async (params = {}) => {
    // Ensure we always send explicit string values for the backend's expected query params if not provided
    const mergedParams = {
        limit: 50,
        page: 1,
        unreadOnly: 'false',
        category: 'all',
        ...params
    };

    // Explicitly convert unreadOnly boolean to string to match backend expectations
    if (typeof mergedParams.unreadOnly === 'boolean') {
        mergedParams.unreadOnly = mergedParams.unreadOnly ? 'true' : 'false';
    }

    const searchParams = new URLSearchParams(mergedParams);
    const res = await fetch(`${API_URL}/notifications?${searchParams.toString()}`, {
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data.data;
};

export const useNotifications = (params = {}) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => fetchNotifications(params),
        refetchInterval: 30000, // Background refresh occasionally to sync multi-tab state
    });
};

// =========================
// MARK NOTIFICATION READ
// =========================
const markNotificationRead = async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark notification as read');
    return data.data;
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

// =========================
// MARK ALL READ
// =========================
const markAllNotificationsRead = async () => {
    const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark all notifications as read');
    return data;
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('All notifications marked as read', { id: 'mark-all-read' }); // Prevent duplicate toasts
        },
    });
};

// =========================
// DELETE NOTIFICATION
// =========================
const deleteNotification = async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete notification');
    return data;
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete notification');
        },
    });
};
