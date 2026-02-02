/**
 * Notifications API
 */

import api from './client';

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    data?: Record<string, unknown>;
    indent?: {
        id: string;
        indentNumber: string;
        name: string;
    };
}

export interface NotificationsResponse {
    success: boolean;
    data: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const notificationsApi = {
    /**
     * Get all notifications for current user
     */
    async getAll(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

        const response = await api.get(`/notifications?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<{ count: number }> {
        const response = await api.get('/notifications/unread-count');
        return response.data.data;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string): Promise<void> {
        await api.post(`/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        await api.post('/notifications/read-all');
    },

    /**
     * Register push token
     */
    async registerToken(pushToken: string): Promise<void> {
        await api.post('/notifications/register-token', { pushToken });
    },

    /**
     * Unregister push token
     */
    async unregisterToken(): Promise<void> {
        await api.delete('/notifications/unregister-token');
    },
};

export default notificationsApi;
