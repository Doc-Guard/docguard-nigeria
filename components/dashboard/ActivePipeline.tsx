
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, FileText, BadgeCheck, Clock, ArrowUpRight } from 'lucide-react';

interface DashboardItem {
    id: string;
    title: string;
    subtitle: string;
    status: string;
    date: string;
    type: 'document' | 'filing';
}

interface ActivePipelineProps {
    items: DashboardItem[];
    isLoading: boolean;
}

const ActivePipeline: React.FC<ActivePipelineProps> = ({ items, isLoading }) => {
    const navigate = useNavigate();
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/20">
                <div>
                    <h2 className="font-extrabold text-xl text-emerald-950">Recent Activity</h2>
                    <p className="text-xs text-emerald-600/60 mt-1 font-medium uppercase tracking-widest">Latest Drafts & Filings</p>
                </div>
                <button className="text-[#008751] text-xs font-black uppercase tracking-widest hover:text-emerald-800 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all">
                    View All <ChevronRight size={16} />
                </button>
            </div>
            <div className="overflow-x-auto flex-1 relative min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 size={32} className="text-emerald-600 animate-spin" />
                    </div>
                )}
                {items.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-emerald-600/40 p-10">
                        <FileText size={40} className="mb-2 opacity-50" />
                        <p className="text-sm font-bold">No recent activity found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-emerald-50/40 text-emerald-900/40 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Item / Reference</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50/60">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => {
                                        if (item.type === 'document') {
                                            navigate('/doc-builder', { state: { docId: item.id } });
                                        } else {
                                            navigate('/registry', { state: { filingId: item.id } });
                                        }
                                    }}
                                    className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-emerald-950 group-hover:text-[#008751] transition-colors">{item.title}</p>
                                        <p className="text-[10px] font-mono text-emerald-500 mt-1">{item.id.slice(0, 8)}...</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${item.type === 'document' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {item.type === 'document' ? <FileText size={12} /> : <BadgeCheck size={12} />}
                                            {item.subtitle}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Perfected' || item.status === 'final' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-slate-100 text-slate-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-emerald-900/60 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className="text-emerald-300" />
                                            {item.date}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-8 h-8 rounded-lg border border-emerald-100 flex items-center justify-center text-emerald-200 group-hover:text-[#008751] group-hover:border-[#008751]/20 transition-all">
                                            <ArrowUpRight size={18} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ActivePipeline;
