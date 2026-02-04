import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IndentStatus } from '../types';

const theme = {
    colors: {
        primary: '#3B82F6',
        surface: '#F9FAFB',
        cardBg: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#D1D5DB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    }
};

export interface FilterOptions {
    startDate?: Date | null;
    endDate?: Date | null;
    status?: IndentStatus | 'ALL';
    siteId?: string | null;
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    initialFilters?: FilterOptions;
    showStatusFilter?: boolean;
}

const STATUS_OPTIONS: { value: IndentStatus | 'ALL'; label: string; color: string }[] = [
    { value: 'ALL', label: 'All', color: theme.colors.textSecondary },
    { value: IndentStatus.SUBMITTED, label: 'Pending', color: theme.colors.warning },
    { value: IndentStatus.PURCHASE_APPROVED, label: 'PT Approved', color: theme.colors.primary },
    { value: IndentStatus.DIRECTOR_APPROVED, label: 'Approved', color: theme.colors.success },
    { value: IndentStatus.ORDER_PLACED, label: 'Ordered', color: '#8B5CF6' },
    { value: IndentStatus.CLOSED, label: 'Closed', color: theme.colors.textSecondary },
];

export default function FilterModal({ visible, onClose, onApply, initialFilters = {}, showStatusFilter = true }: FilterModalProps) {
    const [startDate, setStartDate] = useState<Date | null>(initialFilters.startDate || null);
    const [endDate, setEndDate] = useState<Date | null>(initialFilters.endDate || null);
    const [status, setStatus] = useState<IndentStatus | 'ALL'>(initialFilters.status || 'ALL');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleApply = () => {
        onApply({ startDate, endDate, status, siteId: initialFilters.siteId });
        onClose();
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setStatus('ALL');
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Filters</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Date Range */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Date Range</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                            </TouchableOpacity>
                            <Text style={styles.dateSeparator}>to</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                            </TouchableOpacity>
                        </View>
                        {startDate && (
                            <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); }}>
                                <Text style={styles.clearLink}>Clear dates</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Status Filter */}
                    {showStatusFilter && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Status</Text>
                        <View style={styles.statusGrid}>
                            {STATUS_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.statusChip,
                                        status === option.value && styles.statusChipActive,
                                        status === option.value && { borderColor: option.color },
                                    ]}
                                    onPress={() => setStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.statusChipText,
                                        status === option.value && { color: option.color },
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    )}
                </View>

                {/* Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>

                {/* Date Pickers */}
                {showStartPicker && (
                    <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowStartPicker(Platform.OS === 'ios');
                            if (date) setStartDate(date);
                        }}
                    />
                )}
                {showEndPicker && (
                    <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowEndPicker(Platform.OS === 'ios');
                            if (date) setEndDate(date);
                        }}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: theme.colors.cardBg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dateText: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        marginLeft: 8,
    },
    dateSeparator: {
        marginHorizontal: 12,
        color: theme.colors.textSecondary,
    },
    clearLink: {
        fontSize: 14,
        color: theme.colors.primary,
        marginTop: 8,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: theme.colors.cardBg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statusChipActive: {
        borderWidth: 2,
        backgroundColor: '#EFF6FF',
    },
    statusChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.cardBg,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
