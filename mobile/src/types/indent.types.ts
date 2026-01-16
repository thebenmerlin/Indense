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
    status: IndentStatus;
    priority: Priority;
    notes: string | null;
    requiredByDate: string | null;
    site: Site;
    createdBy: { id: string; name: string };
    createdAt: string;
    items: IndentItem[];
    purchaseApprovedBy?: { name: string } | null;
    purchaseApprovedAt?: string | null;
    directorApprovedBy?: { name: string } | null;
    directorApprovedAt?: string | null;
    rejectionReason?: string | null;
}

export interface CreateIndentPayload {
    priority?: Priority;
    notes?: string;
    requiredByDate?: string;
    items: {
        materialId: string;
        requestedQty: number;
        specifications?: Record<string, string>;
        notes?: string;
    }[];
}
