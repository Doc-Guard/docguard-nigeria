
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    Calendar,
    CheckCircle,
    ChevronRight,
    Briefcase,
    Building2,
    Loader2,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../common/Toast';

interface OriginationWizardProps {
    onSuccess?: (loanId: string) => void;
}

const OriginationWizard: React.FC<OriginationWizardProps> = ({ onSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [borrower, setBorrower] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [type, setType] = useState('Secured Term Facility');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState('Months');

    // Compliance State
    const [rcNumber, setRcNumber] = useState('');
    const [tin, setTin] = useState('');
    const [bvn, setBvn] = useState('');

    const handleCreate = async () => {
        if (!user || !borrower || !amount) return;
        setIsLoading(true);

        try {
            const payload = {
                user_id: user.id,
                borrower_name: borrower,
                amount: parseFloat(amount.replace(/,/g, '')),
                currency,
                loan_type: type,
                duration_months: durationUnit === 'Years' ? parseInt(duration) * 12 : parseInt(duration),
                status: 'Active',
                tracking_data: {
                    origination_date: new Date().toISOString(),
                    next_review: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days out
                    rc_number: rcNumber,
                    tin: tin,
                    bvn: bvn
                },
                pipeline_stage: 'Review'
            };

            const { data, error } = await supabase
                .from('loans')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            // Redirect to Loan Dashboard or Doc Builder with context
            if (onSuccess) {
                onSuccess(data.id);
            } else {
                navigate('/doc-builder', { state: { loanId: data.id, borrower: data.borrower_name } });
            }

        } catch (err: any) {
            console.error(err);
            showToast(`Creation Failed: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
                <div className="p-3 bg-emerald-100 text-[#008751] rounded-2xl mb-2">
                    <Briefcase size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">New Credit Origination</h1>
                <p className="text-emerald-600/70 font-medium max-w-lg">
                    Structure a new facility with automated compliance checks and document generation.
                </p>
            </div>

            <div className="bg-white border border-emerald-100 rounded-3xl p-10 shadow-xl space-y-8">
                {/* 1. Borrower & Facility Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest pl-1">Borrower / Obligor</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" size={18} />
                            <input
                                type="text"
                                value={borrower}
                                onChange={(e) => setBorrower(e.target.value)}
                                placeholder="e.g. Dangote Cement Plc"
                                className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all border border-emerald-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest pl-1">Facility Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all border border-emerald-50 appearance-none"
                        >
                            <option>Secured Term Facility</option>
                            <option>Revolving Credit Facility</option>
                            <option>Project Finance</option>
                            <option>Trade Finance (LC/Bank Guarantee)</option>
                        </select>
                    </div>
                </div>

                {/* 2. Amount & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest pl-1">Facility Amount</label>
                        <div className="flex gap-2">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-24 px-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-black text-emerald-950 outline-none border border-emerald-50 text-center"
                            >
                                <option>NGN</option>
                                <option>USD</option>
                                <option>GBP</option>
                            </select>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30 font-serif italic text-lg">₦</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-mono font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all border border-emerald-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest pl-1">Tenor / Duration</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="24"
                                className="flex-1 px-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-mono font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all border border-emerald-50"
                            />
                            <select
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value)}
                                className="w-32 px-4 py-4 bg-emerald-50/50 rounded-2xl text-sm font-bold text-emerald-950 outline-none border border-emerald-50"
                            >
                                <option>Months</option>
                                <option>Years</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Compliance & Identity */}
                <div className="pt-6 border-t border-dashed border-emerald-100">
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ShieldCheck size={16} /> Compliance & Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">RC Number</label>
                            <input
                                type="text"
                                value={rcNumber}
                                onChange={(e) => setRcNumber(e.target.value)}
                                placeholder="RC123456"
                                className={`w-full px-4 py-3 bg-white rounded-xl text-sm font-bold text-emerald-950 outline-none border transition-all ${rcNumber && !/^RC\d+$/i.test(rcNumber)
                                    ? 'border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                    : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                    }`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">TIN (Tax ID)</label>
                            <input
                                type="text"
                                value={tin}
                                onChange={(e) => setTin(e.target.value)}
                                placeholder="10-digit TIN"
                                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold text-emerald-950 outline-none border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">BVN (Director)</label>
                            <input
                                type="text"
                                value={bvn}
                                onChange={(e) => setBvn(e.target.value)}
                                placeholder="11-digit BVN"
                                maxLength={11}
                                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold text-emerald-950 outline-none border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                            />
                        </div>
                    </div>
                    {rcNumber && !/^RC\d+$/i.test(rcNumber) && (
                        <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> Format invalid: Must start with "RC" followed by numbers
                        </p>
                    )}
                </div>

                <div className="pt-8 flex items-center justify-end border-t border-emerald-50">
                    <button
                        onClick={handleCreate}
                        disabled={isLoading || !borrower || !amount}
                        className="flex items-center gap-2 px-10 py-4 bg-[#008751] text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        {isLoading ? 'Creating Facility...' : 'Originate Loan'}
                        {!isLoading && <ChevronRight size={18} className="ml-2 opacity-60" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OriginationWizard;
