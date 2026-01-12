import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

const theme = {
    colors: {
        primary: '#1D4ED8',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        error: '#EF4444',
    }
};

export default function PurchaseIndentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (id) fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            const data = await indentsApi.getById(id!);
            setIndent(data);
        } catch (error) {
            console.error('Failed to fetch indent:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setApproving(true);
        try {
            await indentsApi.purchaseApprove(id!, remarks || undefined);
            Alert.alert('Success', 'Indent approved successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to approve');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Error', 'Please enter a rejection reason');
            return;
        }
        setRejecting(true);
        try {
            await indentsApi.reject(id!, rejectReason);
            Alert.alert('Success', 'Indent rejected', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to reject');
        } finally {
            setRejecting(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!indent) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Indent not found</Text>
            </View>
        );
    }

    const StatusBadge = ({ status }: { status: IndentStatus }) => (
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
                {STATUS_LABELS[status]}
            </Text>
        </View>
    );

    const canApprove = indent.status === IndentStatus.SUBMITTED;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                    <StatusBadge status={indent.status} />
                </View>
                <Text style={styles.siteName}>{indent.site?.name}</Text>
                <Text style={styles.createdBy}>By: {indent.createdBy?.name}</Text>
                <Text style={styles.date}>
                    Created: {new Date(indent.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({indent.items?.length || 0})</Text>
                {indent.items?.map((item, index) => (
                    <View key={item.id || index} style={styles.itemCard}>
                        <Text style={styles.materialName}>{item.material?.name}</Text>
                        <Text style={styles.materialCode}>{item.material?.code}</Text>
                        <Text style={styles.qty}>
                            Requested: {item.requestedQty} {item.material?.unit}
                        </Text>
                    </View>
                ))}
            </View>

            {canApprove && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Add remarks (optional)"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                    />

                    <TouchableOpacity
                        style={styles.approveButton}
                        onPress={handleApprove}
                        disabled={approving}
                    >
                        {approving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.approveButtonText}>Approve Indent</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => setShowRejectModal(true)}
                    >
                        <Text style={styles.rejectButtonText}>Reject Indent</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showRejectModal && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rejection Reason</Text>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Enter reason for rejection..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={rejectReason}
                        onChangeText={setRejectReason}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.confirmRejectButton}
                        onPress={handleReject}
                        disabled={rejecting}
                    >
                        {rejecting ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.approveButtonText}>Confirm Rejection</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    indentNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    siteName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    createdBy: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    date: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    itemCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    materialName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    materialCode: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    qty: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        marginTop: 8,
    },
    remarksInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 60,
        marginBottom: 12,
        textAlignVertical: 'top',
    },
    approveButton: {
        backgroundColor: theme.colors.success,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    approveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    rejectButton: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.error,
    },
    rejectButtonText: {
        color: theme.colors.error,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmRejectButton: {
        backgroundColor: theme.colors.error,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
});
