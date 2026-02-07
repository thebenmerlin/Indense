import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { materialsApi, indentsApi } from '../../../src/api';
import { MaterialSuggestion, CreateIndentPayload } from '../../../src/types';
import AddMaterialModal, { NewMaterialData } from '../../../src/components/AddMaterialModal';

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
        highlight: '#EFF6FF',
    }
};

interface IndentItemData {
    materialId: string;
    materialName: string;
    materialCode: string;
    unitCode: string;
    unitName: string;
    categoryName: string;
    requestedQty: number;
    notes: string;
    isUrgent: boolean;
    isNewMaterial: boolean; // True if created via Add Material popup
    specification?: string;
    dimensions?: string;
    colour?: string;
    categoryId?: string;
    unitId?: string;
}

export default function CreateIndent() {
    // Indent details
    const [indentName, setIndentName] = useState('');
    const [description, setDescription] = useState('');
    const [expectedDate, setExpectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Materials
    const [suggestions, setSuggestions] = useState<MaterialSuggestion[]>([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<IndentItemData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);

    const router = useRouter();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced autocomplete search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await materialsApi.searchAutocomplete(query);
                setSuggestions(results);
            } catch (error) {
                console.error('Search failed:', error);
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const addItemFromSearch = (material: MaterialSuggestion) => {
        if (items.find(i => i.materialId === material.id)) {
            Alert.alert('Already Added', 'This material is already in your indent');
            return;
        }
        setItems([...items, {
            materialId: material.id,
            materialName: material.name,
            materialCode: material.code,
            unitCode: material.unitCode,
            unitName: material.unitName,
            categoryName: material.categoryName,
            requestedQty: 1,
            notes: '',
            isUrgent: false,
            isNewMaterial: false,
        }]);
        setSearchQuery('');
        setSuggestions([]);
    };

    const addNewMaterial = (material: NewMaterialData) => {
        setItems([...items, {
            materialId: material.id,
            materialName: material.name,
            materialCode: '',
            unitCode: material.unitCode,
            unitName: material.unitName,
            categoryName: material.categoryName,
            requestedQty: 1,
            notes: '',
            isUrgent: material.isUrgent,
            isNewMaterial: true,
            specification: material.specification,
            dimensions: material.dimensions,
            colour: material.colour,
            categoryId: material.categoryId,
            unitId: material.unitId,
        }]);
    };

    const removeItem = (materialId: string) => {
        setItems(items.filter(i => i.materialId !== materialId));
    };

    const updateItemQty = (materialId: string, delta: number) => {
        setItems(items.map(i => {
            if (i.materialId === materialId) {
                const newQty = Math.max(1, i.requestedQty + delta);
                return { ...i, requestedQty: newQty };
            }
            return i;
        }));
    };

    const toggleUrgent = (materialId: string) => {
        setItems(items.map(i =>
            i.materialId === materialId ? { ...i, isUrgent: !i.isUrgent } : i
        ));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setExpectedDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleSubmit = async () => {
        if (!indentName.trim()) {
            Alert.alert('Required', 'Please enter an indent name');
            return;
        }

        if (items.length === 0) {
            Alert.alert('No Items', 'Please add at least one material');
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateIndentPayload = {
                name: indentName.trim(),
                description: description.trim() || undefined,
                expectedDeliveryDate: expectedDate.toISOString(),
                items: items.map(i => ({
                    materialId: i.materialId,
                    requestedQty: i.requestedQty,
                    notes: i.notes || undefined,
                    isUrgent: i.isUrgent,
                    isNewMaterial: i.isNewMaterial,
                    // For new materials, include all the material data
                    newMaterial: i.isNewMaterial ? {
                        name: i.materialName,
                        specification: i.specification || '',
                        dimensions: i.dimensions || '',
                        colour: i.colour || '',
                        categoryId: i.categoryId || '',
                        categoryName: i.categoryName || '',
                        unitId: i.unitId || '',
                        unitCode: i.unitCode || '',
                        unitName: i.unitName || '',
                    } : undefined,
                })),
            };

            await indentsApi.create(payload);
            Alert.alert('Success', 'Indent created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create indent');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            {/* Indent Details Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Indent Details</Text>

                {/* Indent Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Indent Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Foundation Materials - Block A"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={indentName}
                        onChangeText={setIndentName}
                    />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Add any details or notes..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Expected Delivery Date */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Expected Delivery Date</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>{formatDate(expectedDate)}</Text>
                        <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={expectedDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={handleDateChange}
                    />
                )}
            </View>

            {/* Add Materials Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Materials</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search existing materials..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                    {searching && (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchSpinner} />
                    )}
                </View>

                {/* Add Material Button */}
                <TouchableOpacity
                    style={styles.addMaterialButton}
                    onPress={() => setShowAddMaterialModal(true)}
                >
                    <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
                    <Text style={styles.addMaterialText}>Add New Material</Text>
                </TouchableOpacity>

                {/* Search Results */}
                {suggestions.length > 0 && (
                    <View style={styles.searchResults}>
                        {suggestions.map(material => (
                            <TouchableOpacity
                                key={material.id}
                                style={styles.searchItem}
                                onPress={() => addItemFromSearch(material)}
                            >
                                <View style={styles.searchItemContent}>
                                    <Text style={styles.materialName} numberOfLines={2}>{material.name}</Text>
                                    <View style={styles.materialMeta}>
                                        <Text style={styles.materialCode}>{material.code}</Text>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{material.categoryName}</Text>
                                        </View>
                                        <Text style={styles.unitText}>{material.unitCode}</Text>
                                    </View>
                                </View>
                                <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Selected Items */}
            {items.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Selected Materials ({items.length})</Text>
                    {items.map(item => (
                        <View key={item.materialId} style={[styles.itemCard, item.isUrgent && styles.urgentCard]}>
                            <View style={styles.itemHeader}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.materialName} numberOfLines={2}>{item.materialName}</Text>
                                        {item.isUrgent && (
                                            <View style={styles.urgentBadge}>
                                                <Text style={styles.urgentBadgeText}>URGENT</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.materialMeta}>
                                        {item.materialCode ? (
                                            <Text style={styles.materialCode}>{item.materialCode}</Text>
                                        ) : (
                                            <Text style={styles.newMaterialTag}>New Material</Text>
                                        )}
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{item.categoryName}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeItem(item.materialId)}
                                    style={styles.removeButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>

                            {/* Quantity Controls */}
                            <View style={styles.qtyRow}>
                                <Text style={styles.qtyLabel}>Quantity ({item.unitName}):</Text>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => updateItemQty(item.materialId, -1)}
                                    >
                                        <Ionicons name="remove" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyValue}>{item.requestedQty}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => updateItemQty(item.materialId, 1)}
                                    >
                                        <Ionicons name="add" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Urgent Toggle */}
                            <View style={styles.urgentToggleRow}>
                                <Text style={styles.urgentToggleLabel}>Mark as Urgent</Text>
                                <Switch
                                    value={item.isUrgent}
                                    onValueChange={() => toggleUrgent(item.materialId)}
                                    trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                                    thumbColor={item.isUrgent ? theme.colors.warning : '#f4f3f4'}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, (submitting || items.length === 0 || !indentName.trim()) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || items.length === 0 || !indentName.trim()}
            >
                {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <>
                        <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>Create Indent</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />

            {/* Add Material Modal */}
            <AddMaterialModal
                visible={showAddMaterialModal}
                onClose={() => setShowAddMaterialModal(false)}
                onAdd={addNewMaterial}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    searchSpinner: {
        marginLeft: 8,
    },
    addMaterialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.highlight,
        borderRadius: 10,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    addMaterialText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        marginLeft: 8,
    },
    searchResults: {
        marginTop: 12,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    searchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    searchItemContent: {
        flex: 1,
        marginRight: 12,
    },
    materialName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    materialMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    materialCode: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
    },
    badge: {
        backgroundColor: theme.colors.highlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    unitText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    newMaterialTag: {
        fontSize: 12,
        color: theme.colors.success,
        fontWeight: '600',
    },
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    urgentCard: {
        borderColor: theme.colors.warning,
        borderWidth: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    urgentBadge: {
        backgroundColor: theme.colors.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    urgentBadgeText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    removeButton: {
        padding: 4,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    qtyLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    qtyButton: {
        padding: 10,
    },
    qtyValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        minWidth: 40,
        textAlign: 'center',
    },
    urgentToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    urgentToggleLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: 16,
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
    submitButtonDisabled: {
        backgroundColor: theme.colors.textSecondary,
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
