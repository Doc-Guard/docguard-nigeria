
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { notifyDeadlineApproaching } from '../../services/notificationService';

export interface DeadlineItem {
    id: string;
    days: number;
    entity: string;
    task: string;
    type: 'filing' | 'loan';
    status: 'overdue' | 'critical' | 'urgent' | 'warning' | 'track';
    actionLabel: string;
    originalDate: string;
    deadlineDate: string;
}

export const useDeadlines = () => {
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getStatus = (days: number): DeadlineItem['status'] => {
        if (days < 0) return 'overdue';
        if (days <= 5) return 'critical';
        if (days <= 15) return 'urgent';
        if (days <= 30) return 'warning';
        return 'track';
    };

    const fetchDeadlines = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);

        try {
            // 1. Fetch Fillings
            const { data: pendingFilings, error: filingError } = await supabase
                .from('filings')
                .select('id, entity_name, filing_type, submission_date, status, created_at')
                .eq('user_id', user.id)
                .neq('status', 'Perfected')
                .order('created_at', { ascending: true });

            if (filingError) throw filingError;

            // 2. Fetch Loans
            const { data: pendingLoans, error: loanError } = await supabase
                .from('loans')
                .select('id, borrower_name, pipeline_stage, created_at')
                .eq('user_id', user.id)
                .not('pipeline_stage', 'in', '("Active","Closed")')
                .order('created_at', { ascending: true });

            if (loanError) throw loanError;

            const now = new Date();

            // Process Filings (90-Day Rule)
            const filingItems: DeadlineItem[] = (pendingFilings || []).map(f => {
                const createdDate = new Date(f.created_at);
                const deadline = new Date(createdDate);
                deadline.setDate(deadline.getDate() + 90);
                const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return {
                    id: f.id,
                    days: daysRemaining,
                    entity: f.entity_name,
                    task: f.filing_type || 'CAC Filing',
                    type: 'filing',
                    status: getStatus(daysRemaining),
                    actionLabel: 'Register Charge',
                    originalDate: f.created_at,
                    deadlineDate: deadline.toISOString()
                };
            });

            // Process Loans (30-Day SLA)
            const loanItems: DeadlineItem[] = (pendingLoans || []).map(l => {
                const createdDate = new Date(l.created_at);
                const deadline = new Date(createdDate);
                deadline.setDate(deadline.getDate() + 30);
                const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return {
                    id: l.id,
                    days: daysRemaining,
                    entity: l.borrower_name,
                    task: `Pipeline: ${l.pipeline_stage}`,
                    type: 'loan',
                    status: getStatus(daysRemaining),
                    actionLabel: 'Process Loan',
                    originalDate: l.created_at,
                    deadlineDate: deadline.toISOString()
                };
            });

            const combined = [...filingItems, ...loanItems].sort((a, b) => a.days - b.days);
            setDeadlines(combined);

            // Notification Check (One-off)
            const hasNotified = sessionStorage.getItem('docguard_deadline_notified_v2');
            if (!hasNotified && combined.length > 0) {
                const urgentItems = combined.filter(d => d.days <= 7);
                if (urgentItems.length > 0) {
                    const mostUrgent = urgentItems[0];
                    await notifyDeadlineApproaching(user.id, mostUrgent.entity, mostUrgent.days, mostUrgent.id);
                    sessionStorage.setItem('docguard_deadline_notified_v2', 'true');
                }
            }

        } catch (err: any) {
            console.error("Error fetching deadlines:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDeadlines();
    }, [fetchDeadlines]);

    return { deadlines, isLoading, error, refresh: fetchDeadlines };
};
