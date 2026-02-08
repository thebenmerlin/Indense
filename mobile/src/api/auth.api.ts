import apiClient from './client';
import { LoginResponse } from '../types';

export interface SwitchRoleResponse {
    accessToken: string;
    user: LoginResponse['user'];
}

export interface SwitchSiteResponse {
    accessToken: string;
    user: LoginResponse['user'];
}

export const authApi = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data.data;
    },

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data.data;
    },

    async logout(refreshToken?: string): Promise<void> {
        await apiClient.post('/auth/logout', { refreshToken });
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    },

    async getProfile(): Promise<LoginResponse['user']> {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
    },

    async switchRole(role: 'SITE_ENGINEER' | 'PURCHASE_TEAM' | 'DIRECTOR'): Promise<SwitchRoleResponse> {
        const response = await apiClient.post('/auth/switch-role', { role });
        return response.data.data;
    },

    async switchSite(siteId: string): Promise<SwitchSiteResponse> {
        const response = await apiClient.post('/auth/switch-site', { siteId });
        return response.data.data;
    },
};

export default authApi;
