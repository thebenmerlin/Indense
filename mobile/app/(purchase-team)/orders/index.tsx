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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi } from '../../../src/api';
import { Order } from '../../../src/types';
import FilterModal, { FilterOptions } from '../../../src/components/FilterModal';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
    }
};

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [filters])
    );

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersApi.getAll({
                siteId: filters.siteId || undefined,
                fromDate: filters.startDate?.toISOString(),
                toDate: filters.endDate?.toISOString(),
                limit: 100,
            });
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setShowFilter(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number | null) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (isPurchased: boolean) => {
        if (isPurchased) {
            return { bg: theme.colors.success + '20', text: theme.colors.success, label: 'Purchased' };
        }
        return { bg: theme.colors.warning + '20', text: theme.colors.warning, label: 'Pending' };
    };

    const renderOrder = ({ item }: { item: Order }) => {
        const statusStyle = getStatusBadge(item.isPurchased);
        
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(purchase-team)/orders/${item.id}` as any)}
                activeOpacity={0.7}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.indentName} numberOfLines={1}>
                                {item.indent?.name || item.indent?.indentNumber || 'Order'}
                            </Text>
                            <Text style={styles.indentNumber}>{item.indent?.indentNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                        </View>
                    </View>

                    <View style={styles.cardDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText}>{item.indent?.site?.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="storefront-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.detailText} numberOfLines={1}>{item.vendorName || 'No vendor'}</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
                        </View>
                        <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
                    </View>
                    
                    <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={theme.colors.textSecondary}
                        style={styles.chevron}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    const activeFilterCount = Object.keys(filters).filter(k => filters[k as keyof FilterOptions]).length;

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Add Purchase Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(purchase-team)/orders/select' as any)}
            >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Purchase</Text>
            </TouchableOpacity>

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <Text style={styles.listTitle}>Purchased Orders ({orders.length})</Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilter(true)}
                >
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="cart-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Purchases Yet</Text>
                    <Text style={styles.emptyText}>
                        Click "Add Purchase" to process director-approved indents
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}

            <FilterModal
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
                showStatusFilter={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    listTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    filterButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
    filterBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16 },
    emptyText: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
    list: { padding: 16, paddingTop: 8 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardLeft: { flex: 1 },
    indentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
    detailText: { fontSize: 13, color: theme.colors.textSecondary },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 12, color: theme.colors.textSecondary },
    totalAmount: { fontSize: 16, fontWeight: '700', color: theme.colors.success },
    chevron: { position: 'absolute', right: 16, top: '50%' },
});
