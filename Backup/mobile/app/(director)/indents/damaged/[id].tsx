import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
        success: '#10B981',
    }
};

interface DamagedItem {
    id: string;
    name: string;
    orderedQty: number;
    damagedQty: number;
    unit: string;
    images?: string[];
    description?: string;
    reorderStatus?: 'pending' | 'ordered' | 'received';
}

interface DamagedOrder {
    id: string;
    indentName: string;
    siteName: string;
    siteEngineer: string;
    reportedDate: string;
    items: DamagedItem[];
}

export default function DamagedOrderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<DamagedOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showItem, setShowItem] = useState<DamagedItem | null>(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            // TODO: Replace with actual API call
            setOrder({
                id: id!,
                indentName: 'Steel & Cement Order',
                siteName: 'Green Valley Residences',
                siteEngineer: 'Rajesh Kumar',
                reportedDate: '2024-02-02',
                items: [
                    { id: '1', name: 'TMT Steel Bars 12mm', orderedQty: 500, damagedQty: 50, unit: 'kg', description: 'Bent and corroded bars', reorderStatus: 'ordered' },
                    { id: '2', name: 'Cement OPC 53', orderedQty: 100, damagedQty: 10, unit: 'bags', description: 'Packaging torn, cement hardened', reorderStatus: 'pending' },
                ],
            });
        } catch (error) {
            console.error('Failed to fetch order:', error);
            Alert.alert('Error', 'Failed to load damage report');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getReorderStatusColor = (status?: string) => {
        switch (status) {
            case 'ordered': return theme.colors.primary;
            case 'received': return theme.colors.success;
            default: return theme.colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="alert-circle" size={32} color={theme.colors.error} />
                    </View>
                    <Text style={styles.indentName}>{order.indentName}</Text>
                    <Text style={styles.subtitle}>{order.siteName}</Text>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Site Engineer</Text>
                        <Text style={styles.infoValue}>{order.siteEngineer}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Reported Date</Text>
                        <Text style={styles.infoValue}>{formatDate(order.reportedDate)}</Text>
                    </View>
                </View>

                {/* Damaged Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Damaged Items ({order.items.length})</Text>
                    {order.items.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemCard}
                            onPress={() => setShowItem(item)}
                        >
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <View style={[styles.reorderBadge, { backgroundColor: getReorderStatusColor(item.reorderStatus) + '15' }]}>
                                    <Text style={[styles.reorderText, { color: getReorderStatusColor(item.reorderStatus) }]}>
                                        {item.reorderStatus === 'ordered' ? 'Reordered' : item.reorderStatus === 'received' ? 'Received' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.qtyRow}>
                                <Text style={styles.qtyLabel}>Ordered: {item.orderedQty} {item.unit}</Text>
                                <Text style={[styles.qtyLabel, { color: theme.colors.error }]}>Damaged: {item.damagedQty} {item.unit}</Text>
                            </View>
                            {item.description && (
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            )}
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} style={styles.itemChevron} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Item Detail Modal */}
            <Modal visible={!!showItem} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Damage Details</Text>
                        <TouchableOpacity onPress={() => setShowItem(null)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {showItem && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalItemName}>{showItem.name}</Text>

                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Ordered Quantity</Text>
                                <Text style={styles.modalInfoValue}>{showItem.orderedQty} {showItem.unit}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Damaged Quantity</Text>
                                <Text style={[styles.modalInfoValue, { color: theme.colors.error }]}>{showItem.damagedQty} {showItem.unit}</Text>
                            </View>

                            {showItem.description && (
                                <View style={styles.descriptionBox}>
                                    <Text style={styles.descriptionLabel}>Description</Text>
                                    <Text style={styles.descriptionText}>{showItem.description}</Text>
                                </View>
                            )}

                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Reorder Status</Text>
                                <View style={[styles.reorderBadge, { backgroundColor: getReorderStatusColor(showItem.reorderStatus) + '15' }]}>
                                    <Text style={[styles.reorderText, { color: getReorderStatusColor(showItem.reorderStatus) }]}>
                                        {showItem.reorderStatus === 'ordered' ? 'Reordered' : showItem.reorderStatus === 'received' ? 'Received' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 24,
        alignItems: 'center',
        marginBottom: 8,
    },
    headerIcon: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: theme.colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4 },
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoLabel: { fontSize: 14, color: theme.colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    section: { padding: 16, paddingTop: 0 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.error,
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    itemName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    reorderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    reorderText: { fontSize: 11, fontWeight: '600' },
    qtyRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
    qtyLabel: { fontSize: 13, color: theme.colors.textSecondary },
    itemDescription: { fontSize: 13, color: theme.colors.textSecondary, fontStyle: 'italic' },
    itemChevron: { position: 'absolute', right: 14, top: '50%' },
    modal: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { padding: 20 },
    modalItemName: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 20 },
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalInfoLabel: { fontSize: 15, color: theme.colors.textSecondary },
    modalInfoValue: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    descriptionBox: {
        backgroundColor: theme.colors.surface,
        padding: 14,
        borderRadius: 10,
        marginVertical: 16,
    },
    descriptionLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    descriptionText: { fontSize: 14, color: theme.colors.textPrimary },
});
