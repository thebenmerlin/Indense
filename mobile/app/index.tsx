import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Role } from '../src/constants';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (token && userJson) {
                setUser(JSON.parse(userJson));
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.warn('Auth check failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user?.role === Role.SITE_ENGINEER) {
        return <Redirect href="/(site-engineer)/dashboard" />;
    } else if (user?.role === Role.PURCHASE_TEAM) {
        return <Redirect href="/(purchase-team)/dashboard" />;
    } else if (user?.role === Role.DIRECTOR) {
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
