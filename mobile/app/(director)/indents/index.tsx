import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://indense.onrender.com/api/v1';

export default function PendingApprovals() {
    const [indents, setIndents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => { loadIndents(); }, []);

    const loadIndents = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents?status=PURCHASE_APPROVED`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) setIndents(data.data || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };

    const handleApprove = async (id: string) => {
        try {
            const token = await SecureStore.getItemAsync('auth_access_token');
            const response = await fetch(`${API_URL}/indents/${id}/director-approve`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) { Alert.alert('Success', 'Indent approved'); loadIndents(); }
        } catch (e) { Alert.alert('Error', 'Failed'); }
    };

    const handleReject = async (id: string) => {
        Alert.prompt('Reject', 'Enter reason:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject', style: 'destructive',
                onPress: async (reason) => {
                    try {
                        const token = await SecureStore.getItemAsync('auth_access_token');
                        await fetch(`${API_URL}/indents/${id}/director-reject`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ reason: reason || 'Rejected' }),
                        });
                        loadIndents();
                    } catch (e) { }
                },
            },
        ]);
    };

    const renderIndent = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => router.push(`/(director)/indents/${item.id}`)}>
                <Text style={styles.indentNumber}>{item.indentNumber}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.items?.length || 0} items • {item.site?.name}</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleReject(item.id)}>
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleApprove(item.id)}>
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backButton}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Pending Approvals</Text>
                <View style={{ width: 50 }} />
            </View>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>
            ) : (
                <FlatList
                    data={indents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderIndent}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadIndents(); }} />}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>✅</Text><Text style={styles.emptyText}>No pending approvals</Text></View>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 16 },
    backButton: { color: '#FFFFFF', fontSize: 16 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
    indentNumber: { fontSize: 14, fontWeight: '600', color: '#059669' },
    name: { fontSize: 16, fontWeight: '600', color: '#111827', marginVertical: 4 },
    meta: { fontSize: 12, color: '#6B7280' },
    actions: { flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' },
    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
    rejectBtn: { backgroundColor: '#FEE2E2' },
    rejectText: { color: '#EF4444', fontWeight: '600' },
    approveBtn: { backgroundColor: '#D1FAE5' },
    approveText: { color: '#10B981', fontWeight: '600' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, color: '#6B7280' },
});
