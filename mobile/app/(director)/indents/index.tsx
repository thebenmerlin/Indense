import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const theme = {
    colors: {
        primary: '#1E3A8A',
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        accent: '#3B82F6',
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#10B981',
    }
};

interface MenuButtonProps {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

const MenuButton = ({ title, subtitle, icon, color, onPress }: MenuButtonProps) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>{title}</Text>
            <Text style={styles.buttonSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacity>
);

export default function IndentsMenu() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Indent Management</Text>

                <MenuButton
                    title="Pending Approvals"
                    subtitle="Indents awaiting your approval"
                    icon="time-outline"
                    color={theme.colors.warning}
                    onPress={() => router.push('/(director)/indents/pending' as any)}
                />

                <MenuButton
                    title="All Indents"
                    subtitle="View and manage all indents"
                    icon="document-text-outline"
                    color={theme.colors.accent}
                    onPress={() => router.push('/(director)/indents/all' as any)}
                />

                <MenuButton
                    title="Damaged Orders"
                    subtitle="Orders with reported damages"
                    icon="alert-circle-outline"
                    color={theme.colors.danger}
                    onPress={() => router.push('/(director)/indents/damaged' as any)}
                />

                <MenuButton
                    title="Partially Received"
                    subtitle="Orders with pending deliveries"
                    icon="cube-outline"
                    color={theme.colors.success}
                    onPress={() => router.push('/(director)/indents/partial' as any)}
                />

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    buttonContent: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    buttonSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});
