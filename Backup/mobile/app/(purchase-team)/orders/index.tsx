import React, { useEffect, useState } from 'react';
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
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
    }
};

export default function OrderManagement() {
    const [orders, setOrders] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch ORDERED indents (ones that have been purchased)
            const response = await indentsApi.getAll({ status: 'ORDER_PLACED', limit: 100 });
            setOrders(response.data);
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderOrder = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(purchase-team)/orders/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardMain}>
                    <View style={styles.cardLeft}>
                        <Text style={styles.indentName} numberOfLines={1}>
                            {item.name || item.indentNumber}
                        </Text>
                        <Text style={styles.siteName}>
                            <Ionicons name="location-outline" size={12} /> {item.site?.name}
                        </Text>
                        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.cardRight}>
                        <View style={styles.purchasedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                            <Text style={styles.purchasedText}>Purchased</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </View>
                </View>
            </View>
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
            {/* Add Purchase Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(purchase-team)/orders/select' as any)}
            >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Purchase</Text>
            </TouchableOpacity>

            {orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="cart-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Purchases Yet</Text>
                    <Text style={styles.emptyText}>
                        Click "Add Purchase" to process director-approved indents
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={styles.listTitle}>Purchased Orders</Text>
                    <FlatList
                        data={orders}
                        keyExtractor={item => item.id}
                        renderItem={renderOrder}
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                </>
            )}
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
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16 },
    emptyText: { fontSize: 15, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
    listTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginHorizontal: 16, marginTop: 8 },
    list: { padding: 16 },
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
    cardMain: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
    indentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
    siteName: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
    date: { fontSize: 12, color: theme.colors.textSecondary },
    purchasedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        marginBottom: 8,
    },
    purchasedText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },
});
