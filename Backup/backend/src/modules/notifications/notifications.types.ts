import { NotificationType } from '@prisma/client';

export interface NotificationData {
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    indentId?: string;
    data?: Record<string, unknown>;
}

export const notificationTemplates: Record<NotificationType, { title: string; message: string }> = {
    INDENT_SUBMITTED: {
        title: 'New Indent Submitted',
        message: 'A new material indent has been submitted for approval.',
    },
    INDENT_PURCHASE_APPROVED: {
        title: 'Indent Approved by Purchase Team',
        message: 'Your indent has been approved by the Purchase Team and is pending Director approval.',
    },
    INDENT_DIRECTOR_APPROVED: {
        title: 'Indent Approved',
        message: 'Your indent has been fully approved. Order can now be placed.',
    },
    INDENT_REJECTED: {
        title: 'Indent Rejected',
        message: 'Your indent has been rejected.',
    },
    INDENT_ON_HOLD: {
        title: 'Indent On Hold',
        message: 'An indent has been put on hold by the Director.',
    },
    INDENT_URGENT: {
        title: '🚨 Urgent Indent',
        message: 'An urgent indent requires immediate attention.',
    },
    INDENT_CLOSED: {
        title: 'Indent Closed',
        message: 'An indent has been closed.',
    },
    ORDER_PLACED: {
        title: 'Order Placed',
        message: 'An order has been placed with the vendor for your indent.',
    },
    ORDER_UPDATED: {
        title: 'Order Updated',
        message: 'The order details have been updated.',
    },
    MATERIAL_RECEIVED: {
        title: 'Material Received',
        message: 'Materials have been received for your indent.',
    },
    DAMAGE_REPORTED: {
        title: 'Damage Reported',
        message: 'A damage report has been filed for materials.',
    },
    DAMAGE_REPAIRED: {
        title: 'Damage Repaired',
        message: 'Damaged materials have been reordered.',
    },
    PARTIAL_RECEIVED: {
        title: 'Partially Received',
        message: 'Materials have been partially received.',
    },
    PARTIAL_REORDERED: {
        title: 'Partial Order Placed',
        message: 'Remaining materials have been reordered.',
    },
    SITE_ASSIGNED: {
        title: 'Site Assignment',
        message: 'You have been assigned to a new site.',
    },
    USER_REGISTERED: {
        title: 'New User Registered',
        message: 'A new user has registered on the platform.',
    },
    RETURN_RAISED: {
        title: 'Return Raised',
        message: 'A return has been raised for damaged materials.',
    },
};

/**
 * Get deep link screen for notification type by role
 */
export function getDeepLinkScreen(type: NotificationType, role: string): string {
    const siteEngineerRoutes: Partial<Record<NotificationType, string>> = {
        INDENT_PURCHASE_APPROVED: '/indents',
        INDENT_DIRECTOR_APPROVED: '/indents',
        ORDER_PLACED: '/indents',
        DAMAGE_REPAIRED: '/indents',
        PARTIAL_REORDERED: '/indents',
        SITE_ASSIGNED: '/dashboard',
    };

    const purchaseTeamRoutes: Partial<Record<NotificationType, string>> = {
        INDENT_SUBMITTED: '/indents/pending',
        INDENT_URGENT: '/indents/pending',
        INDENT_DIRECTOR_APPROVED: '/indents/approved',
        INDENT_ON_HOLD: '/indents/pending',
        INDENT_CLOSED: '/indents',
        DAMAGE_REPORTED: '/indents/damaged',
        PARTIAL_RECEIVED: '/indents/partial',
        SITE_ASSIGNED: '/dashboard',
    };

    const directorRoutes: Partial<Record<NotificationType, string>> = {
        INDENT_SUBMITTED: '/indents/pending',
        INDENT_URGENT: '/indents/pending',
        ORDER_PLACED: '/indents/all',
        INDENT_CLOSED: '/indents/all',
        DAMAGE_REPORTED: '/indents/damaged',
        DAMAGE_REPAIRED: '/indents/damaged',
        PARTIAL_RECEIVED: '/indents/partial',
        PARTIAL_REORDERED: '/indents/partial',
        USER_REGISTERED: '/space/roles',
    };

    switch (role) {
        case 'SITE_ENGINEER':
            return siteEngineerRoutes[type] || '/dashboard';
        case 'PURCHASE_TEAM':
            return purchaseTeamRoutes[type] || '/dashboard';
        case 'DIRECTOR':
            return directorRoutes[type] || '/dashboard';
        default:
            return '/dashboard';
    }
}
