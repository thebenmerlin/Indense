import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
        warning: '#F59E0B',
        urgent: '#EF4444',
    }
};

interface IndentItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    isUrgent: boolean;
}

interface Indent {
    id: string;
    name: string;
    siteName: string;
    siteEngineer: string;
    createdAt: string;
    expectedDate: string;
    description: string;
    status: 'PENDING' | 'PT_APPROVED' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';
    items: IndentItem[];
}

export default function PendingIndentDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [indent, setIndent] = useState<Indent | null>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [showMaterial, setShowMaterial] = useState<IndentItem | null>(null);

    // Animation for on-hold button
    const holdAnim = useRef(new Animated.Value(0)).current;
    const [actionState, setActionState] = useState<'initial' | 'approved' | 'rejected' | 'on_hold'>('initial');

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
                status: 'PT_APPROVED',
                items: [
                    { id: '1', name: 'TMT Steel Bars 12mm', quantity: 500, unit: 'kg', isUrgent: true },
                    { id: '2', name: 'Cement OPC 53', quantity: 100, unit: 'bags', isUrgent: false },
                    { id: '3', name: 'Sand', quantity: 50, unit: 'cubic ft', isUrgent: false },
                ],
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

    const handleApprove = () => {
        if (actionState === 'approved') {
            // Unapprove
            Alert.alert('Unapprove', 'Remove approval?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Unapprove', onPress: () => setActionState('initial') }
            ]);
        } else {
            Alert.alert('Approve Indent', 'Are you sure you want to approve this indent?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Approve', onPress: () => setActionState('approved') }
            ]);
        }
    };

    const handleReject = () => {
        if (actionState === 'rejected') {
            Alert.alert('Unreject', 'Remove rejection?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Unreject', onPress: () => setActionState('initial') }
            ]);
        } else {
            Alert.alert('Reject Indent', 'Are you sure you want to reject this indent?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reject', style: 'destructive', onPress: () => setActionState('rejected') }
            ]);
        }
    };

    const handleOnHold = () => {
        if (actionState === 'on_hold') {
            // Remove from hold
            Animated.timing(holdAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => setActionState('initial'));
        } else {
            Alert.alert('Put On Hold', 'Are you sure you want to put this indent on hold?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'On Hold',
                    onPress: () => {
                        setActionState('on_hold');
                        Animated.timing(holdAnim, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: false,
                        }).start();
                    }
                }
            ]);
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

    const holdButtonTop = holdAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -60],
    });

    const approveRejectOpacity = holdAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Indent Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.indentName}>{indent.name}</Text>

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
                            {item.isUrgent && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentText}>URGENT</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    <View style={styles.actionsContainer}>
                        {actionState !== 'on_hold' && (
                            <Animated.View style={[styles.actionRow, { opacity: approveRejectOpacity }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.approveButton,
                                        actionState === 'approved' && styles.actionButtonActive
                                    ]}
                                    onPress={handleApprove}
                                >
                                    <Ionicons name={actionState === 'approved' ? "checkmark-circle" : "checkmark"} size={22} color={actionState === 'approved' ? '#FFFFFF' : theme.colors.success} />
                                    <Text style={[styles.approveText, actionState === 'approved' && styles.actionTextActive]}>
                                        {actionState === 'approved' ? 'Approved' : 'Approve'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.rejectButton,
                                        actionState === 'rejected' && styles.rejectButtonActive
                                    ]}
                                    onPress={handleReject}
                                >
                                    <Ionicons name={actionState === 'rejected' ? "close-circle" : "close"} size={22} color={actionState === 'rejected' ? '#FFFFFF' : theme.colors.error} />
                                    <Text style={[styles.rejectText, actionState === 'rejected' && styles.actionTextActive]}>
                                        {actionState === 'rejected' ? 'Rejected' : 'Reject'}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        <Animated.View style={{ transform: [{ translateY: holdButtonTop }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.onHoldButton,
                                    actionState === 'on_hold' && styles.onHoldButtonActive
                                ]}
                                onPress={handleOnHold}
                            >
                                <Ionicons name={actionState === 'on_hold' ? "play" : "pause"} size={22} color={actionState === 'on_hold' ? '#FFFFFF' : theme.colors.warning} />
                                <Text style={[styles.onHoldText, actionState === 'on_hold' && styles.actionTextActive]}>
                                    {actionState === 'on_hold' ? 'Remove from Hold' : 'On Hold'}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* Remarks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Remarks (Optional)</Text>
                    <TextInput
                        style={styles.remarksInput}
                        placeholder="Add remarks, reasons, or doubts..."
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                        numberOfLines={3}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>

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
                        <View style={styles.modalContent}>
                            <Text style={styles.modalMaterialName}>{showMaterial.name}</Text>
                            {showMaterial.isUrgent && (
                                <View style={[styles.urgentBadge, { alignSelf: 'flex-start', marginBottom: 16 }]}>
                                    <Text style={styles.urgentText}>URGENT</Text>
                                </View>
                            )}
                            <View style={styles.modalInfoRow}>
                                <Text style={styles.modalInfoLabel}>Quantity</Text>
                                <Text style={styles.modalInfoValue}>{showMaterial.quantity} {showMaterial.unit}</Text>
                            </View>
                        </View>
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
    indentName: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16 },
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
    urgentBadge: { backgroundColor: theme.colors.urgent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 },
    urgentText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    actionsContainer: { overflow: 'hidden', minHeight: 120 },
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    approveButton: { backgroundColor: theme.colors.success + '15' },
    rejectButton: { backgroundColor: theme.colors.error + '15' },
    actionButtonActive: { backgroundColor: theme.colors.success },
    rejectButtonActive: { backgroundColor: theme.colors.error },
    approveText: { fontSize: 16, fontWeight: '600', color: theme.colors.success },
    rejectText: { fontSize: 16, fontWeight: '600', color: theme.colors.error },
    actionTextActive: { color: '#FFFFFF' },
    onHoldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.warning + '15',
        gap: 8,
    },
    onHoldButtonActive: { backgroundColor: theme.colors.warning },
    onHoldText: { fontSize: 16, fontWeight: '600', color: theme.colors.warning },
    remarksInput: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 80,
        textAlignVertical: 'top',
        color: theme.colors.textPrimary,
    },
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
    modalMaterialName: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 },
    modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalInfoLabel: { fontSize: 15, color: theme.colors.textSecondary },
    modalInfoValue: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
});
