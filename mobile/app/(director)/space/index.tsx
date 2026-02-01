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
    }
};

interface MenuItemProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

const MenuItem = ({ title, description, icon, color, onPress }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.colors.textSecondary} />
    </TouchableOpacity>
);

export default function DirectorSpace() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.pageTitle}>Manage your organization</Text>

            <MenuItem
                title="Site Management"
                description="Add, edit, and manage sites"
                icon="business-outline"
                color="#8B5CF6"
                onPress={() => router.push('/(director)/space/sites' as any)}
            />

            <MenuItem
                title="Role Management"
                description="Manage engineers, team & directors"
                icon="people-outline"
                color="#3B82F6"
                onPress={() => router.push('/(director)/space/roles' as any)}
            />

            <MenuItem
                title="Material Management"
                description="Add and manage materials catalog"
                icon="cube-outline"
                color="#10B981"
                onPress={() => router.push('/(director)/space/materials' as any)}
            />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.surface, padding: 20 },
    pageTitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardBg,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
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
    menuContent: { flex: 1 },
    menuTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.textPrimary },
    menuDescription: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
});
