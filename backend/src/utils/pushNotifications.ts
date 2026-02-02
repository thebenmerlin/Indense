/**
 * Expo Push Notifications Utility
 * Sends push notifications via Expo's Push Notification service
 */

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: 'default' | null;
    badge?: number;
    priority?: 'default' | 'normal' | 'high';
    channelId?: string;
}

interface ExpoPushTicket {
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: Record<string, unknown>;
}

interface ExpoPushResponse {
    data: ExpoPushTicket[];
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Check if a push token is a valid Expo push token
 */
export function isExpoPushToken(token: string): boolean {
    return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

/**
 * Send a single push notification
 */
export async function sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<ExpoPushTicket | null> {
    if (!pushToken || !isExpoPushToken(pushToken)) {
        console.warn(`Invalid Expo push token: ${pushToken}`);
        return null;
    }

    const message: ExpoPushMessage = {
        to: pushToken,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
    };

    try {
        const response = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json() as ExpoPushResponse;
        return result.data[0];
    } catch (error) {
        console.error('Failed to send push notification:', error);
        return null;
    }
}

/**
 * Send push notifications to multiple tokens (batch)
 */
export async function sendPushNotifications(
    pushTokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<ExpoPushTicket[]> {
    // Filter valid tokens
    const validTokens = pushTokens.filter(isExpoPushToken);

    if (validTokens.length === 0) {
        return [];
    }

    const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
    }));

    // Expo recommends batching in chunks of 100
    const chunks: ExpoPushMessage[][] = [];
    for (let i = 0; i < messages.length; i += 100) {
        chunks.push(messages.slice(i, i + 100));
    }

    const results: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });

            const result = await response.json() as ExpoPushResponse;
            results.push(...result.data);
        } catch (error) {
            console.error('Failed to send batch push notifications:', error);
        }
    }

    return results;
}

/**
 * Notification data structure for deep linking
 */
export interface NotificationDeepLink {
    screen: string;
    params?: Record<string, string>;
}

/**
 * Build notification data for deep linking
 */
export function buildNotificationData(
    type: string,
    indentId?: string,
    additionalData?: Record<string, unknown>
): Record<string, unknown> {
    return {
        type,
        indentId,
        timestamp: new Date().toISOString(),
        ...additionalData,
    };
}
