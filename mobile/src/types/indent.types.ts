import { IndentStatus, Priority } from '../constants/indentStatus';

// =============================================================================
// MATERIAL TYPES (Updated for normalized schema)
// =============================================================================

export interface ItemGroup {
    id: string;
    name: string;
}

export interface UnitOfMeasure {
    id: string;
    code: string;
    name: string;
}

export interface Material {
    id: string;
    name: string;
    code: string;
    description: string | null;
    specifications: Record<string, string[]> | null;
    isActive: boolean;
    itemGroup: ItemGroup;
    unit: UnitOfMeasure;
}

/** Lightweight material for autocomplete suggestions */
export interface MaterialSuggestion {
    id: string;
    name: string;
    code: string;
    unitCode: string;
    unitName: string;
    categoryName: string;
}

/** Material created on-the-fly by Site Engineer */
export interface CreateMaterialPayload {
    name: string;
    specification?: string;
    dimensions?: string;
    colour?: string;
    categoryId: string;
    unitId: string;
}

// =============================================================================
// INDENT TYPES
// =============================================================================

export interface IndentItem {
    id: string;
    materialId: string;
    material: Material;
    requestedQty: number;
    receivedQty: number;
    pendingQty: number;
    specifications: Record<string, string> | null;
    notes: string | null;
    isUrgent: boolean;
    arrivalStatus: 'ARRIVED' | 'PARTIAL' | 'NOT_ARRIVED' | null;
    arrivalNotes: string | null;
    // Reorder tracking for partial orders
    isReordered?: boolean;
    reorderedAt?: string | null;
    reorderVendorName?: string | null;
    reorderVendorContact?: string | null;
}

export interface Site {
    id: string;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    state: string | null;
}

export interface Indent {
    id: string;
    indentNumber: string;
    name: string;
    description: string | null;
    status: IndentStatus;
    priority: Priority;
    notes: string | null;
    requiredByDate: string | null;
    expectedDeliveryDate: string | null;
    site: Site;
    createdBy: { id: string; name: string };
    createdAt: string;
    items: IndentItem[];
    purchaseApprovedBy?: { name: string } | null;
    purchaseApprovedAt?: string | null;
    directorApprovedBy?: { name: string } | null;
    directorApprovedAt?: string | null;
    rejectionReason?: string | null;
    order?: {
        vendorName?: string;
        vendorContact?: string;
        status: string;
    } | null;
}

export interface CreateIndentPayload {
    name: string;
    description?: string;
    expectedDeliveryDate?: string;
    priority?: Priority;
    notes?: string;
    requiredByDate?: string;
    items: {
        materialId: string;
        requestedQty: number;
        specifications?: Record<string, string>;
        notes?: string;
        isUrgent?: boolean;
    }[];
}

