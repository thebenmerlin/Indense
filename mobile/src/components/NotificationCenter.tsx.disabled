import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { notificationsApi, Notification } from '../api/notifications.api';

interface NotificationCenterProps {
    primaryColor?: string;
}

const theme = {
    colors: {
        surface: '#F8FAFC',
        cardBg: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        unread: '#DBEAFE',
    }
};

export default function NotificationCenter({ primaryColor = '#1E3A8A' }: NotificationCenterProps) {
    const [visible, setVisible] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { count } = await notificationsApi.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await notificationsApi.getAll({ limit: 50 });
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for unread count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const handleOpen = () => {
        setVisible(true);
        setLoading(true);
        fetchNotifications();
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
        fetchUnreadCount();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await notificationsApi.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        // Navigate based on notification data
        setVisible(false);

        const data = notification.data;
        if (data?.screen) {
            const indentId = notification.indent?.id || (data.indentId as string);
            if (indentId && (data.screen as string).includes('[id]')) {
                router.push((data.screen as string).replace('[id]', indentId) as any);
            } else {
                router.push(data.screen as any);
            }
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && { backgroundColor: theme.colors.unread }]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
                    {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
                {item.indent && (
                    <Text style={styles.indentRef}>#{item.indent.indentNumber}</Text>
                )}
                <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            {/* Bell Icon */}
            <TouchableOpacity style={styles.bellContainer} onPress={handleOpen}>
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Notification Modal */}
            <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalHeader, { backgroundColor: primaryColor }]}>
                        <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                                <Text style={styles.markAllText}>Mark all read</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={primaryColor} />
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={item => item.id}
                            renderItem={renderNotification}
                            contentContainerStyle={styles.list}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                            }
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Ionicons name="notifications-off-outline" size={56} color={theme.colors.textSecondary} />
                                    <Text style={styles.emptyText}>No notifications</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    bellContainer: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    markAllButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 6,
    },
    markAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 12,
    },
    notificationItem: {
        backgroundColor: theme.colors.cardBg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    notificationContent: {},
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    indentRef: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    notificationTime: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginTop: 6,
    },
    empty: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 12,
    },
});
