
import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, Download, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import PortfolioOverview from './PortfolioOverview';
import ComplianceTracking from './ComplianceTracking';
import PerformanceMetrics from './PerformanceMetrics';
import TurnaroundChart from './TurnaroundChart';
import PrecisionHealth from './PrecisionHealth';
import ImpactMetrics from './ImpactMetrics';
import { useToast } from '../common/Toast';

const Analytics: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

    // Portfolio State
    const [portfolioData, setPortfolioData] = useState({
        totalValue: 0,
        totalValueTrend: 0,
        activeLoans: 0,
        loansByType: [] as any[],
        currencyMix: [] as any[]
    });

    // Compliance State
    const [complianceData, setComplianceData] = useState({
        kycCompletionRate: 0,
        pendingVerifications: 0,
        filingStatusData: [] as any[],
        deadlineRisks: [] as any[]
    });

    // Performance State
    const [performanceData, setPerformanceData] = useState({
        documentSpeedData: [] as any[],
        avgFilingTime: 0,
        avgFilingTimeTrend: 0,
        errorRate: 0,
        totalDocuments: 0
    });

    // Legacy State (for existing charts)
    const [turnaroundData, setTurnaroundData] = useState<any[]>([]);
    const [registrationData, setRegistrationData] = useState<any[]>([]);
    const [impact, setImpact] = useState({
        riskMitigated: '₦0.00',
        costReduction: '0%',
        hoursSaved: '0',
        penalties: '0.00'
    });

    useEffect(() => {
        if (!user) return;
        fetchAllAnalytics();
    }, [user, dateRange]);

    const fetchAllAnalytics = async () => {
        setIsLoading(true);
        try {
            // Fetch all data in parallel
            const [filings, loans, docs, kycRequests] = await Promise.all([
                supabase.from('filings').select('*').eq('user_id', user.id),
                supabase.from('loans').select('*').eq('user_id', user.id),
                supabase.from('documents').select('*', { count: 'exact' }).eq('user_id', user.id),
                supabase.from('kyc_requests').select('*').eq('user_id', user.id)
            ]);

            const filingsData = filings.data || [];
            const loansData = loans.data || [];
            const docsCount = docs.count || 0;
            const kycData = kycRequests.data || [];

            // Process Portfolio Data
            processPortfolioData(loansData);

            // Process Compliance Data
            processComplianceData(kycData, filingsData);

            // Process Performance Data
            processPerformanceData(docsCount, filingsData);

            // Process Legacy Charts
            processLegacyCharts(filingsData, loansData, docsCount);

        } catch (err: any) {
            console.error('Analytics fetch error:', err);
            showToast('Failed to load analytics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const processPortfolioData = (loans: any[]) => {
        const totalValue = loans.reduce((acc, loan) => {
            const value = loan.currency === 'NGN' ? loan.amount : loan.amount * 1500;
            return acc + value;
        }, 0);

        const activeCount = loans.filter(l => ['Active', 'Disbursed'].includes(l.status || 'Active')).length;

        // Loan type distribution
        const typeCount: any = {};
        loans.forEach(loan => {
            const type = loan.loan_type || 'Term Facility';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const loansByType = Object.entries(typeCount).map(([name, value], idx) => ({
            name,
            value: value as number,
            color: ['#008751', '#f59e0b', '#3b82f6'][idx % 3]
        }));

        // Currency mix
        const currencyCount: any = { NGN: 0, USD: 0, GBP: 0 };
        loans.forEach(loan => {
            currencyCount[loan.currency || 'NGN']++;
        });

        const currencyMix = Object.entries(currencyCount)
            .filter(([, count]) => (count as number) > 0)
            .map(([name, value], idx) => ({
                name,
                value: value as number,
                color: ['#008751', '#10b981', '#34d399'][idx]
            }));

        setPortfolioData({
            totalValue,
            totalValueTrend: 12.5, // Mock trend
            activeLoans: activeCount,
            loansByType: loansByType.length > 0 ? loansByType : [{ name: 'No Data', value: 0, color: '#e5e7eb' }],
            currencyMix: currencyMix.length > 0 ? currencyMix : [{ name: 'NGN', value: 0, color: '#008751' }]
        });
    };

    const processComplianceData = (kycRequests: any[], filings: any[]) => {
        // Count both 'Approved' (legacy) and 'Verified' (new persistence layer) statuses
        const completedKYC = kycRequests.filter(k => k.status === 'Approved' || k.status === 'Verified').length;
        const kycCompletionRate = kycRequests.length > 0 ? Math.round((completedKYC / kycRequests.length) * 100) : 0;
        const pendingVerifications = kycRequests.filter(k => k.status === 'Pending').length;

        // Filing status
        const statusCounts = {
            Perfected: filings.filter(f => f.status === 'Perfected').length,
            Submitted: filings.filter(f => f.status === 'Submitted').length,
            Pending: filings.filter(f => f.status === 'Pending').length
        };

        const filingStatusData = [
            { name: 'Perfected', count: statusCounts.Perfected, color: '#008751' },
            { name: 'Submitted', count: statusCounts.Submitted, color: '#f59e0b' },
            { name: 'Pending', count: statusCounts.Pending, color: '#f43f5e' }
        ];

        // Deadline risks (mock calculation based on filing dates)
        const now = new Date();
        const risks = filings.map(f => {
            const created = new Date(f.created_at);
            const daysOld = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            if (daysOld > 60) return 'High';
            if (daysOld > 30) return 'Medium';
            return 'Low';
        });

        const deadlineRisks = [
            { level: 'High', count: risks.filter(r => r === 'High').length, days: '> 60 days old' },
            { level: 'Medium', count: risks.filter(r => r === 'Medium').length, days: '30-60 days' },
            { level: 'Low', count: risks.filter(r => r === 'Low').length, days: '< 30 days' }
        ];

        setComplianceData({
            kycCompletionRate,
            pendingVerifications,
            filingStatusData,
            deadlineRisks
        });
    };

    const processPerformanceData = (docCount: number, filings: any[]) => {
        // Document speed data (mock monthly comparison)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const documentSpeedData = months.map(month => ({
            month,
            manual: 48, // hours
            ai: 6 // hours
        }));

        const avgFilingTime = filings.length > 0 ? 5 : 0; // Mock: 5 days average
        const avgFilingTimeTrend = -15; // Negative is good (reduction)
        const errorRate = filings.length > 0 ? 2.3 : 0; // Mock: 2.3% error rate

        setPerformanceData({
            documentSpeedData,
            avgFilingTime,
            avgFilingTimeTrend,
            errorRate,
            totalDocuments: docCount
        });
    };

    const processLegacyCharts = (filings: any[], loans: any[], docCount: number) => {
        // Turnaround Chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        const monthlyStats = new Array(12).fill(0).map((_, i) => ({
            name: months[i],
            manual: 0,
            docGuard: 0,
            count: 0
        }));

        filings?.forEach(f => {
            const date = new Date(f.submission_date || f.created_at);
            if (date.getFullYear() === currentYear) {
                const monthIdx = date.getMonth();
                monthlyStats[monthIdx].docGuard += 5;
                monthlyStats[monthIdx].manual += 45;
                monthlyStats[monthIdx].count++;
            }
        });

        const processedTurnaround = monthlyStats
            .filter(m => m.count > 0 || m.name === months[new Date().getMonth()])
            .map(m => ({
                name: m.name,
                manual: m.count ? 45 : 0,
                docGuard: m.count ? Math.round(m.docGuard / m.count) : 0
            }));

        if (processedTurnaround.length === 0) {
            processedTurnaround.push({ name: months[new Date().getMonth()], manual: 0, docGuard: 0 });
        }

        setTurnaroundData(processedTurnaround);

        // Registration Health
        const statusCounts = {
            Perfected: 0,
            Submitted: 0,
            Pending: 0
        };
        filings?.forEach(f => {
            if (f.status === 'Perfected') statusCounts.Perfected++;
            else if (f.status === 'Submitted') statusCounts.Submitted++;
            else statusCounts.Pending++;
        });

        setRegistrationData([
            { name: 'Perfected', value: statusCounts.Perfected, color: '#008751' },
            { name: 'Submitted', value: statusCounts.Submitted, color: '#f59e0b' },
            { name: 'Pending', value: statusCounts.Pending, color: '#f43f5e' },
        ]);

        // Impact Metrics - Real Calculations
        const totalLoanValue = loans?.reduce((acc, curr) => acc + (curr.currency === 'NGN' ? curr.amount : curr.amount * 1500), 0) || 0;

        // Calculate actual hours saved based on real activities
        const docsGenerated = docCount;
        const filingsCompleted = filings?.length || 0;
        const perfectedFilings = filings?.filter(f => f.status === 'Perfected').length || 0;

        // Manual process: 48 hours/doc, 120 hours/filing
        // DocGuard: 6 hours/doc, 15 hours/filing
        const manualHours = (docsGenerated * 48) + (filingsCompleted * 120);
        const docGuardHours = (docsGenerated * 6) + (filingsCompleted * 15);
        const hoursSaved = manualHours - docGuardHours;

        // Calculate cost reduction percentage based on actual perfection rate
        const perfectionRate = filingsCompleted > 0 ? (perfectedFilings / filingsCompleted) * 100 : 0;
        const costReduction = perfectionRate > 0 ? Math.round(85 * (perfectionRate / 100)) : 0;

        // Calculate avoided penalties (CAMA 2020: ₦10,000 per day after 90 days)
        const now = new Date();
        let potentialPenalties = 0;
        filings?.forEach(f => {
            if (f.status === 'Perfected') {
                const created = new Date(f.created_at);
                const perfected = new Date(f.submission_date || f.created_at);
                const daysToComplete = Math.floor((perfected.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

                // If we completed before 90 days but manual would have taken longer
                const manualDays = 45; // Average manual processing time
                if (daysToComplete < 90 && daysToComplete + manualDays > 90) {
                    const savedDays = (daysToComplete + manualDays) - 90;
                    potentialPenalties += savedDays * 10000; // ₦10,000 per day
                }
            }
        });

        setImpact({
            riskMitigated: `₦${(totalLoanValue ? (totalLoanValue / 1000000).toFixed(1) : '0.0')}M`,
            costReduction: `${costReduction}%`,
            hoursSaved: hoursSaved > 0 ? hoursSaved.toLocaleString() : '0',
            penalties: potentialPenalties > 0 ? `₦${(potentialPenalties / 1000).toFixed(0)}K` : '₦0'
        });
    };

    const handleExport = async () => {
        try {
            const reportData = {
                generated: new Date().toISOString(),
                portfolio: portfolioData,
                compliance: complianceData,
                performance: performanceData,
                impact
            };

            const jsonContent = JSON.stringify(reportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `docguard_analytics_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('Analytics exported successfully', 'success');
        } catch (err) {
            showToast('Export failed', 'error');
        }
    };

    const dateRangeOptions = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: 'all', label: 'All Time' }
    ];

    const currentLabel = dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'All Time';

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Analytics Intelligence</h1>
                    </div>
                    <p className="text-emerald-600/70 font-medium">Real-time insights into your loan compliance operations</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-50 transition-all shadow-sm appearance-none pr-10 cursor-pointer"
                        >
                            {dateRangeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-[#0a2e1f] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-900 shadow-xl shadow-emerald-950/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Export Data
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                </div>
            ) : (
                <>
                    {/* New Sections */}
                    <PortfolioOverview {...portfolioData} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ComplianceTracking {...complianceData} />
                        <PerformanceMetrics {...performanceData} />
                    </div>

                    {/* Legacy Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <TurnaroundChart data={turnaroundData} />
                        <PrecisionHealth data={registrationData} />
                    </div>

                    <ImpactMetrics metrics={impact} />
                </>
            )}
        </div>
    );
};

export default Analytics;
