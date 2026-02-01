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
    }
};

interface VendorDetails {
    vendorName: string;
    vendorAddress: string;
    gstNo: string;
    contactPerson: string;
    contactPhone: string;
    natureOfBusiness: string;
}

interface MaterialCost {
    rate: string;
    quantity: string;
    total: number;
}

interface Invoice {
    id: string;
    name: string;
    imageUri: string;
}

export default function ProcessOrder() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);

    // Vendor Details State
    const [vendor, setVendor] = useState<VendorDetails>({
        vendorName: '',
        vendorAddress: '',
        gstNo: '',
        contactPerson: '',
        contactPhone: '',
        natureOfBusiness: '',
    });

    // Material Modal State
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);
    const [materialCost, setMaterialCost] = useState<MaterialCost>({ rate: '', quantity: '', total: 0 });
    const [materialInvoices, setMaterialInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        if (id) fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
            setIsPurchased(data.status === 'ORDER_PLACED');
            if (data.order) {
                setVendor(prev => ({
                    ...prev,
                    vendorName: data.order?.vendorName || '',
                    contactPhone: data.order?.vendorContact || '',
                }));
            }
        } catch (error) {
            console.error('Failed to fetch indent:', error);
            Alert.alert('Error', 'Failed to load indent');
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

    const openMaterialModal = (item: IndentItem) => {
        setSelectedMaterial(item);
        setMaterialCost({ rate: '', quantity: String(item.requestedQty), total: 0 });
        setMaterialInvoices([]);
        setShowMaterialModal(true);
    };

    const calculateTotal = () => {
        const rate = parseFloat(materialCost.rate) || 0;
        const qty = parseFloat(materialCost.quantity) || 0;
        setMaterialCost(prev => ({ ...prev, total: rate * qty }));
    };

    const handlePickInvoice = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setMaterialInvoices([...materialInvoices, {
                id: `inv-${Date.now()}`,
                name: `Invoice ${materialInvoices.length + 1}`,
                imageUri: result.assets[0].uri,
            }]);
        }
    };

    const handleSaveMaterial = () => {
        // TODO: Save material costs and invoices to API
        setShowMaterialModal(false);
        Alert.alert('Saved', 'Material details saved');
    };

    const handlePurchase = async () => {
        if (!vendor.vendorName.trim()) {
            Alert.alert('Required', 'Please enter vendor name');
            return;
        }

        Alert.alert(
            'Confirm Purchase',
            'Mark this indent as purchased?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Purchase',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            // TODO: API call to mark as purchased with vendor details
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            setIsPurchased(true);
                            Alert.alert('Success', 'Indent marked as purchased!', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
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

    if (!indent) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Indent not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Info */}
                <View style={styles.header}>
                    <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                    <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{indent.site?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Created: {formatDate(indent.createdAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>Expected: {formatDate(indent.expectedDeliveryDate)}</Text>
                    </View>
                </View>

                {/* Vendor Details Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vendor Details</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Vendor Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter vendor name"
                            value={vendor.vendorName}
                            onChangeText={(text) => setVendor({ ...vendor, vendorName: text })}
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
                        />
                    </View>
                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>GST No.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="GST number"
                                value={vendor.gstNo}
                                onChangeText={(text) => setVendor({ ...vendor, gstNo: text })}
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Contact Person</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contact person name"
                            value={vendor.contactPerson}
                            onChangeText={(text) => setVendor({ ...vendor, contactPerson: text })}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Contact Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone number"
                            value={vendor.contactPhone}
                            onChangeText={(text) => setVendor({ ...vendor, contactPhone: text })}
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nature of Business</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Building Materials Supplier"
                            value={vendor.natureOfBusiness}
                            onChangeText={(text) => setVendor({ ...vendor, natureOfBusiness: text })}
                        />
                    </View>
                </View>

                {/* Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({indent.items?.length || 0})</Text>
                    <Text style={styles.sectionSubtitle}>Tap to add cost and invoices</Text>
                    {indent.items?.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.materialCard}
                            onPress={() => openMaterialModal(item)}
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

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomButtons}>
                <TouchableOpacity
                    style={[styles.purchaseButton, isPurchased && styles.purchasedButton]}
                    onPress={handlePurchase}
                    disabled={saving || isPurchased}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name={isPurchased ? "checkmark-circle" : "cart"}
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text style={styles.purchaseButtonText}>
                                {isPurchased ? 'Purchased' : 'Mark as Purchased'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

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
                        {selectedMaterial && (
                            <>
                                <View style={styles.materialHeader}>
                                    <Text style={styles.materialModalName}>{selectedMaterial.material?.name}</Text>
                                    <Text style={styles.materialModalCode}>{selectedMaterial.material?.code}</Text>
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
                                        />
                                    </View>
                                </View>
                                <View style={styles.totalBox}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>₹ {materialCost.total.toLocaleString('en-IN')}</Text>
                                </View>

                                <Text style={styles.costSectionTitle}>Invoices</Text>
                                {materialInvoices.map((invoice) => (
                                    <View key={invoice.id} style={styles.invoicePreview}>
                                        <Image source={{ uri: invoice.imageUri }} style={styles.invoiceThumb} />
                                        <Text style={styles.invoiceName}>{invoice.name}</Text>
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addInvoiceButton} onPress={handlePickInvoice}>
                                    <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                                    <Text style={styles.addInvoiceText}>Add Invoice</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.saveMaterialButton} onPress={handleSaveMaterial}>
                                    <Text style={styles.saveMaterialButtonText}>Save</Text>
                                </TouchableOpacity>
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
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 4 },
    sectionSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
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
    purchasedButton: { backgroundColor: theme.colors.success },
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
    totalLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    totalValue: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
    invoicePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    invoiceThumb: { width: 50, height: 50, borderRadius: 6, marginRight: 12 },
    invoiceName: { fontSize: 14, color: theme.colors.textPrimary },
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
