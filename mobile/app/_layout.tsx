import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

// CRITICAL: Do NOT import auth store at module level
// This causes the crash. Import it lazily inside useEffect.

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [authState, setAuthState] = useState<{
        isAuthenticated: boolean;
        isLoading: boolean;
        userRole: string | null;
    }>({
        isAuthenticated: false,
        isLoading: true,
        userRole: null,
    });

    const router = useRouter();
    const segments = useSegments();

    // Initialize auth AFTER component mounts (not during module load)
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                // Dynamically import the auth store to avoid module-level execution
                const { useAuthStore } = await import('../src/store');

                // Get the store's current state
                const state = useAuthStore.getState();

                // Load stored auth
                await state.loadStoredAuth();

                // Get updated state after loading
                const updatedState = useAuthStore.getState();

                if (isMounted) {
                    setAuthState({
                        isAuthenticated: updatedState.isAuthenticated,
                        isLoading: false,
                        userRole: updatedState.user?.role || null,
                    });
                    setIsReady(true);
                }

                // Subscribe to future changes
                useAuthStore.subscribe((newState) => {
                    if (isMounted) {
                        setAuthState({
                            isAuthenticated: newState.isAuthenticated,
                            isLoading: newState.isLoading,
                            userRole: newState.user?.role || null,
                        });
                    }
                });
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                if (isMounted) {
                    setAuthState({
                        isAuthenticated: false,
                        isLoading: false,
                        userRole: null,
                    });
                    setIsReady(true);
                }
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle navigation after auth state changes
    useEffect(() => {
        if (!isReady || authState.isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!authState.isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (authState.isAuthenticated && inAuthGroup) {
            if (authState.userRole === 'SITE_ENGINEER') {
                router.replace('/(site-engineer)/dashboard');
            } else if (authState.userRole === 'PURCHASE_TEAM') {
                router.replace('/(purchase-team)/dashboard');
            } else if (authState.userRole === 'DIRECTOR') {
                router.replace('/(director)/dashboard');
            }
        }
    }, [isReady, authState, segments]);

    // Show loading until ready
    if (!isReady || authState.isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(site-engineer)" options={{ headerShown: false }} />
                <Stack.Screen name="(purchase-team)" options={{ headerShown: false }} />
                <Stack.Screen name="(director)" options={{ headerShown: false }} />
            </Stack>
        </>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6B7280',
    },
});
