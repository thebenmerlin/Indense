import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context';

// Role constants
const Role = {
    SITE_ENGINEER: 'SITE_ENGINEER',
    PURCHASE_TEAM: 'PURCHASE_TEAM',
    DIRECTOR: 'DIRECTOR',
} as const;

export default function Index() {
    const { isLoading, isAuthenticated, user } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!isAuthenticated || !user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user.role === Role.SITE_ENGINEER) {
        return <Redirect href="/(site-engineer)/dashboard" />;
    } else if (user.role === Role.PURCHASE_TEAM) {
        return <Redirect href="/(purchase-team)/dashboard" />;
    } else if (user.role === Role.DIRECTOR) {
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
