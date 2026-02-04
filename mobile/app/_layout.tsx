import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import type { Subscription } from 'expo-notifications';
import { AuthProvider, useAuth } from '../src/context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import {
    addNotificationResponseListener,
    getNotificationData,
    registerForPushNotificationsAsync,
    registerPushTokenWithBackend,
    removeNotificationListeners,
} from '../src/services/notifications';

// Role constants
const Role = {
    SITE_ENGINEER: 'SITE_ENGINEER',
    PURCHASE_TEAM: 'PURCHASE_TEAM',
    DIRECTOR: 'DIRECTOR',
} as const;

// Navigation guard component
function NavigationGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup && user) {
            // Navigate to appropriate dashboard based on role
            if (user.role === Role.SITE_ENGINEER) {
                router.replace('/(site-engineer)/dashboard');
            } else if (user.role === Role.PURCHASE_TEAM) {
                router.replace('/(purchase-team)/dashboard');
            } else if (user.role === Role.DIRECTOR) {
                router.replace('/(director)/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, segments, user]);

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return <>{children}</>;
}

function NotificationBinding() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const hasRegistered = useRef(false);

    useEffect(() => {
        const subscriptions: Subscription[] = [];

        if (!isAuthenticated || !user) {
            hasRegistered.current = false;
            removeNotificationListeners(subscriptions);
            return undefined;
        }

        const setup = async () => {
            if (!hasRegistered.current) {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    await registerPushTokenWithBackend(token);
                    hasRegistered.current = true;
                }
            }

            const responseSub = addNotificationResponseListener((response) => {
                const data = getNotificationData(response);
                const screen = data?.screen as string | undefined;
                if (!screen) return;

                const indentId = (data?.indentId as string | undefined) || (data?.id as string | undefined);
                const target = indentId && screen.includes('[id]')
                    ? screen.replace('[id]', indentId)
                    : screen;

                router.push(target as any);
            });

            subscriptions.push(responseSub);
        };

        setup();

        return () => {
            removeNotificationListeners(subscriptions);
            hasRegistered.current = false;
        };
    }, [isAuthenticated, router, user?.id]);

    return null;
}

// Root layout with providers
export default function RootLayout() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <NotificationBinding />
                <StatusBar style="auto" />
                <NavigationGuard>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(site-engineer)" options={{ headerShown: false }} />
                        <Stack.Screen name="(purchase-team)" options={{ headerShown: false }} />
                        <Stack.Screen name="(director)" options={{ headerShown: false }} />
                    </Stack>
                </NavigationGuard>
            </AuthProvider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
