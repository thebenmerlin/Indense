import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { indentsApi } from '../../../src/api';
import { Indent, IndentItem } from '../../../src/types';
import { STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

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

export default function IndentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);
    const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchIndent();
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

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const openMaterialDetail = (item: IndentItem) => {
        setSelectedMaterial(item);
        setShowMaterialModal(true);
    };

    const viewInvoice = (invoiceUrl: string) => {
        setSelectedInvoice(invoiceUrl);
        setShowInvoiceViewer(true);
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

    const isPurchased = indent.status === 'ORDER_PLACED' || indent.status === 'FULLY_RECEIVED' || indent.status === 'CLOSED';
    const statusLabel = STATUS_LABELS[indent.status as keyof typeof STATUS_LABELS] || indent.status;
    const statusColor = STATUS_COLORS[indent.status as keyof typeof STATUS_COLORS] || theme.colors.textSecondary;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Info */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                            <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoLabel}>Site</Text>
                            <Text style={styles.infoValue}>{indent.site?.name}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoLabel}>Engineer</Text>
                            <Text style={styles.infoValue}>{indent.createdBy?.name}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoLabel}>Created</Text>
                            <Text style={styles.infoValue}>{formatDate(indent.createdAt)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.infoLabel}>Expected</Text>
                            <Text style={styles.infoValue}>{formatDate(indent.expectedDeliveryDate)}</Text>
                        </View>
                    </View>

                    {indent.description && (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionLabel}>Description</Text>
                            <Text style={styles.descriptionText}>{indent.description}</Text>
                        </View>
                    )}
                </View>

                {/* Vendor Details (for purchased) */}
                {isPurchased && indent.order && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vendor Details</Text>
                        <View style={styles.vendorCard}>
                            <View style={styles.vendorRow}>
                                <Text style={styles.vendorLabel}>Vendor Name</Text>
                                <Text style={styles.vendorValue}>{indent.order.vendorName || '-'}</Text>
                            </View>
                            <View style={styles.vendorRow}>
                                <Text style={styles.vendorLabel}>Contact</Text>
                                <Text style={styles.vendorValue}>{indent.order.vendorContact || '-'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({indent.items?.length || 0})</Text>
                    {indent.items?.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.materialCard}
                            onPress={() => openMaterialDetail(item)}
                        >
                            <View style={styles.materialInfo}>
                                <Text style={styles.materialName}>{item.material?.name}</Text>
                                <Text style={styles.materialCode}>{item.material?.code}</Text>
                            </View>
                            <View style={styles.qtyBox}>
                                <Text style={styles.qtyValue}>{item.requestedQty}</Text>
                                <Text style={styles.qtyUnit}>{item.material?.unit?.code}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Material Detail Modal */}
            <Modal visible={showMaterialModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Material Details</Text>
                        <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {selectedMaterial && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.detailLabel}>Name</Text>
                            <Text style={styles.detailValue}>{selectedMaterial.material?.name}</Text>

                            <Text style={styles.detailLabel}>Code</Text>
                            <Text style={styles.detailValue}>{selectedMaterial.material?.code}</Text>

                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>{selectedMaterial.material?.itemGroup?.name}</Text>

                            <Text style={styles.detailLabel}>Unit</Text>
                            <Text style={styles.detailValue}>{selectedMaterial.material?.unit?.name}</Text>

                            <Text style={styles.detailLabel}>Requested Quantity</Text>
                            <Text style={styles.detailValue}>{selectedMaterial.requestedQty}</Text>

                            {selectedMaterial.notes && (
                                <>
                                    <Text style={styles.detailLabel}>Notes</Text>
                                    <Text style={styles.detailValue}>{selectedMaterial.notes}</Text>
                                </>
                            )}

                            {/* Vendor Details for Purchased Items */}
                            {isPurchased && (
                                <View style={styles.vendorSection}>
                                    <Text style={styles.vendorSectionTitle}>Vendor & Cost</Text>

                                    <Text style={styles.detailLabel}>Vendor Name</Text>
                                    <Text style={styles.detailValue}>{indent.order?.vendorName || '-'}</Text>

                                    <Text style={styles.detailLabel}>Contact</Text>
                                    <Text style={styles.detailValue}>{indent.order?.vendorContact || '-'}</Text>

                                    {/* TODO: Add rate, quantity, total when available in item */}

                                    {/* Invoice View Button */}
                                    <TouchableOpacity
                                        style={styles.viewInvoiceButton}
                                        onPress={() => viewInvoice('placeholder')}
                                    >
                                        <Ionicons name="document-text" size={18} color={theme.colors.primary} />
                                        <Text style={styles.viewInvoiceText}>View Invoice</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </Modal>

            {/* Invoice Viewer Modal */}
            <Modal visible={showInvoiceViewer} animationType="fade">
                <View style={styles.invoiceViewerContainer}>
                    <View style={styles.invoiceViewerHeader}>
                        <Text style={styles.modalTitle}>Invoice</Text>
                        <TouchableOpacity onPress={() => setShowInvoiceViewer(false)}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.invoiceContent}>
                        <Text style={styles.invoicePlaceholder}>Invoice preview will appear here</Text>
                    </View>
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
    header: { backgroundColor: theme.colors.cardBg, padding: 16, marginBottom: 8 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    statusText: { fontSize: 12, fontWeight: '600' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: { width: '47%', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 10 },
    infoLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 },
    infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 2 },
    descriptionBox: { marginTop: 12, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10 },
    descriptionLabel: { fontSize: 11, color: theme.colors.textSecondary },
    descriptionText: { fontSize: 14, color: theme.colors.textPrimary, marginTop: 4 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    vendorCard: { backgroundColor: theme.colors.cardBg, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
    vendorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    vendorLabel: { fontSize: 13, color: theme.colors.textSecondary },
    vendorValue: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    materialInfo: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    qtyBox: { alignItems: 'center', marginRight: 12 },
    qtyValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    qtyUnit: { fontSize: 11, color: theme.colors.textSecondary },
    modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
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
    modalContent: { flex: 1, padding: 16 },
    detailLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 12 },
    detailValue: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary, marginTop: 4 },
    vendorSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border },
    vendorSectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.primary, marginBottom: 8 },
    viewInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: 10,
        gap: 8,
    },
    viewInvoiceText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    invoiceViewerContainer: { flex: 1, backgroundColor: '#000' },
    invoiceViewerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 48,
    },
    invoiceContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    invoicePlaceholder: { fontSize: 16, color: '#FFFFFF' },
});
