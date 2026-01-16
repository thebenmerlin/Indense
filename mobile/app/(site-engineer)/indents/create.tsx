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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { materialsApi, indentsApi } from '../../../src/api';
import { MaterialSuggestion, CreateIndentPayload } from '../../../src/types';

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
    requestedQty: string;
    notes: string;
}

export default function CreateIndent() {
    const [suggestions, setSuggestions] = useState<MaterialSuggestion[]>([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<IndentItemData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced autocomplete search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Don't search if less than 2 characters
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Debounce: wait 300ms before searching
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

    const addItem = (material: MaterialSuggestion) => {
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
            requestedQty: '',
            notes: '',
        }]);
        setSearchQuery('');
        setSuggestions([]);
    };

    const removeItem = (materialId: string) => {
        setItems(items.filter(i => i.materialId !== materialId));
    };

    const updateItemQty = (materialId: string, qty: string) => {
        setItems(items.map(i =>
            i.materialId === materialId ? { ...i, requestedQty: qty } : i
        ));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            Alert.alert('No Items', 'Please add at least one material');
            return;
        }

        const invalidItems = items.filter(
            i => !i.requestedQty || parseFloat(i.requestedQty) <= 0
        );
        if (invalidItems.length > 0) {
            Alert.alert('Invalid Quantity', 'Please enter valid quantities for all items');
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateIndentPayload = {
                notes: notes || undefined,
                items: items.map(i => ({
                    materialId: i.materialId,
                    requestedQty: parseFloat(i.requestedQty),
                    notes: i.notes || undefined,
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
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Materials</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Type material name (min 2 chars)..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                    />
                    {searching && (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchSpinner} />
                    )}
                </View>
                <Text style={styles.hintText}>
                    💡 Start typing to search from 3,800+ materials
                </Text>

                {suggestions.length > 0 && (
                    <View style={styles.searchResults}>
                        {suggestions.map(material => (
                            <TouchableOpacity
                                key={material.id}
                                style={styles.searchItem}
                                onPress={() => addItem(material)}
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

            {items.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Selected Items ({items.length})</Text>
                    {items.map(item => (
                        <View key={item.materialId} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.materialName} numberOfLines={2}>{item.materialName}</Text>
                                    <View style={styles.materialMeta}>
                                        <Text style={styles.materialCode}>{item.materialCode}</Text>
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
                            <View style={styles.qtyRow}>
                                <Text style={styles.qtyLabel}>Quantity ({item.unitName}):</Text>
                                <TextInput
                                    style={styles.qtyInput}
                                    placeholder="Enter qty"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    keyboardType="numeric"
                                    value={item.requestedQty}
                                    onChangeText={(v) => updateItemQty(item.materialId, v)}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                    style={styles.notesInput}
                    placeholder="Add any notes or special instructions..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, (submitting || items.length === 0) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || items.length === 0}
            >
                {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <>
                        <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>Submit Indent</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
    hintText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 8,
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
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    removeButton: {
        padding: 4,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginRight: 12,
    },
    qtyInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notesInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 100,
        textAlignVertical: 'top',
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
