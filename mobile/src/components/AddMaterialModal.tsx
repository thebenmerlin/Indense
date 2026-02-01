import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { materialsApi } from '../api';
import { ItemGroup, UnitOfMeasure } from '../types';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
    }
};

export interface NewMaterialData {
    id: string; // Temporary ID for local state
    name: string;
    specification: string;
    dimensions: string;
    colour: string;
    categoryId: string;
    categoryName: string;
    unitId: string;
    unitCode: string;
    unitName: string;
    isUrgent: boolean;
}

interface AddMaterialModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (material: NewMaterialData) => void;
}

export default function AddMaterialModal({ visible, onClose, onAdd }: AddMaterialModalProps) {
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [colour, setColour] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    const [categories, setCategories] = useState<ItemGroup[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            loadDropdownData();
        }
    }, [visible]);

    const loadDropdownData = async () => {
        setLoading(true);
        try {
            const [cats, uoms] = await Promise.all([
                materialsApi.getCategories(),
                materialsApi.getUnits(),
            ]);
            setCategories(cats);
            setUnits(uoms);
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
            Alert.alert('Error', 'Failed to load categories and units');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setSpecification('');
        setDimensions('');
        setColour('');
        setCategoryId('');
        setUnitId('');
        setIsUrgent(false);
    };

    const handleAdd = () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Material name is required');
            return;
        }
        if (!categoryId) {
            Alert.alert('Required', 'Category is required');
            return;
        }
        if (!unitId) {
            Alert.alert('Required', 'Unit is required');
            return;
        }

        const selectedCategory = categories.find(c => c.id === categoryId);
        const selectedUnit = units.find(u => u.id === unitId);

        const newMaterial: NewMaterialData = {
            id: `temp-${Date.now()}`,
            name: name.trim(),
            specification: specification.trim(),
            dimensions: dimensions.trim(),
            colour: colour.trim(),
            categoryId,
            categoryName: selectedCategory?.name || '',
            unitId,
            unitCode: selectedUnit?.code || '',
            unitName: selectedUnit?.name || '',
            isUrgent,
        };

        onAdd(newMaterial);
        resetForm();
        onClose();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add Material</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
                        {/* Material Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Material Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter material name"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Specification */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Specification</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Grade A, OPC 53"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={specification}
                                onChangeText={setSpecification}
                            />
                        </View>

                        {/* Dimensions/Size */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dimensions/Size</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 12mm, 4 inch"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={dimensions}
                                onChangeText={setDimensions}
                            />
                        </View>

                        {/* Colour */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Colour</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Red, Grey"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={colour}
                                onChangeText={setColour}
                            />
                        </View>

                        {/* Category Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={categoryId}
                                    onValueChange={setCategoryId}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select category..." value="" />
                                    {categories.map(cat => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Unit Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Unit *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={unitId}
                                    onValueChange={setUnitId}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select unit..." value="" />
                                    {units.map(unit => (
                                        <Picker.Item
                                            key={unit.id}
                                            label={`${unit.name} (${unit.code})`}
                                            value={unit.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Urgent Toggle */}
                        <View style={styles.urgentRow}>
                            <View style={styles.urgentInfo}>
                                <Ionicons
                                    name="alert-circle"
                                    size={24}
                                    color={isUrgent ? theme.colors.warning : theme.colors.textSecondary}
                                />
                                <View style={styles.urgentText}>
                                    <Text style={styles.urgentLabel}>Mark as Urgent</Text>
                                    <Text style={styles.urgentHint}>This material is needed urgently</Text>
                                </View>
                            </View>
                            <Switch
                                value={isUrgent}
                                onValueChange={setIsUrgent}
                                trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                                thumbColor={isUrgent ? theme.colors.warning : '#f4f3f4'}
                            />
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add Material</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    closeButton: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    pickerContainer: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    urgentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    urgentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    urgentText: {
        marginLeft: 12,
    },
    urgentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    urgentHint: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        marginLeft: 8,
    },
});
