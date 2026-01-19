import React from 'react';
import { Zap, FileText, Clock, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceMetricsProps {
    documentSpeedData: { month: string; ai: number; manual: number }[];
    avgFilingTime: number;
    avgFilingTimeTrend: number;
    errorRate: number;
    totalDocuments: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
    documentSpeedData,
    avgFilingTime,
    avgFilingTimeTrend,
    errorRate,
    totalDocuments
}) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                    <Zap size={20} />
                </div>
                <h2 className="text-xl font-bold text-emerald-950">Performance Metrics</h2>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold mb-2">
                        <Clock size={16} />
                        Avg Filing Time
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-2xl font-extrabold text-emerald-950">{avgFilingTime}d</div>
                        <div className={`flex items-center gap-1 text-xs font-bold mb-1 ${avgFilingTimeTrend <= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                            <TrendingDown size={14} />
                            {Math.abs(avgFilingTimeTrend)}%
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 text-sm text-amber-700 font-semibold mb-2">
                        <FileText size={16} />
                        Documents Generated
                    </div>
                    <div className="text-2xl font-extrabold text-amber-950">{totalDocuments}</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-2 text-sm text-rose-700 font-semibold mb-2">
                        <TrendingDown size={16} />
                        Error/Query Rate
                    </div>
                    <div className="text-2xl font-extrabold text-rose-950">{errorRate}%</div>
                </div>
            </div>

            {/* Document Generation Speed Chart */}
            <div>
                <h3 className="text-sm font-bold text-emerald-700 mb-4">Document Generation Time (Hours)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={documentSpeedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                            <XAxis dataKey="month" stroke="#059669" />
                            <YAxis stroke="#059669" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="manual"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                name="Manual Process"
                                dot={{ fill: '#94a3b8', r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="ai"
                                stroke="#008751"
                                strokeWidth={3}
                                name="DocGuard AI"
                                dot={{ fill: '#008751', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-emerald-600 mt-2 text-center font-medium">
                    AI-powered generation achieves 85% time reduction vs manual processes
                </p>
            </div>
        </div>
    );
};

export default PerformanceMetrics;
