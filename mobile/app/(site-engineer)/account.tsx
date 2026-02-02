import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Account() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => { loadUser(); }, []);

    const loadUser = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (userJson) setUser(JSON.parse(userJson));
        } catch (e) {
            console.warn('Failed:', e);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await SecureStore.deleteItemAsync('auth_access_token');
                        await SecureStore.deleteItemAsync('auth_refresh_token');
                        await SecureStore.deleteItemAsync('auth_user');
                    } catch (e) { }
                    router.replace('/');
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Account</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role?.replace(/_/g, ' ')}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>👤</Text>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🔒</Text>
                        <Text style={styles.menuText}>Change Password</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🔔</Text>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 16,
    },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    content: { flex: 1, padding: 16 },
    profileCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold' },
    name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
    email: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
    roleBadge: { backgroundColor: '#EBF5FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    roleText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 24 },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    menuIcon: { fontSize: 20, marginRight: 16 },
    menuText: { flex: 1, fontSize: 16, color: '#111827' },
    menuArrow: { fontSize: 16, color: '#9CA3AF' },
    logoutButton: {
        backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    },
    logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
