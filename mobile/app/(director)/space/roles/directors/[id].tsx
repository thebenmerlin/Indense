import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
    phone: string;
    dob: string;
}

export default function DirectorDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [director, setDirector] = useState<Director | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDirector();
    }, [id]);

    const fetchDirector = async () => {
        try {
            // TODO: Replace with actual API call
            setDirector({
                id: id!,
                name: 'Arun Mehta',
                email: 'arun@company.com',
                phone: '+91 99887 76655',
                dob: '1975-03-12',
            });
        } catch (error) {
            console.error('Failed to fetch director:', error);
            Alert.alert('Error', 'Failed to load director details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!director) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Director not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{director.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.name}>{director.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Director</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="person-outline" size={18} color={theme.colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>{director.name}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="call-outline" size={18} color={theme.colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone Number</Text>
                                <Text style={styles.infoValue}>{director.phone}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="mail-outline" size={18} color={theme.colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{director.email}</Text>
                            </View>
                        </View>
                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.infoIcon}>
                                <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Date of Birth</Text>
                                <Text style={styles.infoValue}>{formatDate(director.dob)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    profileCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 24,
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: theme.colors.accent },
    name: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary },
    badge: {
        backgroundColor: theme.colors.accent + '15',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    badgeText: { fontSize: 13, fontWeight: '600', color: theme.colors.accent },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: theme.colors.textSecondary },
    infoValue: { fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary, marginTop: 2 },
});
