import { Role } from '@prisma/client';

/**
 * Visibility rules for Order data
 * Price-related fields are ONLY visible to Purchase Team and Director
 */

// Fields that are hidden from Site Engineers in Order responses
const HIDDEN_ORDER_FIELDS = [
    'totalAmount',
    'taxAmount',
    'shippingAmount',
    'grandTotal',
];

const HIDDEN_ORDER_ITEM_FIELDS = [
    'unitPrice',
    'totalPrice',
];

/**
 * Check if user can view pricing information
 */
export function canViewPricing(role: Role): boolean {
    return role === Role.PURCHASE_TEAM || role === Role.DIRECTOR;
}

/**
 * Strip pricing fields from order based on user role
 */
export function filterOrderForRole<T extends Record<string, unknown>>(
    order: T,
    role: Role
): T {
    if (canViewPricing(role)) {
        return order;
    }

    const filtered = { ...order };

    // Remove hidden fields
    for (const field of HIDDEN_ORDER_FIELDS) {
        delete filtered[field];
    }

    // Filter order items if present
    const orderItems = (filtered as { orderItems?: unknown }).orderItems;
    if (Array.isArray(orderItems)) {
        (filtered as Record<string, unknown>).orderItems = orderItems.map(
            (item) => filterOrderItemForRole(item as Record<string, unknown>, role)
        );
    }

    return filtered;
}

/**
 * Strip pricing fields from order item based on user role
 */
export function filterOrderItemForRole<T extends Record<string, unknown>>(
    item: T,
    role: Role
): T {
    if (canViewPricing(role)) {
        return item;
    }

    const filtered = { ...item };

    for (const field of HIDDEN_ORDER_ITEM_FIELDS) {
        delete filtered[field];
    }

    return filtered;
}

/**
 * Filter array of orders for role
 */
export function filterOrdersForRole<T extends Record<string, unknown>>(
    orders: T[],
    role: Role
): T[] {
    return orders.map((order) => filterOrderForRole(order, role));
}
