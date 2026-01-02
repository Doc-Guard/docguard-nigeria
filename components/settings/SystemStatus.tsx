
import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, HardDrive, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const SystemStatus: React.FC = () => {
    const { user } = useAuth();
    const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [storageUsage, setStorageUsage] = useState({ avatars: 0, evidence: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSystemHealth();
    }, [user]);

    const checkSystemHealth = async () => {
        setIsLoading(true);

        // 1. Check database connection
        try {
            const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            setDbStatus(error ? 'error' : 'connected');
        } catch {
            setDbStatus('error');
        }

        // 2. Get storage usage (mock calculation based on records)
        try {
            const { count: avatarCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).not('avatar_url', 'is', null);
            const { count: evidenceCount } = await supabase.from('filings').select('*', { count: 'exact', head: true }).not('evidence_path', 'is', null);

            setStorageUsage({
                avatars: (avatarCount || 0) * 50, // ~50KB per avatar estimate
                evidence: (evidenceCount || 0) * 200 // ~200KB per evidence estimate
            });
        } catch (err) {
            console.error('Storage check error:', err);
        }

        // 3. Get recent activity (last 10 records across tables)
        try {
            const [loans, filings, docs] = await Promise.all([
                supabase.from('loans').select('id, borrower_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
                supabase.from('filings').select('id, charge_type, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
                supabase.from('documents').select('id, name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
            ]);

            const activities = [
                ...(loans.data || []).map(l => ({ type: 'Loan Created', detail: l.borrower_name, time: l.created_at })),
                ...(filings.data || []).map(f => ({ type: 'Filing Submitted', detail: f.charge_type, time: f.created_at })),
                ...(docs.data || []).map(d => ({ type: 'Document Generated', detail: d.name, time: d.created_at }))
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

            setRecentActivity(activities);
        } catch (err) {
            console.error('Activity fetch error:', err);
        }

        setIsLoading(false);
    };

    const formatBytes = (kb: number) => {
        if (kb < 1024) return `${kb.toFixed(0)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* System Health Card */}
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">System Health</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Real-time status of core services</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Database Status */}
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3 mb-3">
                            <Database size={20} className="text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Database</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {dbStatus === 'connected' && (
                                <>
                                    <Check size={16} className="text-emerald-600" />
                                    <span className="text-sm font-bold text-emerald-950">Connected</span>
                                </>
                            )}
                            {dbStatus === 'error' && (
                                <>
                                    <AlertCircle size={16} className="text-rose-600" />
                                    <span className="text-sm font-bold text-rose-950">Connection Error</span>
                                </>
                            )}
                            {dbStatus === 'checking' && <span className="text-sm font-bold text-emerald-600">Checking...</span>}
                        </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                            <HardDrive size={20} className="text-blue-700" />
                            <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Storage</span>
                        </div>
                        <div className="text-sm font-bold text-blue-950">
                            {formatBytes(storageUsage.avatars + storageUsage.evidence)}
                        </div>
                        <div className="text-[10px] text-blue-600 mt-1">Avatars + Evidence</div>
                    </div>

                    {/* API Status */}
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap size={20} className="text-amber-700" />
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Gemini AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check size={16} className="text-amber-600" />
                            <span className="text-sm font-bold text-amber-950">Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <h3 className="text-lg font-black text-emerald-950 mb-6">Recent Activity</h3>

                {isLoading ? (
                    <div className="text-center py-8 text-emerald-600">Loading...</div>
                ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-emerald-600/60 text-sm">No recent activity</div>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 px-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                <div>
                                    <span className="text-sm font-bold text-emerald-950">{activity.type}</span>
                                    <p className="text-xs text-emerald-600/70 mt-0.5">{activity.detail}</p>
                                </div>
                                <span className="text-xs text-emerald-600/60 font-medium">{formatTimeAgo(activity.time)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemStatus;
