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
        INDENT_PURCHASE_APPROVED: '/(site-engineer)/indents/[id]',
        INDENT_DIRECTOR_APPROVED: '/(site-engineer)/indents/[id]',
        INDENT_ON_HOLD: '/(site-engineer)/indents/[id]',
        INDENT_REJECTED: '/(site-engineer)/indents/[id]',
        ORDER_PLACED: '/(site-engineer)/indents/[id]',
        MATERIAL_RECEIVED: '/(site-engineer)/indents/[id]',
        DAMAGE_REPAIRED: '/(site-engineer)/indents/[id]',
        PARTIAL_REORDERED: '/(site-engineer)/indents/[id]',
        SITE_ASSIGNED: '/(site-engineer)/dashboard',
        RETURN_RAISED: '/(site-engineer)/damages/[id]',
    };

    const purchaseTeamRoutes: Partial<Record<NotificationType, string>> = {
        INDENT_SUBMITTED: '/(purchase-team)/pending/[id]',
        INDENT_URGENT: '/(purchase-team)/pending/[id]',
        INDENT_PURCHASE_APPROVED: '/(purchase-team)/pending/[id]',
        INDENT_DIRECTOR_APPROVED: '/(purchase-team)/indents/[id]',
        INDENT_ON_HOLD: '/(purchase-team)/pending/[id]',
        INDENT_CLOSED: '/(purchase-team)/indents/[id]',
        DAMAGE_REPORTED: '/(purchase-team)/damages/[id]',
        MATERIAL_RECEIVED: '/(purchase-team)/indents/[id]',
        PARTIAL_RECEIVED: '/(purchase-team)/partial/[id]',
        PARTIAL_REORDERED: '/(purchase-team)/partial/[id]',
        SITE_ASSIGNED: '/(purchase-team)/dashboard',
        RETURN_RAISED: '/(purchase-team)/damages/[id]',
    };

    const directorRoutes: Partial<Record<NotificationType, string>> = {
        INDENT_SUBMITTED: '/(director)/indents/pending/[id]',
        INDENT_URGENT: '/(director)/indents/pending/[id]',
        INDENT_PURCHASE_APPROVED: '/(director)/indents/pending/[id]',
        INDENT_DIRECTOR_APPROVED: '/(director)/indents/all/[id]',
        ORDER_PLACED: '/(director)/indents/all/[id]',
        INDENT_CLOSED: '/(director)/indents/all/[id]',
        DAMAGE_REPORTED: '/(director)/indents/damaged/[id]',
        DAMAGE_REPAIRED: '/(director)/indents/damaged/[id]',
        MATERIAL_RECEIVED: '/(director)/indents/all/[id]',
        PARTIAL_RECEIVED: '/(director)/indents/partial/[id]',
        PARTIAL_REORDERED: '/(director)/indents/partial/[id]',
        USER_REGISTERED: '/(director)/space/roles',
        RETURN_RAISED: '/(director)/indents/damaged/[id]',
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
