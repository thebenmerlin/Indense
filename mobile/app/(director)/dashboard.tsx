import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import NotificationCenter from '../../src/components/NotificationCenter';

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

interface MenuCardProps {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

const MenuCard = ({ title, subtitle, icon, color, onPress }: MenuCardProps) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.menuCardContent}>
            <Text style={styles.menuCardTitle}>{title}</Text>
            <Text style={styles.menuCardSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
);

export default function DirectorDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (userJson) setUser(JSON.parse(userJson));
        } catch (e) { }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Welcome,</Text>
                    <Text style={styles.userName}>{user?.name || 'Director'}</Text>
                    <Text style={styles.role}>Director</Text>
                </View>
                <View style={styles.headerActions}>
                    <NotificationCenter primaryColor={theme.colors.primary} />
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push('/(director)/account' as any)}
                    >
                        <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Main Menu</Text>

                {/* Director's Space */}
                <MenuCard
                    title="Director's Space"
                    subtitle="Sites, Roles & Materials"
                    icon="grid-outline"
                    color="#8B5CF6"
                    onPress={() => router.push('/(director)/space' as any)}
                />

                {/* Indents */}
                <MenuCard
                    title="Indents"
                    subtitle="Pending, All, Damaged & Partial"
                    icon="document-text-outline"
                    color="#3B82F6"
                    onPress={() => router.push('/(director)/indents/pending' as any)}
                />

                {/* Analytics */}
                <MenuCard
                    title="Analytics"
                    subtitle="Reports & Insights"
                    icon="bar-chart-outline"
                    color="#10B981"
                    onPress={() => router.push('/(director)/analytics' as any)}
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primary },
    header: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerContent: { flex: 1 },
    greeting: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    userName: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
    role: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    profileButton: { padding: 4 },
    scrollView: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuCardContent: { flex: 1 },
    menuCardTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    menuCardSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
});
