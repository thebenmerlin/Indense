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
import { damagesApi } from '../../../src/api';
import { Indent, DamageReport } from '../../../src/types';

const theme = {
    colors: {
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        primary: '#3B82F6',
        border: '#D1D5DB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
    }
};

type ViewMode = 'damage-list' | 'indent-picker';

interface DamageRecord {
    id: string;
    indentId: string;
    indentName: string;
    indentNumber: string;
    siteName: string;
    status: 'DRAFT' | 'REPORTED';
    damageCount: number;
    createdAt: Date;
}

export default function DamagesScreen() {
    const [viewMode, setViewMode] = useState<ViewMode>('damage-list');
    const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
    const [purchasedIndents, setPurchasedIndents] = useState<Indent[]>([]);
    const [filteredIndents, setFilteredIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingIndents, setLoadingIndents] = useState(false);

    // Search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [activeFilter, setActiveFilter] = useState(false);

    const router = useRouter();

    useEffect(() => {
        loadDamages();
    }, []);

    const loadDamages = async () => {
        try {
            const response = await damagesApi.getAll({ limit: 100 });

            // Group by indent and create records
            const indentMap = new Map<string, DamageRecord>();

            response.data.forEach((report: DamageReport) => {
                const indentId = report.indentId;
                const existing = indentMap.get(indentId);

                if (existing) {
                    existing.damageCount += 1;
                    // Keep the latest status
                    if (report.status === 'REPORTED') {
                        existing.status = 'REPORTED';
                    }
                } else {
                    indentMap.set(indentId, {
                        id: report.id,
                        indentId: report.indentId,
                        indentName: report.indent?.name || report.indent?.indentNumber || 'Unknown Indent',
                        indentNumber: report.indent?.indentNumber || '',
                        siteName: report.indent?.site?.name || '',
                        status: report.status === 'DRAFT' ? 'DRAFT' : 'REPORTED',
                        damageCount: 1,
                        createdAt: new Date(report.createdAt),
                    });
                }
            });

            setDamageRecords(Array.from(indentMap.values()));
        } catch (error) {
            console.error('Failed to load damages:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadPurchasedIndents = async () => {
        setLoadingIndents(true);
        try {
            const response = await damagesApi.getPurchasedIndents({ limit: 100 });
            setPurchasedIndents(response.data);
            setFilteredIndents(response.data);
            setViewMode('indent-picker');
        } catch (error) {
            console.error('Failed to load purchased indents:', error);
        } finally {
            setLoadingIndents(false);
        }
    };

    // Apply search and date filters to indents
    useEffect(() => {
        if (viewMode !== 'indent-picker') return;

        let result = [...purchasedIndents];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                i => i.name?.toLowerCase().includes(query) ||
                    i.indentNumber.toLowerCase().includes(query)
            );
        }

        if (fromDate) {
            result = result.filter(i => new Date(i.createdAt) >= fromDate);
        }
        if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            result = result.filter(i => new Date(i.createdAt) <= endOfDay);
        }

        setFilteredIndents(result);
    }, [searchQuery, purchasedIndents, fromDate, toDate, viewMode]);

    const onRefresh = () => {
        setRefreshing(true);
        loadDamages();
    };

    const formatDate = (dateStr: Date | string) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatFilterDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return formatDate(date);
    };

    const handleFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromPicker(Platform.OS === 'ios');
        if (selectedDate) setFromDate(selectedDate);
    };

    const handleToDateChange = (event: any, selectedDate?: Date) => {
        setShowToPicker(Platform.OS === 'ios');
        if (selectedDate) setToDate(selectedDate);
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

    const handleSelectIndent = (indent: Indent) => {
        // Navigate to damage detail for this indent
        router.push(`/(site-engineer)/damages/${indent.id}?type=indent` as any);
    };

    const handleViewDamageRecord = (record: DamageRecord) => {
        router.push(`/(site-engineer)/damages/${record.indentId}?type=indent` as any);
    };

    const renderDamageRecord = ({ item }: { item: DamageRecord }) => (
        <TouchableOpacity
            onPress={() => handleViewDamageRecord(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.card, item.status === 'DRAFT' && styles.draftCard]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.indentName} numberOfLines={1}>
                            {item.indentName}
                        </Text>
                        <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'DRAFT' ? theme.colors.warning + '20' : theme.colors.error + '20' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'DRAFT' ? theme.colors.warning : theme.colors.error }
                        ]}>
                            {item.status === 'DRAFT' ? 'Draft' : 'Reported'}
                        </Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{item.siteName}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
                        <Text style={styles.footerText}>{item.damageCount} damage(s)</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderIndentOption = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            style={styles.indentOption}
            onPress={() => handleSelectIndent(item)}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.indentOptionName}>{item.name || item.indentNumber}</Text>
                <Text style={styles.indentOptionNumber}>{item.indentNumber}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.footerText, { fontSize: 12 }]}>{item.site?.name}</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.footerText, { fontSize: 12 }]}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
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

    // Indent Picker View (when Report Damage is clicked)
    if (viewMode === 'indent-picker') {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => {
                        setViewMode('damage-list');
                        setSearchQuery('');
                        clearFilters();
                    }}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerTitle}>Select Indent</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Bar with Filter */}
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

                {/* Active Filter Banner */}
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

                {loadingIndents ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredIndents}
                        keyExtractor={item => item.id}
                        renderItem={renderIndentOption}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                                <Text style={styles.emptyText}>No purchased indents</Text>
                                <Text style={styles.emptySubtext}>
                                    Only indents that have been purchased can have damage reports
                                </Text>
                            </View>
                        }
                    />
                )}

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
                                    <TouchableOpacity style={styles.clearDateButton} onPress={() => setFromDate(null)}>
                                        <Text style={styles.clearDateText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

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
                                    <TouchableOpacity style={styles.clearDateButton} onPress={() => setToDate(null)}>
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

    // Main Damage List View
    return (
        <View style={styles.container}>
            {damageRecords.length === 0 ? (
                // Empty state with Report Damage button
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.emptyStateTitle}>No Damage Reports</Text>
                    <Text style={styles.emptyStateText}>
                        Report any damaged materials from your purchased indents
                    </Text>
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={loadPurchasedIndents}
                        disabled={loadingIndents}
                    >
                        {loadingIndents ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                                <Text style={styles.reportButtonText}>Report Damage</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                // Damage records list
                <>
                    <FlatList
                        data={damageRecords}
                        keyExtractor={item => item.indentId}
                        renderItem={renderDamageRecord}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                    <TouchableOpacity
                        style={styles.floatingButton}
                        onPress={loadPurchasedIndents}
                    >
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </>
            )}
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
    list: {
        padding: 16,
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
    draftCard: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
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
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIcon: {
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    emptyStateText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.error,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    reportButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
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
    indentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    indentOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    indentOptionNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
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
