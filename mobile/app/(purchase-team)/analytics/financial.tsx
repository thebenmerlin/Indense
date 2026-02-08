import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { reportsApi, FinancialReportRow, sitesApi, Site } from '../../../src/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
    }
};

const currentYear = new Date().getFullYear();
const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function FinancialReport() {
    const [data, setData] = useState<FinancialReportRow[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [fromMonth, setFromMonth] = useState(1);
    const [fromYear, setFromYear] = useState(currentYear);
    const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
    const [toYear, setToYear] = useState(currentYear);
    const [selectedSite, setSelectedSite] = useState<string>('');

    useEffect(() => {
        fetchSites();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fromMonth, fromYear, toMonth, toYear, selectedSite])
    );

    const fetchSites = async () => {
        try {
            const response = await sitesApi.getAll();
            setSites(response);
        } catch (error) {
            console.error('Failed to fetch sites:', error);
        }
    };

    const getDateRange = () => {
        const fromDate = new Date(fromYear, fromMonth - 1, 1);
        const toDate = new Date(toYear, toMonth, 0); // Last day of toMonth
        return {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            siteId: selectedSite || undefined,
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = getDateRange();
            const result = await reportsApi.getFinancialReport(params);
            setData(result || []);
        } catch (error) {
            console.error('Failed to fetch financial report:', error);
            Alert.alert('Error', 'Failed to load financial report');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = getDateRange();
            const response = await reportsApi.downloadFinancialReport(params);

            // For React Native, we need to handle the blob download differently
            Alert.alert(
                'Report Generated',
                'Financial report has been generated successfully.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Failed to export:', error);
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr: string | Date) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    const totalCost = data.reduce((sum, row) => sum + (row.cost || 0), 0);

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Filter Toggle */}
            <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
                <Ionicons name="filter" size={18} color={theme.colors.primary} />
                <Text style={styles.filterToggleText}>Filters</Text>
                <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Filters Panel */}
            {showFilters && (
                <View style={styles.filtersPanel}>
                    <Text style={styles.filterLabel}>From</Text>
                    <View style={styles.filterRow}>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={fromMonth} onValueChange={setFromMonth} style={styles.picker}>
                                {months.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
                            </Picker>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={fromYear} onValueChange={setFromYear} style={styles.picker}>
                                {years.map(y => <Picker.Item key={y} label={String(y)} value={y} />)}
                            </Picker>
                        </View>
                    </View>

                    <Text style={styles.filterLabel}>To</Text>
                    <View style={styles.filterRow}>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={toMonth} onValueChange={setToMonth} style={styles.picker}>
                                {months.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
                            </Picker>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={toYear} onValueChange={setToYear} style={styles.picker}>
                                {years.map(y => <Picker.Item key={y} label={String(y)} value={y} />)}
                            </Picker>
                        </View>
                    </View>

                    <Text style={styles.filterLabel}>Site</Text>
                    <View style={styles.sitePickerContainer}>
                        <Picker selectedValue={selectedSite} onValueChange={setSelectedSite} style={styles.picker}>
                            <Picker.Item label="All Sites" value="" />
                            {sites.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
                        </Picker>
                    </View>

                    <TouchableOpacity style={styles.applyButton} onPress={() => { setShowFilters(false); fetchData(); }}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 2 }]}>Material</Text>
                <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Qty</Text>
                <Text style={[styles.headerCell, { flex: 1.2, textAlign: 'right' }]}>Cost</Text>
            </View>

            {/* Table Body */}
            <ScrollView
                style={styles.tableBody}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {data.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No data found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                ) : (
                    data.map((row, index) => (
                        <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.materialName} numberOfLines={1}>{row.materialName}</Text>
                                <Text style={styles.materialCode}>{row.materialCode}</Text>
                            </View>
                            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(row.rate)}</Text>
                            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{row.quantity}</Text>
                            <Text style={[styles.cellBold, { flex: 1.2, textAlign: 'right' }]}>{formatCurrency(row.cost)}</Text>
                        </View>
                    ))
                )}

                {/* Total Row */}
                {data.length > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { flex: 4 }]}>TOTAL</Text>
                        <Text style={[styles.totalValue, { flex: 1.2, textAlign: 'right' }]}>{formatCurrency(totalCost)}</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Export Button */}
            <View style={styles.exportContainer}>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={handleExport}
                    disabled={exporting || data.length === 0}
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.exportButtonText}>Export to Excel</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: 8,
    },
    filterToggleText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary, flex: 1 },
    filtersPanel: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 6, marginTop: 12 },
    filterRow: { flexDirection: 'row', gap: 12 },
    pickerContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    sitePickerContainer: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    picker: { height: 50 },
    applyButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    applyButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    headerCell: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
    tableBody: { flex: 1 },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
        alignItems: 'center',
    },
    tableRowAlt: { backgroundColor: theme.colors.surface },
    materialName: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
    cell: { fontSize: 13, color: theme.colors.textPrimary },
    cellBold: { fontSize: 13, fontWeight: '600', color: theme.colors.success },
    totalRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.primary + '10',
        borderTopWidth: 2,
        borderTopColor: theme.colors.primary,
    },
    totalLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
    totalValue: { fontSize: 16, fontWeight: '700', color: theme.colors.success },
    emptyState: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 12 },
    emptySubtext: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
    exportContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    exportButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
