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
import DateTimePicker from '@react-native-community/datetimepicker';
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
        warning: '#F59E0B',
        error: '#EF4444',
    }
};

interface PartialMaterial {
    item: IndentItem;
    status: 'PARTIAL' | 'NOT_ARRIVED';
}

export default function PartialOrderDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable vendor fields
    const [vendorName, setVendorName] = useState('');
    const [vendorContact, setVendorContact] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expectedDate, setExpectedDate] = useState(new Date());

    // Material modal
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<PartialMaterial | null>(null);
    const [newRate, setNewRate] = useState('');
    const [newTotal, setNewTotal] = useState('');

    // Partial materials (populated from API)
    const [partialMaterials, setPartialMaterials] = useState<PartialMaterial[]>([]);

    useEffect(() => {
        if (id) fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
            setVendorName(data.order?.vendorName || '');
            setVendorContact(data.order?.vendorContact || '');

            // Use actual items with PARTIAL or NOT_ARRIVED status
            const partials: PartialMaterial[] = (data.items || [])
                .filter(item => item.arrivalStatus === 'PARTIAL' || item.arrivalStatus === 'NOT_ARRIVED')
                .map(item => ({
                    item,
                    status: item.arrivalStatus as 'PARTIAL' | 'NOT_ARRIVED',
                }));
            setPartialMaterials(partials);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | null | undefined | Date) => {
        if (!dateStr) return '-';
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const openMaterialModal = (material: PartialMaterial) => {
        setSelectedMaterial(material);
        setNewRate('');
        setNewTotal('');
        setShowMaterialModal(true);
    };

    const handleUploadInvoice = async () => {
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
            Alert.alert('Success', 'Invoice uploaded');
        }
    };

    const handleSaveMaterial = () => {
        // TODO: Save updated costs to API
        setShowMaterialModal(false);
        Alert.alert('Saved', 'Material details updated');
    };

    const handleReorder = async () => {
        if (!vendorName.trim()) {
            Alert.alert('Required', 'Please enter vendor name');
            return;
        }

        setSaving(true);
        try {
            // TODO: API call to reorder pending materials
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Reorder placed for pending materials', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to place reorder');
        } finally {
            setSaving(false);
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
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const partialCount = partialMaterials.filter(m => m.status === 'PARTIAL').length;
    const notReceivedCount = partialMaterials.filter(m => m.status === 'NOT_ARRIVED').length;

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
                </View>

                {/* Vendor Details - Editable */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vendor Details</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Vendor Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter vendor name"
                            value={vendorName}
                            onChangeText={setVendorName}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Contact</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contact number"
                            value={vendorContact}
                            onChangeText={setVendorContact}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Materials List - Partial & Not Arrived */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Problem Materials</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {partialCount > 0 && (
                                <View style={styles.pendingBadge}>
                                    <Text style={styles.pendingBadgeText}>{partialCount} partial</Text>
                                </View>
                            )}
                            {notReceivedCount > 0 && (
                                <View style={styles.notReceivedBadge}>
                                    <Text style={styles.notReceivedBadgeText}>{notReceivedCount} not received</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    {partialMaterials.map((material) => {
                        const isNotArrived = material.status === 'NOT_ARRIVED';
                        return (
                            <TouchableOpacity
                                key={material.item.id}
                                style={[
                                    styles.materialCard,
                                    isNotArrived && styles.notArrivedCard
                                ]}
                                onPress={() => openMaterialModal(material)}
                            >
                                <View style={styles.materialInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.materialName}>{material.item.material?.name}</Text>
                                        <View style={[
                                            styles.statusChip,
                                            isNotArrived ? styles.notArrivedChip : styles.partialChip
                                        ]}>
                                            <Text style={[
                                                styles.statusChipText,
                                                isNotArrived ? styles.notArrivedChipText : styles.partialChipText
                                            ]}>
                                                {isNotArrived ? 'NOT RECEIVED' : 'PARTIAL'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.materialCode}>{material.item.material?.code}</Text>
                                    <Text style={styles.itemQtyText}>
                                        Ordered: {material.item.requestedQty} {material.item.material?.unit?.code || ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        );
                    })}                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Reorder Button */}
            <View style={styles.bottomButtons}>
                <TouchableOpacity
                    style={styles.reorderButton}
                    onPress={handleReorder}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.reorderButtonText}>Reorder Materials ({partialMaterials.length})</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Material Edit Modal */}
            <Modal visible={showMaterialModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Material</Text>
                        <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {selectedMaterial && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.materialHeader}>
                                <Text style={styles.materialModalName}>{selectedMaterial.item.material?.name}</Text>
                                <View style={[
                                    styles.statusChip,
                                    selectedMaterial.status === 'NOT_ARRIVED' ? styles.notArrivedChip : styles.partialChip
                                ]}>
                                    <Text style={[
                                        styles.statusChipText,
                                        selectedMaterial.status === 'NOT_ARRIVED' ? styles.notArrivedChipText : styles.partialChipText
                                    ]}>
                                        {selectedMaterial.status === 'NOT_ARRIVED' ? 'NOT RECEIVED' : 'PARTIAL'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.costSectionTitle}>Adjust Cost (Optional)</Text>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>New Rate (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={newRate}
                                    onChangeText={setNewRate}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>New Total (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={newTotal}
                                    onChangeText={setNewTotal}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadInvoice}>
                                <Ionicons name="cloud-upload" size={20} color={theme.colors.primary} />
                                <Text style={styles.uploadButtonText}>Re-upload Invoice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMaterial}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
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
    header: { backgroundColor: theme.colors.cardBg, padding: 16, marginBottom: 8 },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    indentNumber: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'monospace', marginTop: 2, marginBottom: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary },
    section: { padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    pendingBadge: { backgroundColor: theme.colors.warning + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pendingBadgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.warning },
    formGroup: { marginBottom: 14 },
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
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.warning + '40',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
    },
    materialInfo: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    qtyInfo: { flexDirection: 'row', marginTop: 6 },
    receivedLabel: { fontSize: 12, color: theme.colors.textSecondary },
    receivedValue: { fontSize: 12, fontWeight: '600', color: theme.colors.success },
    pendingLabel: { fontSize: 12, color: theme.colors.textSecondary },
    pendingValue: { fontSize: 12, fontWeight: '600', color: theme.colors.warning },
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
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.warning,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    reorderButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
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
    materialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    materialModalName: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    qtyBox: { flexDirection: 'row', alignItems: 'center' },
    qtyLabel: { fontSize: 13, color: theme.colors.textSecondary },
    qtyNumber: { fontSize: 16, fontWeight: '700', color: theme.colors.warning },
    costSectionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.primary, marginBottom: 12 },
    uploadButton: {
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
    uploadButtonText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    // New styles for NOT_ARRIVED distinction
    notReceivedBadge: { backgroundColor: theme.colors.error + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    notReceivedBadgeText: { fontSize: 12, fontWeight: '600', color: theme.colors.error },
    notArrivedCard: {
        borderColor: theme.colors.error + '40',
        borderLeftColor: theme.colors.error,
    },
    statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    notArrivedChip: { backgroundColor: theme.colors.error + '20' },
    partialChip: { backgroundColor: theme.colors.warning + '20' },
    statusChipText: { fontSize: 10, fontWeight: '700' },
    notArrivedChipText: { color: theme.colors.error },
    partialChipText: { color: theme.colors.warning },
    itemQtyText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
});
