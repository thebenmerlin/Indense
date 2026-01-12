import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../../constants';

interface LoadingProps {
    size?: 'small' | 'large';
    color?: string;
}

export function Loading({ size = 'large', color = theme.colors.primary[600] }: LoadingProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default Loading;
