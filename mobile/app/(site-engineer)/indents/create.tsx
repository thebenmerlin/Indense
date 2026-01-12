import React, { useEffect, useState } from 'react';
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
import { Material, CreateIndentPayload } from '../../../src/types';

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
    }
};

interface IndentItemData {
    materialId: string;
    materialName: string;
    materialCode: string;
    unit: string;
    requestedQty: string;
    notes: string;
}

export default function CreateIndent() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<IndentItemData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await materialsApi.getAll({ limit: 100 });
            setMaterials(response.data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = (material: Material) => {
        if (items.find(i => i.materialId === material.id)) {
            Alert.alert('Already Added', 'This material is already in your indent');
            return;
        }
        setItems([...items, {
            materialId: material.id,
            materialName: material.name,
            materialCode: material.code,
            unit: material.unit,
            requestedQty: '',
            notes: '',
        }]);
        setSearchQuery('');
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

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Materials</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search materials..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {searchQuery && (
                    <View style={styles.searchResults}>
                        {filteredMaterials.slice(0, 5).map(material => (
                            <TouchableOpacity
                                key={material.id}
                                style={styles.searchItem}
                                onPress={() => addItem(material)}
                            >
                                <View>
                                    <Text style={styles.materialName}>{material.name}</Text>
                                    <Text style={styles.materialCode}>{material.code} • {material.unit}</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
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
                                    <Text style={styles.materialName}>{item.materialName}</Text>
                                    <Text style={styles.materialCode}>{item.materialCode}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeItem(item.materialId)}>
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.qtyRow}>
                                <Text style={styles.qtyLabel}>Quantity ({item.unit}):</Text>
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
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Text style={styles.submitButtonText}>Submit Indent</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    searchInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchResults: {
        marginTop: 8,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    materialName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    materialCode: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
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
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notesInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        marginHorizontal: 16,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.textSecondary,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
