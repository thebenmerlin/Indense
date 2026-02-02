import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Don't import at module level - use lazy loading
export default function Index() {
    const [authState, setAuthState] = useState<{
        isReady: boolean;
        isAuthenticated: boolean;
        userRole: string | null;
    }>({
        isReady: false,
        isAuthenticated: false,
        userRole: null,
    });

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const { useAuthStore } = await import('../src/store');
                const state = useAuthStore.getState();

                if (isMounted) {
                    setAuthState({
                        isReady: true,
                        isAuthenticated: state.isAuthenticated,
                        userRole: state.user?.role || null,
                    });
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                if (isMounted) {
                    setAuthState({
                        isReady: true,
                        isAuthenticated: false,
                        userRole: null,
                    });
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!authState.isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!authState.isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (authState.userRole === 'SITE_ENGINEER') {
        return <Redirect href="/(site-engineer)/dashboard" />;
    } else if (authState.userRole === 'PURCHASE_TEAM') {
        return <Redirect href="/(purchase-team)/dashboard" />;
    } else if (authState.userRole === 'DIRECTOR') {
        return <Redirect href="/(director)/dashboard" />;
    }

    return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
