import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { ROLE_NAMES } from '../../src/constants';
import { indentsApi } from '../../src/api';
// import NotificationCenter from '../../src/components/NotificationCenter'; // TODO: Uncomment after installing expo-notifications

const theme = {
    colors: {
        primary: '#1D4ED8',
        primaryLight: '#3B82F6',
        surface: '#F9FAFB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        white: '#FFFFFF',
        cardBg: '#FFFFFF',
        badge: '#EF4444',
    }
};

interface MenuItemData {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    badgeCount?: number;
}

export default function PurchaseTeamDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchPendingCount();
    }, []);

    const fetchPendingCount = async () => {
        try {
            const response = await indentsApi.getAll({ status: 'SUBMITTED', limit: 100 });
            setPendingCount(response.data.length);
        } catch (error) {
            console.error('Failed to fetch pending count:', error);
        }
    };

    const menuItems: MenuItemData[] = [
        {
            title: 'Pending Indents',
            subtitle: 'Review and approve requests',
            icon: 'time-outline',
            route: '/(purchase-team)/pending',
            badgeCount: pendingCount,
        },
        {
            title: 'All Indents',
            subtitle: 'View all material requests',
            icon: 'document-text-outline',
            route: '/(purchase-team)/indents',
        },
        {
            title: 'Manage Orders',
            subtitle: 'Process purchases and vendors',
            icon: 'cart-outline',
            route: '/(purchase-team)/orders',
        },
        {
            title: 'Damages Reported',
            subtitle: 'Handle damaged materials',
            icon: 'alert-circle-outline',
            route: '/(purchase-team)/damages',
        },
        {
            title: 'Partially Received',
            subtitle: 'Manage partial deliveries',
            icon: 'hourglass-outline',
            route: '/(purchase-team)/partial',
        },
        {
            title: 'Analytics',
            subtitle: 'Reports and insights',
            icon: 'bar-chart-outline',
            route: '/(purchase-team)/analytics',
        },
    ];

    const MenuCard = ({ item }: { item: MenuItemData }) => (
        <TouchableOpacity
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
            style={styles.cardWrapper}
        >
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={item.icon} size={28} color={theme.colors.primary} />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                </View>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                        <Text style={styles.role}>
                            {user?.role ? ROLE_NAMES[user.role] : 'Purchase Team'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        {/* <NotificationCenter primaryColor={theme.colors.primary} /> */}
                        <TouchableOpacity
                            onPress={() => router.push('/(purchase-team)/account' as any)}
                            style={styles.profileButton}
                        >
                            <Ionicons name="person-circle" size={40} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                {menuItems.map((item, index) => (
                    <MenuCard key={index} item={item} />
                ))}
            </View>

            <View style={{ height: 40 }} />
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
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.white,
        marginTop: 4,
    },
    role: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileButton: {
        padding: 4,
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
    cardWrapper: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: theme.colors.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    badge: {
        backgroundColor: theme.colors.badge,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.white,
    },
});
