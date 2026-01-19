import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ComplianceTrackingProps {
    kycCompletionRate: number;
    pendingVerifications: number;
    filingStatusData: { name: string; count: number; color: string }[];
    deadlineRisks: { level: string; count: number; days: string }[];
}

const ComplianceTracking: React.FC<ComplianceTrackingProps> = ({
    kycCompletionRate,
    pendingVerifications,
    filingStatusData,
    deadlineRisks
}) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (kycCompletionRate / 100) * circumference;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'bg-rose-500';
            case 'Medium': return 'bg-amber-500';
            case 'Low': return 'bg-emerald-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                    <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold text-emerald-950">Compliance Tracking</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* KYC Completion Rate */}
                <div className="flex flex-col items-center">
                    <h3 className="text-sm font-bold text-emerald-700 mb-4">KYC Completion Rate</h3>
                    <div className="relative">
                        <svg className="transform -rotate-90" width="120" height="120">
                            <circle
                                cx="60"
                                cy="60"
                                r="45"
                                stroke="#d1fae5"
                                strokeWidth="10"
                                fill="none"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="45"
                                stroke="#008751"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-extrabold text-emerald-950">{kycCompletionRate}%</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
                        <AlertTriangle size={16} className="text-amber-600" />
                        <span className="text-sm font-semibold text-amber-900">
                            {pendingVerifications} Pending Verification{pendingVerifications !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* CAC Filing Status */}
                <div>
                    <h3 className="text-sm font-bold text-emerald-700 mb-4">CAC Filing Status</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filingStatusData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                                <XAxis type="number" stroke="#059669" />
                                <YAxis dataKey="name" type="category" stroke="#059669" width={80} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                    {filingStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Deadline Risk Heatmap */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-emerald-700 mb-4">90-Day Deadline Risk Monitor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deadlineRisks.map((risk) => (
                        <div
                            key={risk.level}
                            className="border border-emerald-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                    {risk.level} Risk
                                </span>
                                <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.level)}`}></div>
                            </div>
                            <div className="text-2xl font-extrabold text-emerald-950 mb-1">
                                {risk.count}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                                <Clock size={12} />
                                {risk.days}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplianceTracking;
