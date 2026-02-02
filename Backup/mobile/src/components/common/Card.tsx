import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    style?: ViewStyle;
}

export function Card({ children, title, style }: CardProps) {
    return (
        <View style={[styles.card, theme.shadows.md, style]}>
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
});

export default Card;
