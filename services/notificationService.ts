import { supabase } from '../lib/supabase';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    category: 'kyc' | 'filing' | 'document' | 'loan' | 'deadline' | 'system';
    reference_id?: string;
    reference_type?: 'loan' | 'filing' | 'document' | 'kyc';
    read: boolean;
    created_at: string;
}

export interface CreateNotificationData {
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    category?: 'kyc' | 'filing' | 'document' | 'loan' | 'deadline' | 'system';
    reference_id?: string;
    reference_type?: 'loan' | 'filing' | 'document' | 'kyc';
}

/**
 * Create a new notification for a user
 */
export const createNotification = async (
    userId: string,
    data: CreateNotificationData
): Promise<Notification | null> => {
    const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            category: data.category || 'system',
            reference_id: data.reference_id,
            reference_type: data.reference_type,
            read: false
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create notification:', error);
        return null;
    }

    // Trigger native OS notification in Electron (if available)
    if (window.electron) {
        window.electron.showNotification(data.title, data.message);
    }

    return notification;
};

/**
 * Get all notifications for a user (most recent first)
 */
export const getNotifications = async (
    userId: string,
    limit: number = 50
): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }

    return data || [];
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error('Failed to fetch unread count:', error);
        return 0;
    }

    return count || 0;
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Failed to mark notification as read:', error);
        return false;
    }

    return true;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error('Failed to mark all notifications as read:', error);
        return false;
    }

    return true;
};

/**
 * Delete old notifications (older than X days)
 */
export const deleteOldNotifications = async (
    userId: string,
    daysOld: number = 30
): Promise<number> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

    if (error) {
        console.error('Failed to delete old notifications:', error);
        return 0;
    }

    return data?.length || 0;
};

/**
 * Subscribe to real-time notification updates
 * Returns unsubscribe function
 */
export const subscribeToNotifications = (
    userId: string,
    onNewNotification: (notification: Notification) => void
): (() => void) => {
    const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            },
            (payload) => {
                onNewNotification(payload.new as Notification);
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(channel);
    };
};

// ========== Helper functions for common notification triggers ==========

export const notifyKYCVerified = (userId: string, entityName: string, verificationType: string) => {
    return createNotification(userId, {
        title: 'KYC Verification Complete',
        message: `${verificationType} verified successfully for ${entityName}`,
        type: 'success',
        category: 'kyc'
    });
};

export const notifyFilingPerfected = (userId: string, filingRef: string, entityName: string, filingId?: string) => {
    return createNotification(userId, {
        title: 'Filing Perfected',
        message: `CAC filing ${filingRef} perfected for ${entityName}`,
        type: 'success',
        category: 'filing',
        reference_id: filingId,
        reference_type: 'filing'
    });
};

export const notifyDocumentExecuted = (userId: string, documentName: string, documentId?: string) => {
    return createNotification(userId, {
        title: 'Document Executed',
        message: `${documentName} has been signed and archived`,
        type: 'success',
        category: 'document',
        reference_id: documentId,
        reference_type: 'document'
    });
};

export const notifyLoanStageChange = (userId: string, borrowerName: string, newStage: string, loanId?: string) => {
    return createNotification(userId, {
        title: 'Loan Stage Updated',
        message: `${borrowerName} moved to ${newStage}`,
        type: 'info',
        category: 'loan',
        reference_id: loanId,
        reference_type: 'loan'
    });
};

export const notifyDeadlineApproaching = (userId: string, entityName: string, daysRemaining: number, loanId?: string) => {
    return createNotification(userId, {
        title: 'CAMA Deadline Warning',
        message: `Filing deadline for ${entityName} in ${daysRemaining} days`,
        type: daysRemaining <= 7 ? 'error' : 'warning',
        category: 'deadline',
        reference_id: loanId,
        reference_type: 'loan'
    });
};
