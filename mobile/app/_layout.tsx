import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Role = {
    SITE_ENGINEER: 'SITE_ENGINEER',
    PURCHASE_TEAM: 'PURCHASE_TEAM',
    DIRECTOR: 'DIRECTOR',
};

export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (token && userJson) {
                setUser(JSON.parse(userJson));
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.warn('Failed to load auth:', e);
        } finally {
            setIsLoading(false);
        }
    };

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
});
