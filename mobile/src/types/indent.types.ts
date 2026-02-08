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
    updatedAt?: string;
    items: IndentItem[];
    purchaseApprovedBy?: { name: string } | null;
    purchaseApprovedAt?: string | null;
    directorApprovedBy?: { name: string } | null;
    directorApprovedAt?: string | null;
    rejectionReason?: string | null;
    // On-Hold fields
    isOnHold?: boolean;
    onHoldAt?: string | null;
    onHoldById?: string | null;
    onHoldBy?: { id: string; name: string } | null;
    onHoldReason?: string | null;
    releasedFromHoldAt?: string | null;
    order?: {
        orderNumber?: string;
        vendorName?: string;
        vendorContact?: string;
        vendorEmail?: string;
        vendorAddress?: string;
        expectedDeliveryDate?: string;
        actualDeliveryDate?: string;
        deliveryStatus?: string;
        createdAt?: string;
        // Order items with per-material vendor details
        orderItems?: Array<{
            id: string;
            indentItemId?: string | null;
            materialName: string;
            materialCode: string;
            quantity: number;
            unitPrice?: number | null;
            totalPrice?: number | null;
            vendorName?: string | null;
            vendorAddress?: string | null;
            vendorGstNo?: string | null;
            vendorContactPerson?: string | null;
            vendorContactPhone?: string | null;
            vendorNatureOfBusiness?: string | null;
        }>;
    } | null;
    // Receipts with images
    receipts?: Receipt[];
    _count?: {
        damageReports?: number;
    };
}

export interface NewMaterialPayloadData {
    name: string;
    specification?: string;
    dimensions?: string;
    colour?: string;
    categoryId?: string;
    categoryName?: string;
    unitId?: string;
    unitCode?: string;
    unitName?: string;
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
        isNewMaterial?: boolean;
        newMaterial?: NewMaterialPayloadData;
    }[];
}

// =============================================================================
// RECEIPT TYPES
// =============================================================================

export interface ReceiptImage {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
}

export interface ReceiptItem {
    id: string;
    indentItemId: string;
    receivedQty: number;
    isComplete: boolean;
    remarks: string | null;
    indentItem?: IndentItem;
}

export interface Receipt {
    id: string;
    receiptNumber: string;
    name: string | null;
    indentId: string;
    indent?: {
        id: string;
        indentNumber: string;
        name: string;
        status: IndentStatus;
    };
    site?: Site;
    createdBy: { name: string };
    receivedDate: string;
    deliveryNote: string | null;
    remarks: string | null;
    items: ReceiptItem[];
    images: ReceiptImage[];
    createdAt: string;
}

// =============================================================================
// DAMAGE REPORT TYPES
// =============================================================================

export type DamageStatus = 'DRAFT' | 'REPORTED' | 'ACKNOWLEDGED' | 'RESOLVED';
export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';

export interface DamageImage {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
}

export interface DamageReport {
    id: string;
    indentId: string;
    indent?: {
        id: string;
        indentNumber: string;
        name: string;
        status: IndentStatus;
        site?: Site;
    };
    site?: Site;
    indentItemId: string | null;
    indentItem?: IndentItem | null;
    reportedBy: { name: string };
    name: string;
    damagedQty: number | null;
    description: string;
    severity: DamageSeverity;
    status: DamageStatus;
    submittedAt: string | null;
    isResolved: boolean;
    resolvedAt: string | null;
    resolution: string | null;
    images: DamageImage[];
    return?: {
        id: string;
        returnNumber: string;
        status: string;
    } | null;
    // Reorder tracking
    isReordered?: boolean;
    reorderedAt?: string | null;
    reorderExpectedDate?: string | null;
    reorderedBy?: { name: string } | null;
    createdAt: string;
}

// =============================================================================
// ORDER TYPES (Purchase Team)
// =============================================================================

export interface OrderInvoice {
    id: string;
    orderId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
}

export interface OrderItemInvoice {
    id: string;
    orderItemId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    indentItemId: string | null;
    materialName: string;
    materialCode: string;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
    // Per-item vendor details
    vendorName: string | null;
    vendorAddress: string | null;
    vendorGstNo: string | null;
    vendorContactPerson: string | null;
    vendorContactPhone: string | null;
    vendorNatureOfBusiness: string | null;
    // Reorder tracking
    isReordered?: boolean;
    // Relations
    indentItem?: IndentItem | null;
    invoices?: OrderItemInvoice[];
}

export interface Order {
    id: string;
    orderNumber: string;
    indentId: string;
    indent?: Indent;
    // Vendor details at order level
    vendorName: string;
    vendorContact: string | null;
    vendorEmail: string | null;
    vendorAddress: string | null;
    vendorGstNo: string | null;
    vendorContactPerson: string | null;
    vendorContactPhone: string | null;
    vendorNatureOfBusiness: string | null;
    // Pricing
    totalAmount: number | null;
    taxAmount: number | null;
    shippingAmount: number | null;
    grandTotal: number | null;
    // Status
    expectedDeliveryDate: string | null;
    actualDeliveryDate: string | null;
    deliveryStatus: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
    remarks: string | null;
    // Purchase status
    isPurchased: boolean;
    purchasedAt: string | null;
    // Reorder tracking
    isReorder: boolean;
    reorderedAt: string | null;
    reorderExpectedDate: string | null;
    reorderReason: string | null;
    // Relations
    orderItems: OrderItem[];
    invoices?: OrderInvoice[];
    createdAt: string;
}

