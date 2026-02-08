import React, { useState, useCallback } from 'react';
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
import { reportsApi, DamageReportRow } from '../../../src/api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
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

export default function DamageReport() {
    const [data, setData] = useState<DamageReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [fromMonth, setFromMonth] = useState(1);
    const [fromYear, setFromYear] = useState(currentYear);
    const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
    const [toYear, setToYear] = useState(currentYear);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fromMonth, fromYear, toMonth, toYear])
    );

    const getDateRange = () => {
        const fromDate = new Date(fromYear, fromMonth - 1, 1);
        const toDate = new Date(toYear, toMonth, 0);
        return {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = getDateRange();
            const result = await reportsApi.getDamageReport(params);
            setData(result || []);
        } catch (error) {
            console.error('Failed to fetch damage report:', error);
            Alert.alert('Error', 'Failed to load damage report');
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
            await reportsApi.downloadDamageReport(params);
            Alert.alert('Success', 'Damage report exported successfully.');
        } catch (error) {
            console.error('Failed to export:', error);
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const formatDate = (dateStr: string | Date) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'RESOLVED': return theme.colors.success;
            case 'PENDING': return theme.colors.warning;
            default: return theme.colors.error;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toUpperCase()) {
            case 'LOW': return theme.colors.success;
            case 'MEDIUM': return theme.colors.warning;
            case 'HIGH':
            case 'CRITICAL': return theme.colors.error;
            default: return theme.colors.textSecondary;
        }
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

                    <TouchableOpacity style={styles.applyButton} onPress={() => { setShowFilters(false); fetchData(); }}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Table Header */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { width: 120 }]}>Material</Text>
                        <Text style={[styles.headerCell, { width: 90 }]}>Indent</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>Site</Text>
                        <Text style={[styles.headerCell, { width: 90 }]}>Reported By</Text>
                        <Text style={[styles.headerCell, { width: 80 }]}>Date</Text>
                        <Text style={[styles.headerCell, { width: 50, textAlign: 'center' }]}>Qty</Text>
                        <Text style={[styles.headerCell, { width: 70, textAlign: 'center' }]}>Severity</Text>
                        <Text style={[styles.headerCell, { width: 70, textAlign: 'center' }]}>Status</Text>
                    </View>

                    {/* Table Body */}
                    <ScrollView
                        style={styles.tableBody}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {data.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
                                <Text style={styles.emptyText}>No damage reports found</Text>
                                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                            </View>
                        ) : (
                            data.map((row, index) => (
                                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                                    <Text style={[styles.materialName, { width: 120 }]} numberOfLines={2}>{row.materialName}</Text>
                                    <Text style={[styles.cell, { width: 90 }]} numberOfLines={1}>{row.indentNumber}</Text>
                                    <Text style={[styles.cell, { width: 100 }]} numberOfLines={1}>{row.siteName}</Text>
                                    <Text style={[styles.cell, { width: 90 }]} numberOfLines={1}>{row.reportedBy}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{formatDate(row.reportedAt)}</Text>
                                    <Text style={[styles.cell, { width: 50, textAlign: 'center' }]}>{row.damagedQty || '-'}</Text>
                                    <View style={{ width: 70, alignItems: 'center' }}>
                                        <View style={[styles.badge, { backgroundColor: getSeverityColor(row.severity) + '20' }]}>
                                            <Text style={[styles.badgeText, { color: getSeverityColor(row.severity) }]}>
                                                {row.severity || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ width: 70, alignItems: 'center' }}>
                                        <View style={[styles.badge, { backgroundColor: getStatusColor(row.status) + '20' }]}>
                                            <Text style={[styles.badgeText, { color: getStatusColor(row.status) }]}>
                                                {row.status || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
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
        backgroundColor: theme.colors.error,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    headerCell: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', paddingHorizontal: 4 },
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
    materialName: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary, paddingHorizontal: 4 },
    cell: { fontSize: 11, color: theme.colors.textPrimary, paddingHorizontal: 4 },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    emptyState: { padding: 48, alignItems: 'center', width: 670 },
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
