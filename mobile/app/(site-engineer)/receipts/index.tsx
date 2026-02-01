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
    const router = useRouter();

    const fetchApprovedIndents = useCallback(async () => {
        try {
            // Fetch indents that are fully approved (Director approved)
            const response = await indentsApi.getAll({
                limit: 100,
                status: 'DIRECTOR_APPROVED'
            });

            // Also fetch ordered indents
            const orderedResponse = await indentsApi.getAll({
                limit: 100,
                status: 'ORDERED'
            });

            const allApproved = [...response.data, ...orderedResponse.data];
            setIndents(allApproved);
            setFilteredIndents(allApproved);
        } catch (error) {
            console.error('Failed to fetch indents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchApprovedIndents();
    }, [fetchApprovedIndents]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredIndents(indents);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = indents.filter(
                i => i.name?.toLowerCase().includes(query) ||
                    i.indentNumber.toLowerCase().includes(query)
            );
            setFilteredIndents(filtered);
        }
    }, [searchQuery, indents]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchApprovedIndents();
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
            {/* Search Bar */}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        margin: 16,
        marginBottom: 8,
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
});
