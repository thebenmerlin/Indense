import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const theme = {
    colors: {
        surface: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
    }
};

export default function OrdersScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Orders Management</Text>
                <Text style={styles.subtitle}>
                    Create and manage vendor orders for approved indents.
                    Track order status and delivery schedules.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    content: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
