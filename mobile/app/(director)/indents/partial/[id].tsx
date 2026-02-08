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
import { indentsApi } from '../../../../src/api';
import { Indent, IndentItem } from '../../../../src/types';

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
        error: '#EF4444',
    }
};

// No mock interfaces needed - using Indent and IndentItem from types

export default function PartialOrderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [showItem, setShowItem] = useState<IndentItem | null>(null);

    useEffect(() => {
        fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter to only show PARTIAL and NOT_ARRIVED items
    const problemItems = indent?.items?.filter(
        item => item.arrivalStatus === 'PARTIAL' || item.arrivalStatus === 'NOT_ARRIVED'
    ) || [];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status?: string | null) => {
        switch (status) {
            case 'NOT_ARRIVED': return theme.colors.error;
            case 'PARTIAL': return theme.colors.warning;
            case 'ARRIVED': return theme.colors.success;
            default: return theme.colors.textSecondary;
        }
    };

    const getStatusLabel = (status?: string | null) => {
        switch (status) {
            case 'NOT_ARRIVED': return 'NOT RECEIVED';
            case 'PARTIAL': return 'PARTIAL';
            case 'ARRIVED': return 'RECEIVED';
            default: return 'PENDING';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!indent) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Indent not found</Text>
            </View>
        );
    }

    const partialCount = problemItems.filter(i => i.arrivalStatus === 'PARTIAL').length;
    const notReceivedCount = problemItems.filter(i => i.arrivalStatus === 'NOT_ARRIVED').length;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="pie-chart" size={32} color={theme.colors.warning} />
                    </View>
                    <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                    <Text style={styles.subtitle}>{indent.site?.name}</Text>

                    {/* Problem Summary */}
                    <View style={styles.summaryRow}>
                        {partialCount > 0 && (
                            <View style={[styles.summaryBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                                <Text style={[styles.summaryText, { color: theme.colors.warning }]}>{partialCount} Partial</Text>
                            </View>
                        )}
                        {notReceivedCount > 0 && (
                            <View style={[styles.summaryBadge, { backgroundColor: theme.colors.error + '20' }]}>
                                <Text style={[styles.summaryText, { color: theme.colors.error }]}>{notReceivedCount} Not Received</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Site Engineer</Text>
                        <Text style={styles.infoValue}>{indent.createdBy?.name || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Created Date</Text>
                        <Text style={styles.infoValue}>{formatDate(indent.createdAt)}</Text>
                    </View>
                </View>

                {/* Problem Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Problem Materials ({problemItems.length})</Text>
                    {problemItems.map(item => {
                        const isNotArrived = item.arrivalStatus === 'NOT_ARRIVED';
                        const statusColor = getStatusColor(item.arrivalStatus);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.itemCard, { borderLeftColor: statusColor }]}
                                onPress={() => setShowItem(item)}
                            >
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemName}>{item.material?.name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                        <Text style={[styles.statusText, { color: statusColor }]}>
                                            {getStatusLabel(item.arrivalStatus)}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.itemCode}>{item.material?.code}</Text>
                                <Text style={styles.qtyLabel}>Ordered: {item.requestedQty} {item.material?.unit?.code || ''}</Text>

                                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} style={styles.itemChevron} />
                            </TouchableOpacity>
                        );
                    })}
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
                            <Text style={styles.modalItemName}>{showItem.material?.name}</Text>

                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Material Code</Text>
                                <Text style={styles.modalInfoValue}>{showItem.material?.code}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Ordered Quantity</Text>
                                <Text style={styles.modalInfoValue}>{showItem.requestedQty} {showItem.material?.unit?.code || ''}</Text>
                            </View>
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Status</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(showItem.arrivalStatus) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(showItem.arrivalStatus) }]}>
                                        {getStatusLabel(showItem.arrivalStatus)}
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
    // New styles for status display
    summaryRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    summaryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    summaryText: { fontSize: 13, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 11, fontWeight: '600' },
    itemCode: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
});
