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
    Modal,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';

const theme = {
    colors: {
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        primary: '#3B82F6',
        border: '#D1D5DB',
        success: '#10B981',
    }
};

export default function ReceiptsScreen() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [filteredIndents, setFilteredIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Date filter state
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [activeFilter, setActiveFilter] = useState(false);

    const router = useRouter();

    const fetchPurchasedIndents = useCallback(async () => {
        try {
            // Fetch indents that are ordered/purchased (ORDER_PLACED, PARTIALLY_RECEIVED, FULLY_RECEIVED)
            const [orderPlacedRes, partialRes, fullyReceivedRes] = await Promise.all([
                indentsApi.getAll({ limit: 100, status: 'ORDER_PLACED' }),
                indentsApi.getAll({ limit: 100, status: 'PARTIALLY_RECEIVED' }),
                indentsApi.getAll({ limit: 100, status: 'FULLY_RECEIVED' }),
            ]);

            const allIndents = [
                ...orderPlacedRes.data,
                ...partialRes.data,
                ...fullyReceivedRes.data,
            ];

            // Filter for indents that:
            // 1. Have no unresolved damage reports (or no damage reports at all)
            // 2. All items are marked as ARRIVED (not partial or not arrived)
            const readyForReceipts = allIndents.filter(indent => {
                // Check for unresolved damages
                const hasDamages = (indent._count?.damageReports || 0) > 0;

                // Check if all items arrived (all have arrivalStatus = 'ARRIVED')
                const allItemsArrived = indent.items?.every(
                    item => item.arrivalStatus === 'ARRIVED'
                );

                // Show indents that are purchased and either:
                // - Have all items arrived with no damages, OR
                // - Are fully received status (already confirmed)
                return indent.status === 'FULLY_RECEIVED' ||
                    (allItemsArrived && !hasDamages);
            });

            setIndents(readyForReceipts);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchasedIndents();
    }, [fetchPurchasedIndents]);

    // Apply search and date filters
    useEffect(() => {
        let result = [...indents];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                i => i.name?.toLowerCase().includes(query) ||
                    i.indentNumber.toLowerCase().includes(query)
            );
        }

        // Apply date filter
        if (fromDate) {
            result = result.filter(i => new Date(i.createdAt) >= fromDate);
        }
        if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            result = result.filter(i => new Date(i.createdAt) <= endOfDay);
        }

        setFilteredIndents(result);
    }, [searchQuery, indents, fromDate, toDate]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPurchasedIndents();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatFilterDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setFromDate(selectedDate);
        }
    };

    const handleToDateChange = (event: any, selectedDate?: Date) => {
        setShowToPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setToDate(selectedDate);
        }
    };

    const applyFilters = () => {
        setActiveFilter(fromDate !== null || toDate !== null);
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        setFromDate(null);
        setToDate(null);
        setActiveFilter(false);
        setShowFilterModal(false);
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(site-engineer)/receipts/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.indentName} numberOfLines={1}>
                            {item.name || item.indentNumber}
                        </Text>
                        <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                    </View>
                    <View style={styles.approvedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={styles.approvedText}>Approved</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{item.site?.name}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>

                <View style={styles.itemsPreview}>
                    <Ionicons name="cube-outline" size={14} color={theme.colors.primary} />
                    <Text style={styles.itemsText}>{item.items?.length || 0} materials</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
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
            {/* Search Bar with Filter Button */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search indents..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, activeFilter && styles.filterButtonActive]}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons
                        name="filter"
                        size={22}
                        color={activeFilter ? '#FFFFFF' : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Active Filter Indicator */}
            {activeFilter && (
                <View style={styles.activeFilterBanner}>
                    <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                    <Text style={styles.activeFilterText}>
                        {fromDate && toDate
                            ? `${formatFilterDate(fromDate)} - ${formatFilterDate(toDate)}`
                            : fromDate
                                ? `From ${formatFilterDate(fromDate)}`
                                : `Until ${formatFilterDate(toDate)}`
                        }
                    </Text>
                    <TouchableOpacity onPress={clearFilters}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filteredIndents}
                keyExtractor={(item) => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="receipt-outline" size={48} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No approved indents</Text>
                        <Text style={styles.emptySubtext}>
                            Indents that are approved by the Director will appear here
                        </Text>
                    </View>
                }
            />

            {/* Date Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter by Date</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* From Date */}
                        <View style={styles.dateGroup}>
                            <Text style={styles.dateLabel}>From Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                                <Text style={styles.dateButtonText}>{formatFilterDate(fromDate)}</Text>
                            </TouchableOpacity>
                            {fromDate && (
                                <TouchableOpacity
                                    style={styles.clearDateButton}
                                    onPress={() => setFromDate(null)}
                                >
                                    <Text style={styles.clearDateText}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* To Date */}
                        <View style={styles.dateGroup}>
                            <Text style={styles.dateLabel}>To Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowToPicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                                <Text style={styles.dateButtonText}>{formatFilterDate(toDate)}</Text>
                            </TouchableOpacity>
                            {toDate && (
                                <TouchableOpacity
                                    style={styles.clearDateButton}
                                    onPress={() => setToDate(null)}
                                >
                                    <Text style={styles.clearDateText}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {showFromPicker && (
                            <DateTimePicker
                                value={fromDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleFromDateChange}
                                maximumDate={toDate || new Date()}
                            />
                        )}

                        {showToPicker && (
                            <DateTimePicker
                                value={toDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleToDateChange}
                                minimumDate={fromDate || undefined}
                                maximumDate={new Date()}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>Apply Filter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    filterButton: {
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    activeFilterBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '15',
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    activeFilterText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    list: {
        padding: 16,
        paddingTop: 8,
    },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    indentName: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    indentNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
    },
    approvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    approvedText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    itemsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    itemsText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
        marginLeft: 6,
    },
    empty: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.cardBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    dateGroup: {
        marginBottom: 20,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 10,
    },
    dateButtonText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    clearDateButton: {
        marginTop: 8,
    },
    clearDateText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
