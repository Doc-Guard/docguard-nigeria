
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

interface TurnaroundChartProps {
    data: any[];
}

const TurnaroundChart: React.FC<TurnaroundChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-900/5">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="font-extrabold text-lg text-emerald-950 tracking-tight">Turnaround Cycle Time</h3>
                    <p className="text-xs text-emerald-600/50 font-bold uppercase tracking-widest mt-1">Average Days to Completion</p>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-slate-300">
                        <div className="w-2.5 h-2.5 rounded bg-slate-100 shadow-inner"></div> Manual Path
                    </span>
                    <span className="flex items-center gap-2 text-[#008751]">
                        <div className="w-2.5 h-2.5 rounded bg-[#008751] shadow-lg shadow-emerald-900/20"></div> DocGuard
                    </span>
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="manual" fill="#f8fafc" radius={[6, 6, 0, 0]} barSize={24} />
                        <Bar dataKey="docGuard" fill="#008751" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TurnaroundChart;
