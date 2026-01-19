
import React, { useState, useEffect } from 'react';
import { Search, Wallet, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface Loan {
    id: string;
    borrower_name: string;
    amount: number;
    currency: string;
    loan_type: string;
    status: string;
    rc_number?: string;
    tin?: string;
    bvn?: string;
}

interface LoanSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (loan: Loan) => void;
}

const LoanSelector: React.FC<LoanSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) return;

        const fetchLoans = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                // Flatten tracking_data for easier consumption
                const mapped = data.map((l: any) => ({
                    ...l,
                    rc_number: l.tracking_data?.rc_number || '',
                    tin: l.tracking_data?.tin || '',
                    bvn: l.tracking_data?.bvn || ''
                }));
                setLoans(mapped);
            }
            setIsLoading(false);
        };
        fetchLoans();
    }, [isOpen, user]);

    if (!isOpen) return null;

    const filtered = loans.filter(l =>
        l.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
        l.loan_type?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-emerald-100 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-emerald-950">Select Active Loan</h3>
                        <p className="text-xs text-emerald-600/60 font-medium">Link this action to a transaction.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-emerald-50 rounded-full text-emerald-900/40 hover:text-emerald-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-emerald-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900/30" size={16} />
                        <input
                            type="text"
                            placeholder="Find Borrower or Facility..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 rounded-xl text-sm font-medium text-emerald-900 outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-emerald-900/40 text-xs font-medium">Loading Portfolio...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-emerald-900/40 text-xs font-medium">No loans found.</div>
                    ) : (
                        filtered.map(loan => (
                            <button
                                key={loan.id}
                                onClick={() => { onSelect(loan); onClose(); }}
                                className="w-full p-3 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition-colors group text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-100/50 text-[#008751] flex items-center justify-center shrink-0 group-hover:bg-[#008751] group-hover:text-white transition-colors">
                                    <Wallet size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-emerald-950 truncate">{loan.borrower_name}</h4>
                                    <p className="text-[10px] text-emerald-600/70 font-mono truncate">
                                        {loan.currency} {loan.amount.toLocaleString()} • {loan.loan_type}
                                    </p>
                                </div>
                                {loan.status === 'Active' && <Check size={16} className="text-[#008751] opacity-0 group-hover:opacity-100" />}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoanSelector;
