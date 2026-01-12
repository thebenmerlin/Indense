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
        title: 'Indent Approved by Director',
        message: 'Your indent has been approved by the Director. Order can now be placed.',
    },
    INDENT_REJECTED: {
        title: 'Indent Rejected',
        message: 'Your indent has been rejected.',
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
    RETURN_RAISED: {
        title: 'Return Raised',
        message: 'A return has been raised for damaged materials.',
    },
};
