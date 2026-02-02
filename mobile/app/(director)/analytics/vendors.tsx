import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        purple: '#7C3AED',
    }
};

interface Vendor {
    id: string;
    name: string;
    contact: string;
    email: string;
    orderCount: number;
    totalValue: number;
}

export default function VendorsReport() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setVendors([
                { id: '1', name: 'Steel Corp India', contact: '+91 98765 43210', email: 'sales@steelcorp.com', orderCount: 25, totalValue: 1800000 },
                { id: '2', name: 'Cement Ltd', contact: '+91 98765 12345', email: 'orders@cementltd.com', orderCount: 18, totalValue: 850000 },
                { id: '3', name: 'Electrical World', contact: '+91 99887 76655', email: 'info@electricalworld.com', orderCount: 12, totalValue: 720000 },
                { id: '4', name: 'Plumbing Supplies', contact: '+91 99888 77766', email: 'contact@plumbingsupplies.com', orderCount: 10, totalValue: 450000 },
            ]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        return `₹${(amount / 1000).toFixed(0)}K`;
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    };

    const renderVendor = ({ item }: { item: Vendor }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.vendorName}>{item.name}</Text>
                    <Text style={styles.orderInfo}>{item.orderCount} orders • {formatCurrency(item.totalValue)}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(item.contact)}>
                    <Ionicons name="call" size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(item.email)}>
                    <Ionicons name="mail" size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="people" size={24} color={theme.colors.purple} />
                <Text style={styles.headerTitle}>Vendor Directory</Text>
            </View>
            <FlatList
                data={vendors}
                keyExtractor={item => item.id}
                renderItem={renderVendor}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No vendors found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    list: { padding: 16 },
    card: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.purple + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: theme.colors.purple },
    headerContent: { flex: 1 },
    vendorName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    orderInfo: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary + '10',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    actionText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 16, color: theme.colors.textSecondary },
});
