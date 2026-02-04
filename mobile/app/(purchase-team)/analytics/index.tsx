import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert,
    Share,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { reportsApi, DashboardSummary } from '../../../src/api';
import FilterModal, { FilterOptions } from '../../../src/components/FilterModal';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        purple: '#7C3AED',
    }
};

interface ReportItem {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    reportType: 'financial' | 'material' | 'vendor' | 'damage';
    color: string;
}

export default function Analytics() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({ startDate: null, endDate: null, status: 'ALL' });
    const [downloading, setDownloading] = useState<string | null>(null);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchDashboardSummary();
        }, [filters])
    );

    const fetchDashboardSummary = async () => {
        try {
            const response = await reportsApi.getDashboardSummary({
                siteId: filters.siteId || undefined,
                fromDate: filters.startDate?.toISOString(),
                toDate: filters.endDate?.toISOString(),
            });
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch dashboard summary:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardSummary();
    };

    const handleApplyFilters = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setShowFilters(false);
    };

    const handleDownloadReport = async (reportType: string) => {
        setDownloading(reportType);
        try {
            let downloadFn;
            switch (reportType) {
                case 'financial':
                    downloadFn = reportsApi.downloadFinancialReport;
                    break;
                case 'material':
                    downloadFn = reportsApi.downloadMaterialReport;
                    break;
                case 'vendor':
                    downloadFn = reportsApi.downloadVendorReport;
                    break;
                case 'damage':
                    downloadFn = reportsApi.downloadDamageReport;
                    break;
                default:
                    return;
            }
            
            const blob = await downloadFn({
                siteId: filters.siteId || undefined,
                fromDate: filters.startDate?.toISOString(),
                toDate: filters.endDate?.toISOString(),
            });
            
            // In React Native, we'd typically use expo-file-system or expo-sharing
            // For now, show success message
            Alert.alert(
                'Report Generated',
                'The Excel report has been generated successfully. In a production app, this would download to your device.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Failed to download report:', error);
            Alert.alert('Error', 'Failed to generate report. Please try again.');
        } finally {
            setDownloading(null);
        }
    };

    const handleViewReport = (reportType: string) => {
        router.push(`/(purchase-team)/analytics/${reportType}` as any);
    };

    const reports: ReportItem[] = [
        {
            title: 'Financial Report',
            description: 'Total costs, spending trends',
            icon: 'cash-outline',
            reportType: 'financial',
            color: theme.colors.success,
        },
        {
            title: 'Material Report',
            description: 'Most ordered materials',
            icon: 'cube-outline',
            reportType: 'material',
            color: theme.colors.primary,
        },
        {
            title: "Vendor's List",
            description: 'All vendors and history',
            icon: 'people-outline',
            reportType: 'vendor',
            color: theme.colors.purple,
        },
        {
            title: 'Damage Report',
            description: 'Damaged materials summary',
            icon: 'alert-circle-outline',
            reportType: 'damage',
            color: theme.colors.error,
        },
    ];

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const activeFilterCount = Object.keys(filters).filter(k => filters[k as keyof FilterOptions]).length;

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Filter Button */}
            <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilters(true)}>
                <View style={styles.filterButton}>
                    <Ionicons name="filter" size={18} color={theme.colors.primary} />
                    <Text style={styles.filterText}>Filter</Text>
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Summary Stats */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { borderColor: theme.colors.primary }]}>
                        <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                        <Text style={styles.statValue}>{summary?.totalIndents || 0}</Text>
                        <Text style={styles.statLabel}>Total Indents</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.warning }]}>
                        <Ionicons name="time-outline" size={24} color={theme.colors.warning} />
                        <Text style={styles.statValue}>{summary?.pendingIndents || 0}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: theme.colors.success }]}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
                        <Text style={styles.statValue}>{summary?.closedSites || 0}</Text>
                        <Text style={styles.statLabel}>Closed Sites</Text>
                    </View>
                </View>

                {/* Total Expense Card */}
                <View style={styles.expenseCard}>
                    <View style={styles.expenseIcon}>
                        <Ionicons name="wallet-outline" size={28} color={theme.colors.success} />
                    </View>
                    <View style={styles.expenseContent}>
                        <Text style={styles.expenseLabel}>Total Expense</Text>
                        <Text style={styles.expenseValue}>{formatCurrency(summary?.totalExpense || 0)}</Text>
                    </View>
                </View>
            </View>

            {/* Detailed Reports */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Generate Reports</Text>
                {reports.map((report, index) => (
                    <View key={index} style={styles.reportCard}>
                        <View style={[styles.reportIcon, { backgroundColor: report.color + '15' }]}>
                            <Ionicons name={report.icon} size={24} color={report.color} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>{report.title}</Text>
                            <Text style={styles.reportDesc}>{report.description}</Text>
                        </View>
                        <View style={styles.reportActions}>
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => handleViewReport(report.reportType)}
                            >
                                <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.downloadButton, downloading === report.reportType && styles.downloadingButton]}
                                onPress={() => handleDownloadReport(report.reportType)}
                                disabled={downloading !== null}
                            >
                                {downloading === report.reportType ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />

            <FilterModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
                showStatusFilter={false}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterBar: {
        padding: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: {
        width: '47%',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: { fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 8 },
    statLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 2,
        borderColor: theme.colors.success + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    expenseIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.success + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseContent: { flex: 1 },
    expenseLabel: { fontSize: 14, color: theme.colors.textSecondary },
    expenseValue: { fontSize: 26, fontWeight: '700', color: theme.colors.success, marginTop: 2 },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    reportContent: { flex: 1 },
    reportTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    reportDesc: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    reportActions: { flexDirection: 'row', gap: 8 },
    viewButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadingButton: { backgroundColor: theme.colors.textSecondary },
});
