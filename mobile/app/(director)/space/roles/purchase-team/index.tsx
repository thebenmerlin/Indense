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
        accent: '#3B82F6',
    }
};

interface PurchaseMember {
    id: string;
    name: string;
    email: string;
}

export default function PurchaseTeamList() {
    const [members, setMembers] = useState<PurchaseMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchMembers = useCallback(async () => {
        try {
            // TODO: Replace with actual API call
            setMembers([
                { id: '1', name: 'Vikram Singh', email: 'vikram@example.com' },
                { id: '2', name: 'Anita Desai', email: 'anita@example.com' },
                { id: '3', name: 'Kiran Rao', email: 'kiran@example.com' },
                { id: '4', name: 'Sanjay Gupta', email: 'sanjay@example.com' },
            ]);
        } catch (error) {
            console.error('Failed to fetch purchase team:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMembers();
    };

    const renderMember = ({ item }: { item: PurchaseMember }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(director)/space/roles/purchase-team/${item.id}` as any)}
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
                data={members}
                keyExtractor={item => item.id}
                renderItem={renderMember}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cart-outline" size={56} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No purchase team members</Text>
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
