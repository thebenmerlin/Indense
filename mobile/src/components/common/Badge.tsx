import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IndentStatus, STATUS_LABELS, STATUS_COLORS } from '../../constants';

interface BadgeProps {
    status: IndentStatus;
}

export function StatusBadge({ status }: BadgeProps) {
    const backgroundColor = STATUS_COLORS[status] + '20'; // 20% opacity
    const textColor = STATUS_COLORS[status];

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={[styles.text, { color: textColor }]}>
                {STATUS_LABELS[status]}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default StatusBadge;
