import React from 'react';
import { TrendingUp, TrendingDown, Briefcase, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PortfolioOverviewProps {
    totalValue: number;
    totalValueTrend: number;
    activeLoans: number;
    loansByType: { name: string; value: number; color: string }[];
    currencyMix: { name: string; value: number; color: string }[];
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
    totalValue,
    totalValueTrend,
    activeLoans,
    loansByType,
    currencyMix
}) => {
    const formatCurrency = (value: number) => {
        if (value >= 1000000000) return `₦${(value / 1000000000).toFixed(2)}B`;
        if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
        return `₦${value.toLocaleString()}`;
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                    <Briefcase size={20} />
                </div>
                <h2 className="text-xl font-bold text-emerald-950">Portfolio Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Portfolio Value */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                        <DollarSign size={16} />
                        Total Portfolio Value
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="text-3xl font-extrabold text-emerald-950">
                            {formatCurrency(totalValue)}
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-bold mb-1 ${totalValueTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                            {totalValueTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {Math.abs(totalValueTrend)}%
                        </div>
                    </div>
                    <p className="text-xs text-emerald-500">vs. previous period</p>
                </div>

                {/* Active Loans */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                        <Briefcase size={16} />
                        Active Facilities
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-950">
                        {activeLoans}
                    </div>
                    <p className="text-xs text-emerald-500">currently under management</p>
                </div>
            </div>

            {/* Loan Type Distribution */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-bold text-emerald-700 mb-4">Loan Type Distribution</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={loansByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {loansByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {loansByType.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-emerald-700 font-medium">{item.name} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Currency Mix */}
                <div>
                    <h3 className="text-sm font-bold text-emerald-700 mb-4">Currency Mix</h3>
                    <div className="space-y-3">
                        {currencyMix.map((currency) => {
                            const total = currencyMix.reduce((acc, curr) => acc + curr.value, 0);
                            const percentage = total > 0 ? ((currency.value / total) * 100).toFixed(1) : 0;
                            return (
                                <div key={currency.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-emerald-900">{currency.name}</span>
                                        <span className="text-emerald-600 font-bold">{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: currency.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioOverview;
