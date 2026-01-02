import React from 'react';
import { Clock, MessageSquare, CheckCircle, FileText } from 'lucide-react';

interface ActivityFeedProps {
    isLoading: boolean;
}

interface ActivityEvent {
    event_type: string;
    event_id: string;
    entity_name: string;
    description: string;
    metadata: string;
    event_timestamp: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isLoading }) => {
    const [events, setEvents] = React.useState<ActivityEvent[]>([]);

    React.useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        const { supabase } = await import('../../lib/supabase');
        const { useAuth } = await import('../auth/AuthContext');

        try {
            // Query the activity_feed view
            const { data, error } = await supabase
                .from('activity_feed')
                .select('*')
                .order('event_timestamp', { ascending: false })
                .limit(15);

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch activity feed:', err);
        }
    };

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'loan_created': return FileText;
            case 'filing_submitted': return CheckCircle;
            case 'document_generated': return FileText;
            case 'kyc_completed': return CheckCircle;
            default: return MessageSquare;
        }
    };

    const getEventColor = (eventType: string) => {
        switch (eventType) {
            case 'loan_created': return 'emerald';
            case 'filing_submitted': return 'amber';
            case 'document_generated': return 'blue';
            case 'kyc_completed': return 'purple';
            default: return 'slate';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
        return then.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
                <h2 className="text-lg font-black text-emerald-950 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-emerald-100 rounded w-3/4"></div>
                                <div className="h-3 bg-emerald-50 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
                <h2 className="text-lg font-black text-emerald-950 mb-6">Recent Activity</h2>
                <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-emerald-200 mb-4" />
                    <p className="text-sm text-emerald-600/60 font-medium">No recent activity</p>
                    <p className="text-xs text-emerald-500/40 mt-1">Your workflow events will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-emerald-950">Recent Activity</h2>
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                    View All →
                </button>
            </div>

            <div className="space-y-4">
                {events.map((event, idx) => {
                    const Icon = getEventIcon(event.event_type);
                    const color = getEventColor(event.event_type);

                    return (
                        <div key={`${event.event_id}-${idx}`} className="flex items-start gap-4 group hover:bg-emerald-50/50 p-3 rounded-xl transition-colors">
                            <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                                <Icon size={18} className={`text-${color}-600`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-emerald-950 truncate">{event.entity_name}</p>
                                <p className="text-xs text-emerald-600/60 mt-0.5">{event.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={10} className="text-emerald-400" />
                                    <span className="text-[10px] text-emerald-500 font-medium">{formatTimeAgo(event.event_timestamp)}</span>
                                    {event.metadata && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                            {event.metadata}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityFeed;
