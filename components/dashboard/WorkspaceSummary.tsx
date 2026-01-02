import React, { useEffect, useState } from 'react';
import { Briefcase, UserCheck, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const WorkspaceSummary: React.FC = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({
        activeLoans: 0,
        pendingKYC: 0,
        overdueFilings: 0,
        portfolioValue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, [user]);

    const fetchMetrics = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Parallel fetch all metrics
            const [loansRes, kycRes, filingsRes, portfolioRes] = await Promise.all([
                // Active loans count
                supabase
                    .from('loans')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('status', ['Active', 'Disbursed']),

                // Pending KYC count
                supabase
                    .from('kyc_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'Pending'),

                // Overdue filings (> 60 days old, not perfected)
                supabase
                    .from('filings')
                    .select('created_at, status')
                    .eq('user_id', user.id)
                    .neq('status', 'Perfected'),

                // Total portfolio value
                supabase
                    .from('loans')
                    .select('amount, currency')
                    .eq('user_id', user.id)
                    .in('status', ['Active', 'Disbursed'])
            ]);

            // Calculate overdue filings (> 60 days)
            const now = new Date();
            const overdueCount = filingsRes.data?.filter(f => {
                const daysOld = Math.floor((now.getTime() - new Date(f.created_at).getTime()) / (1000 * 60 * 60 * 24));
                return daysOld > 60;
            }).length || 0;

            // Calculate total portfolio value (convert to NGN)
            const totalValue = portfolioRes.data?.reduce((acc, loan) => {
                const amount = loan.amount || 0;
                const multiplier = loan.currency === 'NGN' ? 1 : loan.currency === 'USD' ? 1500 : loan.currency === 'GBP' ? 1900 : loan.currency === 'EUR' ? 1600 : 1;
                return acc + (amount * multiplier);
            }, 0) || 0;

            setMetrics({
                activeLoans: loansRes.count || 0,
                pendingKYC: kycRes.count || 0,
                overdueFilings: overdueCount,
                portfolioValue: totalValue
            });

        } catch (err) {
            console.error('Failed to fetch workspace metrics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}B`;
        if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
        return `₦${value.toFixed(0)}`;
    };

    const cards = [
        {
            label: 'Active Loans',
            value: metrics.activeLoans,
            icon: Briefcase,
            color: 'emerald',
            bgColor: 'bg-emerald-500',
            bgGradient: 'from-emerald-50 to-emerald-100/50'
        },
        {
            label: 'Pending KYC',
            value: metrics.pendingKYC,
            icon: UserCheck,
            color: 'purple',
            bgColor: 'bg-purple-500',
            bgGradient: 'from-purple-50 to-purple-100/50'
        },
        {
            label: 'Overdue Filings',
            value: metrics.overdueFilings,
            icon: AlertTriangle,
            color: metrics.overdueFilings > 0 ? 'rose' : 'amber',
            bgColor: metrics.overdueFilings > 0 ? 'bg-rose-500' : 'bg-amber-500',
            bgGradient: metrics.overdueFilings > 0 ? 'from-rose-50 to-rose-100/50' : 'from-amber-50 to-amber-100/50'
        },
        {
            label: 'Total Portfolio',
            value: formatCurrency(metrics.portfolioValue),
            icon: DollarSign,
            color: 'blue',
            bgColor: 'bg-blue-500',
            bgGradient: 'from-blue-50 to-blue-100/50'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-50 animate-pulse">
                        <div className="h-12 w-12 bg-emerald-100 rounded-xl mb-4"></div>
                        <div className="h-8 bg-emerald-100 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-emerald-50 rounded w-24"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                const borderClass = card.color === 'emerald' ? 'border-emerald-100' : card.color === 'purple' ? 'border-purple-100' : card.color === 'blue' ? 'border-blue-100' : 'border-amber-100'; // Handle rose too if needed
                const text950 = card.color === 'emerald' ? 'text-emerald-950' : card.color === 'purple' ? 'text-purple-950' : card.color === 'blue' ? 'text-blue-950' : card.color === 'rose' ? 'text-rose-950' : 'text-amber-950';
                const text600 = card.color === 'emerald' ? 'text-emerald-600/70' : card.color === 'purple' ? 'text-purple-600/70' : card.color === 'blue' ? 'text-blue-600/70' : card.color === 'rose' ? 'text-rose-600/70' : 'text-amber-600/70';
                const trendColor = card.color === 'emerald' ? 'text-emerald-400' : card.color === 'purple' ? 'text-purple-400' : card.color === 'blue' ? 'text-blue-400' : card.color === 'rose' ? 'text-rose-400' : 'text-amber-400';

                return (
                    <div
                        key={idx}
                        className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 shadow-lg border ${borderClass} group hover:shadow-xl transition-all duration-300`}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={24} className="text-white" />
                        </div>

                        {/* Value */}
                        <div className={`text-3xl font-extrabold ${text950} mb-1`}>
                            {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                        </div>

                        {/* Label */}
                        <div className={`text-xs font-bold ${text600} uppercase tracking-wider`}>
                            {card.label}
                        </div>

                        {/* Trend indicator (optional - can be added later) */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp size={16} className={trendColor} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WorkspaceSummary;
