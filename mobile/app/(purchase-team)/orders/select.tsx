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
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ordersApi } from '../../../src/api';
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
    const [creatingOrder, setCreatingOrder] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [siteFilter, setSiteFilter] = useState('all');
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();

    const fetchIndents = useCallback(async () => {
        try {
            setLoading(true);
            // Use orders API to get approved indents with proper filters
            const response = await ordersApi.getApprovedIndents({
                siteId: siteFilter !== 'all' ? siteFilter : undefined,
                fromDate: fromDate?.toISOString(),
                toDate: toDate?.toISOString(),
                limit: 100,
            });

            setIndents(response.data);

            // Extract unique sites for filter
            const uniqueSites = new Map<string, string>();
            response.data.forEach(i => {
                if (i.site?.id && i.site?.name) {
                    uniqueSites.set(i.site.id, i.site.name);
                }
            });
            setSites(Array.from(uniqueSites, ([id, name]) => ({ id, name })));
        } catch (error) {
            console.error('Failed to fetch indents:', error);
            Alert.alert('Error', 'Failed to load approved indents');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [siteFilter, fromDate, toDate]);

    useEffect(() => {
        fetchIndents();
    }, [fetchIndents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const handleSelectIndent = async (indent: Indent) => {
        setCreatingOrder(indent.id);
        try {
            // Create order from indent
            const order = await ordersApi.create({
                indentId: indent.id,
                items: (indent.items || []).map(item => ({
                    indentItemId: item.id, // Link to source indent item for damage reorder tracking
                    materialName: item.material?.name || 'Unknown',
                    materialCode: item.material?.code || '',
                    specifications: item.material?.specifications ? JSON.stringify(item.material.specifications) : null,
                    quantity: item.requestedQty,
                })),
            });

            // Navigate to order detail with the new order ID
            router.push(`/(purchase-team)/orders/${order.id}` as any);
        } catch (error: any) {
            console.error('Failed to create order:', error);
            const message = error?.response?.data?.message || 'Failed to create order';
            Alert.alert('Error', message);
        } finally {
            setCreatingOrder(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatFilterDate = (date: Date | null) => {
        if (!date) return 'Select...';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleFromDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowFromPicker(false);
        if (selectedDate) {
            setFromDate(selectedDate);
        }
    };

    const handleToDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowToPicker(false);
        if (selectedDate) {
            setToDate(selectedDate);
        }
    };

    const resetFilters = () => {
        setSiteFilter('all');
        setFromDate(null);
        setToDate(null);
    };

    const applyFilters = () => {
        setShowFilters(false);
        setLoading(true);
    };

    const activeFilterCount = () => {
        let count = 0;
        if (siteFilter !== 'all') count++;
        if (fromDate) count++;
        if (toDate) count++;
        return count;
    };

    const renderIndent = ({ item }: { item: Indent }) => {
        const isCreating = creatingOrder === item.id;

        return (
            <TouchableOpacity
                onPress={() => handleSelectIndent(item)}
                activeOpacity={0.7}
                disabled={isCreating}
            >
                <View style={[styles.card, isCreating && styles.cardDisabled]}>
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
                            {isCreating ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilters(true)}>
                <View style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    <Text style={styles.filterText}>Filter</Text>
                    {activeFilterCount() > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount()}</Text>
                        </View>
                    )}
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
                        {/* Site Filter */}
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

                        {/* Date Range */}
                        <Text style={styles.filterLabel}>Date Range</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Text style={styles.dateLabel}>From</Text>
                                <Text style={styles.dateValue}>{formatFilterDate(fromDate)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowToPicker(true)}
                            >
                                <Text style={styles.dateLabel}>To</Text>
                                <Text style={styles.dateValue}>{formatFilterDate(toDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate || new Date()}
                                mode="date"
                                onChange={handleFromDateChange}
                            />
                        )}
                        {showToPicker && (
                            <DateTimePicker
                                value={toDate || new Date()}
                                mode="date"
                                onChange={handleToDateChange}
                            />
                        )}
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
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
    filterBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
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
    cardDisabled: { opacity: 0.6 },
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
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateButton: {
        flex: 1,
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 12,
    },
    dateLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    dateValue: { fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
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
