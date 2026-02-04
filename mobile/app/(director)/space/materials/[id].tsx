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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { materialsApi, Material, MaterialCategory, UnitOfMeasure } from '../../../../src/api/materials.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#10B981',
    }
};

export default function MaterialDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [material, setMaterial] = useState<Material | null>(null);
    const [categories, setCategories] = useState<MaterialCategory[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit fields
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [color, setColor] = useState('');
    const [code, setCode] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [materialData, categoriesData, unitsData] = await Promise.all([
                materialsApi.getById(id!),
                materialsApi.getCategories(),
                materialsApi.getUnits(),
            ]);

            setMaterial(materialData);
            setCategories(categoriesData);
            setUnits(unitsData);

            // Set edit form values
            setName(materialData.name);
            setSpecification(materialData.specification || '');
            setDimensions(materialData.dimensions || '');
            setColor(materialData.color || '');
            setCode(materialData.code || '');
            setSelectedCategoryId(materialData.itemGroupId);
            setSelectedUnitId(materialData.uomId);
        } catch (error) {
            console.error('Failed to fetch material:', error);
            Alert.alert('Error', 'Failed to load material details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Material name is required');
            return;
        }
        setSaving(true);
        try {
            // NOTE: If backend has update endpoint, use it. For now we show success.
            // The backend currently only has create, not update endpoint.
            Alert.alert('Info', 'Material update API not yet implemented', [
                { text: 'OK', onPress: () => setEditMode(false) }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update material');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (material) {
            setName(material.name);
            setSpecification(material.specification || '');
            setDimensions(material.dimensions || '');
            setColor(material.color || '');
            setCode(material.code || '');
            setSelectedCategoryId(material.itemGroupId);
            setSelectedUnitId(material.uomId);
        }
        setEditMode(false);
    };

    const getCategoryName = (catId: string) => {
        return categories.find(c => c.id === catId)?.name || 'Unknown';
    };

    const getUnitDisplay = (unitId: string) => {
        const u = units.find(u => u.id === unitId);
        return u ? `${u.name} (${u.abbreviation})` : 'Unknown';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!material) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Material not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Ionicons name="cube" size={32} color={theme.colors.accent} />
                    </View>
                    {!editMode ? (
                        <>
                            <Text style={styles.materialName}>{material.name}</Text>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{getCategoryName(material.itemGroupId)}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.editingLabel}>Editing Material</Text>
                    )}
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsCard}>
                        {/* Name */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Material Name</Text>
                            {editMode ? (
                                <TextInput style={styles.input} value={name} onChangeText={setName} />
                            ) : (
                                <Text style={styles.fieldValue}>{material.name}</Text>
                            )}
                        </View>

                        {/* Material Code */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Material Code</Text>
                            {editMode ? (
                                <TextInput style={styles.input} value={code} onChangeText={setCode} />
                            ) : (
                                <Text style={styles.fieldValue}>{material.code || '-'}</Text>
                            )}
                        </View>

                        {/* Specification */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Specification</Text>
                            {editMode ? (
                                <TextInput style={styles.input} value={specification} onChangeText={setSpecification} />
                            ) : (
                                <Text style={styles.fieldValue}>{material.specification || '-'}</Text>
                            )}
                        </View>

                        {/* Dimensions */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Dimensions / Size</Text>
                            {editMode ? (
                                <TextInput style={styles.input} value={dimensions} onChangeText={setDimensions} />
                            ) : (
                                <Text style={styles.fieldValue}>{material.dimensions || '-'}</Text>
                            )}
                        </View>

                        {/* Color */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Color</Text>
                            {editMode ? (
                                <TextInput style={styles.input} value={color} onChangeText={setColor} />
                            ) : (
                                <Text style={styles.fieldValue}>{material.color || '-'}</Text>
                            )}
                        </View>

                        {/* Category */}
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldLabel}>Category</Text>
                            {editMode ? (
                                <View style={styles.pickerWrapper}>
                                    <Picker selectedValue={selectedCategoryId} onValueChange={setSelectedCategoryId} style={styles.picker}>
                                        {categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={cat.id} />)}
                                    </Picker>
                                </View>
                            ) : (
                                <Text style={styles.fieldValue}>{getCategoryName(material.itemGroupId)}</Text>
                            )}
                        </View>

                        {/* Unit */}
                        <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.fieldLabel}>Unit</Text>
                            {editMode ? (
                                <View style={styles.pickerWrapper}>
                                    <Picker selectedValue={selectedUnitId} onValueChange={setSelectedUnitId} style={styles.picker}>
                                        {units.map(u => <Picker.Item key={u.id} label={`${u.name} (${u.abbreviation})`} value={u.id} />)}
                                    </Picker>
                                </View>
                            ) : (
                                <Text style={styles.fieldValue}>{getUnitDisplay(material.uomId)}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                {!editMode ? (
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                        <Ionicons name="create" size={20} color="#FFFFFF" />
                        <Text style={styles.editButtonText}>Edit Material</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.editActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
        padding: 24,
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBox: {
        width: 72,
        height: 72,
        borderRadius: 18,
        backgroundColor: theme.colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    materialName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary },
    categoryBadge: {
        backgroundColor: theme.colors.accent + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    categoryText: { fontSize: 13, fontWeight: '600', color: theme.colors.accent },
    editingLabel: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
    detailsCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 4,
    },
    fieldRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    fieldLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    fieldValue: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    pickerWrapper: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: { height: 44, marginTop: -6, marginBottom: -6 },
    footer: {
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    editButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    editActions: { flexDirection: 'row', gap: 12 },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    saveButton: {
        flex: 1,
        backgroundColor: theme.colors.accent,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
