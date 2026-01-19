import React from 'react';
import { History, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityFeed from './ActivityFeed';

const ActivityPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={24} className="text-emerald-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-3">
                        <History className="text-emerald-600" size={32} />
                        Activity Log
                    </h1>
                    <p className="text-emerald-600/60 font-medium mt-1">Full history of all actions and events across the workspace.</p>
                </div>
            </div>

            <ActivityFeed isLoading={false} limit={50} showViewAll={false} />
        </div>
    );
};

export default ActivityPage;
