import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Briefcase,
    Calendar,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface Loan {
    id: string;
    borrower_name: string;
    amount: number;
    currency: string;
    loan_type: string;
    pipeline_stage?: string;
    status: 'Active' | 'Pending' | 'Closed' | 'Defaulted';
    created_at: string;
    tracking_data: {
        next_review?: string;
    };
}

interface LoanListProps {
    onSelectLoan: (loanId: string) => void;
    onNewLoan: () => void;
}

const LoanList: React.FC<LoanListProps> = ({ onSelectLoan, onNewLoan }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Active' | 'Pending'>('All');
    const [stageFilter, setStageFilter] = useState<string>('All');

    useEffect(() => {
        if (!user) return;
        fetchLoans();
    }, [user]);

    const fetchLoans = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('loans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setLoans(data);
        }
        setIsLoading(false);
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loan_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filter === 'All' || loan.status === filter;
        const matchesStage = stageFilter === 'All' || loan.pipeline_stage === stageFilter;

        return matchesSearch && matchesStatus && matchesStage;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Defaulted': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-3">
                        <Briefcase className="text-emerald-600" size={32} />
                        Credit Portfolio
                    </h1>
                    <p className="text-emerald-600/70 font-medium mt-1">
                        Manage your active facilities and track compliance status.
                    </p>
                </div>
                <button
                    onClick={onNewLoan}
                    className="flex items-center gap-2 px-6 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Originate Deal
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
                        <span className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">Total Exposure</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-950">
                        ₦{(loans.reduce((acc, curr) => acc + (curr.currency === 'NGN' ? curr.amount : curr.amount * 1500), 0) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-emerald-600 mt-1 font-medium">+12% vs last month</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertCircle size={20} /></div>
                        <span className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">Pending Review</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-950">
                        {loans.filter(l => l.status === 'Pending').length} Deals
                    </div>
                    <div className="text-xs text-amber-600 mt-1 font-medium">Requires attention</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CheckCircle2 size={20} /></div>
                        <span className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">Active Portfolio</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-950">
                        {loans.filter(l => l.status === 'Active').length} Facilities
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">Fully complied</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search borrowers, deal types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-emerald-950 font-medium placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2 p-1 overflow-x-auto">
                    {(['All', 'Active', 'Pending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === f
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}

                    <div className="w-px h-8 bg-gray-200 mx-2" />

                    <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All Stages</option>
                        {['Review', 'Approval', 'Documentation', 'Disbursement', 'Active'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loan Grid */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse">Loading portfolio data...</div>
                ) : filteredLoans.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                        <p className="text-emerald-900/40 font-medium">No loans found matching your criteria.</p>
                        <button onClick={onNewLoan} className="text-[#008751] font-bold text-sm mt-2 hover:underline">Start a new origination</button>
                    </div>
                ) : (
                    filteredLoans.map(loan => (
                        <div
                            key={loan.id}
                            onClick={() => onSelectLoan(loan.id)}
                            className="bg-white p-6 rounded-2xl border border-emerald-50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white ${loan.status === 'Active' ? 'bg-[#008751]' : 'bg-gray-400'
                                        }`}>
                                        {loan.borrower_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-950 group-hover:text-[#008751] transition-colors">
                                            {loan.borrower_name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="font-mono font-medium text-emerald-900">
                                                {loan.currency} {loan.amount.toLocaleString()}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span>{loan.loan_type}</span>
                                            {loan.pipeline_stage && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-emerald-600 font-bold">{loan.pipeline_stage}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <time className="text-xs text-gray-400 font-medium block">Originated</time>
                                        <span className="text-sm font-bold text-emerald-950">
                                            {new Date(loan.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(loan.status)}`}>
                                        {loan.status}
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#008751] group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LoanList;
