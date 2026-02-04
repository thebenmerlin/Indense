import apiClient from './client';

// =============================================================================
// TYPES
// =============================================================================

export interface Site {
    id: string;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    state: string | null;
    isActive: boolean;
    isClosed: boolean;
    startDate: string | null;
    expectedHandoverDate: string | null;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
    indentCount?: number;
    engineerCount?: number;
}

export interface SiteEngineer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
}

export interface SiteWithEngineers extends Site {
    engineers: SiteEngineer[];
    indentCount: number;
}

// Alias for site detail page
export type SiteDetail = SiteWithEngineers;

export interface CreateSitePayload {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    startDate?: string;
    expectedHandoverDate?: string;
    engineerIds?: string[];
}

export interface UpdateSitePayload {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
    startDate?: string;
    expectedHandoverDate?: string;
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
// SITES API
// =============================================================================

export const sitesApi = {
    /**
     * Get all sites with pagination
     */
    async getAll(params?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        isClosed?: boolean;
        search?: string;
        includeCounts?: boolean;
    }): Promise<PaginatedResponse<Site>> {
        const response = await apiClient.get('/sites', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    /**
     * Get site by ID (basic info)
     */
    async getById(id: string): Promise<Site> {
        const response = await apiClient.get(`/sites/${id}`);
        return response.data.data;
    },

    /**
     * Get site with engineers and indent count
     */
    async getDetails(id: string): Promise<SiteWithEngineers> {
        const response = await apiClient.get(`/sites/${id}/details`);
        return response.data.data;
    },

    /**
     * Create a new site
     */
    async create(data: CreateSitePayload): Promise<Site> {
        const response = await apiClient.post('/sites', data);
        return response.data.data;
    },

    /**
     * Update a site
     */
    async update(id: string, data: UpdateSitePayload): Promise<Site> {
        const response = await apiClient.patch(`/sites/${id}`, data);
        return response.data.data;
    },

    /**
     * Get available engineers to assign (not currently assigned to this site)
     */
    async getAvailableEngineers(siteId: string): Promise<SiteEngineer[]> {
        const response = await apiClient.get(`/sites/${siteId}/available-engineers`);
        return response.data.data;
    },

    /**
     * Assign engineers to a site
     */
    async assignEngineers(siteId: string, engineerIds: string[]): Promise<void> {
        await apiClient.post(`/sites/${siteId}/engineers`, { engineerIds });
    },

    /**
     * Remove an engineer from a site
     */
    async removeEngineer(siteId: string, engineerId: string): Promise<void> {
        await apiClient.delete(`/sites/${siteId}/engineers/${engineerId}`);
    },

    /**
     * Close a site (mark as completed)
     */
    async closeSite(id: string): Promise<Site> {
        const response = await apiClient.post(`/sites/${id}/close`);
        return response.data.data;
    },

    /**
     * Delete a site (soft delete)
     */
    async deleteSite(id: string): Promise<void> {
        await apiClient.delete(`/sites/${id}`);
    },

    /**
     * Get public sites list (for registration - no auth required)
     */
    async getPublicList(): Promise<Array<{ id: string; name: string; code: string }>> {
        const response = await apiClient.get('/sites/public');
        return response.data.data;
    },
};

export default sitesApi;
