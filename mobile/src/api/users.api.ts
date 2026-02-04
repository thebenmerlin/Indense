import apiClient from './client';

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'SITE_ENGINEER' | 'PURCHASE_TEAM' | 'DIRECTOR';

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
    currentSiteId: string | null;
    currentSiteName?: string;
    sites: Array<{ id: string; name: string; code: string }>;
    isActive: boolean;
    isRevoked: boolean;
    createdAt: string;
    lastLoginAt: string | null;
}

// Alias for backward compatibility
export type UserResponse = User;

export interface RoleCounts {
    siteEngineers: number;
    purchaseTeam: number;
    directors: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// =============================================================================
// USERS API
// =============================================================================

export const usersApi = {
    /**
     * Get all users with pagination and filters
     */
    async getAll(params?: {
        page?: number;
        limit?: number;
        role?: UserRole;
        siteId?: string;
        isActive?: boolean;
        isRevoked?: boolean;
        search?: string;
    }): Promise<PaginatedResponse<User>> {
        const response = await apiClient.get('/users', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    /**
     * Get users by role (for Role Management screens)
     */
    async getByRole(role: UserRole): Promise<User[]> {
        const response = await apiClient.get(`/users/role/${role}`);
        return response.data.data;
    },

    /**
     * Get role counts for dashboard badges
     */
    async getRoleCounts(): Promise<RoleCounts> {
        const response = await apiClient.get('/users/role-counts');
        return response.data.data;
    },

    /**
     * Get user by ID
     */
    async getById(id: string): Promise<User> {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data;
    },

    /**
     * Promote user to higher role
     * SE -> PT, PT -> Director
     */
    async promote(id: string): Promise<User> {
        const response = await apiClient.post(`/users/${id}/promote`);
        return response.data.data;
    },

    /**
     * Demote user to lower role
     * Director -> PT, PT -> SE (requires siteId)
     */
    async demote(id: string, siteId?: string): Promise<User> {
        const response = await apiClient.post(`/users/${id}/demote`, { siteId });
        return response.data.data;
    },

    /**
     * Revoke user access (critical action)
     */
    async revoke(id: string): Promise<User> {
        const response = await apiClient.post(`/users/${id}/revoke`);
        return response.data.data;
    },

    /**
     * Restore revoked user access
     */
    async restore(id: string): Promise<User> {
        const response = await apiClient.post(`/users/${id}/restore`);
        return response.data.data;
    },
};

export default usersApi;
