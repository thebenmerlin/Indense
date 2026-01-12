import apiClient from './client';
import { Indent, CreateIndentPayload, Material } from '../types';

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

export const materialsApi = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
    }): Promise<PaginatedResponse<Material>> {
        const response = await apiClient.get('/materials', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Material> {
        const response = await apiClient.get(`/materials/${id}`);
        return response.data.data;
    },

    async getCategories(): Promise<string[]> {
        const response = await apiClient.get('/materials/categories');
        return response.data.data;
    },
};

export default { indentsApi, materialsApi };
