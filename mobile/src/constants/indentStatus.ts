// Indent status definitions
export enum IndentStatus {
    SUBMITTED = 'SUBMITTED',
    PURCHASE_APPROVED = 'PURCHASE_APPROVED',
    DIRECTOR_APPROVED = 'DIRECTOR_APPROVED',
    ORDER_PLACED = 'ORDER_PLACED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    FULLY_RECEIVED = 'FULLY_RECEIVED',
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED',
}

// Status display names
export const STATUS_LABELS: Record<IndentStatus, string> = {
    [IndentStatus.SUBMITTED]: 'Submitted',
    [IndentStatus.PURCHASE_APPROVED]: 'Purchase Approved',
    [IndentStatus.DIRECTOR_APPROVED]: 'Director Approved',
    [IndentStatus.ORDER_PLACED]: 'Order Placed',
    [IndentStatus.PARTIALLY_RECEIVED]: 'Partially Received',
    [IndentStatus.FULLY_RECEIVED]: 'Fully Received',
    [IndentStatus.CLOSED]: 'Closed',
    [IndentStatus.REJECTED]: 'Rejected',
};

// Status colors for UI
export const STATUS_COLORS: Record<IndentStatus, string> = {
    [IndentStatus.SUBMITTED]: '#F59E0B', // Amber
    [IndentStatus.PURCHASE_APPROVED]: '#3B82F6', // Blue
    [IndentStatus.DIRECTOR_APPROVED]: '#8B5CF6', // Purple
    [IndentStatus.ORDER_PLACED]: '#06B6D4', // Cyan
    [IndentStatus.PARTIALLY_RECEIVED]: '#F97316', // Orange
    [IndentStatus.FULLY_RECEIVED]: '#10B981', // Emerald
    [IndentStatus.CLOSED]: '#6B7280', // Gray
    [IndentStatus.REJECTED]: '#EF4444', // Red
};

// Priority levels
export enum Priority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
    [Priority.LOW]: '#6B7280',
    [Priority.NORMAL]: '#3B82F6',
    [Priority.HIGH]: '#F59E0B',
    [Priority.URGENT]: '#EF4444',
};
