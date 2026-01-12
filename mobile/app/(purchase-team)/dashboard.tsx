import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { ROLE_NAMES } from '../../src/constants';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        white: '#FFFFFF',
        cardBg: '#FFFFFF',
    }
};

export default function PurchaseTeamDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                }
            },
        ]);
    };

    const menuItems = [
        {
            title: 'Pending Approvals',
            subtitle: 'Indents awaiting your approval',
            icon: 'time-outline' as const,
            route: '/(purchase-team)/indents?status=SUBMITTED',
        },
        {
            title: 'All Indents',
            subtitle: 'View indents across all sites',
            icon: 'document-text-outline' as const,
            route: '/(purchase-team)/indents',
        },
        {
            title: 'Manage Orders',
            subtitle: 'Create and track vendor orders',
            icon: 'cart-outline' as const,
            route: '/(purchase-team)/orders',
        },
        {
            title: 'Monthly Reports',
            subtitle: 'View and export reports',
            icon: 'bar-chart-outline' as const,
            route: '/(purchase-team)/reports',
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.role}>
                        {user?.role ? ROLE_NAMES[user.role] : 'Purchase Team'}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.card}>
                            <View style={styles.menuContent}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={item.icon} size={28} color={theme.colors.primary} />
                                </View>
                                <View style={styles.menuText}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        paddingTop: 48,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.white,
        marginTop: 4,
    },
    role: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    menuSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});
