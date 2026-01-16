import apiClient from './client';
import { Indent, CreateIndentPayload, Material, MaterialSuggestion, ItemGroup, UnitOfMeasure } from '../types';

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
// INDENTS API
// =============================================================================

export const indentsApi = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        status?: string;
        siteId?: string;
    }): Promise<PaginatedResponse<Indent>> {
        const response = await apiClient.get('/indents', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Indent> {
        const response = await apiClient.get(`/indents/${id}`);
        return response.data.data;
    },

    async create(data: CreateIndentPayload): Promise<Indent> {
        const response = await apiClient.post('/indents', data);
        return response.data.data;
    },

    async purchaseApprove(id: string, remarks?: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/purchase-approve`, { remarks });
        return response.data.data;
    },

    async directorApprove(id: string, remarks?: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/director-approve`, { remarks });
        return response.data.data;
    },

    async reject(id: string, reason: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/reject`, { reason });
        return response.data.data;
    },

    async close(id: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/close`);
        return response.data.data;
    },
};

// =============================================================================
// MATERIALS API (Updated with fast autocomplete)
// =============================================================================

export const materialsApi = {
    /**
     * Get paginated materials list with full details
     */
    async getAll(params?: {
        page?: number;
        limit?: number;
        itemGroupId?: string;
        search?: string;
        isActive?: boolean;
    }): Promise<PaginatedResponse<Material>> {
        const response = await apiClient.get('/materials', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    /**
     * Get a single material by ID
     */
    async getById(id: string): Promise<Material> {
        const response = await apiClient.get(`/materials/${id}`);
        return response.data.data;
    },

    /**
     * ⚡ Fast autocomplete search for material names
     * Use this for typeahead suggestions - returns minimal data for speed
     * @param query - Search string (min 2 characters)
     * @param itemGroupId - Optional category filter
     * @param limit - Max results (default 20)
     */
    async searchAutocomplete(
        query: string,
        itemGroupId?: string,
        limit: number = 20
    ): Promise<MaterialSuggestion[]> {
        if (!query || query.length < 2) {
            return [];
        }
        const response = await apiClient.get('/materials/search', {
            params: { q: query, itemGroupId, limit },
        });
        return response.data.data;
    },

    /**
     * Get all item groups (categories) for dropdowns
     */
    async getCategories(): Promise<ItemGroup[]> {
        const response = await apiClient.get('/materials/categories');
        return response.data.data;
    },

    /**
     * Get all units of measure for dropdowns
     */
    async getUnits(): Promise<UnitOfMeasure[]> {
        const response = await apiClient.get('/materials/units');
        return response.data.data;
    },
};

// =============================================================================
// ITEM GROUPS API
// =============================================================================

export const itemGroupsApi = {
    async getAll(params?: {
        search?: string;
        isActive?: boolean;
        includeCounts?: boolean;
    }): Promise<ItemGroup[]> {
        const response = await apiClient.get('/item-groups', { params });
        return response.data.data;
    },

    async getNames(): Promise<string[]> {
        const response = await apiClient.get('/item-groups/names');
        return response.data.data;
    },
};

// =============================================================================
// UNITS OF MEASURE API
// =============================================================================

export const uomApi = {
    async getAll(): Promise<UnitOfMeasure[]> {
        const response = await apiClient.get('/units-of-measure');
        return response.data.data;
    },
};

export default { indentsApi, materialsApi, itemGroupsApi, uomApi };
