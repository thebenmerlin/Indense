import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) setOrders(data.data || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };

    const renderOrder = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/(purchase-team)/orders/${item.id}`)}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.vendor}>{item.vendorName || 'Unknown Vendor'}</Text>
            <View style={styles.row}>
                <Text style={styles.meta}>{item.items?.length || 0} items</Text>
                <Text style={[styles.status, { backgroundColor: item.status === 'DELIVERED' ? '#D1FAE5' : '#FEF3C7' }]}>
                    {item.status}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Orders</Text>
                <TouchableOpacity onPress={() => router.push('/(purchase-team)/orders/select')}><Text style={styles.addButton}>+ New</Text></TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#8B5CF6" /></View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📦</Text><Text style={styles.emptyText}>No orders yet</Text></View>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    addButton: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
    orderNumber: { fontSize: 14, fontWeight: '600', color: '#8B5CF6', marginBottom: 4 },
    vendor: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    meta: { fontSize: 12, color: '#6B7280' },
    status: { fontSize: 10, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, color: '#6B7280' },
});
