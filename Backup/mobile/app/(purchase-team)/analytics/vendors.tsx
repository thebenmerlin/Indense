import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        purple: '#7C3AED',
    }
};

interface Vendor {
    name: string;
    contact: string;
    gst?: string;
    orderCount: number;
    totalValue: number;
}

export default function VendorsList() {
    const [exporting, setExporting] = useState(false);

    // Mock data
    const vendors: Vendor[] = [
        { name: 'ABC Suppliers', contact: '+91 98765 43210', gst: '29ABCDE1234F1Z5', orderCount: 25, totalValue: 850000 },
        { name: 'Steel World', contact: '+91 87654 32109', gst: '29FGHIJ5678G2Y6', orderCount: 18, totalValue: 650000 },
        { name: 'Electrical Hub', contact: '+91 76543 21098', gst: '29KLMNO9012H3X7', orderCount: 12, totalValue: 350000 },
        { name: 'Plumbing Solutions', contact: '+91 65432 10987', orderCount: 8, totalValue: 250000 },
        { name: 'Timber Works', contact: '+91 54321 09876', gst: '29PQRST3456I4W8', orderCount: 6, totalValue: 200000 },
    ];

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Success', 'Vendor list exported to Downloads');
        } catch (error) {
            Alert.alert('Error', 'Failed to export');
        } finally {
            setExporting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Summary */}
            <View style={styles.section}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{vendors.length}</Text>
                    <Text style={styles.summaryLabel}>Total Vendors</Text>
                </View>
            </View>

            {/* Vendors List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Vendors</Text>
                {vendors.map((vendor, index) => (
                    <View key={index} style={styles.vendorCard}>
                        <View style={styles.vendorHeader}>
                            <View style={styles.vendorIcon}>
                                <Ionicons name="person" size={20} color={theme.colors.purple} />
                            </View>
                            <View style={styles.vendorInfo}>
                                <Text style={styles.vendorName}>{vendor.name}</Text>
                                <Text style={styles.vendorContact}>{vendor.contact}</Text>
                                {vendor.gst && (
                                    <Text style={styles.vendorGst}>GST: {vendor.gst}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => handleCall(vendor.contact)}
                            >
                                <Ionicons name="call" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.vendorStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Orders</Text>
                                <Text style={styles.statValue}>{vendor.orderCount}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Value</Text>
                                <Text style={styles.statValue}>{formatCurrency(vendor.totalValue)}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Export Button */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={handleExport}
                    disabled={exporting}
                >
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.exportButtonText}>
                        {exporting ? 'Exporting...' : 'Export to Excel'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 },
    summaryCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryValue: { fontSize: 36, fontWeight: '700', color: theme.colors.purple },
    summaryLabel: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
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
    vendorHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    vendorIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.purple + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vendorInfo: { flex: 1 },
    vendorName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    vendorContact: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    vendorGst: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },
    callButton: {
        backgroundColor: theme.colors.purple,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vendorStats: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: { flex: 1 },
    statLabel: { fontSize: 12, color: theme.colors.textSecondary },
    statValue: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 2 },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.purple,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
