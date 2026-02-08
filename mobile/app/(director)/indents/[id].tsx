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
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { indentsApi } from '../../../src/api';
import { UPLOADS_URL } from '../../../src/api/client';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

// Type for order items from indent.order.orderItems
type OrderItemType = NonNullable<NonNullable<Indent['order']>['orderItems']>[number];

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        gray: '#9CA3AF',
    }
};

// Helper to construct full image URL from relative path
const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_URL}/${imagePath}`;
};

export default function DirectorIndentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const router = useRouter();

    // Material Modal State
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItemType | null>(null);

    // Image viewer modals
    const [showReceiptImageModal, setShowReceiptImageModal] = useState(false);
    const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const indentData = await indentsApi.getById(id!);
            setIndent(indentData);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | null | undefined) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const openMaterialModal = (orderItem: OrderItemType) => {
        setSelectedOrderItem(orderItem);
        setShowMaterialModal(true);
    };

    const openReceiptImage = (imagePath: string) => {
        setSelectedReceiptImage(getImageUrl(imagePath));
        setShowReceiptImageModal(true);
    };

    const openInvoice = (invoicePath: string) => {
        setSelectedInvoice(getImageUrl(invoicePath));
        setShowInvoiceModal(true);
    };

    // ===== APPROVAL =====
    const handleApprove = async () => {
        Alert.alert(
            'Approve Indent',
            'Are you sure you want to approve this indent for ordering?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await indentsApi.directorApprove(id!, remarks || undefined);
                            Alert.alert('Success', 'Indent approved successfully');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to approve');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // ===== REJECTION =====
    const handleReject = async () => {
        if (!remarks.trim()) {
            Alert.alert('Required', 'Please enter a reason for rejection');
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
                        setActionLoading(true);
                        try {
                            await indentsApi.reject(id!, remarks);
                            Alert.alert('Success', 'Indent rejected', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to reject');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // ===== ON HOLD =====
    const handlePutOnHold = async () => {
        setActionLoading(true);
        try {
            await indentsApi.putOnHold(id!, remarks || 'Put on hold by director');
            Alert.alert('Success', 'Indent put on hold');
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to put on hold');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReleaseFromHold = async () => {
        setActionLoading(true);
        try {
            await indentsApi.releaseFromHold(id!);
            Alert.alert('Success', 'Indent released from hold');
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to release from hold');
        } finally {
            setActionLoading(false);
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
                <Text>Indent not found</Text>
            </View>
        );
    }

    // Determine current state
    const isOnHold = indent.isOnHold;
    const isApproved = indent.status === IndentStatus.DIRECTOR_APPROVED;
    const isRejected = indent.status === IndentStatus.REJECTED;
    const isPending = indent.status === IndentStatus.SUBMITTED || indent.status === IndentStatus.PURCHASE_APPROVED;
    const hasOrder = !!indent.order?.orderItems;
    const isPurchased = indent.status === IndentStatus.ORDER_PLACED || indent.status === IndentStatus.CLOSED;
    const totalAmount = indent.order?.orderItems?.reduce((sum: number, item: OrderItemType) => sum + (item.totalPrice || 0), 0) || 0;

    const StatusBadge = ({ status }: { status: IndentStatus }) => (
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
                {isOnHold ? 'On Hold' : STATUS_LABELS[status]}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                        <StatusBadge status={indent.status} />
                    </View>
                    <Text style={styles.siteName}>{indent.site?.name}</Text>
                    <Text style={styles.createdBy}>By: {indent.createdBy?.name}</Text>
                    <Text style={styles.date}>
                        Created: {new Date(indent.createdAt).toLocaleDateString()}
                    </Text>
                    {indent.purchaseApprovedBy && (
                        <Text style={styles.approval}>
                            ✓ PT Approved: {indent.purchaseApprovedBy.name}
                        </Text>
                    )}
                    {indent.directorApprovedBy && (
                        <Text style={styles.approval}>
                            ✓ Director Approved: {indent.directorApprovedBy.name}
                        </Text>
                    )}
                    {hasOrder && totalAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                        </View>
                    )}
                </View>

                {/* Materials Section - Show with vendor details if order exists */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({indent.items?.length || 0})</Text>
                    {hasOrder && (
                        <Text style={styles.sectionSubtitle}>
                            Tap each material to view vendor details, cost & invoices
                        </Text>
                    )}

                    {hasOrder ? (
                        // Show order items with vendor/cost info
                        indent.order?.orderItems?.map((orderItem: OrderItemType) => (
                            <TouchableOpacity
                                key={orderItem.id}
                                style={styles.materialCard}
                                onPress={() => openMaterialModal(orderItem)}
                            >
                                <View style={styles.materialStatus}>
                                    <Ionicons
                                        name={orderItem.vendorName ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={20}
                                        color={orderItem.vendorName ? theme.colors.success : theme.colors.gray}
                                    />
                                </View>
                                <View style={styles.materialInfo}>
                                    <Text style={styles.materialName}>{orderItem.materialName}</Text>
                                    <Text style={styles.materialCode}>{orderItem.materialCode}</Text>
                                    {orderItem.vendorName && (
                                        <Text style={styles.vendorPreview}>
                                            <Ionicons name="storefront-outline" size={12} /> {orderItem.vendorName}
                                        </Text>
                                    )}
                                    {orderItem.unitPrice && orderItem.unitPrice > 0 && (
                                        <Text style={styles.materialCost}>
                                            {formatCurrency(orderItem.unitPrice)} × {orderItem.quantity} = {formatCurrency(orderItem.totalPrice)}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.qtyBox}>
                                    <Text style={styles.qtyValue}>{orderItem.quantity}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Basic items without order details
                        indent.items?.map((item, index) => (
                            <View key={item.id || index} style={styles.itemCard}>
                                <Text style={styles.materialName}>{item.material?.name}</Text>
                                <Text style={styles.materialCode}>{item.material?.code}</Text>
                                <Text style={styles.qty}>
                                    Requested: {item.requestedQty} {item.material?.unit?.code}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Receipt Photos Section - Show if indent has receipts */}
                {indent.receipts && indent.receipts.length > 0 && indent.receipts.some(r => r.images?.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Receipt Photos ({indent.receipts.reduce((acc, r) => acc + (r.images?.length || 0), 0)})
                        </Text>
                        {indent.receipts.map((receipt) => (
                            receipt.images && receipt.images.length > 0 && (
                                <View key={receipt.id} style={styles.receiptGroup}>
                                    <Text style={styles.receiptGroupTitle}>
                                        {receipt.receiptNumber} • {new Date(receipt.receivedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                                        {receipt.images.map((image, index) => (
                                            <TouchableOpacity
                                                key={image.id}
                                                onPress={() => openReceiptImage(image.path)}
                                                style={styles.imageContainer}
                                            >
                                                <Image
                                                    source={{ uri: getImageUrl(image.path) }}
                                                    style={styles.imageThumbnail}
                                                />
                                                <View style={styles.imageOverlay}>
                                                    <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                                                    <Text style={styles.imageViewText}>View {index + 1}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )
                        ))}
                    </View>
                )}

                {/* On Hold Reason Display */}
                {isOnHold && indent.onHoldReason && (
                    <View style={styles.section}>
                        <View style={styles.holdReasonBox}>
                            <Ionicons name="pause-circle" size={20} color="#92400E" />
                            <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text style={styles.holdReasonLabel}>On Hold Reason</Text>
                                <Text style={styles.holdReasonText}>{indent.onHoldReason}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Final Status Display */}
                {isApproved && (
                    <View style={styles.section}>
                        <View style={styles.successBox}>
                            <Ionicons name="checkmark-done-circle" size={24} color={theme.colors.success} />
                            <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text style={styles.successTitle}>Approved!</Text>
                                <Text style={styles.successText}>
                                    This indent has been approved and is ready for ordering.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {isRejected && (
                    <View style={styles.section}>
                        <View style={styles.errorBox}>
                            <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                            <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text style={styles.errorTitle}>Rejected</Text>
                                <Text style={styles.errorText}>
                                    This indent has been rejected.
                                    {indent.rejectionReason && ` Reason: ${indent.rejectionReason}`}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Action Buttons Section - Only show for pending indents */}
                {(isPending || isOnHold) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Director Actions</Text>

                        {actionLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={styles.loadingText}>Processing...</Text>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        isOnHold ? styles.holdActiveButton : styles.holdButton
                                    ]}
                                    onPress={isOnHold ? handleReleaseFromHold : handlePutOnHold}
                                >
                                    <Ionicons
                                        name={isOnHold ? "play-circle" : "pause-circle"}
                                        size={20}
                                        color={isOnHold ? theme.colors.gray : theme.colors.warning}
                                    />
                                    <Text style={[
                                        styles.actionButtonText,
                                        { color: isOnHold ? theme.colors.gray : theme.colors.warning }
                                    ]}>
                                        {isOnHold ? 'Remove from Hold' : 'Put on Hold'}
                                    </Text>
                                </TouchableOpacity>

                                {!isOnHold && (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.approveButton]}
                                            onPress={handleApprove}
                                        >
                                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                            <Text style={styles.whiteButtonText}>Approve for Order</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.rejectButton]}
                                            onPress={handleReject}
                                        >
                                            <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
                                            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                                                Reject Indent
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {isOnHold && (
                                    <View style={styles.infoBox}>
                                        <Ionicons name="information-circle" size={18} color={theme.colors.textSecondary} />
                                        <Text style={styles.infoText}>
                                            Remove from hold to approve or reject this indent
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* Remarks Section */}
                {(isPending || isOnHold) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Remarks (Optional)</Text>
                        <TextInput
                            style={styles.remarksInput}
                            placeholder="Add remarks, doubts, or reason for rejection..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={remarks}
                            onChangeText={setRemarks}
                            multiline
                            numberOfLines={3}
                        />
                        <Text style={styles.remarksHint}>
                            {isOnHold
                                ? 'Add reason for hold or any notes'
                                : 'Required for rejection, optional for approval'}
                        </Text>
                    </View>
                )}

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

                    {selectedOrderItem && (
                        <ScrollView style={styles.modalContent}>
                            {/* Material Info */}
                            <View style={styles.materialHeaderSection}>
                                <Text style={styles.modalMaterialName}>{selectedOrderItem.materialName}</Text>
                                <Text style={styles.modalMaterialCode}>{selectedOrderItem.materialCode}</Text>
                            </View>

                            {/* Vendor Details Section */}
                            <Text style={styles.sectionLabel}>Vendor Details</Text>
                            <View style={styles.formCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Vendor Name</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorName || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Address</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorAddress || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>GST No.</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorGstNo || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Contact Person</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorContactPerson || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Phone</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorContactPhone || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Nature of Business</Text>
                                    <Text style={styles.detailValue}>{selectedOrderItem.vendorNatureOfBusiness || '-'}</Text>
                                </View>
                            </View>

                            {/* Cost Section */}
                            <Text style={styles.sectionLabel}>Cost</Text>
                            <View style={styles.formCard}>
                                <View style={styles.costGrid}>
                                    <View style={styles.costItem}>
                                        <Text style={styles.costLabel}>Rate</Text>
                                        <Text style={styles.costValue}>{formatCurrency(selectedOrderItem.unitPrice)}</Text>
                                    </View>
                                    <View style={styles.costItem}>
                                        <Text style={styles.costLabel}>Quantity</Text>
                                        <Text style={styles.costValue}>{selectedOrderItem.quantity}</Text>
                                    </View>
                                </View>
                                <View style={styles.totalBox}>
                                    <Text style={styles.totalBoxLabel}>Total</Text>
                                    <Text style={styles.totalBoxValue}>{formatCurrency(selectedOrderItem.totalPrice)}</Text>
                                </View>
                            </View>

                            {/* Invoices Section */}
                            <Text style={styles.sectionLabel}>Invoices</Text>
                            <View style={styles.formCard}>
                                {selectedOrderItem.invoices && selectedOrderItem.invoices.length > 0 ? (
                                    selectedOrderItem.invoices.map((invoice) => (
                                        <TouchableOpacity
                                            key={invoice.id}
                                            style={styles.invoiceItem}
                                            onPress={() => openInvoice(invoice.path)}
                                        >
                                            <Ionicons name="document-outline" size={20} color={theme.colors.primary} />
                                            <Text style={styles.invoiceName} numberOfLines={1}>
                                                {invoice.originalName || invoice.filename}
                                            </Text>
                                            <View style={styles.viewButton}>
                                                <Text style={styles.viewButtonText}>View</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={styles.noInvoicesText}>No invoices uploaded</Text>
                                )}
                            </View>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    )}
                </View>
            </Modal>

            {/* Receipt Image Preview Modal */}
            <Modal visible={showReceiptImageModal} animationType="fade" transparent>
                <View style={styles.imageModalContainer}>
                    <View style={styles.imageModalHeader}>
                        <Text style={styles.imageModalTitle}>Receipt Photo</Text>
                        <TouchableOpacity onPress={() => setShowReceiptImageModal(false)}>
                            <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    {selectedReceiptImage && (
                        <Image
                            source={{ uri: selectedReceiptImage }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

            {/* Invoice Viewer Modal */}
            <Modal visible={showInvoiceModal} animationType="fade" transparent>
                <View style={styles.imageModalContainer}>
                    <View style={styles.imageModalHeader}>
                        <Text style={styles.imageModalTitle}>Invoice</Text>
                        <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                            <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    {selectedInvoice && (
                        <Image
                            source={{ uri: selectedInvoice }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
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
    header: { backgroundColor: theme.colors.cardBg, padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    indentNumber: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    siteName: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary, marginBottom: 4 },
    createdBy: { fontSize: 14, color: theme.colors.textSecondary },
    date: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
    approval: { fontSize: 14, color: theme.colors.success, marginTop: 8, fontWeight: '500' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    totalLabel: { fontSize: 14, color: theme.colors.textSecondary },
    totalValue: { fontSize: 20, fontWeight: '700', color: theme.colors.success },
    section: { padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    sectionSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: -8, marginBottom: 12 },
    // Material Cards
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
    materialStatus: { marginRight: 12 },
    materialInfo: { flex: 1 },
    materialName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    vendorPreview: { fontSize: 12, color: theme.colors.primary, marginTop: 4 },
    materialCost: { fontSize: 12, color: theme.colors.success, marginTop: 2, fontWeight: '500' },
    qtyBox: { alignItems: 'center', marginRight: 12 },
    qtyValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    qtyUnit: { fontSize: 11, color: theme.colors.textSecondary },
    // Basic Item Card (no order)
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    qty: { fontSize: 14, color: theme.colors.textPrimary, marginTop: 8 },
    // Receipt Images
    receiptGroup: { marginBottom: 16 },
    receiptGroupTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    imagesScroll: { flexDirection: 'row' },
    imageContainer: { marginRight: 12, borderRadius: 8, overflow: 'hidden' },
    imageThumbnail: { width: 100, height: 100, borderRadius: 8 },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    imageViewText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
    // Image Modal
    imageModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
    imageModalHeader: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    imageModalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    fullImage: { flex: 1, width: '100%', marginTop: 80 },
    // Modal
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
    materialHeaderSection: {
        backgroundColor: theme.colors.primary + '08',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    modalMaterialName: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    modalMaterialCode: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    materialSpecs: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    detailRow: { marginBottom: 12 },
    detailLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 2 },
    detailValue: { fontSize: 15, color: theme.colors.textPrimary },
    costGrid: { flexDirection: 'row', gap: 16 },
    costItem: { flex: 1 },
    costLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
    costValue: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    totalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '10',
        padding: 14,
        borderRadius: 10,
        marginTop: 12,
    },
    totalBoxLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    totalBoxValue: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
    invoiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        marginBottom: 8,
        gap: 10,
    },
    invoiceName: { fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
    viewButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    viewButtonText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
    noInvoicesText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 12 },
    // Status Boxes
    holdReasonBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF3C7',
        borderRadius: 10,
        padding: 14,
    },
    holdReasonLabel: { fontSize: 12, fontWeight: '600', color: '#92400E', marginBottom: 4 },
    holdReasonText: { fontSize: 14, color: '#92400E' },
    successBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.success + '15',
        borderRadius: 10,
        padding: 14,
    },
    successTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.success, marginBottom: 4 },
    successText: { fontSize: 14, color: theme.colors.textSecondary },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.error + '15',
        borderRadius: 10,
        padding: 14,
    },
    errorTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.error, marginBottom: 4 },
    errorText: { fontSize: 14, color: theme.colors.textSecondary },
    // Action Buttons
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 14,
        marginBottom: 10,
        gap: 8,
    },
    holdButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.warning },
    holdActiveButton: { backgroundColor: theme.colors.gray + '20', borderWidth: 2, borderColor: theme.colors.gray },
    approveButton: { backgroundColor: theme.colors.success },
    rejectButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.error },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    whiteButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        gap: 8,
    },
    infoText: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    loadingText: { fontSize: 14, color: theme.colors.textSecondary },
    remarksInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    remarksHint: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
});
