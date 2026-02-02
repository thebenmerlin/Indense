import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
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
        accent: '#10B981',
    }
};

interface MaterialItem {
    id: string;
    name: string;
    category: string;
    totalOrdered: number;
    unit: string;
    orderCount: number;
}

export default function MaterialsReport() {
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setMaterials([
                { id: '1', name: 'TMT Steel Bars', category: 'Structural', totalOrdered: 5000, unit: 'kg', orderCount: 15 },
                { id: '2', name: 'Cement OPC 53', category: 'Structural', totalOrdered: 2500, unit: 'bags', orderCount: 12 },
                { id: '3', name: 'PVC Pipes', category: 'Plumbing', totalOrdered: 800, unit: 'pieces', orderCount: 8 },
                { id: '4', name: 'Electrical Wire', category: 'Electrical', totalOrdered: 3000, unit: 'meter', orderCount: 6 },
                { id: '5', name: 'Wall Tiles', category: 'Finishing', totalOrdered: 1500, unit: 'sqft', orderCount: 5 },
            ]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMaterial = ({ item, index }: { item: MaterialItem; index: number }) => (
        <View style={styles.card}>
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.materialName}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={styles.statsColumn}>
                <Text style={styles.statsValue}>{item.totalOrdered.toLocaleString()}</Text>
                <Text style={styles.statsLabel}>{item.unit}</Text>
            </View>
            <View style={styles.ordersColumn}>
                <Text style={styles.ordersValue}>{item.orderCount}</Text>
                <Text style={styles.ordersLabel}>orders</Text>
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
                <Ionicons name="cube" size={24} color={theme.colors.primary} />
                <Text style={styles.headerTitle}>Most Ordered Materials</Text>
            </View>
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={renderMaterial}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No material data available</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: { fontSize: 14, fontWeight: '700', color: theme.colors.accent },
    cardContent: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    category: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    statsColumn: { alignItems: 'flex-end', marginRight: 16 },
    statsValue: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary },
    statsLabel: { fontSize: 10, color: theme.colors.textSecondary },
    ordersColumn: { alignItems: 'center', minWidth: 50 },
    ordersValue: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
    ordersLabel: { fontSize: 10, color: theme.colors.textSecondary },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 16, color: theme.colors.textSecondary },
});
