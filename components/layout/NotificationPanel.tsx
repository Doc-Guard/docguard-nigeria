import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import NotificationItem, { NotificationItemData } from './NotificationItem';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    // Mock notifications - in production, fetch from Supabase
    const [notifications, setNotifications] = useState<NotificationItemData[]>([
        {
            id: '1',
            type: 'success',
            title: 'Charge Registered Successfully',
            message: 'Ref: CAC-CHG-9912 for Dangote Refinery Ltd has been perfected',
            timestamp: new Date(Date.now() - 120000), // 2 minutes ago
            read: false
        },
        {
            id: '2',
            type: 'warning',
            title: 'Deadline Warning',
            message: 'Ibeto Cement filing due in 5 days! Complete submission to avoid penalties.',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            read: false
        },
        {
            id: '3',
            type: 'error',
            title: 'KYC Flag Detected',
            message: 'Credit utilization alert for MTN Nigeria - immediate review required',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            read: false
        },
        {
            id: '4',
            type: 'info',
            title: 'Document Saved',
            message: 'LMA Term Sheet for Access Bank saved to cloud',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            read: true
        }
    ]);

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notification: NotificationItemData) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );

        // Navigate if link exists
        if (notification.link) {
            window.location.href = notification.link;
        }
        onClose();
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-emerald-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <h4 className="font-black text-sm uppercase tracking-widest text-emerald-950">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-white bg-[#008751] px-2 py-1 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-emerald-600" />
                    </button>
                </div>

                {/* Filters */}
                <div className="px-4 py-3 border-b border-emerald-50 flex items-center gap-2 shrink-0">
                    <Filter size={14} className="text-emerald-600" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${filter === 'all'
                                ? 'bg-[#008751] text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${filter === 'unread'
                                ? 'bg-[#008751] text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                        >
                            Unread
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="ml-auto text-[10px] font-bold text-[#008751] hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-emerald-600/60 font-medium">No notifications</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={handleNotificationClick}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-emerald-50 shrink-0">
                    <button
                        onClick={() => {
                            // Navigate to dashboard activity section
                            window.location.href = '/';
                            onClose();
                        }}
                        className="w-full py-2 text-[10px] font-black text-[#008751] uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all"
                    >
                        View All Activity
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
