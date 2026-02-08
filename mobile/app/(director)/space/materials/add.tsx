import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { materialsApi, MaterialCategory, UnitOfMeasure } from '../../../../src/api/materials.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#10B981',
        error: '#EF4444',
    }
};

export default function AddMaterial() {
    const router = useRouter();

    // Form fields
    const [name, setName] = useState('');
    const [specification, setSpecification] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [color, setColor] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [saving, setSaving] = useState(false);

    // Autocomplete data
    const [categories, setCategories] = useState<MaterialCategory[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Autocomplete suggestions
    const [categorySuggestions, setCategorySuggestions] = useState<MaterialCategory[]>([]);
    const [unitSuggestions, setUnitSuggestions] = useState<UnitOfMeasure[]>([]);
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);

    // Selected IDs (for matching existing records)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const [categoriesData, unitsData] = await Promise.all([
                materialsApi.getCategories(),
                materialsApi.getUnits(),
            ]);
            setCategories(categoriesData);
            setUnits(unitsData);
        } catch (error) {
            console.error('Failed to load form data:', error);
            Alert.alert('Error', 'Failed to load categories and units');
        } finally {
            setLoadingData(false);
        }
    };

    // Category autocomplete handlers
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

    const selectCategory = (cat: MaterialCategory) => {
        setCategory(cat.name);
        setSelectedCategoryId(cat.id);
        setShowCategorySuggestions(false);
    };

    // Unit autocomplete handlers
    const handleUnitChange = (text: string) => {
        setUnit(text);
        setSelectedUnitId(null);

        if (text.length >= 1) {
            const filtered = units.filter(u =>
                u.name.toLowerCase().includes(text.toLowerCase()) ||
                u.abbreviation.toLowerCase().includes(text.toLowerCase())
            );
            setUnitSuggestions(filtered);
            setShowUnitSuggestions(filtered.length > 0);
        } else {
            setUnitSuggestions([]);
            setShowUnitSuggestions(false);
        }
    };

    const selectUnit = (u: UnitOfMeasure) => {
        setUnit(`${u.name} (${u.abbreviation})`);
        setSelectedUnitId(u.id);
        setShowUnitSuggestions(false);
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Required', 'Material Name is required');
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

        // Find matching category and unit if not already selected
        let finalCategoryId = selectedCategoryId;
        let finalUnitId = selectedUnitId;

        if (!finalCategoryId) {
            const matchedCategory = categories.find(c =>
                c.name.toLowerCase() === category.toLowerCase()
            );
            finalCategoryId = matchedCategory?.id || null;
        }

        if (!finalUnitId) {
            const matchedUnit = units.find(u =>
                u.name.toLowerCase() === unit.toLowerCase() ||
                u.abbreviation.toLowerCase() === unit.toLowerCase() ||
                `${u.name} (${u.abbreviation})`.toLowerCase() === unit.toLowerCase()
            );
            finalUnitId = matchedUnit?.id || null;
        }

        // If no matching IDs found, show error
        if (!finalCategoryId) {
            Alert.alert('Invalid Category', 'Please select a category from the suggestions or enter an existing category name.');
            return;
        }
        if (!finalUnitId) {
            Alert.alert('Invalid Unit', 'Please select a unit from the suggestions or enter an existing unit name.');
            return;
        }

        setSaving(true);
        try {
            await materialsApi.create({
                name: name.trim(),
                specification: specification.trim() || undefined,
                dimensions: dimensions.trim() || undefined,
                color: color.trim() || undefined,
                itemGroupId: finalCategoryId,
                uomId: finalUnitId,
            });
            Alert.alert('Success', 'Material added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Failed to create material:', error);
            const message = error?.response?.data?.message || 'Failed to add material';
            Alert.alert('Error', message);
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                {/* Material Name - Required */}
                <View style={styles.field}>
                    <Text style={styles.label}>Material Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter material name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Specification */}
                <View style={styles.field}>
                    <Text style={styles.label}>Specification</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Fe 500D, OPC 53 Grade"
                        value={specification}
                        onChangeText={setSpecification}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Dimensions/Size */}
                <View style={styles.field}>
                    <Text style={styles.label}>Dimensions / Size</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 12mm x 12m, 50 kg bags"
                        value={dimensions}
                        onChangeText={setDimensions}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Color */}
                <View style={styles.field}>
                    <Text style={styles.label}>Colour</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Black, Grey, White"
                        value={color}
                        onChangeText={setColor}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

                {/* Category with Autocomplete - Required */}
                <View style={[styles.field, { zIndex: 20 }]}>
                    <Text style={styles.label}>Category *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type to search categories"
                        value={category}
                        onChangeText={handleCategoryChange}
                        placeholderTextColor={theme.colors.textSecondary}
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
                        <View style={styles.suggestions}>
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

                {/* Unit with Autocomplete - Required */}
                <View style={[styles.field, { zIndex: 10 }]}>
                    <Text style={styles.label}>Unit *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type to search units"
                        value={unit}
                        onChangeText={handleUnitChange}
                        placeholderTextColor={theme.colors.textSecondary}
                        onFocus={() => {
                            if (unit.length >= 1) {
                                const filtered = units.filter(u =>
                                    u.name.toLowerCase().includes(unit.toLowerCase()) ||
                                    u.abbreviation.toLowerCase().includes(unit.toLowerCase())
                                );
                                setUnitSuggestions(filtered);
                                setShowUnitSuggestions(filtered.length > 0);
                            }
                        }}
                        onBlur={() => setTimeout(() => setShowUnitSuggestions(false), 200)}
                    />
                    {showUnitSuggestions && (
                        <View style={styles.suggestions}>
                            {unitSuggestions.slice(0, 5).map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.suggestionItem}
                                    onPress={() => selectUnit(u)}
                                >
                                    <Text style={styles.suggestionText}>{u.name} ({u.abbreviation})</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="save" size={20} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Save Material</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1, padding: 16 },
    field: { marginBottom: 20, position: 'relative' },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    input: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary,
    },
    suggestions: {
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
    suggestionText: { fontSize: 15, color: theme.colors.textPrimary },
    footer: {
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
