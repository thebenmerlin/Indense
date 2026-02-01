import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { ROLE_NAMES } from '../../src/constants';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
    }
};

export default function DirectorAccount() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || 'D'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'Director'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {user?.role ? ROLE_NAMES[user.role] : 'Director'}
                    </Text>
                </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{user?.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>{user?.role ? ROLE_NAMES[user.role] : '-'}</Text>
                    </View>
                </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="moon-outline" size={20} color={theme.colors.primary} />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    profileCard: {
        backgroundColor: theme.colors.primary,
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
    userName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
    },
    roleText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
    section: { padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoLabel: { fontSize: 14, color: theme.colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '500', color: theme.colors.textPrimary },
    settingsCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 15, color: theme.colors.textPrimary },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.colors.textPrimary },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.error,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
