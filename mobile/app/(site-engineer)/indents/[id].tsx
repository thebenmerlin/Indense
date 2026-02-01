import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { indentsApi } from '../../../src/api';
import { Indent, IndentItem } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    }
};

type ArrivalStatus = 'ARRIVED' | 'PARTIAL' | 'NOT_ARRIVED' | null;

export default function IndentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [arrivalStates, setArrivalStates] = useState<Record<string, ArrivalStatus>>({});
    const [arrivalNotes, setArrivalNotes] = useState<Record<string, string>>({});
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);

    useEffect(() => {
        if (id) {
            fetchIndent();
        }
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
            // Initialize arrival states from existing data
            const states: Record<string, ArrivalStatus> = {};
            const notes: Record<string, string> = {};
            data.items?.forEach(item => {
                states[item.id] = item.arrivalStatus || null;
                notes[item.id] = item.arrivalNotes || '';
            });
            setArrivalStates(states);
            setArrivalNotes(notes);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const isPurchased = indent?.order?.status === 'ORDER_PLACED' || indent?.status === 'ORDER_PLACED' || indent?.status === 'FULLY_RECEIVED';
    const canClose = isPurchased && indent?.status !== 'CLOSED';

    const handleArrivalChange = async (itemId: string, status: ArrivalStatus) => {
        const prevStatus = arrivalStates[itemId];
        setArrivalStates(prev => ({ ...prev, [itemId]: status }));

        if (status === 'NOT_ARRIVED') {
            Alert.alert(
                'Notify Team',
                'This will notify the Purchase Team and Director about the non-arrival. Continue?',
                [
                    { text: 'Cancel', onPress: () => setArrivalStates(prev => ({ ...prev, [itemId]: prevStatus })) },
                    {
                        text: 'Confirm', style: 'destructive', onPress: () => {
                            // TODO: API call to notify
                            console.log('Notifying about non-arrival:', itemId);
                        }
                    }
                ]
            );
        }
    };

    const handleCloseIndent = () => {
        Alert.alert(
            'Close Indent',
            'Are you sure you want to close this indent? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close Indent',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await indentsApi.close(id!);
                            Alert.alert('Success', 'Indent closed successfully');
                            router.back();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to close indent');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
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

    const StatusBadge = ({ status }: { status: IndentStatus }) => {
        const bgColor = STATUS_COLORS[status] + '20';
        const textColor = STATUS_COLORS[status];
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {STATUS_LABELS[status]}
                </Text>
            </View>
        );
    };

    const ArrivalCheckbox = ({ status, itemId }: { status: ArrivalStatus; itemId: string }) => {
        const current = arrivalStates[itemId];

        const CheckButton = ({ value, color, icon }: { value: ArrivalStatus; color: string; icon: string }) => (
            <TouchableOpacity
                style={[
                    styles.arrivalButton,
                    current === value && { backgroundColor: color + '20', borderColor: color }
                ]}
                onPress={() => handleArrivalChange(itemId, value)}
            >
                <Ionicons name={icon as any} size={20} color={current === value ? color : theme.colors.textSecondary} />
            </TouchableOpacity>
        );

        return (
            <View style={styles.arrivalRow}>
                <CheckButton value="ARRIVED" color={theme.colors.success} icon="checkmark-circle" />
                <CheckButton value="PARTIAL" color={theme.colors.warning} icon="ellipse-outline" />
                <CheckButton value="NOT_ARRIVED" color={theme.colors.error} icon="close-circle" />
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                    <StatusBadge status={indent.status} />
                </View>
                <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                <Text style={styles.siteName}>{indent.site?.name}</Text>

                <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.dateText}>Created: {formatDate(indent.createdAt)}</Text>
                    </View>
                    {indent.expectedDeliveryDate && (
                        <View style={styles.dateItem}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                            <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                                Expected: {formatDate(indent.expectedDeliveryDate)}
                            </Text>
                        </View>
                    )}
                </View>

                {indent.description && (
                    <Text style={styles.description}>{indent.description}</Text>
                )}
            </View>

            {/* Purchase Status */}
            {indent.order && (
                <View style={styles.purchaseStatus}>
                    <Ionicons
                        name={isPurchased ? 'checkmark-circle' : 'time-outline'}
                        size={20}
                        color={isPurchased ? theme.colors.success : theme.colors.warning}
                    />
                    <Text style={[styles.purchaseText, { color: isPurchased ? theme.colors.success : theme.colors.warning }]}>
                        {isPurchased ? 'Purchased' : 'Purchase Pending'}
                    </Text>
                </View>
            )}

            {/* Materials */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Materials ({indent.items?.length || 0})</Text>
                {indent.items?.map((item, index) => (
                    <TouchableOpacity
                        key={item.id || index}
                        style={[styles.itemCard, item.isUrgent && styles.urgentItemCard]}
                        onPress={() => setSelectedMaterial(item)}
                    >
                        <View style={styles.itemHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.materialName}>{item.material?.name}</Text>
                                    {item.isUrgent && (
                                        <View style={styles.urgentBadge}>
                                            <Text style={styles.urgentBadgeText}>URGENT</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.materialCode}>{item.material?.code}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </View>

                        <View style={styles.qtyRow}>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Requested</Text>
                                <Text style={styles.qtyValue}>
                                    {item.requestedQty} {item.material?.unit?.code}
                                </Text>
                            </View>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Received</Text>
                                <Text style={styles.qtyValue}>
                                    {item.receivedQty} {item.material?.unit?.code}
                                </Text>
                            </View>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Pending</Text>
                                <Text style={[styles.qtyValue, item.pendingQty > 0 && { color: theme.colors.warning }]}>
                                    {item.pendingQty} {item.material?.unit?.code}
                                </Text>
                            </View>
                        </View>

                        {/* Arrival Checkboxes - only for purchased indents */}
                        {isPurchased && (
                            <>
                                <View style={styles.arrivalSection}>
                                    <Text style={styles.arrivalLabel}>Arrival Status:</Text>
                                    <ArrivalCheckbox status={arrivalStates[item.id]} itemId={item.id} />
                                </View>

                                {arrivalStates[item.id] === 'PARTIAL' && (
                                    <TextInput
                                        style={styles.arrivalNotes}
                                        placeholder="Describe partial arrival..."
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={arrivalNotes[item.id]}
                                        onChangeText={(text) => setArrivalNotes(prev => ({ ...prev, [item.id]: text }))}
                                        multiline
                                    />
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Vendor Details - only for purchased indents, no cost */}
            {isPurchased && indent.order && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vendor Details</Text>
                    <View style={styles.vendorCard}>
                        <View style={styles.vendorRow}>
                            <Ionicons name="business-outline" size={18} color={theme.colors.textSecondary} />
                            <Text style={styles.vendorText}>{indent.order.vendorName || 'Vendor Name N/A'}</Text>
                        </View>
                        {indent.order.vendorContact && (
                            <View style={styles.vendorRow}>
                                <Ionicons name="call-outline" size={18} color={theme.colors.textSecondary} />
                                <Text style={styles.vendorText}>{indent.order.vendorContact}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Approvals */}
            {indent.purchaseApprovedBy && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Approvals</Text>
                    <View style={styles.approvalCard}>
                        <Text style={styles.approvalLabel}>Purchase Team</Text>
                        <Text style={styles.approvalName}>{indent.purchaseApprovedBy.name}</Text>
                        <Text style={styles.approvalDate}>
                            {indent.purchaseApprovedAt
                                ? formatDate(indent.purchaseApprovedAt)
                                : '-'}
                        </Text>
                    </View>
                    {indent.directorApprovedBy && (
                        <View style={styles.approvalCard}>
                            <Text style={styles.approvalLabel}>Director</Text>
                            <Text style={styles.approvalName}>{indent.directorApprovedBy.name}</Text>
                            <Text style={styles.approvalDate}>
                                {indent.directorApprovedAt
                                    ? formatDate(indent.directorApprovedAt)
                                    : '-'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Rejection */}
            {indent.rejectionReason && (
                <View style={styles.section}>
                    <View style={styles.rejectionCard}>
                        <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                        <Text style={styles.rejectionReason}>{indent.rejectionReason}</Text>
                    </View>
                </View>
            )}

            {/* Close Indent Button */}
            {canClose && (
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseIndent}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                            <Text style={styles.closeButtonText}>Close Indent</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />

            {/* Material Detail Modal */}
            <Modal
                visible={!!selectedMaterial}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedMaterial(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Material Details</Text>
                        <TouchableOpacity onPress={() => setSelectedMaterial(null)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {selectedMaterial && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalMaterialName}>{selectedMaterial.material?.name}</Text>
                            <Text style={styles.modalMaterialCode}>{selectedMaterial.material?.code}</Text>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Category</Text>
                                <Text style={styles.modalValue}>{selectedMaterial.material?.itemGroup?.name}</Text>
                            </View>

                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Unit</Text>
                                <Text style={styles.modalValue}>
                                    {selectedMaterial.material?.unit?.name} ({selectedMaterial.material?.unit?.code})
                                </Text>
                            </View>

                            {selectedMaterial.material?.description && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>Description</Text>
                                    <Text style={styles.modalValue}>{selectedMaterial.material.description}</Text>
                                </View>
                            )}

                            <View style={styles.modalQtyGrid}>
                                <View style={styles.modalQtyItem}>
                                    <Text style={styles.modalQtyLabel}>Requested</Text>
                                    <Text style={styles.modalQtyValue}>{selectedMaterial.requestedQty}</Text>
                                </View>
                                <View style={styles.modalQtyItem}>
                                    <Text style={styles.modalQtyLabel}>Received</Text>
                                    <Text style={styles.modalQtyValue}>{selectedMaterial.receivedQty}</Text>
                                </View>
                                <View style={styles.modalQtyItem}>
                                    <Text style={styles.modalQtyLabel}>Pending</Text>
                                    <Text style={[styles.modalQtyValue, selectedMaterial.pendingQty > 0 && { color: theme.colors.warning }]}>
                                        {selectedMaterial.pendingQty}
                                    </Text>
                                </View>
                            </View>

                            {selectedMaterial.notes && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>Notes</Text>
                                    <Text style={styles.modalValue}>{selectedMaterial.notes}</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    indentName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: 12,
    },
    indentNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    siteName: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 8,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    purchaseStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 10,
        gap: 8,
    },
    purchaseText: {
        fontSize: 15,
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    urgentItemCard: {
        borderColor: theme.colors.warning,
        borderWidth: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    materialName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    urgentBadge: {
        backgroundColor: theme.colors.warning,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    urgentBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    materialCode: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    qtyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    qtyItem: {
        alignItems: 'center',
    },
    qtyLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    arrivalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
    },
    arrivalLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    arrivalRow: {
        flexDirection: 'row',
        gap: 8,
    },
    arrivalButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrivalNotes: {
        marginTop: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: theme.colors.textPrimary,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    vendorCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    vendorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    vendorText: {
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    approvalCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    approvalLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    approvalName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginTop: 4,
    },
    approvalDate: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    rejectionCard: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    rejectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: 4,
    },
    rejectionReason: {
        fontSize: 14,
        color: '#991B1B',
    },
    closeButton: {
        backgroundColor: theme.colors.success,
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalMaterialName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    modalMaterialCode: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
        marginBottom: 20,
    },
    modalSection: {
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    modalValue: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    modalQtyGrid: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 16,
        marginVertical: 16,
    },
    modalQtyItem: {
        flex: 1,
        alignItems: 'center',
    },
    modalQtyLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    modalQtyValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
});
