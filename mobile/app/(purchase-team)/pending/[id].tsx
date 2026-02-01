import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { indentsApi } from '../../../src/api';
import { Indent, IndentItem } from '../../../src/types';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    }
};

export default function PendingIndentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);

    useEffect(() => {
        if (id) fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
            Alert.alert('Error', 'Failed to load indent details');
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

    const handleApprove = () => {
        Alert.alert(
            'Approve Indent',
            'Are you sure you want to approve this indent? It will be sent for Director\'s approval.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await indentsApi.purchaseApprove(id!, remarks || undefined);
                            Alert.alert('Success', 'Indent approved successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to approve indent');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = () => {
        if (!remarks.trim()) {
            Alert.alert('Remarks Required', 'Please provide a reason for rejection');
            return;
        }
        Alert.alert(
            'Reject Indent',
            'Are you sure you want to reject this indent?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await indentsApi.reject(id!, remarks);
                            Alert.alert('Rejected', 'Indent has been rejected', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to reject indent');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const openMaterialDetail = (item: IndentItem) => {
        setSelectedMaterial(item);
        setShowMaterialModal(true);
    };

    const getStatusInfo = () => {
        if (indent?.status === 'SUBMITTED') {
            return { label: 'Pending Approval', color: theme.colors.warning };
        }
        if (indent?.status === 'PURCHASE_APPROVED') {
            return { label: 'PT Approved - Director Pending', color: theme.colors.primary };
        }
        return { label: indent?.status, color: theme.colors.textSecondary };
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

    const statusInfo = getStatusInfo();

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
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.label}
                            </Text>
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
                                {item.isUrgent && (
                                    <View style={styles.urgentBadge}>
                                        <Text style={styles.urgentText}>Urgent</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.qtyBox}>
                                <Text style={styles.qtyValue}>{item.requestedQty}</Text>
                                <Text style={styles.qtyUnit}>{item.material?.unit?.code}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Remarks Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Remarks (Optional for Approval)</Text>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Add remarks or reason for rejection..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Buttons */}
            {indent.status === 'SUBMITTED' && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={handleReject}
                        disabled={processing}
                    >
                        <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.approveButton}
                        onPress={handleApprove}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.approveButtonText}>Approve</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

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
        padding: 16,
        marginBottom: 8,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    statusText: { fontSize: 12, fontWeight: '600' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: {
        width: '47%',
        backgroundColor: theme.colors.surface,
        padding: 12,
        borderRadius: 10,
    },
    infoLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 },
    infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 2 },
    descriptionBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
    },
    descriptionLabel: { fontSize: 11, color: theme.colors.textSecondary },
    descriptionText: { fontSize: 14, color: theme.colors.textPrimary, marginTop: 4 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
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
    urgentBadge: {
        backgroundColor: theme.colors.error + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    urgentText: { fontSize: 10, fontWeight: '600', color: theme.colors.error },
    qtyBox: { alignItems: 'center', marginRight: 12 },
    qtyValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    qtyUnit: { fontSize: 11, color: theme.colors.textSecondary },
    remarksInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
        color: theme.colors.textPrimary,
    },
    bottomButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.error,
        gap: 6,
    },
    rejectButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.error },
    approveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.success,
        gap: 6,
    },
    approveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
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
});
