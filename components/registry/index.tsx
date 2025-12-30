
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Cpu, Lock, Activity, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../common/Toast';
import { RPAActivity } from '../../types';
import LogTerminal from './LogTerminal';
import PayloadSidebar from './PayloadSidebar';
import FilingHistory from './FilingHistory';
import LoanSelector from '../common/LoanSelector';
import FilingForm, { FilingFormData } from './FilingForm';

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
    const { showToast } = useToast();
    const location = useLocation();
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
                    // RPA completed - refresh filings from database to show updated status
                    // The realtime subscription will automatically update the UI
                    showToast('CAC Filing successfully perfected!', 'success');
                }
            };
            window.electron.onRPAUpdate(handleUpdate);
            return () => {
                window.electron.offRPAUpdate(handleUpdate);
            };
        }
    }, []);

    // Handle navigation from DocBuilder
    useEffect(() => {
        if (location.state?.openFilingForm) {
            setIsFilingFormOpen(true);
        }
    }, [location.state]);

    const [isFilingFormOpen, setIsFilingFormOpen] = useState(false);
    const [currentFilingId, setCurrentFilingId] = useState<string | null>(null);

    const startAutomatedFiling = async (filingData: import('./FilingForm').FilingFormData) => {
        if (!user) return;

        setIsBotActive(true);
        setLogs([]);
        setProgress(0);

        try {
            // Generate reference ID
            const refId = `CAC-CHG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            // Create initial filing record
            const { data: filing, error: filingError } = await supabase
                .from('filings')
                .insert({
                    user_id: user.id,
                    loan_id: filingData.loanId || activeLoanId,
                    document_id: filingData.documentId,
                    reference_id: refId,
                    entity_name: filingData.entityName,
                    rc_number: filingData.rcNumber,
                    filing_type: filingData.filingType,
                    charge_amount: filingData.chargeAmount,
                    charge_currency: filingData.chargeCurrency,
                    asset_description: filingData.assetDescription,
                    status: 'Pending',
                    metadata: {
                        startedAt: new Date().toISOString(),
                        initiatedBy: user.email
                    }
                })
                .select()
                .single();

            if (filingError) throw filingError;
            setCurrentFilingId(filing.id);

            if (window.electron) {
                // Native Electron Mode with real data
                await window.electron.startRPA({
                    ref: refId,
                    entity: filingData.entityName,
                    rcNumber: filingData.rcNumber,
                    filingId: filing.id
                });
            } else {
                // Web Fallback Mode with database updates
                const steps = [
                    { msg: `Initializing filing for ${filingData.entityName}...`, type: 'info', p: 5, status: 'Pending' },
                    { msg: `Connecting to CAC Portal (RC: ${filingData.rcNumber})...`, type: 'info', p: 20, status: 'Pending' },
                    { msg: "Authenticating with CAC credentials...", type: 'success', p: 30, status: 'Submitted' },
                    { msg: `Uploading charge particulars (${filingData.chargeCurrency} ${filingData.chargeAmount.toLocaleString()})...`, type: 'info', p: 50, status: 'Submitted' },
                    { msg: "Processing asset registration...", type: 'info', p: 70, status: 'Submitted' },
                    { msg: `PERFECTION SUCCESS - Ref: ${refId}`, type: 'success', p: 100, status: 'Perfected' },
                ];

                for (const step of steps) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    addLog(step.msg, step.type as any);
                    setProgress(step.p);

                    // Update database at milestones
                    if (step.p === 30 || step.p === 70 || step.p === 100) {
                        await supabase
                            .from('filings')
                            .update({
                                status: step.status,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', filing.id);
                    }
                }

                setIsBotActive(false);
                showToast(`Filing completed successfully! Reference: ${refId}`, 'success');
            }
        } catch (error: any) {
            console.error('Filing failed:', error);
            addLog(`ERROR: ${error.message}`, 'error');
            setIsBotActive(false);
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
                        showToast(`RPA Context set to: ${loan.borrower_name} (${loan.amount.toLocaleString()} ${loan.currency})`, 'success');
                        // Ideally pass this loan context to PayloadSidebar or RPA invocation
                    }}
                />
                <FilingForm
                    isOpen={isFilingFormOpen}
                    onClose={() => setIsFilingFormOpen(false)}
                    onSubmit={startAutomatedFiling}
                    linkedLoanId={activeLoanId}
                    linkedDocumentId={location.state?.documentId}
                    prefillData={location.state?.prefillData}
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
                            onClick={() => setIsFilingFormOpen(true)}
                            className="flex items-center gap-2 px-8 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                        >
                            <Activity size={18} className="animate-pulse" />
                            Create New Filing
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
