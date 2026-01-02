import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    FileText,
    Landmark,
    Briefcase,
    Calendar,
    Clock,
    ShieldCheck,
    AlertTriangle,
    Plus,
    ExternalLink
} from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loanId) fetchLoanDetails();
    }, [loanId]);

    const fetchLoanDetails = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Loan
            const { data: loanData, error: loanError } = await supabase
                .from('loans')
                .select('*')
                .eq('id', loanId)
                .single();

            if (loanError) throw loanError;
            setLoan(loanData);

            // 2. Fetch Linked Documents
            const { data: docsData } = await supabase
                .from('documents')
                .select('*')
                .eq('loan_id', loanId)
                .order('updated_at', { ascending: false });
            setDocuments(docsData || []);

            // 3. Fetch Linked Filings
            const { data: filingsData } = await supabase
                .from('filings')
                .select('*')
                .eq('loan_id', loanId)
                .order('submission_date', { ascending: false });
            setFilings(filingsData || []);

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

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/doc-builder', { state: { loanId: loan.id, borrower: loan.borrower_name } })}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-100 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-50 transition-all shadow-sm"
                    >
                        <Plus size={16} /> New Document
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95">
                        Manage Facility
                    </button>
                </div>
            </div>

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
