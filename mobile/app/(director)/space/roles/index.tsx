import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usersApi, RoleCounts } from '../../../../src/api/users.api';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
    }
};

interface RoleCardProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    count?: number;
    loading?: boolean;
    onPress: () => void;
}

const RoleCard = ({ title, description, icon, color, count, loading, onPress }: RoleCardProps) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
        {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />
        ) : count !== undefined && (
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
            </View>
        )}
        <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacity>
);

export default function RoleManagement() {
    const router = useRouter();
    const [counts, setCounts] = useState<RoleCounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCounts = useCallback(async () => {
        try {
            const data = await usersApi.getRoleCounts();
            setCounts(data);
        } catch (error) {
            console.error('Failed to fetch role counts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCounts();
    }, [fetchCounts]);

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.pageDescription}>Manage team members and their roles</Text>

            <RoleCard
                title="Site Engineers"
                description="On-site engineers managing indents"
                icon="construct-outline"
                color="#F59E0B"
                count={counts?.siteEngineers}
                loading={loading}
                onPress={() => router.push('/(director)/space/roles/engineers' as any)}
            />

            <RoleCard
                title="Purchase Team"
                description="Team handling purchases and orders"
                icon="cart-outline"
                color="#3B82F6"
                count={counts?.purchaseTeam}
                loading={loading}
                onPress={() => router.push('/(director)/space/roles/purchase-team' as any)}
            />

            <RoleCard
                title="Directors"
                description="Directors with full access"
                icon="shield-outline"
                color="#8B5CF6"
                count={counts?.directors}
                loading={loading}
                onPress={() => router.push('/(director)/space/roles/directors' as any)}
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface, padding: 16 },
    pageDescription: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
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
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.textPrimary },
    cardDescription: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    countBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 8,
    },
    countText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
});
