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

const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: '#3B82F6',
    PURCHASE_APPROVED: '#8B5CF6',
    DIRECTOR_APPROVED: '#10B981',
    ORDER_PLACED: '#F59E0B',
    PARTIALLY_RECEIVED: '#F97316',
    FULLY_RECEIVED: '#059669',
    CLOSED: '#6B7280',
    REJECTED: '#EF4444',
};

export default function MyIndents() {
    const [indents, setIndents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadIndents();
    }, []);

    const loadIndents = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setIndents(data.data || []);
            }
        } catch (e) {
            console.warn('Failed to load indents:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadIndents();
    };

    const renderIndent = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(site-engineer)/indents/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#6B7280' }]}>
                    <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
                </View>
            </View>
            <Text style={styles.indentName}>{item.name}</Text>
            <Text style={styles.indentMeta}>
                {item.items?.length || 0} items • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Indents</Text>
                <TouchableOpacity onPress={() => router.push('/(site-engineer)/indents/create')}>
                    <Text style={styles.addButton}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={indents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderIndent}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No indents yet</Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push('/(site-engineer)/indents/create')}
                            >
                                <Text style={styles.createButtonText}>Create First Indent</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    addButton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
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
        alignItems: 'center',
        marginBottom: 8,
    },
    indentNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    indentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    indentMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
