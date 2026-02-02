import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
    }
};

export default function SelectIndentForOrder() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [siteFilter, setSiteFilter] = useState('all');
    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();

    const fetchIndents = useCallback(async () => {
        try {
            // Fetch DIRECTOR_APPROVED indents (ready for purchase)
            const response = await indentsApi.getAll({ status: 'DIRECTOR_APPROVED', limit: 100 });
            let data = response.data;

            if (siteFilter !== 'all') {
                data = data.filter(i => i.site?.id === siteFilter);
            }

            // Extract unique sites
            const uniqueSites = new Map<string, string>();
            response.data.forEach(i => {
                if (i.site?.id && i.site?.name) {
                    uniqueSites.set(i.site.id, i.site.name);
                }
            });
            setSites(Array.from(uniqueSites, ([id, name]) => ({ id, name })));

            setIndents(data);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [siteFilter]);

    useEffect(() => {
        fetchIndents();
    }, [fetchIndents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(purchase-team)/orders/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardMain}>
                    <View style={styles.cardLeft}>
                        <Text style={styles.indentName} numberOfLines={1}>
                            {item.name || item.indentNumber}
                        </Text>
                        <Text style={styles.engineerName}>
                            <Ionicons name="person-outline" size={12} /> {item.createdBy?.name}
                        </Text>
                        <Text style={styles.siteName}>
                            <Ionicons name="location-outline" size={12} /> {item.site?.name}
                        </Text>
                        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.cardRight}>
                        <View style={styles.approvedBadge}>
                            <Ionicons name="checkmark-done" size={14} color={theme.colors.success} />
                            <Text style={styles.approvedText}>Approved</Text>
                        </View>
                        <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </View>
                </View>
            </View>
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
            <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilters(true)}>
                <View style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    <Text style={styles.filterText}>Filter</Text>
                </View>
                <Text style={styles.countText}>{indents.length} approved indent{indents.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>

            <FlatList
                data={indents}
                keyExtractor={item => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No approved indents</Text>
                        <Text style={styles.emptySubtext}>Indents need Director approval before purchase</Text>
                    </View>
                }
            />

            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalContent}>
                        <Text style={styles.filterLabel}>Site</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={siteFilter}
                                onValueChange={setSiteFilter}
                            >
                                <Picker.Item label="All Sites" value="all" />
                                {sites.map(site => (
                                    <Picker.Item key={site.id} label={site.name} value={site.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.resetButton} onPress={() => setSiteFilter('all')}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={() => { setShowFilters(false); setLoading(true); }}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: 20,
        gap: 6,
    },
    filterText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
    countText: { fontSize: 14, color: theme.colors.textSecondary },
    list: { padding: 16 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardMain: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end' },
    indentName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
    engineerName: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
    siteName: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 2 },
    date: { fontSize: 12, color: theme.colors.textSecondary },
    approvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        marginBottom: 4,
    },
    approvedText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },
    itemCount: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
    emptySubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
    modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { flex: 1, padding: 16 },
    filterLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8, marginTop: 16 },
    pickerContainer: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
    },
    resetButton: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    resetButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    applyButton: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center' },
    applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
