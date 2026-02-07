import apiClient from './client';
import { Indent, CreateIndentPayload, Material, MaterialSuggestion, ItemGroup, UnitOfMeasure, Receipt, DamageReport, IndentItem, Order, OrderItem } from '../types';

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
        status?: string | string[];
        siteId?: string;
        fromDate?: string;
        toDate?: string;
        search?: string;
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

    async closeByEngineer(id: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/close-by-engineer`);
        return response.data.data;
    },

    async putOnHold(id: string, reason: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/on-hold`, { reason });
        return response.data.data;
    },

    async releaseFromHold(id: string): Promise<Indent> {
        const response = await apiClient.post(`/indents/${id}/release-hold`);
        return response.data.data;
    },

    async updateArrivalStatus(
        indentId: string,
        itemId: string,
        arrivalStatus: 'ARRIVED' | 'PARTIAL' | 'NOT_ARRIVED',
        arrivalNotes?: string
    ): Promise<IndentItem> {
        const response = await apiClient.patch(`/indents/${indentId}/items/${itemId}/arrival`, {
            arrivalStatus,
            arrivalNotes,
        });
        return response.data.data;
    },

    // PT Dashboard stats
    async getPendingCount(siteId?: string): Promise<number> {
        const response = await apiClient.get('/indents/pending-count', { params: { siteId } });
        return response.data.data.count;
    },

    async getStats(siteId?: string): Promise<{
        totalIndents: number;
        pendingIndents: number;
        approvedIndents: number;
        purchasedIndents: number;
        closedIndents: number;
    }> {
        const response = await apiClient.get('/indents/stats', { params: { siteId } });
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

// =============================================================================
// RECEIPTS API
// =============================================================================

export interface CreateReceiptPayload {
    indentId: string;
    name?: string;
    deliveryNote?: string;
    remarks?: string;
    items?: Array<{
        indentItemId: string;
        receivedQty: number;
        remarks?: string;
    }>;
}

export const receiptsApi = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        indentId?: string;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<Receipt>> {
        const response = await apiClient.get('/receipts', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Receipt> {
        const response = await apiClient.get(`/receipts/${id}`);
        return response.data.data;
    },

    async getByIndentId(indentId: string): Promise<Receipt[]> {
        const response = await apiClient.get(`/receipts/indent/${indentId}`);
        return response.data.data;
    },

    async create(data: CreateReceiptPayload): Promise<Receipt> {
        const response = await apiClient.post('/receipts', data);
        return response.data.data;
    },

    async uploadImage(receiptId: string, imageUri: string, fileName: string): Promise<any> {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            name: fileName,
            type: 'image/jpeg',
        } as any);

        const response = await apiClient.post(`/receipts/${receiptId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async deleteReceipt(id: string): Promise<void> {
        await apiClient.delete(`/receipts/${id}`);
    },

    async deleteImage(receiptId: string, imageId: string): Promise<void> {
        await apiClient.delete(`/receipts/${receiptId}/images/${imageId}`);
    },
};

// =============================================================================
// DAMAGES / RETURNS API
// =============================================================================

export interface CreateDamageReportPayload {
    indentId: string;
    indentItemId?: string;
    name: string;
    damagedQty?: number;
    description: string;
    severity?: 'MINOR' | 'MODERATE' | 'SEVERE';
    isDraft?: boolean;
}

export interface UpdateDamageReportPayload {
    name?: string;
    indentItemId?: string;
    damagedQty?: number;
    description?: string;
    severity?: 'MINOR' | 'MODERATE' | 'SEVERE';
}

export const damagesApi = {
    /**
     * Get purchased indents that can be used for damage reporting
     */
    async getPurchasedIndents(params?: {
        page?: number;
        limit?: number;
        search?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<Indent>> {
        const response = await apiClient.get('/returns/purchased-indents', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getAll(params?: {
        page?: number;
        limit?: number;
        indentId?: string;
        isResolved?: boolean;
        status?: string;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<DamageReport>> {
        const response = await apiClient.get('/returns/damages', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<DamageReport> {
        const response = await apiClient.get(`/returns/damages/${id}`);
        return response.data.data;
    },

    async getByIndentId(indentId: string): Promise<DamageReport[]> {
        const response = await apiClient.get(`/returns/damages/indent/${indentId}`);
        return response.data.data;
    },

    async create(data: CreateDamageReportPayload): Promise<DamageReport> {
        const response = await apiClient.post('/returns/damages', data);
        return response.data.data;
    },

    async update(id: string, data: UpdateDamageReportPayload): Promise<DamageReport> {
        const response = await apiClient.patch(`/returns/damages/${id}`, data);
        return response.data.data;
    },

    async submit(id: string): Promise<DamageReport> {
        const response = await apiClient.post(`/returns/damages/${id}/submit`);
        return response.data.data;
    },

    async uploadImage(damageReportId: string, imageUri: string, fileName: string): Promise<any> {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            name: fileName,
            type: 'image/jpeg',
        } as any);

        const response = await apiClient.post(`/returns/damages/${damageReportId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async deleteImage(damageReportId: string, imageId: string): Promise<void> {
        await apiClient.delete(`/returns/damages/${damageReportId}/images/${imageId}`);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/returns/damages/${id}`);
    },

    // PT reorder functionality
    async reorder(id: string, expectedDeliveryDate: string): Promise<DamageReport> {
        const response = await apiClient.post(`/returns/damages/${id}/reorder`, {
            expectedDeliveryDate,
        });
        return response.data.data;
    },

    async getReorderedList(params?: {
        page?: number;
        limit?: number;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<DamageReport>> {
        const response = await apiClient.get('/returns/damages-reordered', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getPartiallyReceivedIndents(params?: {
        page?: number;
        limit?: number;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
        search?: string;
    }): Promise<PaginatedResponse<Indent>> {
        const response = await apiClient.get('/returns/partially-received', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },
};

// =============================================================================
// ORDERS API (Purchase Team)
// =============================================================================

export interface CreateOrderPayload {
    indentId: string;
    vendorName?: string;
    vendorContact?: string;
    vendorEmail?: string;
    vendorAddress?: string;
    vendorGstNo?: string;
    vendorContactPerson?: string;
    vendorContactPhone?: string;
    vendorNatureOfBusiness?: string;
    totalAmount?: number;
    taxAmount?: number;
    shippingAmount?: number;
    expectedDeliveryDate?: string;
    remarks?: string;
    items: Array<{
        materialName: string;
        materialCode: string;
        specifications?: string | null;
        quantity: number;
        unitPrice?: number;
    }>;
}

export interface UpdateOrderItemPayload {
    vendorName?: string;
    vendorAddress?: string;
    vendorGstNo?: string;
    vendorContactPerson?: string;
    vendorContactPhone?: string;
    vendorNatureOfBusiness?: string;
    unitPrice?: number;
    quantity?: number;
    totalPrice?: number;
}

export const ordersApi = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        isPurchased?: boolean;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<Order>> {
        const response = await apiClient.get('/orders', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Order> {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data.data;
    },

    async getApprovedIndents(params?: {
        page?: number;
        limit?: number;
        siteId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<PaginatedResponse<Indent>> {
        const response = await apiClient.get('/orders/approved-indents', { params });
        return { data: response.data.data, pagination: response.data.pagination };
    },

    async create(data: CreateOrderPayload): Promise<Order> {
        const response = await apiClient.post('/orders', data);
        return response.data.data;
    },

    async update(id: string, data: Partial<CreateOrderPayload>): Promise<Order> {
        const response = await apiClient.patch(`/orders/${id}`, data);
        return response.data.data;
    },

    async markAsPurchased(id: string): Promise<Order> {
        const response = await apiClient.post(`/orders/${id}/purchased`);
        return response.data.data;
    },

    async updateOrderItem(orderId: string, itemId: string, data: UpdateOrderItemPayload): Promise<OrderItem> {
        const response = await apiClient.patch(`/orders/${orderId}/items/${itemId}`, data);
        return response.data.data;
    },

    async uploadOrderInvoice(orderId: string, imageUri: string, fileName: string): Promise<any> {
        const formData = new FormData();
        formData.append('invoice', {
            uri: imageUri,
            name: fileName,
            type: imageUri.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        } as any);

        const response = await apiClient.post(`/orders/${orderId}/invoices`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async deleteOrderInvoice(orderId: string, invoiceId: string): Promise<void> {
        await apiClient.delete(`/orders/${orderId}/invoices/${invoiceId}`);
    },

    async uploadOrderItemInvoice(orderId: string, itemId: string, imageUri: string, fileName: string): Promise<any> {
        const formData = new FormData();
        formData.append('invoice', {
            uri: imageUri,
            name: fileName,
            type: imageUri.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        } as any);

        const response = await apiClient.post(`/orders/${orderId}/items/${itemId}/invoices`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    async deleteOrderItemInvoice(orderId: string, itemId: string, invoiceId: string): Promise<void> {
        await apiClient.delete(`/orders/${orderId}/items/${itemId}/invoices/${invoiceId}`);
    },
};

// =============================================================================
// REPORTS API (PT Analytics)
// =============================================================================

export interface DashboardSummary {
    totalIndents: number;
    pendingIndents: number;
    closedSites: number;
    totalExpense: number;
}

export interface FinancialReportRow {
    materialName: string;
    materialCode: string;
    specification: string | null;
    unit: string;
    rate: number;
    quantity: number;
    cost: number;
    indentNumber: string;
    siteName: string;
    vendorName: string;
    purchaseDate: string;
}

export interface MaterialReportRow {
    materialName: string;
    materialCode: string;
    specification: string | null;
    dimension: string | null;
    color: string | null;
    category: string;
    unit: string;
    totalRequested: number;
    totalOrdered: number;
}

export interface VendorReportRow {
    vendorName: string;
    vendorAddress: string | null;
    vendorGstNo: string | null;
    vendorContactPerson: string | null;
    vendorContactPhone: string | null;
    vendorNatureOfBusiness: string | null;
    totalOrders: number;
    totalValue: number;
    materialsSupplied: string[];
}

export interface DamageReportRow {
    damageId: string;
    materialName: string;
    indentNumber: string;
    siteName: string;
    reportedBy: string;
    reportedAt: string;
    damagedQty: number | null;
    severity: string;
    status: string;
    isReordered: boolean;
    reorderExpectedDate: string | null;
}

export const reportsApi = {
    async getDashboardSummary(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<DashboardSummary> {
        const response = await apiClient.get('/reports/dashboard-summary', { params });
        return response.data.data;
    },

    // Financial Report
    async getFinancialReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<FinancialReportRow[]> {
        const response = await apiClient.get('/reports/financial', { params });
        return response.data.data;
    },

    async downloadFinancialReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<string> {
        const response = await apiClient.get('/reports/financial/download', {
            params,
            responseType: 'blob',
        });
        // Return blob URL for download
        const url = URL.createObjectURL(response.data);
        return url;
    },

    // Material Report
    async getMaterialReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<MaterialReportRow[]> {
        const response = await apiClient.get('/reports/material', { params });
        return response.data.data;
    },

    async downloadMaterialReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<string> {
        const response = await apiClient.get('/reports/material/download', {
            params,
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        return url;
    },

    async downloadAllMaterials(): Promise<string> {
        const response = await apiClient.get('/reports/material/all/download', {
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        return url;
    },

    // Vendor Report
    async getVendorReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<VendorReportRow[]> {
        const response = await apiClient.get('/reports/vendor', { params });
        return response.data.data;
    },

    async downloadVendorReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<string> {
        const response = await apiClient.get('/reports/vendor/download', {
            params,
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        return url;
    },

    // Damage Report
    async getDamageReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<DamageReportRow[]> {
        const response = await apiClient.get('/reports/damage', { params });
        return response.data.data;
    },

    async downloadDamageReport(params?: {
        fromDate?: string;
        toDate?: string;
        siteId?: string;
    }): Promise<string> {
        const response = await apiClient.get('/reports/damage/download', {
            params,
            responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        return url;
    },
};

export default { indentsApi, materialsApi, itemGroupsApi, uomApi, receiptsApi, damagesApi, ordersApi, reportsApi };
