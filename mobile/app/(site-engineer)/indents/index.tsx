import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';
import FilterModal, { FilterOptions } from '../../../src/components/FilterModal';

const theme = {
    colors: {
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        primary: '#3B82F6',
        border: '#D1D5DB',
        warning: '#F59E0B',
    }
};

export default function IndentsList() {
    const [indents, setIndents] = useState<Indent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        startDate: null,
        endDate: null,
        status: 'ALL',
    });
    const router = useRouter();

    const fetchIndents = useCallback(async () => {
        try {
            const params: any = { limit: 50 };
            if (filters.status !== 'ALL') {
                params.status = filters.status;
            }
            const response = await indentsApi.getAll(params);

            // Client-side date filtering (ideally backend would support this)
            let filteredData = response.data;
            if (filters.startDate) {
                filteredData = filteredData.filter(
                    i => new Date(i.createdAt) >= filters.startDate!
                );
            }
            if (filters.endDate) {
                const endOfDay = new Date(filters.endDate);
                endOfDay.setHours(23, 59, 59, 999);
                filteredData = filteredData.filter(
                    i => new Date(i.createdAt) <= endOfDay
                );
            }

            setIndents(filteredData);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchIndents();
    }, [fetchIndents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIndents();
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setLoading(true);
    };

    const hasActiveFilters = filters.status !== 'ALL' || filters.startDate || filters.endDate;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const StatusBadge = ({ status }: { status: IndentStatus }) => {
        const bgColor = STATUS_COLORS[status] + '20';
        const textColor = STATUS_COLORS[status];
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {STATUS_LABELS[status]}
                </Text>
            </View>
        );
    };

    const hasUrgentItems = (indent: Indent) => {
        return indent.items?.some(item => item.isUrgent);
    };

    const renderIndent = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(site-engineer)/indents/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={[styles.card, hasUrgentItems(item) && styles.urgentCard]}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.indentName} numberOfLines={1}>
                            {item.name || item.indentNumber}
                        </Text>
                        {hasUrgentItems(item) && (
                            <View style={styles.urgentBadge}>
                                <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                                <Text style={styles.urgentText}>URGENT</Text>
                            </View>
                        )}
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                <Text style={styles.indentNumber}>{item.indentNumber}</Text>

                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="cube-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{item.items?.length || 0} items</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    {item.expectedDeliveryDate && (
                        <View style={styles.footerItem}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                            <Text style={[styles.footerText, { color: theme.colors.primary }]}>
                                {formatDate(item.expectedDeliveryDate)}
                            </Text>
                        </View>
                    )}
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
            {/* Filter Button */}
            <View style={styles.filterBar}>
                <TouchableOpacity
                    style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons
                        name="filter"
                        size={20}
                        color={hasActiveFilters ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}>
                        Filters {hasActiveFilters && '•'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.countText}>{indents.length} indent{indents.length !== 1 ? 's' : ''}</Text>
            </View>

            <FlatList
                data={indents}
                keyExtractor={(item) => item.id}
                renderItem={renderIndent}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No indents found</Text>
                        <Text style={styles.emptySubtext}>
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first indent to get started'}
                        </Text>
                    </View>
                }
            />

            <FilterModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
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
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: theme.colors.primary,
    },
    filterButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    filterButtonTextActive: {
        color: theme.colors.primary,
    },
    countText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
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
    urgentCard: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
    },
    indentName: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warning,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    indentNumber: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
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
        fontSize: 12,
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
});
