
import React from 'react';
import { useDeadlines } from '../dashboard/useDeadlines';
import { Loader2, ShieldAlert } from 'lucide-react';
import DeadlineList from './DeadlineList';
import DeadlineKanban from './DeadlineKanban';

const DeadlinePage: React.FC = () => {
    const { deadlines, isLoading } = useDeadlines();
    const [viewMode, setViewMode] = React.useState<'list' | 'kanban'>('kanban');

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                <p className="text-emerald-800 font-medium">Scanning compliance obligations...</p>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-950 flex items-center gap-3">
                        <ShieldAlert className="text-emerald-600" size={32} />
                        Compliance Guardian
                    </h1>
                    <p className="text-emerald-700/80 mt-2 font-medium">
                        90-Day CAMA Registration & Loan SLA Monitor
                    </p>
                </div>

                <div className="flex bg-emerald-100/50 p-1 rounded-xl border border-emerald-200">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-emerald-800' : 'text-emerald-600 hover:bg-emerald-200/50'}`}
                    >
                        Board View
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-800' : 'text-emerald-600 hover:bg-emerald-200/50'}`}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {viewMode === 'kanban' ? (
                    <DeadlineKanban deadlines={deadlines} />
                ) : (
                    <DeadlineList deadlines={deadlines} />
                )}
            </div>
        </div>
    );
};

export default DeadlinePage;
