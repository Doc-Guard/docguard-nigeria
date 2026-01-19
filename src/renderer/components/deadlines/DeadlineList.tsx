
import React from 'react';
import { DeadlineItem } from '../dashboard/useDeadlines';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeadlineListProps {
    deadlines: DeadlineItem[];
}

const DeadlineList: React.FC<DeadlineListProps> = ({ deadlines }) => {
    const navigate = useNavigate();

    const handleAction = (item: DeadlineItem) => {
        if (item.type === 'filing') {
            navigate('/registry');
        } else {
            navigate('/loans');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Entity</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Task</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Deadline</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {deadlines.map((item) => {
                            const isOverdue = item.days < 0;
                            const deadlineDate = new Date(item.deadlineDate).toLocaleDateString();

                            return (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.entity}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{item.task}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded-md ${item.type === 'filing' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? 'text-rose-600' :
                                                item.status === 'critical' ? 'text-rose-500' :
                                                    item.status === 'urgent' ? 'text-amber-500' :
                                                        item.status === 'warning' ? 'text-yellow-500' :
                                                            'text-emerald-600'
                                            }`}>
                                            {isOverdue ? 'OVERDUE' : `${item.days} Days Left`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {deadlineDate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAction(item)}
                                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-200"
                                        >
                                            {item.actionLabel} <ArrowRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeadlineList;
