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

interface Material {
    id: string;
    name: string;
    specification: string;
    dimensions: string;
    color: string;
    category: string;
    unit: string;
}

const CATEGORIES = ['Structural', 'Plumbing', 'Electrical', 'Finishing', 'Hardware', 'Other'];
const UNITS = ['kg', 'bags', 'pieces', 'meter', 'sqft', 'sqm', 'liters', 'nos'];

export default function MaterialDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit fields
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [color, setColor] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');

    useEffect(() => {
        fetchMaterial();
    }, [id]);

    const fetchMaterial = async () => {
        try {
            // TODO: Replace with actual API call
            const mockMaterial: Material = {
                id: id!,
                name: 'TMT Steel Bars',
                specification: 'Fe 500D',
                dimensions: '12mm x 12m',
                color: 'Black',
                category: 'Structural',
                unit: 'kg',
            };
            setMaterial(mockMaterial);
            setName(mockMaterial.name);
            setSpecification(mockMaterial.specification);
            setDimensions(mockMaterial.dimensions);
            setColor(mockMaterial.color);
            setCategory(mockMaterial.category);
            setUnit(mockMaterial.unit);
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
            // TODO: API call to update
            await new Promise(resolve => setTimeout(resolve, 500));
            setMaterial({ id: id!, name, specification, dimensions, color, category, unit });
            setEditMode(false);
            Alert.alert('Success', 'Material updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update material');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (material) {
            setName(material.name);
            setSpecification(material.specification);
            setDimensions(material.dimensions);
            setColor(material.color);
            setCategory(material.category);
            setUnit(material.unit);
        }
        setEditMode(false);
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
                                <Text style={styles.categoryText}>{material.category}</Text>
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
                                    <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
                                        {CATEGORIES.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                                    </Picker>
                                </View>
                            ) : (
                                <Text style={styles.fieldValue}>{material.category}</Text>
                            )}
                        </View>

                        {/* Unit */}
                        <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.fieldLabel}>Unit</Text>
                            {editMode ? (
                                <View style={styles.pickerWrapper}>
                                    <Picker selectedValue={unit} onValueChange={setUnit} style={styles.picker}>
                                        {UNITS.map(u => <Picker.Item key={u} label={u} value={u} />)}
                                    </Picker>
                                </View>
                            ) : (
                                <Text style={styles.fieldValue}>{material.unit}</Text>
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
