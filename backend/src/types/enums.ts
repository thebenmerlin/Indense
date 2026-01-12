// Re-export Prisma enums for use throughout the application
export { Role, IndentStatus, NotificationType, ReturnStatus } from '@prisma/client';

// Priority levels for indents
export enum Priority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

// Delivery status for orders
export enum DeliveryStatus {
    PENDING = 'PENDING',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
}

// Damage severity levels
export enum DamageSeverity {
    MINOR = 'MINOR',
    MODERATE = 'MODERATE',
    SEVERE = 'SEVERE',
}

// Audit action types
export enum AuditAction {
    // User actions
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',

    // Indent actions
    INDENT_CREATED = 'INDENT_CREATED',
    INDENT_UPDATED = 'INDENT_UPDATED',
    INDENT_PURCHASE_APPROVED = 'INDENT_PURCHASE_APPROVED',
    INDENT_PURCHASE_REJECTED = 'INDENT_PURCHASE_REJECTED',
    INDENT_DIRECTOR_APPROVED = 'INDENT_DIRECTOR_APPROVED',
    INDENT_DIRECTOR_REJECTED = 'INDENT_DIRECTOR_REJECTED',
    INDENT_CLOSED = 'INDENT_CLOSED',

    // Order actions
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_UPDATED = 'ORDER_UPDATED',

    // Receipt actions
    RECEIPT_CREATED = 'RECEIPT_CREATED',
    RECEIPT_IMAGE_UPLOADED = 'RECEIPT_IMAGE_UPLOADED',

    // Damage & Return actions
    DAMAGE_REPORTED = 'DAMAGE_REPORTED',
    DAMAGE_RESOLVED = 'DAMAGE_RESOLVED',
    RETURN_CREATED = 'RETURN_CREATED',
    RETURN_APPROVED = 'RETURN_APPROVED',
    RETURN_PROCESSED = 'RETURN_PROCESSED',
}

// Entity types for audit logging
export enum EntityType {
    USER = 'USER',
    SITE = 'SITE',
    MATERIAL = 'MATERIAL',
    INDENT = 'INDENT',
    INDENT_ITEM = 'INDENT_ITEM',
    ORDER = 'ORDER',
    RECEIPT = 'RECEIPT',
    DAMAGE_REPORT = 'DAMAGE_REPORT',
    RETURN = 'RETURN',
}
