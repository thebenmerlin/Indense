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
import { reportsApi, VendorReportRow } from '../../../src/api';

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

export default function VendorReport() {
    const [data, setData] = useState<VendorReportRow[]>([]);
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
            const result = await reportsApi.getVendorReport(params);
            setData(result || []);
        } catch (error) {
            console.error('Failed to fetch vendor report:', error);
            Alert.alert('Error', 'Failed to load vendor report');
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
            await reportsApi.downloadVendorReport(params);
            Alert.alert('Success', 'Vendor report exported successfully.');
        } catch (error) {
            console.error('Failed to export:', error);
            Alert.alert('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
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

            {/* Vendor Cards */}
            <ScrollView
                style={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {data.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No vendors found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                ) : (
                    data.map((vendor, index) => (
                        <View key={index} style={styles.vendorCard}>
                            <View style={styles.vendorHeader}>
                                <View style={styles.vendorIcon}>
                                    <Ionicons name="business" size={20} color={theme.colors.purple} />
                                </View>
                                <View style={styles.vendorInfo}>
                                    <Text style={styles.vendorName}>{vendor.vendorName}</Text>
                                    {vendor.vendorAddress && (
                                        <Text style={styles.vendorAddress} numberOfLines={1}>{vendor.vendorAddress}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.vendorDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>GST No:</Text>
                                    <Text style={styles.detailValue}>{vendor.vendorGstNo || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Contact:</Text>
                                    <Text style={styles.detailValue}>{vendor.vendorContactPerson || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Phone:</Text>
                                    <Text style={styles.detailValue}>{vendor.vendorContactPhone || '-'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Business:</Text>
                                    <Text style={styles.detailValue}>{vendor.vendorNatureOfBusiness || '-'}</Text>
                                </View>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{vendor.totalOrders}</Text>
                                    <Text style={styles.statLabel}>Orders</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: theme.colors.success }]}>
                                        {formatCurrency(vendor.totalValue)}
                                    </Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                            </View>

                            {vendor.materialsSupplied && vendor.materialsSupplied.length > 0 && (
                                <View style={styles.materialsSection}>
                                    <Text style={styles.materialsLabel}>Materials Supplied:</Text>
                                    <Text style={styles.materialsList} numberOfLines={2}>
                                        {vendor.materialsSupplied.slice(0, 5).join(', ')}
                                        {vendor.materialsSupplied.length > 5 && ` +${vendor.materialsSupplied.length - 5} more`}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
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
    listContainer: { flex: 1, padding: 16 },
    vendorCard: {
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
    vendorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    vendorIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.colors.purple + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vendorInfo: { flex: 1 },
    vendorName: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    vendorAddress: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    vendorDetails: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    detailLabel: { fontSize: 13, color: theme.colors.textSecondary },
    detailValue: { fontSize: 13, fontWeight: '500', color: theme.colors.textPrimary },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    statLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: theme.colors.border },
    materialsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
    materialsLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
    materialsList: { fontSize: 12, color: theme.colors.textPrimary, lineHeight: 18 },
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
