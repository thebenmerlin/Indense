import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

interface Material {
    id: string;
    materialId: string;
    materialName: string;
    materialCode: string;
    unit: string;
    quantity: number;
}

export default function CreateIndent() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const searchMaterials = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/materials/autocomplete?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setSearchResults(data.data || []);
            }
        } catch (e) {
            console.warn('Search error:', e);
        } finally {
            setSearching(false);
        }
    };

    const addMaterial = (material: any) => {
        if (materials.find(m => m.materialId === material.id)) {
            Alert.alert('Already Added', 'This material is already in the list');
            return;
        }

        setMaterials([...materials, {
            id: Date.now().toString(),
            materialId: material.id,
            materialName: material.name,
            materialCode: material.code,
            unit: material.unit?.code || 'PCS',
            quantity: 1,
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateQuantity = (id: string, qty: number) => {
        setMaterials(materials.map(m =>
            m.id === id ? { ...m, quantity: Math.max(1, qty) } : m
        ));
    };

    const removeMaterial = (id: string) => {
        setMaterials(materials.filter(m => m.id !== id));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter an indent name');
            return;
        }
        if (materials.length === 0) {
            Alert.alert('Error', 'Please add at least one material');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    items: materials.map(m => ({
                        materialId: m.materialId,
                        requestedQty: m.quantity,
                    })),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Indent submitted successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', data.error || 'Failed to submit indent');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>New Indent</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                    <Text style={styles.submitButton}>
                        {submitting ? '...' : 'Submit'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Indent Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Steel for Foundation"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Optional notes..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Search Materials</Text>
                    <TextInput
                        style={styles.input}
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            searchMaterials(text);
                        }}
                        placeholder="Type to search materials..."
                        placeholderTextColor="#9CA3AF"
                    />

                    {searching && <ActivityIndicator style={styles.searching} />}

                    {searchResults.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.searchResult}
                            onPress={() => addMaterial(item)}
                        >
                            <Text style={styles.resultName}>{item.name}</Text>
                            <Text style={styles.resultCode}>{item.code}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Selected Materials ({materials.length})</Text>

                    {materials.length === 0 ? (
                        <Text style={styles.noMaterials}>No materials added yet</Text>
                    ) : (
                        materials.map((item) => (
                            <View key={item.id} style={styles.materialCard}>
                                <View style={styles.materialInfo}>
                                    <Text style={styles.materialName}>{item.materialName}</Text>
                                    <Text style={styles.materialCode}>{item.materialCode}</Text>
                                </View>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Text style={styles.qtyButtonText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Text style={styles.qtyButtonText}>+</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.unit}>{item.unit}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeMaterial(item.id)}
                                >
                                    <Text style={styles.removeText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    submitButton: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    searching: {
        marginTop: 8,
    },
    searchResult: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    resultName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    resultCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    noMaterials: {
        textAlign: 'center',
        color: '#9CA3AF',
        paddingVertical: 24,
    },
    materialCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    materialInfo: {
        flex: 1,
    },
    materialName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    materialCode: {
        fontSize: 12,
        color: '#6B7280',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyButton: {
        width: 28,
        height: 28,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    unit: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    removeButton: {
        marginLeft: 12,
        padding: 4,
    },
    removeText: {
        fontSize: 16,
        color: '#EF4444',
    },
});
