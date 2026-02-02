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
        warning: '#F59E0B',
        success: '#10B981',
    }
};

interface PartialItem {
    id: string;
    name: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
    pendingQty: number;
    reorderStatus?: 'pending' | 'ordered' | 'received';
}

interface PartialOrder {
    id: string;
    indentName: string;
    siteName: string;
    siteEngineer: string;
    reportedDate: string;
    items: PartialItem[];
}

export default function PartialOrderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<PartialOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showItem, setShowItem] = useState<PartialItem | null>(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            // TODO: Replace with actual API call
            setOrder({
                id: id!,
                indentName: 'Plumbing Materials',
                siteName: 'Riverside Complex',
                siteEngineer: 'Amit Patel',
                reportedDate: '2024-02-01',
                items: [
                    { id: '1', name: 'PVC Pipes 4 inch', orderedQty: 100, receivedQty: 60, pendingQty: 40, unit: 'pieces', reorderStatus: 'ordered' },
                    { id: '2', name: 'Ball Valves', orderedQty: 50, receivedQty: 30, pendingQty: 20, unit: 'nos', reorderStatus: 'pending' },
                    { id: '3', name: 'Pipe Fittings', orderedQty: 200, receivedQty: 200, pendingQty: 0, unit: 'nos' },
                ],
            });
        } catch (error) {
            console.error('Failed to fetch order:', error);
            Alert.alert('Error', 'Failed to load partial order');
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

    const calculateProgress = (received: number, ordered: number) => {
        return Math.round((received / ordered) * 100);
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

    const totalOrdered = order.items.reduce((sum, i) => sum + i.orderedQty, 0);
    const totalReceived = order.items.reduce((sum, i) => sum + i.receivedQty, 0);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="pie-chart" size={32} color={theme.colors.warning} />
                    </View>
                    <Text style={styles.indentName}>{order.indentName}</Text>
                    <Text style={styles.subtitle}>{order.siteName}</Text>

                    {/* Overall Progress */}
                    <View style={styles.progressCard}>
                        <Text style={styles.progressLabel}>Overall Progress</Text>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${calculateProgress(totalReceived, totalOrdered)}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{calculateProgress(totalReceived, totalOrdered)}% received</Text>
                    </View>
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

                {/* Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
                    {order.items.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemCard}
                            onPress={() => setShowItem(item)}
                        >
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                {item.pendingQty > 0 && (
                                    <View style={[styles.reorderBadge, { backgroundColor: getReorderStatusColor(item.reorderStatus) + '15' }]}>
                                        <Text style={[styles.reorderText, { color: getReorderStatusColor(item.reorderStatus) }]}>
                                            {item.reorderStatus === 'ordered' ? 'Reordered' : item.reorderStatus === 'received' ? 'Received' : 'Pending'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.qtyRow}>
                                <Text style={styles.qtyLabel}>Ordered: {item.orderedQty}</Text>
                                <Text style={[styles.qtyLabel, { color: theme.colors.success }]}>Received: {item.receivedQty}</Text>
                                {item.pendingQty > 0 && (
                                    <Text style={[styles.qtyLabel, { color: theme.colors.warning }]}>Pending: {item.pendingQty}</Text>
                                )}
                            </View>

                            <View style={styles.itemProgressBg}>
                                <View style={[styles.itemProgressFill, { width: `${calculateProgress(item.receivedQty, item.orderedQty)}%` }]} />
                            </View>

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
                        <Text style={styles.modalTitle}>Item Details</Text>
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
                                <Text style={styles.modalInfoLabel}>Received Quantity</Text>
                                <Text style={[styles.modalInfoValue, { color: theme.colors.success }]}>{showItem.receivedQty} {showItem.unit}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Pending Quantity</Text>
                                <Text style={[styles.modalInfoValue, { color: theme.colors.warning }]}>{showItem.pendingQty} {showItem.unit}</Text>
                            </View>

                            {showItem.pendingQty > 0 && (
                                <View style={styles.modalInfoRow}>
                                    <Text style={styles.modalInfoLabel}>Reorder Status</Text>
                                    <View style={[styles.reorderBadge, { backgroundColor: getReorderStatusColor(showItem.reorderStatus) + '15' }]}>
                                        <Text style={[styles.reorderText, { color: getReorderStatusColor(showItem.reorderStatus) }]}>
                                            {showItem.reorderStatus === 'ordered' ? 'Reordered' : showItem.reorderStatus === 'received' ? 'Received' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            )}
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
        backgroundColor: theme.colors.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4, marginBottom: 16 },
    progressCard: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        padding: 14,
        borderRadius: 12,
    },
    progressLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: theme.colors.warning, borderRadius: 4 },
    progressText: { fontSize: 14, fontWeight: '600', color: theme.colors.warning, textAlign: 'center', marginTop: 8 },
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
        borderLeftColor: theme.colors.warning,
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    itemName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    reorderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    reorderText: { fontSize: 11, fontWeight: '600' },
    qtyRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    qtyLabel: { fontSize: 12, color: theme.colors.textSecondary },
    itemProgressBg: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' },
    itemProgressFill: { height: '100%', backgroundColor: theme.colors.success, borderRadius: 2 },
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
});
