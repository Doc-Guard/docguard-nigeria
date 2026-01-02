import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, ShieldCheck, FileText, Landmark, ExternalLink, Plus, ChevronRight, Briefcase, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';
import PipelineStepper from './PipelineStepper';
import ActivityFeed from '../dashboard/ActivityFeed';

interface LoanDetailProps {
    loanId: string;
    onBack: () => void;
}

interface Loan {
    id: string;
    borrower_name: string;
    amount: number;
    currency: string;
    loan_type: string;
    status: string;
    duration_months: number;
    pipeline_stage: string;
    created_at: string;
    tracking_data: any;
}

const LoanDetailView: React.FC<LoanDetailProps> = ({ loanId, onBack }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [filings, setFilings] = useState<any[]>([]);
    const [kycRequests, setKycRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isActionMenuOpen, setIsActionMenuOpen] = React.useState(false);

    const handleUpdateStage = async (newStage: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('loans')
                .update({ pipeline_stage: newStage })
                .eq('id', loan?.id);

            if (error) throw error;

            showToast(`Facility moved to ${newStage}`, 'success');
            fetchLoanDetails(); // Refresh
        } catch (error) {
            console.error(error);
            showToast('Failed to update stage', 'error');
        } finally {
            setIsLoading(false);
            setIsActionMenuOpen(false);
        }
    };

    React.useEffect(() => {
        if (loanId) {
            fetchLoanDetails();
        }
    }, [loanId]);

    const fetchLoanDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch loan details
            const { data: loanData, error: loanError } = await supabase
                .from('loans')
                .select('*')
                .eq('id', loanId)
                .single();

            if (loanError) throw loanError;
            setLoan(loanData);

            // Fetch related documents
            const { data: docsData, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .eq('loan_id', loanId)
                .order('created_at', { ascending: false });

            if (docsError) throw docsError;
            setDocuments(docsData || []);

            // Fetch related filings
            const { data: filingsData, error: filingsError } = await supabase
                .from('filings')
                .select('*')
                .eq('loan_id', loanId)
                .order('created_at', { ascending: false });

            if (filingsError) throw filingsError;
            setFilings(filingsData || []);

            // Fetch related KYC
            const { data: kycData, error: kycError } = await supabase
                .from('kyc_requests')
                .select('*')
                .eq('loan_id', loanId)
                .order('created_at', { ascending: false });

            // Allow error if kyc table doesn't have loan_id yet? No, I verified it does.
            if (kycError && kycError.code !== 'PGRST100') throw kycError;
            setKycRequests(kycData || []);

        } catch (error: any) {
            console.error('Error fetching details:', error);
            showToast('Could not load loan details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-20 text-center animate-pulse text-emerald-900/40">Loading Facility Details...</div>;
    }

    if (!loan) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header / Nav */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-800 transition-colors uppercase tracking-widest"
            >
                <ArrowLeft size={16} /> Back to Portfolio
            </button>

            {/* Title Block */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-emerald-100 text-[#008751] rounded-2xl">
                            <Briefcase size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">{loan.borrower_name}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-emerald-900/60 font-medium">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                            {loan.loan_type}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-bold">{loan.id.slice(0, 8)}</span>
                    </div>
                </div>

                <div className="flex gap-3 relative">
                    <button
                        onClick={() => navigate('/doc-builder', { state: { loanId: loan.id, borrower: loan.borrower_name } })}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-50 transition-all shadow-sm"
                    >
                        <Plus size={16} /> New Document
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                        >
                            Manage Facility
                            <ChevronDown size={14} className={`transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isActionMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 border-b border-gray-50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 block">Update Stage</span>
                                    {['Review', 'Approval', 'Documentation', 'Disbursement', 'Active'].map((stage) => (
                                        <button
                                            key={stage}
                                            disabled={loan.pipeline_stage === stage}
                                            onClick={() => handleUpdateStage(stage)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between group transition-colors ${loan.pipeline_stage === stage
                                                ? 'bg-emerald-50 text-emerald-700 cursor-default'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-900'
                                                }`}
                                        >
                                            {stage}
                                            {loan.pipeline_stage === stage && <CheckCircle size={12} />}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 bg-gray-50/50 space-y-1">
                                    <button
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to close this facility?')) {
                                                handleUpdateStage('Closed');
                                            }
                                        }}
                                    >
                                        <XCircle size={14} /> Close Facility
                                    </button>
                                    <button
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                        onClick={async () => {
                                            if (window.confirm('⚠️ PERMANENT DELETE: This will permanently remove this facility and all associated data. This action cannot be undone. Continue?')) {
                                                try {
                                                    const { error } = await supabase.from('loans').delete().eq('id', loan.id);
                                                    if (error) throw error;
                                                    showToast('Facility deleted permanently', 'success');
                                                    onBack(); // Navigate back to list
                                                } catch (err: any) {
                                                    console.error(err);
                                                    showToast('Failed to delete facility: ' + err.message, 'error');
                                                }
                                            }
                                        }}
                                    >
                                        <XCircle size={14} /> Delete Permanently
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Workflow Guide */}
            {!isLoading && (
                <div className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm mb-6">
                    <h2 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Briefcase size={16} /> Recommended Next Action
                    </h2>

                    {/* Step 1: KYC */}
                    {kycRequests.every(k => k.status !== 'Approved') && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-emerald-950">Verify Borrower Identity</h3>
                                <p className="text-xs text-gray-500 mt-1">KYC verification is required before generating legal documents.</p>
                            </div>
                            <button
                                onClick={() => navigate('/kyc', {
                                    state: {
                                        loanId: loan.id,
                                        borrower: loan.borrower_name,
                                        rcNumber: loan.tracking_data?.rc_number,
                                        tin: loan.tracking_data?.tin,
                                        bvn: loan.tracking_data?.bvn
                                    }
                                })}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 transition-all"
                            >
                                Start KYC Check
                            </button>
                        </div>
                    )}

                    {/* Step 2: Documents (only if KYC approved) */}
                    {kycRequests.some(k => k.status === 'Approved') && documents.length === 0 && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-emerald-950">Generate Security Documents</h3>
                                <p className="text-xs text-gray-500 mt-1">Identity verified. Proceed to generate legal agreements.</p>
                            </div>
                            <button
                                onClick={() => navigate('/doc-builder', {
                                    state: {
                                        loanId: loan.id,
                                        borrower: loan.borrower_name,
                                        rcNumber: loan.tracking_data?.rc_number // Pass defaults if needed
                                    }
                                })}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 transition-all"
                            >
                                Build Documents
                            </button>
                        </div>
                    )}

                    {/* Step 3: Filings (only if Docs exist) */}
                    {documents.length > 0 && filings.length === 0 && (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-emerald-950">Register Collateral (CAC)</h3>
                                <p className="text-xs text-gray-500 mt-1">Documents generated. File the charge with the registry.</p>
                            </div>
                            <button
                                onClick={() => navigate('/registry', { state: { loanId: loan.id, borrower: loan.borrower_name } })}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 transition-all"
                            >
                                Register Charge
                            </button>
                        </div>
                    )}

                    {/* All Done */}
                    {filings.length > 0 && (
                        <div className="flex items-center gap-3 text-emerald-700 bg-emerald-100/50 p-3 rounded-xl border border-emerald-100">
                            <CheckCircle size={20} />
                            <span className="font-bold text-sm">All origination steps completed. Facility is active.</span>
                        </div>
                    )}
                </div>
            )}

            {/* Pipeline Stepper */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Facility Lifecycle</h3>
                <PipelineStepper currentStage={loan.pipeline_stage || 'Review'} />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest">Facility Amount</span>
                    <div className="text-2xl font-black text-emerald-900 mt-1">
                        {loan.currency} {loan.amount.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tenor</span>
                    <div className="text-xl font-bold text-gray-700 mt-1 flex items-center gap-2">
                        <Clock size={18} className="text-emerald-500" />
                        {loan.duration_months} Months
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Origination Date</span>
                    <div className="text-xl font-bold text-gray-700 mt-1 flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-500" />
                        {new Date(loan.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Compliance Status</span>
                    <div className="text-xl font-bold text-gray-700 mt-1 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        {loan.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Documents & Filings Column */}
                <div className="space-y-8">
                    {/* Documents Section */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                                <FileText size={20} className="text-emerald-600" />
                                Security Documents
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{documents.length}</span>
                        </div>

                        <div className="space-y-3">
                            {documents.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">No documents generated yet.</div>
                            ) : documents.map(doc => (
                                <div key={doc.id} className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex justify-between items-center group cursor-pointer"
                                    onClick={() => navigate('/doc-builder', { state: { docId: doc.id } })}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                                            PDF
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{doc.template_type?.replace(/-/g, ' ').toUpperCase() || 'UNTITLED DOC'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${doc.status === 'executed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {doc.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filings Section */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                                <Landmark size={20} className="text-emerald-600" />
                                Regulatory Filings
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{filings.length}</span>
                        </div>

                        <div className="space-y-3">
                            {filings.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">No filings submitted yet.</div>
                            ) : filings.map(filing => (
                                <div key={filing.id} className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                            CAC
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{filing.filing_type}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Ref: {filing.reference_id}</p>
                                        </div>
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${filing.status === 'Perfected' ? 'bg-emerald-100 text-emerald-700' :
                                        filing.status === 'Submitted' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {filing.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/registry')}
                            className="w-full mt-4 py-3 text-xs font-bold text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            Go to Registry <ExternalLink size={14} />
                        </button>
                    </div>
                </div>

                {/* Activity Feed Column */}
                <div>
                    <h3 className="text-lg font-black text-emerald-950 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-emerald-600" />
                        Facility History
                    </h3>
                    <ActivityFeed isLoading={isLoading} loanId={loanId} />
                </div>
            </div>
        </div>
    );
};

export default LoanDetailView;
