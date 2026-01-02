
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { analyzePortfolioRisks } from '../../services/geminiService';
import ChartsSection from './ChartsSection';
import DeadlineGuardian from './DeadlineGuardian';
import WorkspaceSummary from './WorkspaceSummary';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [riskAnalysis, setRiskAnalysis] = useState<{ summary: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' } | null>(null);
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [isDeadlinesLoading, setIsDeadlinesLoading] = useState(true);

    const fetchRiskAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const risksForAI = deadlines.map(d => ({
                days: d.days,
                entity: d.entity,
                task: d.task,
                val: d.days <= 7 ? 90 : d.days <= 21 ? 60 : 30
            }));
            const result = await analyzePortfolioRisks(risksForAI);
            setRiskAnalysis(result);
        } catch (err) {
            console.error("AI Analysis failed", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const fetchDashboardData = async () => {
        if (!user) return;
        setIsLoading(true);
        setIsDeadlinesLoading(true);

        try {
            // Fetch Deadlines from Filings (pending ones)
            const { data: pendingFilings } = await supabase
                .from('filings')
                .select('id, entity_name, filing_type, submission_date, status, created_at')
                .eq('user_id', user.id)
                .neq('status', 'Perfected')
                .order('created_at', { ascending: true })
                .limit(5);

            const now = new Date();
            const deadlineItems = pendingFilings?.map(f => {
                const createdDate = new Date(f.created_at);
                // Calculate days since creation (90-day window from creation)
                const perfectionDeadline = new Date(createdDate);
                perfectionDeadline.setDate(perfectionDeadline.getDate() + 90);
                const daysRemaining = Math.max(0, Math.ceil((perfectionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

                return {
                    id: f.id,
                    days: daysRemaining,
                    entity: f.entity_name,
                    task: f.filing_type || 'CAC Filing'
                };
            }) || [];

            setDeadlines(deadlineItems);

        } catch (e) {
            console.error("Dashboard fetch failed", e);
        } finally {
            setIsLoading(false);
            setIsDeadlinesLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Command Center</h1>
                    <p className="text-emerald-600/80 mt-1 font-medium italic">Real-time portfolio intelligence and workflow automation.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <div className="px-4 py-2 bg-emerald-100/50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                        <Zap size={14} className="text-emerald-600" />
                        DOCGUARD CLOUD ACTIVE
                    </div>
                </div>
            </div>

            {/* Workspace Summary Metrics */}
            <WorkspaceSummary />

            {/* Quick Actions */}
            <QuickActions />

            {/* Activity Feed & Deadline Guardian */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ActivityFeed isLoading={isLoading} />

                <DeadlineGuardian
                    riskAnalysis={riskAnalysis}
                    isAnalyzing={isAnalyzing}
                    onRunAnalysis={fetchRiskAnalysis}
                    deadlines={deadlines}
                    isLoading={isDeadlinesLoading}
                />
            </div>
        </div>
    );
};

export default Dashboard;



