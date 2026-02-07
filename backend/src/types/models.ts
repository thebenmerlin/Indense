import { Role, IndentStatus } from '@prisma/client';

// Base response interface
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
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

// User DTOs
export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: Role;
    siteId?: string;
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
    isActive?: boolean;
}

export interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: Role;
    siteId: string | null;
    siteName?: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
}

// Site DTOs
export interface CreateSiteDto {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
}

export interface UpdateSiteDto {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
}

export interface SiteResponse {
    id: string;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    state: string | null;
    isActive: boolean;
    createdAt: Date;
}

// Material DTOs
export interface MaterialSpecifications {
    [key: string]: string[] | undefined;
}

// ItemGroup Response
export interface ItemGroupResponse {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// UnitOfMeasure Response
export interface UnitOfMeasureResponse {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMaterialDto {
    name: string;
    code: string;
    itemGroupId: string;  // Foreign key to ItemGroup
    unitId: string;       // Foreign key to UnitOfMeasure
    description?: string;
    specifications?: MaterialSpecifications;
}

export interface MaterialResponse {
    id: string;
    name: string;
    code: string;
    itemGroupId: string;
    unitId: string;
    itemGroup?: ItemGroupResponse;  // Included when fetching with relations
    unit?: UnitOfMeasureResponse;   // Included when fetching with relations
    description: string | null;
    specifications: MaterialSpecifications | null;
    isActive: boolean;
    isSystemData: boolean;
}

// Indent DTOs
export interface NewMaterialInput {
    name: string;
    specification?: string;
    dimensions?: string;
    colour?: string;
    categoryId?: string;      // Existing category ID
    categoryName?: string;    // Category name (for lookup or creation)
    unitId?: string;          // Existing unit ID
    unitCode?: string;        // Unit code (for lookup)
    unitName?: string;        // Unit name (for lookup or creation)
}

export interface IndentItemInput {
    materialId: string;
    requestedQty: number;
    specifications?: Record<string, string>;
    notes?: string;
    isUrgent?: boolean;
    isNewMaterial?: boolean;          // Flag for new materials
    newMaterial?: NewMaterialInput;   // Data for creating new material
}

export interface CreateIndentDto {
    name: string;              // Required indent name
    description?: string;      // Optional description
    priority?: string;
    notes?: string;
    requiredByDate?: Date;
    expectedDeliveryDate?: Date;
    items: IndentItemInput[];
}

export interface ApproveIndentDto {
    remarks?: string;
}

export interface RejectIndentDto {
    reason: string;
}

// Order DTOs
export interface OrderItemInput {
    indentItemId?: string; // Link to source indent item for reorder tracking
    materialName: string;
    materialCode: string;
    specifications?: Record<string, string>;
    quantity: number;
    unitPrice?: number;
    // Per-item vendor details (optional)
    vendorName?: string;
    vendorAddress?: string;
    vendorGstNo?: string;
    vendorContactPerson?: string;
    vendorContactPhone?: string;
    vendorNatureOfBusiness?: string;
}

export interface CreateOrderDto {
    indentId: string;
    vendorName: string;
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
    expectedDeliveryDate?: Date;
    remarks?: string;
    items: OrderItemInput[];
}

export interface UpdateOrderDto {
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
    expectedDeliveryDate?: Date;
    deliveryStatus?: string;
    remarks?: string;
}

// Receipt DTOs
export interface ReceiptItemInput {
    indentItemId: string;
    receivedQty: number;
    remarks?: string;
}

export interface CreateReceiptDto {
    indentId: string;
    deliveryNote?: string;
    remarks?: string;
    items: ReceiptItemInput[];
}

// Damage Report DTOs
export interface CreateDamageReportDto {
    indentId: string;          // Required parent indent
    indentItemId?: string;     // Optional specific item
    name: string;              // Name for the damage report
    damagedQty?: number;
    description: string;
    severity?: string;
    isDraft?: boolean;         // Save as draft
}

export interface ResolveDamageDto {
    resolution: string;
}

// Return DTOs
export interface CreateReturnDto {
    damageReportId: string;
    quantity: number;
    reason: string;
}

// Filter types
export interface IndentFilters {
    status?: IndentStatus | IndentStatus[];
    siteId?: string;
    createdById?: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
}

export interface OrderFilters {
    siteId?: string;
    vendorName?: string;
    deliveryStatus?: string;
    fromDate?: Date;
    toDate?: Date;
}

// Report types
export interface MonthlyReportParams {
    year: number;
    month: number;
    siteId?: string;
}

export interface MonthlyReportData {
    period: string;
    siteId?: string;
    siteName?: string;
    summary: {
        totalIndents: number;
        totalApproved: number;
        totalRejected: number;
        totalOrders: number;
        totalValue: number;
    };
    indents: Array<{
        indentNumber: string;
        status: string;
        createdAt: Date;
        itemCount: number;
        totalValue?: number;
    }>;
}
