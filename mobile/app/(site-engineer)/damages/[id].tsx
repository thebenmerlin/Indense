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
    FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { indentsApi } from '../../../src/api';
import { Indent, IndentItem } from '../../../src/types';

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

interface DamageEntry {
    id: string;
    materialId: string;
    materialName: string;
    name: string;
    description: string;
    imageUri: string | null;
    createdAt: Date;
}

export default function DamageDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [damages, setDamages] = useState<DamageEntry[]>([]);
    const [isDraft, setIsDraft] = useState(true);

    // Add damage modal state
    const [showMaterialPicker, setShowMaterialPicker] = useState(false);
    const [showDamageForm, setShowDamageForm] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<IndentItem | null>(null);
    const [damageName, setDamageName] = useState('');
    const [damageDescription, setDamageDescription] = useState('');
    const [damageImage, setDamageImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchIndent();
        }
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
            // TODO: Load existing damages from API
        } catch (error) {
            console.error('Failed to fetch indent:', error);
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

    const handleSelectMaterial = (material: IndentItem) => {
        setSelectedMaterial(material);
        setShowMaterialPicker(false);
        setShowDamageForm(true);
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
            setDamageImage(result.assets[0].uri);
        }
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
            setDamageImage(result.assets[0].uri);
        }
    };

    const handleSaveDamage = () => {
        if (!damageName.trim()) {
            Alert.alert('Required', 'Please enter a damage name');
            return;
        }
        if (!damageDescription.trim()) {
            Alert.alert('Required', 'Please enter a description');
            return;
        }

        const newDamage: DamageEntry = {
            id: `temp-${Date.now()}`,
            materialId: selectedMaterial!.id,
            materialName: selectedMaterial!.material?.name || 'Unknown Material',
            name: damageName.trim(),
            description: damageDescription.trim(),
            imageUri: damageImage,
            createdAt: new Date(),
        };

        setDamages([...damages, newDamage]);
        resetDamageForm();
        setShowDamageForm(false);
    };

    const resetDamageForm = () => {
        setSelectedMaterial(null);
        setDamageName('');
        setDamageDescription('');
        setDamageImage(null);
    };

    const handleReportDamages = async () => {
        if (damages.length === 0) {
            Alert.alert('No Damages', 'Please add at least one damage report');
            return;
        }

        setSaving(true);
        try {
            // TODO: API call to submit damages
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsDraft(false);
            Alert.alert(
                'Damages Reported',
                'Your damage report has been submitted successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to report damages');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (damages.length === 0) {
            Alert.alert('No Damages', 'Please add at least one damage to save as draft');
            return;
        }

        setSaving(true);
        try {
            // TODO: API call to save as draft
            await new Promise(resolve => setTimeout(resolve, 500));
            Alert.alert('Saved', 'Draft saved successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save draft');
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
                <Text style={styles.errorText}>Indent not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Indent Info */}
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

                {/* View Damages */}
                {damages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>View Damages</Text>
                        {damages.map(damage => (
                            <View key={damage.id} style={styles.damageCard}>
                                {damage.imageUri && (
                                    <Image
                                        source={{ uri: damage.imageUri }}
                                        style={styles.damageImage}
                                    />
                                )}
                                <View style={styles.damageInfo}>
                                    <Text style={styles.damageName}>{damage.name}</Text>
                                    <Text style={styles.damageMaterial}>{damage.materialName}</Text>
                                    <Text style={styles.damageDesc} numberOfLines={2}>
                                        {damage.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Add Damages Button */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.addDamagesButton}
                        onPress={() => setShowMaterialPicker(true)}
                    >
                        <Ionicons name="add-circle" size={24} color={theme.colors.error} />
                        <Text style={styles.addDamagesText}>Add Damage(s)</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Buttons */}
            {damages.length > 0 && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity
                        style={styles.draftButton}
                        onPress={handleSaveDraft}
                        disabled={saving}
                    >
                        <Text style={styles.draftButtonText}>Save Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.reportButton, !isDraft && styles.reportedButton]}
                        onPress={handleReportDamages}
                        disabled={saving || !isDraft}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.reportButtonText}>
                                {isDraft ? 'Report Damages' : 'Damages Reported'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Material Picker Modal */}
            <Modal
                visible={showMaterialPicker}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMaterialPicker(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Material</Text>
                        <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={indent.items}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.materialOption}
                                onPress={() => handleSelectMaterial(item)}
                            >
                                <View>
                                    <Text style={styles.materialOptionName}>
                                        {item.material?.name}
                                    </Text>
                                    <Text style={styles.materialOptionCode}>
                                        {item.material?.code}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Damage Form Modal */}
            <Modal
                visible={showDamageForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    resetDamageForm();
                    setShowDamageForm(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Report Damage</Text>
                        <TouchableOpacity onPress={() => {
                            resetDamageForm();
                            setShowDamageForm(false);
                        }}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.formContent}>
                        {selectedMaterial && (
                            <View style={styles.selectedMaterial}>
                                <Text style={styles.selectedMaterialLabel}>Material:</Text>
                                <Text style={styles.selectedMaterialName}>
                                    {selectedMaterial.material?.name}
                                </Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Damage Name *</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g., Cracked Tiles Batch #5"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={damageName}
                                onChangeText={setDamageName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Description *</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                placeholder="Describe the damage..."
                                placeholderTextColor={theme.colors.textSecondary}
                                value={damageDescription}
                                onChangeText={setDamageDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Upload Picture</Text>
                            {damageImage ? (
                                <View style={styles.imagePreview}>
                                    <Image source={{ uri: damageImage }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeImage}
                                        onPress={() => setDamageImage(null)}
                                    >
                                        <Ionicons name="close-circle" size={28} color={theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.uploadOptions}>
                                    <TouchableOpacity style={styles.uploadOption} onPress={handleTakePhoto}>
                                        <Ionicons name="camera" size={24} color={theme.colors.primary} />
                                        <Text style={styles.uploadOptionText}>Camera</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.uploadOption} onPress={handlePickImage}>
                                        <Ionicons name="images" size={24} color={theme.colors.primary} />
                                        <Text style={styles.uploadOptionText}>Photos</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.saveDamageButton} onPress={handleSaveDamage}>
                            <Text style={styles.saveDamageButtonText}>Save Damage</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
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
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    damageCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    damageImage: {
        width: 80,
        height: 80,
    },
    damageInfo: {
        flex: 1,
        padding: 12,
    },
    damageName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    damageMaterial: {
        fontSize: 13,
        color: theme.colors.error,
        marginTop: 2,
    },
    damageDesc: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    addDamagesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: theme.colors.error,
        borderStyle: 'dashed',
        gap: 8,
    },
    addDamagesText: {
        fontSize: 16,
        fontWeight: '600',
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
    reportedButton: {
        backgroundColor: theme.colors.success,
    },
    reportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
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
    materialOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    materialOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    materialOptionCode: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    formContent: {
        flex: 1,
        padding: 16,
    },
    selectedMaterial: {
        backgroundColor: theme.colors.cardBg,
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedMaterialLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    selectedMaterialName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginTop: 4,
    },
    formGroup: {
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    textArea: {
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
        backgroundColor: theme.colors.cardBg,
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
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
    },
    saveDamageButton: {
        backgroundColor: theme.colors.error,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveDamageButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
