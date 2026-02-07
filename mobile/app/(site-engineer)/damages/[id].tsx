import React, { useEffect, useState, useCallback } from 'react';
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
    FlatList,
    ToastAndroid,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { indentsApi, damagesApi } from '../../../src/api';
import { Indent, IndentItem, DamageReport } from '../../../src/types';

const theme = {
    colors: {
        primary: '#3B82F6',
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

interface LocalDamage {
    id: string;
    materialId: string;
    materialName: string;
    name: string;
    description: string;
    imageUri?: string;
    isUploaded: boolean;
    status: 'DRAFT' | 'REPORTED';
}

export default function DamageDetailScreen() {
    const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
    const router = useRouter();

    const [indent, setIndent] = useState<Indent | null>(null);
    const [damages, setDamages] = useState<LocalDamage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Add damage modal state
    const [showMaterialPicker, setShowMaterialPicker] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);
    const [showDamageForm, setShowDamageForm] = useState(false);
    const [damageName, setDamageName] = useState('');
    const [damageDescription, setDamageDescription] = useState('');
    const [damageImageUri, setDamageImageUri] = useState<string | null>(null);

    const isIndentBased = type === 'indent';

    useEffect(() => {
        if (id) {
            if (isIndentBased) {
                fetchIndentAndDamages();
            } else {
                // Legacy: load single damage report
                fetchDamageReport();
            }
        }
    }, [id, isIndentBased]);

    const fetchIndentAndDamages = async () => {
        try {
            // Fetch indent details
            const indentData = await indentsApi.getById(id!);
            setIndent(indentData);

            // Fetch existing damage reports for this indent
            const damageReports = await damagesApi.getByIndentId(id!);

            const localDamages: LocalDamage[] = damageReports.map((report: DamageReport) => ({
                id: report.id,
                materialId: report.indentItemId || '',
                materialName: report.indentItem?.material?.name || 'Unknown Material',
                name: report.name,
                description: report.description || '',
                imageUri: report.images?.[0]?.path,
                isUploaded: true,
                status: report.status === 'DRAFT' ? 'DRAFT' : 'REPORTED',
            }));

            setDamages(localDamages);
        } catch (error) {
            console.error('Failed to fetch indent and damages:', error);
            Alert.alert('Error', 'Failed to load indent details');
        } finally {
            setLoading(false);
        }
    };

    const fetchDamageReport = async () => {
        try {
            const report = await damagesApi.getById(id!);
            if (report.indentId) {
                const indentData = await indentsApi.getById(report.indentId);
                setIndent(indentData);
            }

            setDamages([{
                id: report.id,
                materialId: report.indentItemId || '',
                materialName: report.indentItem?.material?.name || 'Unknown Material',
                name: report.name,
                description: report.description || '',
                imageUri: report.images?.[0]?.path,
                isUploaded: true,
                status: report.status === 'DRAFT' ? 'DRAFT' : 'REPORTED',
            }]);
        } catch (error) {
            console.error('Failed to fetch damage report:', error);
            Alert.alert('Error', 'Failed to load damage report');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | Date) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('', message);
        }
    };

    const handleSelectMaterial = (item: IndentItem) => {
        setSelectedMaterial(item);
        setDamageName(`Damage - ${item.material?.name || 'Unknown'}`);
        setShowMaterialPicker(false);
        setShowDamageForm(true);
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            setDamageImageUri(result.assets[0].uri);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            setDamageImageUri(result.assets[0].uri);
        }
    };

    const handleSaveDamage = async () => {
        if (!damageName.trim()) {
            Alert.alert('Required', 'Please enter a damage name');
            return;
        }
        if (!damageDescription.trim()) {
            Alert.alert('Required', 'Please enter a damage description');
            return;
        }
        if (!damageImageUri) {
            Alert.alert('Required', 'Please add a photo of the damage');
            return;
        }

        setSaving(true);
        try {
            // Create damage report
            const damageReport = await damagesApi.create({
                indentId: indent!.id,
                indentItemId: selectedMaterial?.id,
                name: damageName.trim(),
                description: damageDescription.trim(),
                isDraft: true,
            });

            // Upload image
            const fileName = `damage_${Date.now()}.jpg`;
            await damagesApi.uploadImage(damageReport.id, damageImageUri, fileName);

            // Add to local state
            const newDamage: LocalDamage = {
                id: damageReport.id,
                materialId: selectedMaterial?.id || '',
                materialName: selectedMaterial?.material?.name || 'Unknown Material',
                name: damageName.trim(),
                description: damageDescription.trim(),
                imageUri: damageImageUri,
                isUploaded: true,
                status: 'DRAFT',
            };
            setDamages([...damages, newDamage]);

            // Reset form
            setShowDamageForm(false);
            setSelectedMaterial(null);
            setDamageName('');
            setDamageDescription('');
            setDamageImageUri(null);

            showToast('Damage saved as draft');
        } catch (error) {
            console.error('Failed to save damage:', error);
            Alert.alert('Error', 'Failed to save damage');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDamage = async (damageId: string) => {
        Alert.alert(
            'Delete Damage',
            'Are you sure you want to delete this damage?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await damagesApi.delete(damageId);
                            setDamages(damages.filter(d => d.id !== damageId));
                            showToast('Damage deleted');
                        } catch (error) {
                            console.error('Failed to delete damage:', error);
                            Alert.alert('Error', 'Failed to delete damage');
                        }
                    },
                },
            ]
        );
    };

    const handleSaveDraft = async () => {
        const draftDamages = damages.filter(d => d.status === 'DRAFT');
        if (draftDamages.length === 0) {
            Alert.alert('No drafts', 'All damages have been reported');
            return;
        }

        showToast('Draft saved');
        router.back();
    };

    const handleReportDamages = async () => {
        const draftDamages = damages.filter(d => d.status === 'DRAFT');
        if (draftDamages.length === 0) {
            Alert.alert('No drafts', 'No draft damages to report');
            return;
        }

        Alert.alert(
            'Report Damages',
            `Are you sure you want to report ${draftDamages.length} damage(s)? Once submitted, you cannot edit them.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Report',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            // Submit each draft damage
                            for (const damage of draftDamages) {
                                await damagesApi.submit(damage.id);
                            }

                            // Update local state
                            setDamages(damages.map(d => ({
                                ...d,
                                status: 'REPORTED' as const,
                            })));

                            showToast('Damages Reported!');
                        } catch (error) {
                            console.error('Failed to report damages:', error);
                            Alert.alert('Error', 'Failed to report damages');
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const hasDraftDamages = damages.some(d => d.status === 'DRAFT');
    const allReported = damages.length > 0 && damages.every(d => d.status === 'REPORTED');

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
                {/* Indent Header */}
                <View style={styles.header}>
                    <Text style={styles.indentName}>{indent.name || indent.indentNumber}</Text>
                    <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{indent.site?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{formatDate(indent.createdAt)}</Text>
                    </View>
                </View>

                {/* Add Damage Button */}
                {!allReported && (
                    <TouchableOpacity
                        style={styles.addDamageButton}
                        onPress={() => setShowMaterialPicker(true)}
                    >
                        <Ionicons name="add-circle" size={24} color={theme.colors.error} />
                        <Text style={styles.addDamageButtonText}>Add Damage(s)</Text>
                    </TouchableOpacity>
                )}

                {/* View Damages Section */}
                {damages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>View Damages</Text>
                        {damages.map((damage) => (
                            <View key={damage.id} style={[
                                styles.damageCard,
                                damage.status === 'DRAFT' && styles.draftCard
                            ]}>
                                <View style={styles.damageHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.damageName}>{damage.name}</Text>
                                        <Text style={styles.damageMaterial}>{damage.materialName}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: damage.status === 'DRAFT' ? theme.colors.warning + '20' : theme.colors.error + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: damage.status === 'DRAFT' ? theme.colors.warning : theme.colors.error }
                                        ]}>
                                            {damage.status === 'DRAFT' ? 'Draft' : 'Reported'}
                                        </Text>
                                    </View>
                                </View>

                                {damage.description && (
                                    <Text style={styles.damageDescription}>{damage.description}</Text>
                                )}

                                {damage.imageUri && (
                                    <Image source={{ uri: damage.imageUri }} style={styles.damageImage} />
                                )}

                                {damage.status === 'DRAFT' && (
                                    <TouchableOpacity
                                        style={styles.deleteDamageButton}
                                        onPress={() => handleDeleteDamage(damage.id)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                                        <Text style={styles.deleteDamageText}>Delete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Buttons */}
            {damages.length > 0 && (
                <View style={styles.bottomButtons}>
                    {hasDraftDamages ? (
                        <>
                            <TouchableOpacity
                                style={styles.draftButton}
                                onPress={handleSaveDraft}
                                disabled={submitting}
                            >
                                <Text style={styles.draftButtonText}>Save Draft</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={handleReportDamages}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.reportButtonText}>Report Damages</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.reportedBanner}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                            <Text style={styles.reportedText}>Damages Reported</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Material Picker Modal */}
            <Modal
                visible={showMaterialPicker}
                animationType="slide"
                transparent
                onRequestClose={() => setShowMaterialPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Material</Text>
                            <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={indent?.items || []}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.materialOption}
                                    onPress={() => handleSelectMaterial(item)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.materialName}>{item.material?.name}</Text>
                                        <Text style={styles.materialQty}>
                                            Qty: {item.requestedQty} {item.material?.unit?.code}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyMaterials}>
                                    <Text style={styles.emptyMaterialsText}>No materials in this indent</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* Damage Form Modal */}
            <Modal
                visible={showDamageForm}
                animationType="slide"
                transparent
                onRequestClose={() => setShowDamageForm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Damage</Text>
                            <TouchableOpacity onPress={() => {
                                setShowDamageForm(false);
                                setDamageName('');
                                setDamageDescription('');
                                setDamageImageUri(null);
                            }}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {/* Material Info */}
                            {selectedMaterial && (
                                <View style={styles.selectedMaterial}>
                                    <Text style={styles.materialLabel}>Material:</Text>
                                    <Text style={styles.materialValue}>{selectedMaterial.material?.name}</Text>
                                </View>
                            )}

                            {/* Damage Name */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Name *</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Enter damage name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={damageName}
                                    onChangeText={setDamageName}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.formInput, styles.formTextArea]}
                                    placeholder="Describe the damage in detail..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={damageDescription}
                                    onChangeText={setDamageDescription}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Photo Upload */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Upload Picture *</Text>
                                {damageImageUri ? (
                                    <View style={styles.imagePreview}>
                                        <Image source={{ uri: damageImageUri }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => setDamageImageUri(null)}
                                        >
                                            <Ionicons name="close-circle" size={28} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.uploadOptions}>
                                        <TouchableOpacity style={styles.uploadOption} onPress={handleTakePhoto}>
                                            <Ionicons name="camera" size={28} color={theme.colors.primary} />
                                            <Text style={styles.uploadOptionText}>Camera</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.uploadOption} onPress={handlePickImage}>
                                            <Ionicons name="images" size={28} color={theme.colors.primary} />
                                            <Text style={styles.uploadOptionText}>Your Photos</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveDamage}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scrollView: {
        flex: 1,
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
    indentName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    indentNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    addDamageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardBg,
        marginHorizontal: 16,
        marginVertical: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.error,
        borderStyle: 'dashed',
        gap: 8,
    },
    addDamageButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.error,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    damageCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    draftCard: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
    },
    damageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    damageName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    damageMaterial: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    damageDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    damageImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 12,
    },
    deleteDamageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 6,
    },
    deleteDamageText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.error,
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
    draftButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    draftButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    reportButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
    },
    reportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    reportedBanner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    reportedText: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.success,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.cardBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    materialOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        marginBottom: 8,
    },
    materialName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    materialQty: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    emptyMaterials: {
        padding: 24,
        alignItems: 'center',
    },
    emptyMaterialsText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    selectedMaterial: {
        backgroundColor: theme.colors.primary + '10',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    materialLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    materialValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    formTextArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    uploadOptionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    imagePreview: {
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
    },
    saveButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
