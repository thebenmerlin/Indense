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
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ordersApi } from '../../../src/api';
import { Order, OrderItem, OrderInvoice, OrderItemInvoice } from '../../../src/types';

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
    }
};

interface VendorDetails {
    vendorName: string;
    vendorAddress: string;
    vendorGstNo: string;
    vendorContact: string;
    vendorContactPerson: string;
    vendorNatureOfBusiness: string;
}

interface MaterialCost {
    rate: string;
    quantity: string;
    total: number;
}

export default function ProcessOrder() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Vendor Details State
    const [vendor, setVendor] = useState<VendorDetails>({
        vendorName: '',
        vendorAddress: '',
        vendorGstNo: '',
        vendorContact: '',
        vendorContactPerson: '',
        vendorNatureOfBusiness: '',
    });

    // Material Modal State
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
    const [materialCost, setMaterialCost] = useState<MaterialCost>({ rate: '', quantity: '', total: 0 });
    const [savingItem, setSavingItem] = useState(false);

    // Invoice Upload State
    const [uploadingInvoice, setUploadingInvoice] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const data = await ordersApi.getById(id!);
            setOrder(data);
            // Populate vendor details from existing order
            setVendor({
                vendorName: data.vendorName || '',
                vendorAddress: data.vendorAddress || '',
                vendorGstNo: data.vendorGstNo || '',
                vendorContact: data.vendorContact || '',
                vendorContactPerson: data.vendorContactPerson || '',
                vendorNatureOfBusiness: data.vendorNatureOfBusiness || '',
            });
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
        setMaterialCost({ 
            rate: item.unitPrice?.toString() || '', 
            quantity: item.quantity?.toString() || '', 
            total: item.totalPrice || 0 
        });
        setShowMaterialModal(true);
    };

    const calculateTotal = () => {
        const rate = parseFloat(materialCost.rate) || 0;
        const qty = parseFloat(materialCost.quantity) || 0;
        setMaterialCost(prev => ({ ...prev, total: rate * qty }));
    };

    const handleSaveItemCost = async () => {
        if (!selectedItem) return;

        setSavingItem(true);
        try {
            await ordersApi.updateOrderItem(id!, selectedItem.id, {
                unitPrice: parseFloat(materialCost.rate) || 0,
                quantity: parseFloat(materialCost.quantity) || selectedItem.quantity,
            });
            await fetchOrder(); // Refresh order data
            setShowMaterialModal(false);
            Alert.alert('Saved', 'Material cost updated');
        } catch (error) {
            console.error('Failed to update item:', error);
            Alert.alert('Error', 'Failed to update material cost');
        } finally {
            setSavingItem(false);
        }
    };

    const handleUploadOrderInvoice = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
        });

        if (result.canceled || !result.assets?.[0]) return;

        setUploadingInvoice(true);
        try {
            const file = result.assets[0];
            await ordersApi.uploadOrderInvoice(id!, file.uri, file.name);
            await fetchOrder();
            Alert.alert('Success', 'Invoice uploaded');
        } catch (error) {
            console.error('Failed to upload invoice:', error);
            Alert.alert('Error', 'Failed to upload invoice');
        } finally {
            setUploadingInvoice(false);
        }
    };

    const handleUploadItemInvoice = async () => {
        if (!selectedItem) return;

        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
        });

        if (result.canceled || !result.assets?.[0]) return;

        try {
            const file = result.assets[0];
            await ordersApi.uploadOrderItemInvoice(id!, selectedItem.id, file.uri, file.name);
            await fetchOrder();
            Alert.alert('Success', 'Item invoice uploaded');
        } catch (error) {
            console.error('Failed to upload item invoice:', error);
            Alert.alert('Error', 'Failed to upload invoice');
        }
    };

    const handleSaveVendorDetails = async () => {
        if (!vendor.vendorName.trim()) {
            Alert.alert('Required', 'Please enter vendor name');
            return;
        }

        setSaving(true);
        try {
            await ordersApi.update(id!, vendor);
            Alert.alert('Saved', 'Vendor details updated');
        } catch (error) {
            console.error('Failed to save vendor details:', error);
            Alert.alert('Error', 'Failed to save vendor details');
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsPurchased = async () => {
        if (!vendor.vendorName.trim()) {
            Alert.alert('Required', 'Please enter vendor name before marking as purchased');
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
                            // First save vendor details
                            await ordersApi.update(id!, vendor);
                            // Then mark as purchased
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
                        <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                    </View>
                </View>

                {/* Vendor Details Form */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Vendor Details</Text>
                        {!isPurchased && (
                            <TouchableOpacity onPress={handleSaveVendorDetails} disabled={saving}>
                                <Text style={styles.saveLink}>{saving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Vendor Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter vendor name"
                            value={vendor.vendorName}
                            onChangeText={(text) => setVendor({ ...vendor, vendorName: text })}
                            editable={!isPurchased}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter address"
                            value={vendor.vendorAddress}
                            onChangeText={(text) => setVendor({ ...vendor, vendorAddress: text })}
                            multiline
                            editable={!isPurchased}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>GST No.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="GST number"
                            value={vendor.vendorGstNo}
                            onChangeText={(text) => setVendor({ ...vendor, vendorGstNo: text })}
                            editable={!isPurchased}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Contact Person</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contact person name"
                            value={vendor.vendorContactPerson}
                            onChangeText={(text) => setVendor({ ...vendor, vendorContactPerson: text })}
                            editable={!isPurchased}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Contact Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone number"
                            value={vendor.vendorContact}
                            onChangeText={(text) => setVendor({ ...vendor, vendorContact: text })}
                            keyboardType="phone-pad"
                            editable={!isPurchased}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nature of Business</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Building Materials Supplier"
                            value={vendor.vendorNatureOfBusiness}
                            onChangeText={(text) => setVendor({ ...vendor, vendorNatureOfBusiness: text })}
                            editable={!isPurchased}
                        />
                    </View>
                </View>

                {/* Order Invoices */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Invoices</Text>
                    {order.invoices?.map((invoice) => (
                        <View key={invoice.id} style={styles.invoiceItem}>
                            <Ionicons name="document-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.invoiceName} numberOfLines={1}>{invoice.originalName || invoice.filename}</Text>
                        </View>
                    ))}
                    {!isPurchased && (
                        <TouchableOpacity 
                            style={styles.addInvoiceButton} 
                            onPress={handleUploadOrderInvoice}
                            disabled={uploadingInvoice}
                        >
                            {uploadingInvoice ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <>
                                    <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                                    <Text style={styles.addInvoiceText}>Upload Invoice</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({order.orderItems?.length || 0})</Text>
                    <Text style={styles.sectionSubtitle}>Tap to {isPurchased ? 'view' : 'edit'} cost and invoices</Text>
                    {order.orderItems?.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.materialCard}
                            onPress={() => openMaterialModal(item)}
                        >
                            <View style={styles.materialInfo}>
                                <Text style={styles.materialName}>{item.materialName}</Text>
                                <Text style={styles.materialCode}>{item.materialCode}</Text>
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
                    ))}
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

            {/* Material Cost Modal */}
            <Modal visible={showMaterialModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Material Details</Text>
                        <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                <View style={styles.materialHeader}>
                                    <Text style={styles.materialModalName}>{selectedItem.materialName}</Text>
                                    <Text style={styles.materialModalCode}>{selectedItem.materialCode}</Text>
                                </View>

                                <Text style={styles.costSectionTitle}>Cost Details</Text>
                                <View style={styles.formRow}>
                                    <View style={[styles.formGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Rate (₹)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0.00"
                                            value={materialCost.rate}
                                            onChangeText={(text) => setMaterialCost({ ...materialCost, rate: text })}
                                            onBlur={calculateTotal}
                                            keyboardType="decimal-pad"
                                            editable={!isPurchased}
                                        />
                                    </View>
                                    <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                        <Text style={styles.label}>Quantity</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0"
                                            value={materialCost.quantity}
                                            onChangeText={(text) => setMaterialCost({ ...materialCost, quantity: text })}
                                            onBlur={calculateTotal}
                                            keyboardType="decimal-pad"
                                            editable={!isPurchased}
                                        />
                                    </View>
                                </View>
                                <View style={styles.totalBox}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalBoxValue}>₹ {materialCost.total.toLocaleString('en-IN')}</Text>
                                </View>

                                <Text style={styles.costSectionTitle}>Item Invoices</Text>
                                {selectedItem.invoices?.map((invoice) => (
                                    <View key={invoice.id} style={styles.invoiceItem}>
                                        <Ionicons name="document-outline" size={20} color={theme.colors.primary} />
                                        <Text style={styles.invoiceName} numberOfLines={1}>{invoice.originalName || invoice.filename}</Text>
                                    </View>
                                ))}
                                {!isPurchased && (
                                    <TouchableOpacity style={styles.addInvoiceButton} onPress={handleUploadItemInvoice}>
                                        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                                        <Text style={styles.addInvoiceText}>Add Item Invoice</Text>
                                    </TouchableOpacity>
                                )}

                                {!isPurchased && (
                                    <TouchableOpacity 
                                        style={styles.saveMaterialButton} 
                                        onPress={handleSaveItemCost}
                                        disabled={savingItem}
                                    >
                                        {savingItem ? (
                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                        ) : (
                                            <Text style={styles.saveMaterialButtonText}>Save Cost</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </ScrollView>
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    sectionSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: -8, marginBottom: 12 },
    saveLink: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
    formGroup: { marginBottom: 14 },
    formRow: { flexDirection: 'row' },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 6 },
    input: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    textArea: { minHeight: 70, textAlignVertical: 'top' },
    invoiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 10,
    },
    invoiceName: { fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
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
    materialCost: { fontSize: 12, color: theme.colors.success, marginTop: 4, fontWeight: '500' },
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
    materialHeader: { marginBottom: 20 },
    materialModalName: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    materialModalCode: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    costSectionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.primary, marginTop: 16, marginBottom: 12 },
    totalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '10',
        padding: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    totalBoxValue: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
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
        marginTop: 8,
    },
    addInvoiceText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    saveMaterialButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    saveMaterialButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});