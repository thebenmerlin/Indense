import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Image,
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
        success: '#10B981',
        error: '#EF4444',
    }
};

interface IndentItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    isPurchased: boolean;
    vendor?: { name: string; contact: string };
    cost?: number;
    invoices?: string[];
}

interface Indent {
    id: string;
    name: string;
    siteName: string;
    siteEngineer: string;
    createdAt: string;
    expectedDate: string;
    description: string;
    approvalStatus: string;
    purchaseStatus: string;
    isClosed: boolean;
    items: IndentItem[];
    receipts?: string[];
}

export default function IndentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMaterial, setShowMaterial] = useState<IndentItem | null>(null);
    const [showReceipts, setShowReceipts] = useState(false);

    useEffect(() => {
        fetchIndent();
    }, [id]);

    const fetchIndent = async () => {
        try {
            // TODO: Replace with actual API call
            setIndent({
                id: id!,
                name: 'Steel & Cement Order',
                siteName: 'Green Valley Residences',
                siteEngineer: 'Rajesh Kumar',
                createdAt: '2024-02-01',
                expectedDate: '2024-02-10',
                description: 'Required for foundation work in Block A',
                approvalStatus: 'Approved',
                purchaseStatus: 'Ordered',
                isClosed: false,
                items: [
                    { id: '1', name: 'TMT Steel Bars 12mm', quantity: 500, unit: 'kg', isPurchased: true, vendor: { name: 'Steel Corp', contact: '+91 98765 43210' }, cost: 45000, invoices: ['invoice1.pdf'] },
                    { id: '2', name: 'Cement OPC 53', quantity: 100, unit: 'bags', isPurchased: true, vendor: { name: 'Cement Ltd', contact: '+91 98765 12345' }, cost: 35000 },
                    { id: '3', name: 'Sand', quantity: 50, unit: 'cubic ft', isPurchased: false },
                ],
                receipts: [],
            });
        } catch (error) {
            console.error('Failed to fetch indent:', error);
            Alert.alert('Error', 'Failed to load indent details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': case 'Ordered': case 'Received': return theme.colors.success;
            case 'Rejected': return theme.colors.error;
            default: return theme.colors.textSecondary;
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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Indent Info */}
                <View style={styles.infoCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.indentName}>{indent.name}</Text>
                        <View style={styles.statusBadges}>
                            <View style={[styles.badge, { backgroundColor: getStatusColor(indent.approvalStatus) + '15' }]}>
                                <Text style={[styles.badgeText, { color: getStatusColor(indent.approvalStatus) }]}>{indent.approvalStatus}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: getStatusColor(indent.purchaseStatus) + '15' }]}>
                                <Text style={[styles.badgeText, { color: getStatusColor(indent.purchaseStatus) }]}>{indent.purchaseStatus}</Text>
                            </View>
                            {indent.isClosed && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.textSecondary + '15' }]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>Closed</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Site</Text>
                            <Text style={styles.infoValue}>{indent.siteName}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Site Engineer</Text>
                            <Text style={styles.infoValue}>{indent.siteEngineer}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Created</Text>
                            <Text style={styles.infoValue}>{formatDate(indent.createdAt)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Expected</Text>
                            <Text style={styles.infoValue}>{formatDate(indent.expectedDate)}</Text>
                        </View>
                    </View>

                    {indent.description && (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionLabel}>Description</Text>
                            <Text style={styles.descriptionText}>{indent.description}</Text>
                        </View>
                    )}
                </View>

                {/* Materials List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials ({indent.items.length})</Text>
                    {indent.items.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.materialCard}
                            onPress={() => setShowMaterial(item)}
                        >
                            <View style={styles.materialInfo}>
                                <Text style={styles.materialName}>{item.name}</Text>
                                <Text style={styles.materialQty}>{item.quantity} {item.unit}</Text>
                            </View>
                            {item.isPurchased && (
                                <View style={styles.purchasedBadge}>
                                    <Text style={styles.purchasedText}>Purchased</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Receipts (if closed) */}
                {indent.isClosed && indent.receipts && indent.receipts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Receipts</Text>
                        <TouchableOpacity style={styles.viewReceiptsButton} onPress={() => setShowReceipts(true)}>
                            <Ionicons name="document-attach" size={20} color={theme.colors.primary} />
                            <Text style={styles.viewReceiptsText}>View Uploaded Receipts</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Closed Status Button */}
                {indent.isClosed && (
                    <View style={styles.section}>
                        <View style={styles.closedButton}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                            <Text style={styles.closedButtonText}>Indent Closed</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Material Detail Modal */}
            <Modal visible={!!showMaterial} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Material Details</Text>
                        <TouchableOpacity onPress={() => setShowMaterial(null)}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {showMaterial && (
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalMaterialName}>{showMaterial.name}</Text>

                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Quantity</Text>
                                <Text style={styles.modalInfoValue}>{showMaterial.quantity} {showMaterial.unit}</Text>
                            </View>

                            {showMaterial.isPurchased && showMaterial.vendor && (
                                <>
                                    <Text style={styles.modalSectionTitle}>Vendor Details</Text>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Vendor Name</Text>
                                        <Text style={styles.modalInfoValue}>{showMaterial.vendor.name}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Contact</Text>
                                        <Text style={styles.modalInfoValue}>{showMaterial.vendor.contact}</Text>
                                    </View>
                                    {showMaterial.cost && (
                                        <View style={styles.modalInfoRow}>
                                            <Text style={styles.modalInfoLabel}>Cost</Text>
                                            <Text style={styles.modalInfoValue}>₹{showMaterial.cost.toLocaleString()}</Text>
                                        </View>
                                    )}
                                    {showMaterial.invoices && showMaterial.invoices.length > 0 && (
                                        <TouchableOpacity style={styles.viewInvoicesButton}>
                                            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                                            <Text style={styles.viewInvoicesText}>View Invoices</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: theme.colors.textSecondary },
    infoCard: {
        backgroundColor: theme.colors.cardBg,
        padding: 20,
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: { marginBottom: 16 },
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
    statusBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: { width: '47%', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 10 },
    infoLabel: { fontSize: 12, color: theme.colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 2 },
    descriptionBox: { marginTop: 16, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10 },
    descriptionLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    descriptionText: { fontSize: 14, color: theme.colors.textPrimary },
    section: { padding: 16, paddingTop: 0 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
    materialCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    materialInfo: { flex: 1 },
    materialName: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    materialQty: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    purchasedBadge: { backgroundColor: theme.colors.success + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 },
    purchasedText: { fontSize: 11, fontWeight: '600', color: theme.colors.success },
    viewReceiptsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary + '15',
        padding: 14,
        borderRadius: 10,
        gap: 8,
    },
    viewReceiptsText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    closedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    closedButtonText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    modal: { flex: 1, backgroundColor: theme.colors.surface },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
    modalContent: { padding: 20 },
    modalMaterialName: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 },
    modalSectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 20, marginBottom: 12, textTransform: 'uppercase' },
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalInfoLabel: { fontSize: 15, color: theme.colors.textSecondary },
    modalInfoValue: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
    viewInvoicesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary + '15',
        padding: 14,
        borderRadius: 10,
        marginTop: 16,
        gap: 8,
    },
    viewInvoicesText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
});
