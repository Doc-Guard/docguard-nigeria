import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, FileText, Shield, Briefcase, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../common/Toast';
import {
    Notification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteOldNotifications
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
        case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
        case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
        case 'error': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' };
        default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    }
};

const NotificationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const fetchNotifications = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getNotifications(user.id, 100);
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast('All notifications marked as read', 'success');
    };

    const handleClearOld = async () => {
        if (!user) return;
        const count = await deleteOldNotifications(user.id, 30);
        if (count > 0) {
            showToast(`Deleted ${count} old notifications`, 'success');
            fetchNotifications();
        } else {
            showToast('No old notifications to delete', 'info');
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.reference_id && notification.reference_type) {
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

    // Apply filters
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
        return true;
    });

    const categories = ['all', 'kyc', 'filing', 'document', 'loan', 'deadline', 'system'];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight">Notifications</h1>
                        <p className="text-emerald-600/70 text-sm font-medium">
                            {notifications.filter(n => !n.read).length} unread
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                    >
                        <Check size={14} />
                        Mark All Read
                    </button>
                    <button
                        onClick={handleClearOld}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        <Trash2 size={14} />
                        Clear Old
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status:</span>
                    <div className="flex gap-1">
                        {['all', 'unread'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${filter === f
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category:</span>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 border-0 focus:ring-2 focus:ring-emerald-500"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-3 text-gray-500 text-sm">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={48} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-400">No notifications</h3>
                        <p className="text-sm text-gray-300 mt-1">
                            {filter === 'unread' ? 'All caught up!' : 'Activity will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-emerald-50">
                        {filteredNotifications.map(notification => {
                            const Icon = getCategoryIcon(notification.category);
                            const styles = getTypeStyles(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-5 hover:bg-emerald-50/30 cursor-pointer transition-colors flex gap-4 ${!notification.read ? 'bg-emerald-50/20' : ''
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border} shrink-0`}>
                                        <Icon size={20} className={styles.text} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`font-bold ${!notification.read ? 'text-emerald-950' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                                                {notification.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
