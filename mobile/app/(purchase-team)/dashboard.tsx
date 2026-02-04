import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context';
import { Role, ROLE_NAMES } from '../../src/constants';
import { indentsApi, damagesApi, reportsApi } from '../../src/api';
import NotificationCenter from '../../src/components/NotificationCenter';

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
        success: '#10B981',
        warning: '#F59E0B',
    }
};

interface MenuItemData {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    badgeCount?: number;
}

interface DashboardStats {
    totalIndents: number;
    pendingIndents: number;
    closedSites: number;
    totalExpense: number;
}

export default function PurchaseTeamDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [pendingCount, setPendingCount] = useState(0);
    const [damagesCount, setDamagesCount] = useState(0);
    const [partialCount, setPartialCount] = useState(0);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            // Fetch pending indents count
            const pendingResponse = await indentsApi.getAll({ status: 'SUBMITTED', limit: 1 });
            setPendingCount(pendingResponse.pagination.total);

            // Fetch unresolved damages count
            const damagesResponse = await damagesApi.getAll({ isResolved: false, limit: 1 });
            setDamagesCount(damagesResponse.pagination.total);

            // Fetch partial deliveries count
            const partialResponse = await damagesApi.getPartiallyReceivedIndents({ limit: 1 });
            setPartialCount(partialResponse.pagination.total);

            // Fetch dashboard summary stats
            const dashboardStats = await reportsApi.getDashboardSummary({});
            setStats(dashboardStats);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    }, []);

    // Refresh on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [fetchDashboardData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
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
            badgeCount: damagesCount,
        },
        {
            title: 'Partially Received',
            subtitle: 'Manage partial deliveries',
            icon: 'hourglass-outline',
            route: '/(purchase-team)/partial',
            badgeCount: partialCount,
        },
        {
            title: 'Analytics',
            subtitle: 'Reports and insights',
            icon: 'bar-chart-outline',
            route: '/(purchase-team)/analytics',
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

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
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                        <Text style={styles.role}>
                            {user?.role ? ROLE_NAMES[user.role as Role] : 'Purchase Team'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <NotificationCenter primaryColor={theme.colors.primary} />
                        <TouchableOpacity
                            onPress={() => router.push('/(purchase-team)/account' as any)}
                            style={styles.profileButton}
                        >
                            <Ionicons name="person-circle" size={40} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Stats Cards */}
            {stats && (
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.statValue}>{stats.totalIndents}</Text>
                            <Text style={styles.statLabel}>Total Indents</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.warning }]}>
                            <Text style={styles.statValue}>{stats.pendingIndents}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.success }]}>
                            <Text style={styles.statValue}>{formatCurrency(stats.totalExpense)}</Text>
                            <Text style={styles.statLabel}>Total Expense</Text>
                        </View>
                    </View>
                </View>
            )}

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
    statsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        minHeight: 80,
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.white,
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
});
