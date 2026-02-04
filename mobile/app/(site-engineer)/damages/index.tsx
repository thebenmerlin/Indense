import React, { useEffect, useState } from 'react';
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
    }
};

interface DamageRecord {
    id: string;
    indentId: string;
    indentName: string;
    indentNumber: string;
    status: 'DRAFT' | 'SUBMITTED';
    damageCount: number;
    createdAt: Date;
}

export default function DamagesScreen() {
    const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showIndentPicker, setShowIndentPicker] = useState(false);
    const [purchasedIndents, setPurchasedIndents] = useState<Indent[]>([]);
    const [loadingIndents, setLoadingIndents] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load existing damage reports from API
            const response = await damagesApi.getAll({ limit: 100 });
            const records: DamageRecord[] = response.data.map((report: DamageReport) => ({
                id: report.id,
                indentId: report.indentId,
                indentName: report.indent?.name || report.indent?.indentNumber || 'Unknown Indent',
                indentNumber: report.indent?.indentNumber || '',
                status: report.status as 'DRAFT' | 'SUBMITTED',
                damageCount: report.images?.length || 1,
                createdAt: new Date(report.createdAt),
            }));
            setDamageRecords(records);
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
            // Use the dedicated endpoint to get purchased indents for damage reporting
            const response = await damagesApi.getPurchasedIndents();
            setPurchasedIndents(response.data);
            setShowIndentPicker(true);
        } catch (error) {
            console.error('Failed to load purchased indents:', error);
        } finally {
            setLoadingIndents(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const formatDate = (dateStr: Date | string) => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderDamageRecord = ({ item }: { item: DamageRecord }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(site-engineer)/damages/${item.id}` as any)}
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

    const handleSelectIndentForNewDamage = async (indent: Indent) => {
        setShowIndentPicker(false);
        try {
            // Create a new draft damage report
            const damageReport = await damagesApi.create({
                indentId: indent.id,
                name: `Damage Report - ${indent.name || indent.indentNumber}`,
                description: '',
                isDraft: true,
            });
            // Navigate to the damage detail screen
            router.push(`/(site-engineer)/damages/${damageReport.id}` as any);
        } catch (error) {
            console.error('Failed to create damage report:', error);
        }
    };

    const renderIndentOption = ({ item }: { item: Indent }) => (
        <TouchableOpacity
            style={styles.indentOption}
            onPress={() => handleSelectIndentForNewDamage(item)}
        >
            <View>
                <Text style={styles.indentOptionName}>{item.name || item.indentNumber}</Text>
                <Text style={styles.indentOptionNumber}>{item.indentNumber}</Text>
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

    // Show indent picker overlay
    if (showIndentPicker) {
        return (
            <View style={styles.container}>
                <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowIndentPicker(false)}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerTitle}>Select Indent</Text>
                    <View style={{ width: 24 }} />
                </View>
                <FlatList
                    data={purchasedIndents}
                    keyExtractor={item => item.id}
                    renderItem={renderIndentOption}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No purchased indents</Text>
                            <Text style={styles.emptySubtext}>
                                Only indents that have been purchased can have damage reports
                            </Text>
                        </View>
                    }
                />
            </View>
        );
    }

    // Show empty state or damage records
    return (
        <View style={styles.container}>
            {damageRecords.length === 0 ? (
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
                    >
                        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.reportButtonText}>Report Damage</Text>
                    </TouchableOpacity>
                </View>
            ) : (
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
        gap: 16,
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
});
