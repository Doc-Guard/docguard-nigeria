
import React, { useState, useEffect } from 'react';
import { Cpu, Lock, Activity, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { RPAActivity } from '../../types';
import LogTerminal from './LogTerminal';
import PayloadSidebar from './PayloadSidebar';
import FilingHistory from './FilingHistory';
import LoanSelector from '../common/LoanSelector';

interface Filing {
    id: string;
    entity: string;
    rcNumber: string;
    type: string;
    submissionDate: string;
    status: 'Pending' | 'Submitted' | 'Perfected';
}

const ChargeRegistry: React.FC = () => {
    const { user } = useAuth();
    const [isBotActive, setIsBotActive] = useState(false);
    const [isLoanSelectorOpen, setIsLoanSelectorOpen] = useState(false);
    const [logs, setLogs] = useState<RPAActivity[]>([]);
    const [progress, setProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filings, setFilings] = useState<Filing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLoanId, setActiveLoanId] = useState<string | null>(null);

    // Fetch filings from Supabase
    useEffect(() => {
        if (!user) return;

        const fetchFilings = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('filings')
                .select('*')
                .eq('user_id', user.id)
                .order('submission_date', { ascending: false });

            if (data) {
                const mappedFilings: Filing[] = data.map((f: any) => ({
                    id: f.reference_id || f.id, // Prefer reference ID for display
                    entity: f.entity_name,
                    rcNumber: f.rc_number,
                    type: f.filing_type,
                    submissionDate: new Date(f.submission_date).toLocaleDateString(),
                    status: f.status as any
                }));
                setFilings(mappedFilings);
            }
            setLoading(false);
        };

        fetchFilings();

        // Realtime Subscription (Optional enhancement for "Persistence")
        const channel = supabase
            .channel('public:filings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'filings', filter: `user_id=eq.${user.id}` }, () => {
                fetchFilings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const filteredFilings = filings.filter(f =>
        f.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.rcNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        }]);
    };

    useEffect(() => {
        // Listen for RPA updates from Electron Main Process
        if (window.electron) {
            const handleUpdate = (_event: any, data: any) => {
                addLog(data.message, data.type);
                setProgress(data.progress);
                if (data.progress === 100) {
                    setIsBotActive(false);
                    // Native Notification
                    window.electron.showNotification('RPA Completed', 'CAC Filing successfully perfected for Dangote Refinery Ltd.');

                    // In a real scenario, the RPA process would insert a record into the DB.
                    // For now, our realtime subscription will verify if that happens, 
                    // or we manually refresh if we are the ones triggering the insertion.
                }
            };
            window.electron.onRPAUpdate(handleUpdate);
            return () => {
                window.electron.offRPAUpdate(handleUpdate);
            };
        }
    }, []);

    const startAutomatedFiling = async () => {
        setIsBotActive(true);
        setLogs([]);
        setProgress(0);

        if (window.electron) {
            // Native Electron Mode
            await window.electron.startRPA({
                ref: 'CAC-CHG-2024-9912',
                entity: 'Dangote Refinery Ltd'
            });
        } else {
            // Web Fallback Mode (Demo)
            const steps = [
                { msg: "Initializing Web Demo Mode...", type: 'info', p: 5 },
                { msg: "Connecting to CAC Portal Simulation...", type: 'info', p: 30 },
                { msg: "Uploading Particulars of Charge...", type: 'success', p: 60 },
                { msg: "PERFECTION SUCCESS (Web Simulation)...", type: 'success', p: 100 },
            ];
            let currentStep = 0;
            const interval = setInterval(() => {
                if (currentStep < steps.length) {
                    addLog(steps[currentStep].msg, steps[currentStep].type as any);
                    setProgress(steps[currentStep].p);
                    currentStep++;
                } else {
                    clearInterval(interval);
                    setIsBotActive(false);
                }
            }, 1500);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <LoanSelector
                    isOpen={isLoanSelectorOpen}
                    onClose={() => setIsLoanSelectorOpen(false)}
                    onSelect={(loan) => {
                        setActiveLoanId(loan.id);
                        setSearchTerm(loan.borrower_name); // Auto-filter filings by borrower
                        alert(`RPA Context set to: ${loan.borrower_name} (${loan.amount.toLocaleString()} ${loan.currency})`);
                        // Ideally pass this loan context to PayloadSidebar or RPA invocation
                    }}
                />
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                            <Cpu size={20} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">CAC Portal RPA</h1>
                    </div>
                    <p className="text-emerald-600/70 font-medium">Native Robot performing official charge registration & perfection.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsLoanSelectorOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                        <Briefcase size={16} /> Link Loan
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                        <Lock size={16} /> Secure Portal
                    </button>
                    {!isBotActive ? (
                        <button
                            onClick={startAutomatedFiling}
                            className="flex items-center gap-2 px-8 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                        >
                            <Activity size={18} className="animate-pulse" />
                            Ignite RPA Bot
                        </button>
                    ) : (
                        <button className="flex items-center gap-2 px-8 py-3 bg-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed">
                            <Loader2 size={18} className="animate-spin" />
                            Bot Operating
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <LogTerminal logs={logs} isBotActive={isBotActive} progress={progress} />
                <PayloadSidebar />
            </div>

            <FilingHistory filings={filteredFilings} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
    );
};

export default ChargeRegistry;
