import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store';
import { Role } from '../src/constants';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
    const { isAuthenticated, isLoading, user, loadStoredAuth } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            if (user?.role === Role.SITE_ENGINEER) {
                router.replace('/(site-engineer)/dashboard');
            } else if (user?.role === Role.PURCHASE_TEAM) {
                router.replace('/(purchase-team)/dashboard');
            } else if (user?.role === Role.DIRECTOR) {
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

    return (
        <ErrorBoundary>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(site-engineer)" options={{ headerShown: false }} />
                <Stack.Screen name="(purchase-team)" options={{ headerShown: false }} />
                <Stack.Screen name="(director)" options={{ headerShown: false }} />
            </Stack>
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
