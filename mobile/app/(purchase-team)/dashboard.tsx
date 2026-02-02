import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function PurchaseTeamDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => { loadUser(); }, []);

    const loadUser = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('auth_user');
            if (userJson) setUser(JSON.parse(userJson));
        } catch (e) { }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>{user?.name || 'Purchase Team'}</Text>
                <Text style={styles.role}>Purchase Team</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>8</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.statValue, { color: '#3B82F6' }]}>15</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/indents')}>
                    <Text style={styles.actionIcon}>📋</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Pending Indents</Text>
                        <Text style={styles.actionDesc}>Review and approve material requests</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/orders/select')}>
                    <Text style={styles.actionIcon}>🛒</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Create Order</Text>
                        <Text style={styles.actionDesc}>Place orders with vendors</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/orders')}>
                    <Text style={styles.actionIcon}>📦</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>All Orders</Text>
                        <Text style={styles.actionDesc}>Track order status</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/partial')}>
                    <Text style={styles.actionIcon}>📊</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Partial Receipts</Text>
                        <Text style={styles.actionDesc}>Manage partial deliveries</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/damages')}>
                    <Text style={styles.actionIcon}>⚠️</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Damages</Text>
                        <Text style={styles.actionDesc}>Review damage reports</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(purchase-team)/account')}>
                    <Text style={styles.actionIcon}>👤</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Account</Text>
                        <Text style={styles.actionDesc}>Profile and settings</Text>
                    </View>
                    <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
    greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    role: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    content: { flex: 1, padding: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { flex: 1, marginHorizontal: 4, padding: 16, borderRadius: 12, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
    actionCard: {
        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row',
        alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    actionIcon: { fontSize: 28, marginRight: 16 },
    actionContent: { flex: 1 },
    actionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
    actionDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    actionArrow: { fontSize: 20, color: '#9CA3AF' },
});
