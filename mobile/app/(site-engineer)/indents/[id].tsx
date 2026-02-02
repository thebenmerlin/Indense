import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function IndentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadIndent();
    }, [id]);

    const loadIndent = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setIndent(data.data);
            }
        } catch (e) {
            console.warn('Failed to load indent:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            </SafeAreaView>
        );
    }

    if (!indent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Indent not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{indent.indentNumber}</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[indent.status] || '#6B7280' }]}>
                            <Text style={styles.statusText}>{indent.status.replace(/_/g, ' ')}</Text>
                        </View>
                    </View>

                    <Text style={styles.indentName}>{indent.name}</Text>
                    {indent.description && (
                        <Text style={styles.description}>{indent.description}</Text>
                    )}

                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Created:</Text>
                        <Text style={styles.metaValue}>
                            {new Date(indent.createdAt).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Site:</Text>
                        <Text style={styles.metaValue}>{indent.site?.name || 'N/A'}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    Materials ({indent.items?.length || 0})
                </Text>

                {indent.items?.map((item: any, index: number) => (
                    <View key={item.id || index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.material?.name || 'Unknown'}</Text>
                            <Text style={styles.itemCode}>{item.material?.code}</Text>
                        </View>
                        <View style={styles.itemQuantities}>
                            <View style={styles.qtyBlock}>
                                <Text style={styles.qtyLabel}>Requested</Text>
                                <Text style={styles.qtyValue}>{item.requestedQty}</Text>
                            </View>
                            <View style={styles.qtyBlock}>
                                <Text style={styles.qtyLabel}>Received</Text>
                                <Text style={[styles.qtyValue, { color: '#10B981' }]}>
                                    {item.receivedQty}
                                </Text>
                            </View>
                            <View style={styles.qtyBlock}>
                                <Text style={styles.qtyLabel}>Pending</Text>
                                <Text style={[styles.qtyValue, { color: '#F59E0B' }]}>
                                    {item.pendingQty}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusRow: {
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    indentName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    metaLabel: {
        fontSize: 14,
        color: '#6B7280',
        width: 80,
    },
    metaValue: {
        fontSize: 14,
        color: '#111827',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    itemCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    itemHeader: {
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    itemCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemQuantities: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    qtyBlock: {
        alignItems: 'center',
    },
    qtyLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    qtyValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
});
