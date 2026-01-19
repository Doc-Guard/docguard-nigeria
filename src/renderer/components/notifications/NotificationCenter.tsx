import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, FileText, Shield, Briefcase, AlertTriangle, Info, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    Notification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications
} from '../../services/notificationService';

// Category icon mapping
const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
        case 'kyc': return Shield;
        case 'filing': return FileText;
        case 'document': return FileText;
        case 'loan': return Briefcase;
        case 'deadline': return AlertTriangle;
        default: return Info;
    }
};

// Type color mapping
const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
        case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
        case 'error': return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
        default: return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
    }
};

// Time ago formatter
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const NotificationCenter: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications and unread count
    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [notifs, count] = await Promise.all([
                getNotifications(user.id, 10),
                getUnreadCount(user.id)
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscribe to real-time updates
        if (user) {
            const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
                setUnreadCount(prev => prev + 1);
            });

            return unsubscribe;
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Navigate to related entity
        if (notification.reference_id && notification.reference_type) {
            setIsOpen(false);
            switch (notification.reference_type) {
                case 'loan':
                    navigate('/loans', { state: { selectedLoanId: notification.reference_id } });
                    break;
                case 'filing':
                    navigate('/registry', { state: { filingId: notification.reference_id } });
                    break;
                case 'document':
                    navigate('/doc-builder', { state: { docId: notification.reference_id } });
                    break;
                case 'kyc':
                    navigate('/kyc');
                    break;
            }
        }
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-emerald-50 bg-emerald-50/30">
                        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                            <Bell size={16} className="text-emerald-600" />
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-widest flex items-center gap-1"
                                >
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-emerald-600/50">
                                <Clock size={24} className="animate-spin mx-auto mb-2" />
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">No notifications yet</p>
                                <p className="text-xs mt-1">You'll see updates here</p>
                            </div>
                        ) : (
                            notifications.map(notification => {
                                const Icon = getCategoryIcon(notification.category);
                                const styles = getTypeStyles(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b border-emerald-50 hover:bg-emerald-50/30 cursor-pointer transition-colors ${!notification.read ? 'bg-emerald-50/20' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-xl ${styles.bg} shrink-0`}>
                                                <Icon size={16} className={styles.text} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-bold text-emerald-950 ${!notification.read ? '' : 'text-emerald-900/70'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className={`w-2 h-2 rounded-full ${styles.dot} shrink-0 mt-1.5`} />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                                    {formatTimeAgo(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-emerald-50 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="w-full text-center text-xs font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-widest py-2"
                            >
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
