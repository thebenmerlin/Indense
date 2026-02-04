/**
 * Push Notification Service for Expo
 * Handles permission requests, token registration, and notification handling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationsApi } from '../api';


// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
        projectId,
    });

    // Android-specific channel configuration
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1E3A8A',
        });
    }

    return token.data;
}

/**
 * Register push token with backend
 */
export async function registerPushTokenWithBackend(pushToken: string): Promise<boolean> {
    try {
        await notificationsApi.registerToken(pushToken);
        return true;
    } catch (error) {
        console.error('Failed to register push token:', error);
        return false;
    }
}

/**
 * Unregister push token from backend
 */
export async function unregisterPushTokenFromBackend(): Promise<boolean> {
    try {
        await notificationsApi.unregisterToken();
        return true;
    } catch (error) {
        console.error('Failed to unregister push token:', error);
        return false;
    }
}

/**
 * Add listener for notifications received while app is foregrounded
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification taps (opens app)
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get notification data for deep linking
 */
export function getNotificationData(
    response: Notifications.NotificationResponse
): Record<string, unknown> | null {
    return response.notification.request.content.data as Record<string, unknown> | null;
}

/**
 * Remove all notification listeners
 */
export function removeNotificationListeners(subscriptions: Notifications.Subscription[]): void {
    subscriptions.forEach(sub => sub.remove());
}
