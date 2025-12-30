
import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import TurnaroundChart from './TurnaroundChart';
import PrecisionHealth from './PrecisionHealth';
import ImpactMetrics from './ImpactMetrics';

const Analytics: React.FC = () => {
    const { user } = useAuth();

    // Placeholder for Turnaround (requires tracking time-to-perfection history)
    const turnaroundData = [
        { name: 'Jan', manual: 42, docGuard: 6 },
        { name: 'Feb', manual: 45, docGuard: 5 },
        { name: 'Mar', manual: 38, docGuard: 4 },
        { name: 'Apr', manual: 40, docGuard: 5 },
        { name: 'May', manual: 44, docGuard: 5 },
    ];

    const [registrationData, setRegistrationData] = useState([
        { name: 'Successful', value: 0, color: '#008751' },
        { name: 'Errors Detected', value: 0, color: '#f59e0b' },
        { name: 'Rejected', value: 0, color: '#f43f5e' },
    ]);

    useEffect(() => {
        if (!user) return;

        const fetchAnalytics = async () => {
            // Count Aggregations
            const { count: pending } = await supabase
                .from('filings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'Pending');

            const { count: perfected } = await supabase
                .from('filings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'Perfected');

            const { count: submitted } = await supabase
                .from('filings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'Submitted');

            // Map statuses to health metrics 
            // (Assuming Submitted = In Progress/OK, Perfected = Success, Pending might imply query/wait)
            setRegistrationData([
                { name: 'Perfected', value: perfected || 0, color: '#008751' },
                { name: 'Submitted', value: submitted || 0, color: '#f59e0b' },
                { name: 'Pending', value: pending || 0, color: '#f43f5e' }, // treating pending as "unresolved"
            ]);
        };

        fetchAnalytics();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Efficacy Analytics</h1>
                    </div>
                    <p className="text-emerald-600/70 font-medium">Tracking the 85% optimization of the Nigerian credit documentation cycle.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-50 transition-all shadow-sm">
                        <Filter size={18} className="text-emerald-500" /> Filter View
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 bg-[#0a2e1f] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-900 shadow-xl shadow-emerald-950/20 transition-all active:scale-95">
                        <Download size={18} /> Export Intelligence
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TurnaroundChart data={turnaroundData} />
                <PrecisionHealth data={registrationData} />
            </div>

            <ImpactMetrics />
        </div>
    );
};

export default Analytics;
