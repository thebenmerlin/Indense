import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
    }
};

interface DamagedOrder {
    id: string;
    indentName: string;
    siteName: string;
    damagedItems: number;
    totalItems: number;
    reportedBy: string;
    reportedDate: string;
    hasImages: boolean;
}

export default function DamagedOrdersList() {
    const [orders, setOrders] = useState<DamagedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchOrders = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setOrders([
                { id: '1', indentName: 'Steel & Cement Order', siteName: 'Green Valley', damagedItems: 2, totalItems: 5, reportedBy: 'Rajesh Kumar', reportedDate: '2024-02-02', hasImages: true },
                { id: '2', indentName: 'Electrical Wiring', siteName: 'Skyline Towers', damagedItems: 1, totalItems: 8, reportedBy: 'Priya Sharma', reportedDate: '2024-01-28', hasImages: true },
            ]);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const renderOrder = ({ item }: { item: DamagedOrder }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/indents/damaged/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.indentName}>{item.indentName}</Text>
                <Text style={styles.siteText}>{item.siteName}</Text>
                <Text style={styles.metaText}>
                    {item.damagedItems}/{item.totalItems} items damaged • {formatDate(item.reportedDate)}
                </Text>
            </View>
            {item.hasImages && (
                <View style={styles.imageBadge}>
                    <Ionicons name="images" size={16} color={theme.colors.primary} />
                </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Navigation Tabs */}
            <View style={styles.navTabs}>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/pending' as any)}>
                    <Text style={styles.navTabText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/all' as any)}>
                    <Text style={styles.navTabText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>Damaged</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/partial' as any)}>
                    <Text style={styles.navTabText}>Partial</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={orders}
                keyExtractor={item => item.id}
                renderItem={renderOrder}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-circle-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No damaged orders</Text>
                        <Text style={styles.emptySubtext}>All materials received in good condition</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navTabs: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    navTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    navTabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
    navTabText: { fontSize: 14, color: theme.colors.textSecondary },
    navTabTextActive: { fontWeight: '600', color: theme.colors.primary },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    indentName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    siteText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    metaText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    imageBadge: {
        backgroundColor: theme.colors.primary + '15',
        padding: 6,
        borderRadius: 6,
        marginRight: 8,
    },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
