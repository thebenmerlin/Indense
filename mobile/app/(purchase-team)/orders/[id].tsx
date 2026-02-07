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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ordersApi } from '../../../src/api';
import { Order, OrderItem } from '../../../src/types';

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

interface ItemFormData {
    vendorName: string;
    vendorAddress: string;
    vendorGstNo: string;
    vendorContactPerson: string;
    vendorContactPhone: string;
    vendorNatureOfBusiness: string;
    rate: string;
    quantity: string;
}

export default function ProcessOrder() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Material Modal State
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
    const [itemForm, setItemForm] = useState<ItemFormData>({
        vendorName: '',
        vendorAddress: '',
        vendorGstNo: '',
        vendorContactPerson: '',
        vendorContactPhone: '',
        vendorNatureOfBusiness: '',
        rate: '',
        quantity: '',
    });
    const [savingItem, setSavingItem] = useState(false);
    const [uploadingInvoice, setUploadingInvoice] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const data = await ordersApi.getById(id!);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            Alert.alert('Error', 'Failed to load order');
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

    const formatCurrency = (amount: number | null | undefined) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const openMaterialModal = (item: OrderItem) => {
        setSelectedItem(item);
        setItemForm({
            vendorName: item.vendorName || '',
            vendorAddress: item.vendorAddress || '',
            vendorGstNo: item.vendorGstNo || '',
            vendorContactPerson: item.vendorContactPerson || '',
            vendorContactPhone: item.vendorContactPhone || '',
            vendorNatureOfBusiness: item.vendorNatureOfBusiness || '',
            rate: item.unitPrice?.toString() || '',
            quantity: item.quantity?.toString() || '',
        });
        setShowMaterialModal(true);
    };

    const calculateTotal = () => {
        const rate = parseFloat(itemForm.rate) || 0;
        const qty = parseFloat(itemForm.quantity) || 0;
        return rate * qty;
    };

    const handleSaveItem = async () => {
        if (!selectedItem) return;

        setSavingItem(true);
        try {
            await ordersApi.updateOrderItem(id!, selectedItem.id, {
                vendorName: itemForm.vendorName || undefined,
                vendorAddress: itemForm.vendorAddress || undefined,
                vendorGstNo: itemForm.vendorGstNo || undefined,
                vendorContactPerson: itemForm.vendorContactPerson || undefined,
                vendorContactPhone: itemForm.vendorContactPhone || undefined,
                vendorNatureOfBusiness: itemForm.vendorNatureOfBusiness || undefined,
                unitPrice: parseFloat(itemForm.rate) || 0,
                quantity: parseFloat(itemForm.quantity) || selectedItem.quantity,
            });
            await fetchOrder();
            setShowMaterialModal(false);
            Alert.alert('Saved', 'Material details saved');
        } catch (error) {
            console.error('Failed to save item:', error);
            Alert.alert('Error', 'Failed to save material details');
        } finally {
            setSavingItem(false);
        }
    };

    const handleUploadItemInvoice = async () => {
        if (!selectedItem) return;

        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
        });

        if (result.canceled || !result.assets?.[0]) return;

        setUploadingInvoice(true);
        try {
            const file = result.assets[0];
            await ordersApi.uploadOrderItemInvoice(id!, selectedItem.id, file.uri, file.name);
            await fetchOrder();
            // Update selectedItem with new invoices
            const updatedOrder = await ordersApi.getById(id!);
            const updatedItem = updatedOrder.orderItems?.find(i => i.id === selectedItem.id);
            if (updatedItem) setSelectedItem(updatedItem);
            Alert.alert('Success', 'Invoice uploaded');
        } catch (error) {
            console.error('Failed to upload invoice:', error);
            Alert.alert('Error', 'Failed to upload invoice');
        } finally {
            setUploadingInvoice(false);
        }
    };

    const handleMarkAsPurchased = async () => {
        // Check if all items have vendor details
        const itemsWithoutVendor = order?.orderItems?.filter(item => !item.vendorName);
        if (itemsWithoutVendor && itemsWithoutVendor.length > 0) {
            Alert.alert(
                'Missing Vendor Details',
                `${itemsWithoutVendor.length} material(s) don't have vendor details. Please add vendor details for all materials before marking as purchased.`
            );
            return;
        }

        Alert.alert(
            'Confirm Purchase',
            'Mark this order as purchased? This will update the indent status.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await ordersApi.markAsPurchased(id!);
                            await fetchOrder();
                            Alert.alert('Success', 'Order marked as purchased!');
                        } catch (error) {
                            console.error('Failed to mark as purchased:', error);
                            Alert.alert('Error', 'Failed to process purchase');
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    const getItemStatus = (item: OrderItem) => {
        const hasVendor = !!item.vendorName;
        const hasCost = item.unitPrice && item.unitPrice > 0;

        if (hasVendor && hasCost) {
            return { color: theme.colors.success, icon: 'checkmark-circle', label: 'Complete' };
        } else if (hasVendor || hasCost) {
            return { color: theme.colors.warning, icon: 'alert-circle', label: 'Partial' };
        }
        return { color: theme.colors.textSecondary, icon: 'ellipse-outline', label: 'Pending' };
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

    const isPurchased = order.isPurchased;
    const totalAmount = order.orderItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Info */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.indentName}>{order.indent?.name || order.indent?.indentNumber}</Text>
                            <Text style={styles.indentNumber}>{order.indent?.indentNumber}</Text>
                        </View>
                        <View style={[styles.statusBadge, isPurchased && styles.purchasedBadge]}>
                            <Ionicons name={isPurchased ? "checkmark-circle" : "time"} size={14} color={isPurchased ? theme.colors.success : theme.colors.primary} />
                            <Text style={[styles.statusText, isPurchased && styles.purchasedText]}>
                                {isPurchased ? 'Purchased' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{order.indent?.site?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Created: {formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                    </View>
                </View>

                {/* Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({order.orderItems?.length || 0})</Text>
                    <Text style={styles.sectionSubtitle}>
                        Tap each material to {isPurchased ? 'view' : 'add'} vendor details, costs & invoices
                    </Text>
                    {order.orderItems?.map((item) => {
                        const status = getItemStatus(item);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.materialCard, item.isReordered && { borderColor: theme.colors.warning, borderWidth: 2 }]}
                                onPress={() => openMaterialModal(item)}
                            >
                                <View style={styles.materialStatus}>
                                    <Ionicons name={status.icon as any} size={20} color={status.color} />
                                </View>
                                <View style={styles.materialInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.materialName}>{item.materialName}</Text>
                                        {item.isReordered && (
                                            <View style={{ backgroundColor: theme.colors.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                                <Text style={{ color: theme.colors.warning, fontSize: 10, fontWeight: '700' }}>NEEDS REPURCHASE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.materialCode}>{item.materialCode}</Text>
                                    {item.vendorName && (
                                        <Text style={styles.vendorPreview}>
                                            <Ionicons name="storefront-outline" size={12} /> {item.vendorName}
                                        </Text>
                                    )}
                                    {item.unitPrice && item.unitPrice > 0 && (
                                        <Text style={styles.materialCost}>
                                            {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.qtyBox}>
                                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                                    <Text style={styles.qtyUnit}>{item.indentItem?.material?.unit?.code || ''}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Button */}
            {!isPurchased && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity
                        style={styles.purchaseButton}
                        onPress={handleMarkAsPurchased}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="cart" size={20} color="#FFFFFF" />
                                <Text style={styles.purchaseButtonText}>Mark as Purchased</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Material Details Modal */}
            <Modal visible={showMaterialModal} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Material Details</Text>
                        <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                {/* Material Info */}
                                <View style={styles.materialHeader}>
                                    <Text style={styles.materialModalName}>{selectedItem.materialName}</Text>
                                    <Text style={styles.materialModalCode}>{selectedItem.materialCode}</Text>
                                    {selectedItem.specifications && (
                                        <Text style={styles.materialSpecs}>{selectedItem.specifications}</Text>
                                    )}
                                </View>

                                {/* Vendor Details Section */}
                                <Text style={styles.sectionLabel}>Vendor Details</Text>
                                <View style={styles.formCard}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Name of Vendor</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter vendor name"
                                            value={itemForm.vendorName}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorName: text })}
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter address"
                                            value={itemForm.vendorAddress}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorAddress: text })}
                                            multiline
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>GST No.</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter GST number"
                                            value={itemForm.vendorGstNo}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorGstNo: text })}
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Contact Person's Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter contact person name"
                                            value={itemForm.vendorContactPerson}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorContactPerson: text })}
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Contact Person's Phone</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter phone number"
                                            value={itemForm.vendorContactPhone}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorContactPhone: text })}
                                            keyboardType="phone-pad"
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Nature of Business</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., Building Materials Supplier"
                                            value={itemForm.vendorNatureOfBusiness}
                                            onChangeText={(text) => setItemForm({ ...itemForm, vendorNatureOfBusiness: text })}
                                            editable={!isPurchased || selectedItem?.isReordered}
                                        />
                                    </View>
                                </View>

                                {/* Cost Section */}
                                <Text style={styles.sectionLabel}>Cost</Text>
                                <View style={styles.formCard}>
                                    <View style={styles.formRow}>
                                        <View style={[styles.formGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Rate (₹)</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="0.00"
                                                value={itemForm.rate}
                                                onChangeText={(text) => setItemForm({ ...itemForm, rate: text })}
                                                keyboardType="decimal-pad"
                                                editable={!isPurchased || selectedItem?.isReordered}
                                            />
                                        </View>
                                        <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                            <Text style={styles.label}>Quantity</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="0"
                                                value={itemForm.quantity}
                                                onChangeText={(text) => setItemForm({ ...itemForm, quantity: text })}
                                                keyboardType="decimal-pad"
                                                editable={!isPurchased || selectedItem?.isReordered}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.totalBox}>
                                        <Text style={styles.totalBoxLabel}>Total</Text>
                                        <Text style={styles.totalBoxValue}>₹ {calculateTotal().toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>

                                {/* Invoices Section */}
                                <Text style={styles.sectionLabel}>Invoices</Text>
                                <View style={styles.formCard}>
                                    {selectedItem.invoices?.map((invoice) => (
                                        <View key={invoice.id} style={styles.invoiceItem}>
                                            <Ionicons name="document-outline" size={20} color={theme.colors.primary} />
                                            <Text style={styles.invoiceName} numberOfLines={1}>{invoice.originalName || invoice.filename}</Text>
                                        </View>
                                    ))}
                                    {selectedItem.invoices?.length === 0 && (
                                        <Text style={styles.noInvoicesText}>No invoices uploaded yet</Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.addInvoiceButton}
                                        onPress={handleUploadItemInvoice}
                                        disabled={uploadingInvoice}
                                    >
                                        {uploadingInvoice ? (
                                            <ActivityIndicator size="small" color={theme.colors.primary} />
                                        ) : (
                                            <>
                                                <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                                                <Text style={styles.addInvoiceText}>Add Invoice</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Save Button */}
                                {(!isPurchased || selectedItem?.isReordered) && (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSaveItem}
                                        disabled={savingItem}
                                    >
                                        {savingItem ? (
                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Save & Exit</Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                <View style={{ height: 40 }} />
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
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
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    indentName: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    purchasedBadge: { backgroundColor: theme.colors.success + '15' },
    statusText: { fontSize: 12, fontWeight: '600', color: theme.colors.primary },
    purchasedText: { color: theme.colors.success },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary },
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
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    sectionSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, marginBottom: 12 },
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
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    vendorPreview: { fontSize: 12, color: theme.colors.primary, marginTop: 4 },
    materialCost: { fontSize: 12, color: theme.colors.success, marginTop: 2, fontWeight: '500' },
    qtyBox: { alignItems: 'center', marginRight: 12 },
    qtyValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    qtyUnit: { fontSize: 11, color: theme.colors.textSecondary },
    bottomButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    purchaseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    purchaseButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
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
    materialHeader: {
        backgroundColor: theme.colors.primary + '08',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    materialModalName: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    materialModalCode: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
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
    formGroup: { marginBottom: 14 },
    formRow: { flexDirection: 'row' },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 6 },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    textArea: { minHeight: 70, textAlignVertical: 'top' },
    totalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '10',
        padding: 14,
        borderRadius: 10,
        marginTop: 8,
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
    noInvoicesText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', padding: 12 },
    addInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.primary,
        borderRadius: 10,
        gap: 8,
    },
    addInvoiceText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});