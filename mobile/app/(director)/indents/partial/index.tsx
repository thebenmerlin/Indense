import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
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
        warning: '#F59E0B',
    }
};

interface PartialOrder {
    id: string;
    indentName: string;
    siteName: string;
    receivedItems: number;
    totalItems: number;
    reportedBy: string;
    reportedDate: string;
}

export default function PartialOrdersList() {
    const [orders, setOrders] = useState<PartialOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchOrders = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setOrders([
                { id: '1', indentName: 'Plumbing Materials', siteName: 'Riverside', receivedItems: 3, totalItems: 6, reportedBy: 'Amit Patel', reportedDate: '2024-02-01' },
                { id: '2', indentName: 'Finishing Work', siteName: 'Green Valley', receivedItems: 5, totalItems: 10, reportedBy: 'Rajesh Kumar', reportedDate: '2024-01-30' },
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

    const renderOrder = ({ item }: { item: PartialOrder }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/indents/partial/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <Ionicons name="pie-chart" size={24} color={theme.colors.warning} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.indentName}>{item.indentName}</Text>
                <Text style={styles.siteText}>{item.siteName}</Text>
                <Text style={styles.metaText}>
                    {item.receivedItems}/{item.totalItems} items received • {formatDate(item.reportedDate)}
                </Text>
            </View>
            <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{Math.round(item.receivedItems / item.totalItems * 100)}%</Text>
            </View>
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
                <TouchableOpacity style={styles.navTab} onPress={() => router.replace('/(director)/indents/damaged' as any)}>
                    <Text style={styles.navTabText}>Damaged</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navTab, styles.navTabActive]}>
                    <Text style={[styles.navTabText, styles.navTabTextActive]}>Partial</Text>
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
                        <Text style={styles.emptyText}>No partial orders</Text>
                        <Text style={styles.emptySubtext}>All orders received in full</Text>
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
        backgroundColor: theme.colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    indentName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    siteText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    metaText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    progressBadge: {
        backgroundColor: theme.colors.warning + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    progressText: { fontSize: 12, fontWeight: '600', color: theme.colors.warning },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
});
