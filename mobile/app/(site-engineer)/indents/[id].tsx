import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { indentsApi } from '../../../src/api';
import { Indent } from '../../../src/types';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../../src/constants';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
    }
};

export default function IndentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchIndent();
        }
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
                <Text style={styles.errorText}>Indent not found</Text>
            </View>
        );
    }

    const StatusBadge = ({ status }: { status: IndentStatus }) => {
        const bgColor = STATUS_COLORS[status] + '20';
        const textColor = STATUS_COLORS[status];
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>
                    {STATUS_LABELS[status]}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.indentNumber}>{indent.indentNumber}</Text>
                    <StatusBadge status={indent.status} />
                </View>
                <Text style={styles.siteName}>{indent.site?.name}</Text>
                <Text style={styles.date}>
                    Created: {new Date(indent.createdAt).toLocaleDateString()}
                </Text>
                {indent.notes && (
                    <Text style={styles.notes}>Notes: {indent.notes}</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({indent.items?.length || 0})</Text>
                {indent.items?.map((item, index) => (
                    <View key={item.id || index} style={styles.itemCard}>
                        <Text style={styles.materialName}>{item.material?.name}</Text>
                        <Text style={styles.materialCode}>{item.material?.code}</Text>
                        <View style={styles.qtyRow}>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Requested</Text>
                                <Text style={styles.qtyValue}>
                                    {item.requestedQty} {item.material?.unit}
                                </Text>
                            </View>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Received</Text>
                                <Text style={styles.qtyValue}>
                                    {item.receivedQty} {item.material?.unit}
                                </Text>
                            </View>
                            <View style={styles.qtyItem}>
                                <Text style={styles.qtyLabel}>Pending</Text>
                                <Text style={styles.qtyValue}>
                                    {item.pendingQty} {item.material?.unit}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {indent.purchaseApprovedBy && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Approvals</Text>
                    <View style={styles.approvalCard}>
                        <Text style={styles.approvalLabel}>Purchase Team</Text>
                        <Text style={styles.approvalName}>{indent.purchaseApprovedBy.name}</Text>
                        <Text style={styles.approvalDate}>
                            {indent.purchaseApprovedAt
                                ? new Date(indent.purchaseApprovedAt).toLocaleDateString()
                                : '-'}
                        </Text>
                    </View>
                    {indent.directorApprovedBy && (
                        <View style={styles.approvalCard}>
                            <Text style={styles.approvalLabel}>Director</Text>
                            <Text style={styles.approvalName}>{indent.directorApprovedBy.name}</Text>
                            <Text style={styles.approvalDate}>
                                {indent.directorApprovedAt
                                    ? new Date(indent.directorApprovedAt).toLocaleDateString()
                                    : '-'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {indent.rejectionReason && (
                <View style={styles.section}>
                    <View style={styles.rejectionCard}>
                        <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                        <Text style={styles.rejectionReason}>{indent.rejectionReason}</Text>
                    </View>
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
    errorText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    header: {
        backgroundColor: theme.colors.cardBg,
        padding: 16,
        marginBottom: 8,
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
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    notes: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
        fontStyle: 'italic',
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
        marginBottom: 12,
    },
    qtyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    qtyItem: {
        alignItems: 'center',
    },
    qtyLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    approvalCard: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    approvalLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    approvalName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginTop: 4,
    },
    approvalDate: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    rejectionCard: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    rejectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: 4,
    },
    rejectionReason: {
        fontSize: 14,
        color: '#991B1B',
    },
});
