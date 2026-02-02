import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
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

const CATEGORIES = ['All', 'Structural', 'Plumbing', 'Electrical', 'Finishing', 'Hardware', 'Other'];

export default function MaterialsList() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [category, setCategory] = useState('All');
    const router = useRouter();

    const fetchMaterials = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            const mockData: Material[] = [
                { id: '1', name: 'TMT Steel Bars', specification: 'Fe 500D', dimensions: '12mm x 12m', color: 'Black', category: 'Structural', unit: 'kg' },
                { id: '2', name: 'Cement', specification: 'OPC 53 Grade', dimensions: '50 kg bags', color: 'Grey', category: 'Structural', unit: 'bags' },
                { id: '3', name: 'PVC Pipes', specification: 'Schedule 40', dimensions: '4 inch x 6m', color: 'White', category: 'Plumbing', unit: 'pieces' },
                { id: '4', name: 'Electrical Wire', specification: 'FRLS', dimensions: '2.5 sqmm', color: 'Red', category: 'Electrical', unit: 'meter' },
                { id: '5', name: 'Wall Tiles', specification: 'Vitrified', dimensions: '600x600mm', color: 'Beige', category: 'Finishing', unit: 'sqft' },
            ];
            setMaterials(mockData);
            setFilteredMaterials(mockData);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    useEffect(() => {
        let filtered = [...materials];

        // Filter by category
        if (category !== 'All') {
            filtered = filtered.filter(m => m.category === category);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.category.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

        setFilteredMaterials(filtered);
    }, [materials, searchQuery, sortBy, category]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMaterials();
    };

    const renderMaterial = ({ item }: { item: Material }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/space/materials/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <Ionicons name="cube" size={22} color={theme.colors.accent} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.materialName}>{item.name}</Text>
                <Text style={styles.materialCategory}>{item.category}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Add Material Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(director)/space/materials/add' as any)}
            >
                <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Material</Text>
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            {/* Filters */}
            <View style={styles.filtersRow}>
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Sort by</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={sortBy}
                            onValueChange={setSortBy}
                            style={styles.picker}
                        >
                            <Picker.Item label="Name" value="name" />
                            <Picker.Item label="Category" value="category" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Category</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            {CATEGORIES.map(cat => (
                                <Picker.Item key={cat} label={cat} value={cat} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredMaterials}
                keyExtractor={item => item.id}
                renderItem={renderMaterial}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No materials found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent,
        margin: 16,
        marginBottom: 8,
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 15,
        color: theme.colors.textPrimary,
    },
    filtersRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 8,
        gap: 10,
    },
    filterItem: { flex: 1 },
    filterLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
    pickerWrapper: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    picker: { height: 44, marginTop: -8, marginBottom: -8 },
    list: { padding: 16, paddingTop: 8 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: theme.colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    materialCategory: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
