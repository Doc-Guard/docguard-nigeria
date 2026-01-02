
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
import FilingDetailView from './FilingDetailView';
import FilingForm, { FilingFormData } from './FilingForm';
import { KYCBlockingMessage } from '../common/KYCStatusBadge';
import { getLoanKYCStatus, LoanKYCStatus } from '../../services/kycPersistence';
import { notifyFilingPerfected } from '../../services/notificationService';

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
    const [activeLoan, setActiveLoan] = useState<any | null>(null);
    const [activeFilingPayload, setActiveFilingPayload] = useState<any | null>(null);
    const [activeEvidenceUrl, setActiveEvidenceUrl] = useState<string | null>(null);
    const [selectedFilingId, setSelectedFilingId] = useState<string | null>(null);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [kycStatus, setKycStatus] = useState<LoanKYCStatus | null>(null);

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
    }, [user]);

    // Derived Handler for Filing Selection
    const handleFilingSelection = (filing: Filing) => {
        if (filing.status === 'Pending') {
            // Re-open form with pre-filled details for simple editing/completion
            // Note: In a real app we'd fetch full details for the form, but partial is ok for now.
            setIsFilingFormOpen(true);
            setActiveEvidenceUrl(null);
            // We'd ideally want to pass the specific filing ID to update mode, but for now let's just prefill text
            // To support "Resume", we'd need FilingForm to accept an existing ID.
            // For this demo iteration, we'll open Detail View instead for all, and add "Resume" button there?
            // Actually, user explicitly asked for "editing and completing".
            setSelectedFilingId(filing.id); // View details first, then "Resume" from there is safer pattern?
            // OR: Just open detail view for all, and detail view has "Resume" if pending.
            // User Request: "filing history should be clickable, for editing and completeing incomplete filing"
            if (filing.status === 'Pending') {
                // Fetch full details to prefill form?
                // Let's assume detail view is the gateway.
                setSelectedFilingId(filing.id);
                setIsDetailViewOpen(true);
            } else {
                setSelectedFilingId(filing.id);
                setIsDetailViewOpen(true);
            }
        } else {
            setSelectedFilingId(filing.id);
            setIsDetailViewOpen(true);
            // If we had the full filing object with metadata here we could set it, but 'Filing' interface is simplified.
            // Let's rely on FilingDetailView to fetch valid data, or we just persist the URL if we moved it to the list.
            // For now, let's just clear it on new selection to be safe until we fetch full details.
            setActiveEvidenceUrl(null);
        }
    };

    // Handle navigation state
    useEffect(() => {
        if (location.state?.openFilingForm) {
            setIsFilingFormOpen(true);
        } else if (location.state?.filingId) {
            // Open detail view for the specific filing
            setSelectedFilingId(location.state.filingId);
            setIsDetailViewOpen(true);
            // Clear state to prevent re-opening on subsequent renders
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const [isFilingFormOpen, setIsFilingFormOpen] = useState(false);
    const [currentFilingId, setCurrentFilingId] = useState<string | null>(null);

    const startAutomatedFiling = async (filingData: import('./FilingForm').FilingFormData) => {
        if (!user) return;

        // Check KYC status before proceeding
        const loanId = filingData.loanId || activeLoan?.id;
        if (loanId) {
            const status = await getLoanKYCStatus(loanId);
            if (!status.isFullyVerified) {
                showToast('KYC verification incomplete. Please complete KYC before filing.', 'error');
                return;
            }
        }

        setActiveFilingPayload(filingData);
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
                    loan_id: filingData.loanId || activeLoan?.id,
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
                const rpaResult = await window.electron.startRPA({
                    ref: refId, // Initial ref, will be overwritten by RPA's unique ref
                    entity: filingData.entityName,
                    rcNumber: filingData.rcNumber,
                    filingId: filing.id
                });

                if (rpaResult && rpaResult.success) {
                    let evidenceUrl = null;

                    // Upload Evidence to Cloud
                    if (rpaResult.evidencePath) {
                        try {
                            const readResult = await window.electron.readFile(rpaResult.evidencePath);
                            if (readResult.success && readResult.data) {
                                // Convert Buffer to Uint8Array for Supabase upload
                                // IPC serializes Buffer to object with numeric keys, convert back
                                const bufferData = readResult.data as any;
                                let bytes: number[];

                                if (bufferData instanceof Uint8Array) {
                                    bytes = Array.from(bufferData);
                                } else if (bufferData.type === 'Buffer' && Array.isArray(bufferData.data)) {
                                    // Electron IPC serializes Buffer as {type: 'Buffer', data: [...]}
                                    bytes = bufferData.data;
                                } else {
                                    // Try to convert from object with numeric keys
                                    bytes = Object.values(bufferData) as number[];
                                }

                                const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
                                const fileName = `evidence/${user.id}/${rpaResult.filingRef}_${Date.now()}.png`;

                                const { error: uploadError } = await supabase.storage
                                    .from('evidence') // Ensure this bucket exists in Supabase
                                    .upload(fileName, blob, {
                                        contentType: 'image/png',
                                        upsert: true
                                    });

                                if (!uploadError) {
                                    evidenceUrl = fileName;
                                    addLog('Evidence uploaded securely to cloud.', 'success');
                                    setActiveEvidenceUrl(fileName); // Show in sidebar immediately
                                } else {
                                    console.warn('Evidence upload failed:', uploadError);
                                    addLog(`Cloud upload failed: ${uploadError.message}`, 'error');
                                }
                            }
                        } catch (err: any) {
                            console.error('Evidence processing error:', err);
                            addLog(`Evidence processing failed: ${err.message}`, 'error');
                        }
                    }

                    await supabase
                        .from('filings')
                        .update({
                            status: 'Perfected',
                            reference_id: rpaResult.filingRef,
                            metadata: {
                                ...filing.metadata,
                                completedAt: new Date().toISOString(),
                                evidencePath: rpaResult.evidencePath, // Local path (Electron)
                                evidenceUrl: evidenceUrl // Cloud path (Supabase)
                            }
                        })
                        .eq('id', filing.id);

                    // Create notification for successful filing
                    notifyFilingPerfected(user.id, rpaResult.filingRef, filingData.entityName, filing.id);

                    showToast(`Filing perfected! Ref: ${rpaResult.filingRef}`, 'success');
                }
            } else {
                // Web Mode: Simulate real backend processing delay but use DB updates
                // Ideally this triggers a backend Edge Function, but for this frontend demo
                // we will simulate the "network calls" but strictly update the DB at each step.

                addLog(`Initializing filing for ${filingData.entityName}...`, 'info');
                setProgress(10);

                // 1. Submitted
                await new Promise(r => setTimeout(r, 2000)); // Network simulation
                await supabase.from('filings').update({ status: 'Submitted' }).eq('id', filing.id);
                addLog("Status updated to SUBMITTED.", 'info');
                setProgress(40);

                // 2. Processing
                await new Promise(r => setTimeout(r, 2000));
                addLog("CAC Portal: verifying charge particulars...", 'info');
                setProgress(70);

                // 3. Perfected
                await new Promise(r => setTimeout(r, 2000));
                await supabase.from('filings').update({ status: 'Perfected' }).eq('id', filing.id);
                addLog(`PERFECTION CONFIRMED. Ref: ${refId}`, 'success');
                setProgress(100);

                setIsBotActive(false);
                showToast(`Filing perfected successfully! Reference: ${refId}`, 'success');

                // Refresh list
                // fetchFilings() handled by useEffect dep or subscription
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
                        setActiveLoan(loan);
                        // Check KYC status for selected loan
                        getLoanKYCStatus(loan.id).then(setKycStatus);
                        setSearchTerm(loan.borrower_name); // Auto-filter filings by borrower
                        showToast(`RPA Context set to: ${loan.borrower_name} (${loan.amount.toLocaleString()} ${loan.currency})`, 'success');
                        // Ideally pass this loan context to PayloadSidebar or RPA invocation
                    }}
                />
                <FilingForm
                    isOpen={isFilingFormOpen}
                    onClose={() => setIsFilingFormOpen(false)}
                    onSubmit={startAutomatedFiling}
                    linkedLoanId={activeLoan?.id}
                    linkedDocumentId={location.state?.documentId}
                    prefillData={activeLoan ? {
                        entityName: activeLoan.borrower_name,
                        rcNumber: activeLoan.rc_number || '', // Map RC Number
                        chargeAmount: activeLoan.amount,
                        chargeCurrency: activeLoan.currency,
                        // inferred fields
                        filingType: 'Fixed and Floating Charge'
                    } : location.state?.prefillData}
                />
                <FilingDetailView
                    filingId={selectedFilingId}
                    isOpen={isDetailViewOpen}
                    onClose={() => {
                        setIsDetailViewOpen(false);
                        setSelectedFilingId(null);
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
                        <>
                            {/* KYC Blocking Banner for Linked Loan */}
                            {activeLoan && kycStatus && !kycStatus.isFullyVerified && (
                                <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                                    ⚠️ KYC Required
                                </div>
                            )}
                            <button
                                onClick={() => setIsFilingFormOpen(true)}
                                disabled={activeLoan ? !kycStatus?.isFullyVerified : false}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeLoan
                                    ? 'bg-[#008751] text-white hover:bg-emerald-700 shadow-emerald-900/20'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'
                                    }`}
                            >
                                <Activity size={18} className={isBotActive ? "animate-spin" : ""} />
                                {activeLoan ? 'Create Charge' : 'Create New Filing'}
                            </button>
                        </>
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
                <PayloadSidebar activeLoan={activeLoan} activeFiling={activeFilingPayload} evidenceUrl={activeEvidenceUrl} />
            </div>

            <FilingHistory
                filings={filteredFilings}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSelectFiling={handleFilingSelection}
            />
        </div>
    );
};

export default ChargeRegistry;
