
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface ChartsSectionProps {
    volumeData: any[];
    portfolioData: any[];
    COLORS: string[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ volumeData, portfolioData, COLORS }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-extrabold text-emerald-950 text-lg">Loan Origination Volume</h3>
                        <p className="text-xs text-emerald-600/60 font-bold uppercase tracking-widest">6-Month Trend (₦ Billion)</p>
                    </div>
                    <button className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors">
                        <ArrowUpRight size={18} />
                    </button>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#008751" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#008751" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecfdf5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#065f46' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#065f46' }} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                labelStyle={{ color: '#064e3b', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#008751" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm flex flex-col">
                <div className="mb-6">
                    <h3 className="font-extrabold text-emerald-950 text-lg">Portfolio Composition</h3>
                    <p className="text-xs text-emerald-600/60 font-bold uppercase tracking-widest">By Facility Type</p>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={portfolioData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {portfolioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="absolute bottom-0 right-0 p-4 space-y-2">
                        {portfolioData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;
