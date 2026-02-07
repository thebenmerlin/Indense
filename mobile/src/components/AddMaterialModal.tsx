import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    id: string;
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
    // Form fields
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [colour, setColour] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    // Autocomplete data
    const [categories, setCategories] = useState<ItemGroup[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loading, setLoading] = useState(true);

    // Autocomplete suggestions
    const [categorySuggestions, setCategorySuggestions] = useState<ItemGroup[]>([]);
    const [unitSuggestions, setUnitSuggestions] = useState<UnitOfMeasure[]>([]);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);

    // Selected IDs (optional - for matching existing records)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

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
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (text: string) => {
        setCategory(text);
        setSelectedCategoryId(null);

        if (text.length >= 1) {
            const filtered = categories.filter(c =>
                c.name.toLowerCase().includes(text.toLowerCase())
            );
            setCategorySuggestions(filtered);
            setShowCategorySuggestions(filtered.length > 0);
        } else {
            setCategorySuggestions([]);
            setShowCategorySuggestions(false);
        }
    };

    const handleUnitChange = (text: string) => {
        setUnit(text);
        setSelectedUnitId(null);

        if (text.length >= 1) {
            const filtered = units.filter(u =>
                u.name.toLowerCase().includes(text.toLowerCase()) ||
                u.code.toLowerCase().includes(text.toLowerCase())
            );
            setUnitSuggestions(filtered);
            setShowUnitSuggestions(filtered.length > 0);
        } else {
            setUnitSuggestions([]);
            setShowUnitSuggestions(false);
        }
    };

    const selectCategory = (cat: ItemGroup) => {
        setCategory(cat.name);
        setSelectedCategoryId(cat.id);
        setShowCategorySuggestions(false);
    };

    const selectUnit = (u: UnitOfMeasure) => {
        setUnit(`${u.name} (${u.code})`);
        setSelectedUnitId(u.id);
        setShowUnitSuggestions(false);
    };

    const resetForm = () => {
        setName('');
        setSpecification('');
        setDimensions('');
        setColour('');
        setCategory('');
        setUnit('');
        setSelectedCategoryId(null);
        setSelectedUnitId(null);
        setIsUrgent(false);
        setCategorySuggestions([]);
        setUnitSuggestions([]);
    };

    const handleAdd = () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Material name is required');
            return;
        }
        if (!category.trim()) {
            Alert.alert('Required', 'Category is required');
            return;
        }
        if (!unit.trim()) {
            Alert.alert('Required', 'Unit is required');
            return;
        }

        // Find matching category and unit, or use the typed values
        const matchedCategory = categories.find(c =>
            c.name.toLowerCase() === category.toLowerCase()
        );
        const matchedUnit = units.find(u =>
            u.name.toLowerCase() === unit.toLowerCase() ||
            u.code.toLowerCase() === unit.toLowerCase() ||
            `${u.name} (${u.code})`.toLowerCase() === unit.toLowerCase()
        );

        // Extract unit code from the input (e.g., "Kilogram (KG)" -> "KG")
        let unitCode = unit.trim();
        let unitName = unit.trim();
        if (matchedUnit) {
            unitCode = matchedUnit.code;
            unitName = matchedUnit.name;
        } else {
            // If user typed custom, try to parse "Name (Code)" format
            const match = unit.match(/^(.+?)\s*\(([^)]+)\)$/);
            if (match) {
                unitName = match[1].trim();
                unitCode = match[2].trim();
            }
        }

        const newMaterial: NewMaterialData = {
            id: `temp-${Date.now()}`,
            name: name.trim(),
            specification: specification.trim(),
            dimensions: dimensions.trim(),
            colour: colour.trim(),
            categoryId: matchedCategory?.id || '',
            categoryName: matchedCategory?.name || category.trim(),
            unitId: matchedUnit?.id || '',
            unitCode: unitCode,
            unitName: unitName,
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

                        {/* Category with Autocomplete */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type to search or enter new category"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={category}
                                onChangeText={handleCategoryChange}
                                onFocus={() => {
                                    if (category.length >= 1) {
                                        const filtered = categories.filter(c =>
                                            c.name.toLowerCase().includes(category.toLowerCase())
                                        );
                                        setCategorySuggestions(filtered);
                                        setShowCategorySuggestions(filtered.length > 0);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                            />
                            {showCategorySuggestions && (
                                <View style={styles.suggestionsContainer}>
                                    {categorySuggestions.slice(0, 5).map(cat => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={styles.suggestionItem}
                                            onPress={() => selectCategory(cat)}
                                        >
                                            <Text style={styles.suggestionText}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Unit with Autocomplete */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Unit *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type to search or enter new unit"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={unit}
                                onChangeText={handleUnitChange}
                                onFocus={() => {
                                    if (unit.length >= 1) {
                                        const filtered = units.filter(u =>
                                            u.name.toLowerCase().includes(unit.toLowerCase()) ||
                                            u.code.toLowerCase().includes(unit.toLowerCase())
                                        );
                                        setUnitSuggestions(filtered);
                                        setShowUnitSuggestions(filtered.length > 0);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowUnitSuggestions(false), 200)}
                            />
                            {showUnitSuggestions && (
                                <View style={styles.suggestionsContainer}>
                                    {unitSuggestions.slice(0, 5).map(u => (
                                        <TouchableOpacity
                                            key={u.id}
                                            style={styles.suggestionItem}
                                            onPress={() => selectUnit(u)}
                                        >
                                            <Text style={styles.suggestionText}>{u.name} ({u.code})</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
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
        position: 'relative',
        zIndex: 1,
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
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: 4,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    suggestionText: {
        fontSize: 15,
        color: theme.colors.textPrimary,
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
