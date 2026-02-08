import apiClient from './client';

// =============================================================================
// TYPES
// =============================================================================

export interface Material {
    id: string;
    name: string;
    specification: string | null;
    dimensions: string | null;
    color: string | null;
    code: string | null;
    uomId: string;
    itemGroupId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    uom?: {
        id: string;
        name: string;
        abbreviation: string;
    };
    itemGroup?: {
        id: string;
        name: string;
        code: string;
    };
}

export interface MaterialCategory {
    id: string;
    name: string;
    code: string;
}

export interface UnitOfMeasure {
    id: string;
    name: string;
    abbreviation: string;
}

export interface CreateMaterialPayload {
    name: string;
    specification?: string;
    dimensions?: string;
    color?: string;
    code?: string;
    // Either provide IDs OR names - backend will find or create from names
    itemGroupId?: string;    // Category ID (optional if categoryName provided)
    unitId?: string;         // Unit ID (optional if unitName provided)
    categoryName?: string;   // Category name - will find or create
    unitName?: string;       // Unit name - will find or create
    unitCode?: string;       // Unit abbreviation
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
// MATERIALS API
// =============================================================================

export const materialsApi = {
    /**
     * Get all materials with pagination and filters
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
     * Get material by ID
     */
    async getById(id: string): Promise<Material> {
        const response = await apiClient.get(`/materials/${id}`);
        return response.data.data;
    },

    /**
     * Get all item groups (categories)
     */
    async getCategories(): Promise<MaterialCategory[]> {
        const response = await apiClient.get('/materials/categories');
        return response.data.data;
    },

    /**
     * Get all units of measure
     */
    async getUnits(): Promise<UnitOfMeasure[]> {
        const response = await apiClient.get('/materials/units');
        return response.data.data;
    },

    /**
     * Autocomplete search for materials
     */
    async search(params: {
        query: string;
        itemGroupId?: string;
        limit?: number;
    }): Promise<Material[]> {
        const response = await apiClient.get('/materials/search', {
            params: { q: params.query, itemGroupId: params.itemGroupId, limit: params.limit }
        });
        return response.data.data;
    },

    /**
     * Create a new material (Director only)
     */
    async create(data: CreateMaterialPayload): Promise<Material> {
        const response = await apiClient.post('/materials', data);
        return response.data.data;
    },

    /**
     * Update an existing material (Director only)
     */
    async update(id: string, data: {
        name?: string;
        code?: string;
        specification?: string;
        dimensions?: string;
        color?: string;
        itemGroupId?: string;
        unitId?: string;
    }): Promise<Material> {
        const response = await apiClient.put(`/materials/${id}`, data);
        return response.data.data;
    },
};

export default materialsApi;
