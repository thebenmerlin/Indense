// Design system theme
export const theme = {
    colors: {
        // Primary palette
        primary: {
            50: '#EBF5FF',
            100: '#E1EFFE',
            200: '#C3DDFD',
            300: '#A4CAFE',
            400: '#76A9FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
        },
        // Neutral palette
        neutral: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Background
        background: '#FFFFFF',
        surface: '#F9FAFB',
        surfaceVariant: '#F3F4F6',

        // Text
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textDisabled: '#9CA3AF',
        textInverse: '#FFFFFF',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    typography: {
        h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
        h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
        h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
        h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
        body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
        bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
        caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
        button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
    },
};

export type Theme = typeof theme;
export default theme;
