
import React from 'react';
import { DeadlineItem } from '../dashboard/useDeadlines';
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeadlineKanbanProps {
    deadlines: DeadlineItem[];
}

const DeadlineKanban: React.FC<DeadlineKanbanProps> = ({ deadlines }) => {
    const navigate = useNavigate();

    const columns = [
        { id: 'track', label: 'On Track', color: 'bg-emerald-50 border-emerald-100', icon: CheckCircle2, iconColor: 'text-emerald-500' },
        { id: 'warning', label: 'Warning (< 30 Days)', color: 'bg-yellow-50 border-yellow-100', icon: Clock, iconColor: 'text-yellow-500' },
        { id: 'urgent', label: 'Urgent (< 15 Days)', color: 'bg-amber-50 border-amber-100', icon: AlertTriangle, iconColor: 'text-amber-500' },
        { id: 'critical', label: 'Critical / Overdue', color: 'bg-rose-50 border-rose-100', icon: AlertOctagon, iconColor: 'text-rose-500' }
    ];

    const getColumnItems = (columnId: string) => {
        if (columnId === 'critical') {
            return deadlines.filter(d => d.status === 'critical' || d.status === 'overdue');
        }
        return deadlines.filter(d => d.status === columnId);
    };

    const handleAction = (item: DeadlineItem) => {
        if (item.type === 'filing') {
            navigate('/registry');
        } else {
            navigate('/loans');
        }
    };

    return (
        <div className="h-full grid grid-cols-4 gap-6 overflow-auto pb-4">
            {columns.map(col => {
                const items = getColumnItems(col.id);
                const Icon = col.icon;

                return (
                    <div key={col.id} className={`h-full flex flex-col rounded-2xl border ${col.color} p-4`}>
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                            <div className="flex items-center gap-2">
                                <Icon className={col.iconColor} size={18} />
                                <h3 className="font-bold text-slate-800 text-sm">{col.label}</h3>
                            </div>
                            <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-black text-slate-600">
                                {items.length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            {items.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                                    No items
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${item.type === 'filing' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {item.type}
                                            </span>
                                            {item.days < 0 ? (
                                                <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full animate-pulse">
                                                    OVERDUE
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500">
                                                    {item.days}d left
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-1 leading-tight">{item.entity}</h4>
                                        <p className="text-xs text-slate-500 mb-4">{item.task}</p>

                                        <button
                                            onClick={() => handleAction(item)}
                                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 group-hover:border-emerald-200 group-hover:text-emerald-700 group-hover:bg-emerald-50"
                                        >
                                            {item.actionLabel}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DeadlineKanban;
