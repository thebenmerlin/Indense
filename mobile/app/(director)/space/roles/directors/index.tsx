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
        accent: '#8B5CF6',
    }
};

interface Director {
    id: string;
    name: string;
    email: string;
}

export default function DirectorsList() {
    const [directors, setDirectors] = useState<Director[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchDirectors = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setDirectors([
                { id: '1', name: 'Arun Mehta', email: 'arun@company.com' },
                { id: '2', name: 'Sunita Kapoor', email: 'sunita@company.com' },
            ]);
        } catch (error) {
            console.error('Failed to fetch directors:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDirectors();
    }, [fetchDirectors]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDirectors();
    };

    const renderDirector = ({ item }: { item: Director }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/space/roles/directors/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
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
                data={directors}
                keyExtractor={item => item.id}
                renderItem={renderDirector}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="shield-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No directors</Text>
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
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
