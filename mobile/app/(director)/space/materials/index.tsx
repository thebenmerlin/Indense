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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { materialsApi, Material, MaterialCategory } from '../../../../src/api/materials.api';

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

export default function MaterialsList() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [categories, setCategories] = useState<MaterialCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const router = useRouter();

    // Fetch categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await materialsApi.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        loadCategories();
    }, []);

    const fetchMaterials = useCallback(async (resetPage = true) => {
        try {
            const currentPage = resetPage ? 1 : page;
            const response = await materialsApi.getAll({
                page: currentPage,
                limit: 20,
                itemGroupId: selectedCategory || undefined,
                search: searchQuery || undefined,
            });

            const sortedData = [...response.data].sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'category') return (a.itemGroup?.name || '').localeCompare(b.itemGroup?.name || '');
                return 0;
            });

            if (resetPage) {
                setMaterials(sortedData);
                setPage(1);
            } else {
                setMaterials(prev => [...prev, ...sortedData]);
            }
            setHasMore(response.pagination.hasNext);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [page, selectedCategory, searchQuery, sortBy]);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            fetchMaterials(true);
        }, [selectedCategory, searchQuery, sortBy])
    );

    // Re-fetch when filters change
    useEffect(() => {
        if (!loading) {
            setLoading(true);
            fetchMaterials(true);
        }
    }, [selectedCategory, searchQuery, sortBy]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMaterials(true);
    };

    const loadMore = () => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true);
            setPage(prev => prev + 1);
            fetchMaterials(false);
        }
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
                <Text style={styles.materialCategory}>{item.itemGroup?.name || 'Uncategorized'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

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
                            onValueChange={(v) => setSortBy(v as 'name' | 'category')}
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
                            selectedValue={selectedCategory}
                            onValueChange={setSelectedCategory}
                            style={styles.picker}
                        >
                            <Picker.Item label="All" value="" />
                            {categories.map(cat => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={renderMaterial}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
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
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
});
