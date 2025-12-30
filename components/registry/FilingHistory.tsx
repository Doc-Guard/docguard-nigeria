
import React from 'react';
import { FileText, Search, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface Filing {
    id: string;
    entity: string;
    rcNumber: string;
    type: string;
    submissionDate: string;
    status: 'Pending' | 'Submitted' | 'Perfected';
}

interface FilingHistoryProps {
    filings: Filing[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const FilingHistory: React.FC<FilingHistoryProps> = ({ filings, searchTerm, setSearchTerm }) => {
    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 mt-8">
            <div className="p-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                <div className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                    <FileText size={14} />
                    Filing History
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                        type="text"
                        placeholder="Filter by Entity or RC..."
                        className="pl-9 pr-4 py-2 bg-white border border-emerald-100 rounded-lg text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-[#008751] outline-none w-64 uppercase placeholder:normal-case"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-emerald-50 bg-emerald-50/20">
                            <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-emerald-900/40">Reference ID</th>
                            <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-emerald-900/40">Entity</th>
                            <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-emerald-900/40">Filing Type</th>
                            <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-emerald-900/40">Date</th>
                            <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-emerald-900/40 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                        {filings.map(filing => (
                            <tr key={filing.id} className="hover:bg-emerald-50/30 transition-colors group">
                                <td className="px-6 py-4 font-mono text-emerald-600 text-xs">{filing.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-emerald-950">{filing.entity}</div>
                                    <div className="text-[10px] text-emerald-500 font-mono">{filing.rcNumber}</div>
                                </td>
                                <td className="px-6 py-4 text-emerald-700 font-medium">{filing.type}</td>
                                <td className="px-6 py-4 text-emerald-600/60 font-medium">{filing.submissionDate}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${filing.status === 'Perfected' ? 'bg-[#008751]/10 text-[#008751]' :
                                        filing.status === 'Submitted' ? 'bg-amber-50 text-amber-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                        {filing.status === 'Perfected' && <CheckCircle2 size={12} />}
                                        {filing.status === 'Submitted' && <Loader2 size={12} className="animate-spin" />}
                                        {filing.status === 'Pending' && <Clock size={12} />}
                                        {filing.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FilingHistory;
