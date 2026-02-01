import React, { useEffect, useState, useCallback } from 'react';
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

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#F59E0B',
    }
};

interface Engineer {
    id: string;
    name: string;
    email: string;
    sites: { id: string; name: string }[];
}

export default function EngineersList() {
    const [engineers, setEngineers] = useState<Engineer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchEngineers = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setEngineers([
                { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', sites: [{ id: '1', name: 'Green Valley' }, { id: '2', name: 'Skyline' }] },
                { id: '2', name: 'Priya Sharma', email: 'priya@example.com', sites: [{ id: '1', name: 'Green Valley' }] },
                { id: '3', name: 'Amit Patel', email: 'amit@example.com', sites: [{ id: '3', name: 'Riverside' }, { id: '4', name: 'Sunset' }, { id: '5', name: 'Lakeside' }] },
            ]);
        } catch (error) {
            console.error('Failed to fetch engineers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEngineers();
    }, [fetchEngineers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEngineers();
    };

    const formatSites = (sites: { id: string; name: string }[]) => {
        if (sites.length === 0) return 'No sites assigned';
        if (sites.length === 1) return sites[0].name;
        if (sites.length === 2) return `${sites[0].name}, ${sites[1].name}`;
        return `${sites[0].name}, ${sites[1].name}, +${sites.length - 2}`;
    };

    const renderEngineer = ({ item }: { item: Engineer }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/space/roles/engineers/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sites}>{formatSites(item.sites)}</Text>
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

    return (
        <View style={styles.container}>
            <FlatList
                data={engineers}
                keyExtractor={item => item.id}
                renderItem={renderEngineer}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="construct-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No site engineers</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: { fontSize: 20, fontWeight: '600', color: theme.colors.accent },
    cardContent: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    sites: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
