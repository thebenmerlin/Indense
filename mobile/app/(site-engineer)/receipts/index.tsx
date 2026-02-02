import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function Receipts() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadReceipts();
    }, []);

    const loadReceipts = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/receipts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setReceipts(data.data || []);
            }
        } catch (e) {
            console.warn('Failed to load receipts:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReceipts();
    };

    const renderReceipt = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(site-engineer)/receipts/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.receiptNumber}>{item.receiptNumber}</Text>
                <Text style={styles.date}>
                    {new Date(item.receivedDate).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.indent}>Indent: {item.indent?.indentNumber || 'N/A'}</Text>
            <Text style={styles.items}>{item.items?.length || 0} items received</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Receipts</Text>
                <View style={{ width: 50 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={receipts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReceipt}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyText}>No receipts yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    receiptNumber: { fontSize: 14, fontWeight: '600', color: '#10B981' },
    date: { fontSize: 12, color: '#6B7280' },
    indent: { fontSize: 14, color: '#111827', marginBottom: 4 },
    items: { fontSize: 12, color: '#6B7280' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, color: '#6B7280' },
});
