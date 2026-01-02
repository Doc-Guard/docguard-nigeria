
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


// Placeholder Chart Data (could be real if we aggregated dates)
const volumeData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
];

const portfolioData = [
    { name: 'Secured Term', value: 400 },
    { name: 'Unsecured', value: 300 },
    { name: 'Syndicated', value: 300 },
    { name: 'Trade Finance', value: 200 },
];

const COLORS = ['#008751', '#059669', '#10b981', '#34d399'];

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [recentItems, setRecentItems] = useState<any[]>([]);

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [riskAnalysis, setRiskAnalysis] = useState<{ summary: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' } | null>(null);

    const [stats, setStats] = useState([
        { label: 'Active Drafts', value: '0', change: '+0%', icon: TrendingUp, color: '#008751' },
        { label: 'Pending Filings', value: '0', change: '0 Critical', icon: Clock, color: '#f59e0b' },
        { label: 'Completed Filings', value: '0', change: '+0%', icon: CheckCircle2, color: '#10b981' },
        { label: 'Risk Flags', value: '0', change: '0%', icon: AlertCircle, color: '#e11d48' },
    ]);

    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [isDeadlinesLoading, setIsDeadlinesLoading] = useState(true);

    const fetchRiskAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Use real deadlines data for AI analysis
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
            // 1. Fetch Stats
            const { count: draftCount } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: pendingCount } = await supabase
                .from('filings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .neq('status', 'Perfected');

            const { count: perfectedCount } = await supabase
                .from('filings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'Perfected');

            setStats([
                { label: 'Active Drafts', value: (draftCount || 0).toString(), change: 'current', icon: TrendingUp, color: '#008751' },
                { label: 'Pending Filings', value: (pendingCount || 0).toString(), change: 'awaiting', icon: Clock, color: '#f59e0b' },
                { label: 'Completed Filings', value: (perfectedCount || 0).toString(), change: 'perfected', icon: CheckCircle2, color: '#10b981' },
                { label: 'Risk Flags', value: '3', change: 'simulated', icon: AlertCircle, color: '#e11d48' },
            ]);

            // 2. Fetch Recent Docs & Filings for "Activity"
            const { data: docs } = await supabase
                .from('documents')
                .select('id, title, status, created_at, template_type')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            const { data: filings } = await supabase
                .from('filings')
                .select('id, entity_name, status, submission_date, filing_type, reference_id')
                .eq('user_id', user.id)
                .order('submission_date', { ascending: false })
                .limit(3);

            // Merge and Sort
            const combined = [
                ...(docs?.map(d => ({
                    id: d.id,
                    title: d.title || 'Untitled Draft',
                    subtitle: d.template_type,
                    status: d.status,
                    date: new Date(d.created_at).toLocaleDateString(),
                    type: 'document'
                })) || []),
                ...(filings?.map(f => ({
                    id: f.reference_id || f.id,
                    title: f.entity_name,
                    subtitle: f.filing_type,
                    status: f.status,
                    date: new Date(f.submission_date).toLocaleDateString(),
                    type: 'filing'
                })) || [])
            ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

            setRecentItems(combined);

            // 3. Fetch Deadlines from Filings (pending ones with submission_date)
            const { data: pendingFilings } = await supabase
                .from('filings')
                .select('id, entity_name, filing_type, submission_date, status')
                .eq('user_id', user.id)
                .neq('status', 'Perfected')
                .order('submission_date', { ascending: true })
                .limit(5);

            const now = new Date();
            const deadlineItems = pendingFilings?.map(f => {
                const submissionDate = new Date(f.submission_date);
                // Calculate days remaining (assuming a 90-day perfection window from submission)
                const perfectionDeadline = new Date(submissionDate);
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Portfolio Overview</h1>
                    <p className="text-emerald-600/80 mt-1 font-medium italic">Empowering secure credit expansion across the Federation.</p>
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

            <StatsGrid stats={stats} />

            <ChartsSection
                volumeData={volumeData}
                portfolioData={portfolioData}
                COLORS={COLORS}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ActivePipeline items={recentItems} isLoading={isLoading} />

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
