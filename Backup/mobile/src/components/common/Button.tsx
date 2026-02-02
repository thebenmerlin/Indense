import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? theme.colors.primary[600] : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    // Variants
    primary: {
        backgroundColor: theme.colors.primary[600],
    },
    secondary: {
        backgroundColor: theme.colors.neutral[600],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary[600],
    },
    danger: {
        backgroundColor: theme.colors.error,
    },
    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48,
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 56,
    },
    // States
    disabled: {
        backgroundColor: theme.colors.neutral[300],
        borderColor: theme.colors.neutral[300],
    },
    // Text styles
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: theme.colors.primary[600],
    },
    dangerText: {
        color: '#FFFFFF',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    disabledText: {
        color: theme.colors.neutral[500],
    },
});

export default Button;
