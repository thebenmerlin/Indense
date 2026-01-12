import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const theme = {
    colors: {
        surface: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
    }
};

export default function DamagesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Report Damage</Text>
                <Text style={styles.subtitle}>
                    Use this feature to report any damaged materials received.
                    Select an indent item to file a damage report.
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
