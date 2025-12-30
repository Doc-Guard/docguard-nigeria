
import React from 'react';
import { TrendingUp, Clock, CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react';

interface StatItem {
    label: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
}

interface StatsGridProps {
    stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.label} className="group bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50 group-hover:bg-[#008751]/10 transition-colors" style={{ color: stat.color }}>
                            <stat.icon size={26} />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                            {stat.change}
                        </span>
                    </div>
                    <h3 className="text-emerald-900/50 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                    <p className="text-3xl font-black text-emerald-950 mt-1">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
