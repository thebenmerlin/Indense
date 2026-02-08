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
import { reportsApi, MaterialReportRow, sitesApi, Site } from '../../../src/api';

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
        purple: '#7C3AED',
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

export default function MaterialReport() {
    const [data, setData] = useState<MaterialReportRow[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportingAll, setExportingAll] = useState(false);
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
        const toDate = new Date(toYear, toMonth, 0);
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
            const result = await reportsApi.getMaterialReport(params);
            setData(result || []);
        } catch (error) {
            console.error('Failed to fetch material report:', error);
            Alert.alert('Error', 'Failed to load material report');
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
            await reportsApi.downloadMaterialReport(params);
            Alert.alert('Success', 'Material report exported successfully.');
        } catch (error) {
            console.error('Failed to export:', error);
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const handleExportAllMaterials = async () => {
        setExportingAll(true);
        try {
            await reportsApi.downloadAllMaterials();
            Alert.alert('Success', 'All materials database exported successfully.');
        } catch (error) {
            console.error('Failed to export all materials:', error);
            Alert.alert('Error', 'Failed to export all materials');
        } finally {
            setExportingAll(false);
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { width: 150 }]}>Material Name</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>Specification</Text>
                        <Text style={[styles.headerCell, { width: 80 }]}>Dimension</Text>
                        <Text style={[styles.headerCell, { width: 80 }]}>Color</Text>
                        <Text style={[styles.headerCell, { width: 100 }]}>Category</Text>
                        <Text style={[styles.headerCell, { width: 60 }]}>Unit</Text>
                    </View>

                    {/* Table Body */}
                    <ScrollView
                        style={styles.tableBody}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {data.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={48} color={theme.colors.textSecondary} />
                                <Text style={styles.emptyText}>No materials found</Text>
                                <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                            </View>
                        ) : (
                            data.map((row, index) => (
                                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                                    <View style={{ width: 150 }}>
                                        <Text style={styles.materialName} numberOfLines={2}>{row.materialName}</Text>
                                        <Text style={styles.materialCode}>{row.materialCode}</Text>
                                    </View>
                                    <Text style={[styles.cell, { width: 100 }]} numberOfLines={2}>{row.specification || '-'}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{row.dimension || '-'}</Text>
                                    <Text style={[styles.cell, { width: 80 }]}>{row.color || '-'}</Text>
                                    <Text style={[styles.cell, { width: 100 }]}>{row.category || '-'}</Text>
                                    <Text style={[styles.cell, { width: 60 }]}>{row.unit}</Text>
                                </View>
                            ))
                        )}

                        <View style={{ height: 150 }} />
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Export Buttons */}
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

                <TouchableOpacity
                    style={styles.exportAllButton}
                    onPress={handleExportAllMaterials}
                    disabled={exportingAll}
                >
                    {exportingAll ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="layers-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.exportButtonText}>Export All Materials</Text>
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
    headerCell: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', paddingHorizontal: 4 },
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
    materialName: { fontSize: 13, fontWeight: '600', color: theme.colors.textPrimary },
    materialCode: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
    cell: { fontSize: 12, color: theme.colors.textPrimary, paddingHorizontal: 4 },
    emptyState: { padding: 48, alignItems: 'center', width: 570 },
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
        gap: 10,
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
    exportAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.purple,
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
    },
    exportButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
