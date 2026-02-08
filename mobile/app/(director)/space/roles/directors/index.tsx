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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usersApi, User } from '../../../../../src/api/users.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#8B5CF6',
        error: '#EF4444',
    }
};

export default function DirectorsList() {
    const [directors, setDirectors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchDirectors = useCallback(async () => {
        try {
            setError(null);
            const data = await usersApi.getByRole('DIRECTOR');
            setDirectors(data);
        } catch (err: any) {
            console.error('Failed to fetch directors:', err);
            setError(err?.message || 'Failed to load directors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDirectors();
        }, [fetchDirectors])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDirectors();
    };

    const renderDirector = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={[styles.card, item.isRevoked && styles.revokedCard]}
            onPress={() => router.push(`/(director)/space/roles/directors/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={[styles.avatar, item.isRevoked && styles.revokedAvatar]}>
                <Text style={[styles.avatarText, item.isRevoked && styles.revokedAvatarText]}>
                    {item.name.charAt(0)}
                </Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.nameRow}>
                    <Text style={[styles.name, item.isRevoked && styles.revokedText]}>{item.name}</Text>
                    {item.isRevoked && (
                        <View style={styles.revokedBadge}>
                            <Text style={styles.revokedBadgeText}>Revoked</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.email}>{item.email}</Text>
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

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={{ color: theme.colors.error, marginTop: 12 }}>{error}</Text>
                <TouchableOpacity onPress={fetchDirectors} style={{ marginTop: 16, padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 }}>
                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
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
    revokedCard: {
        opacity: 0.7,
        backgroundColor: theme.colors.surface,
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
    revokedAvatar: {
        backgroundColor: theme.colors.error + '20',
    },
    avatarText: { fontSize: 20, fontWeight: '600', color: theme.colors.accent },
    revokedAvatarText: { color: theme.colors.error },
    cardContent: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary },
    revokedText: { color: theme.colors.textSecondary },
    revokedBadge: {
        backgroundColor: theme.colors.error + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    revokedBadgeText: { fontSize: 11, fontWeight: '600', color: theme.colors.error },
    email: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    empty: { padding: 48, alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 16 },
});
