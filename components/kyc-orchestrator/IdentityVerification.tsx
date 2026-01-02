
import React, { useState } from 'react';
import { Search, CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';

interface IdentityVerificationProps {
    onComplete: (data: any) => void;
    prefillData?: { bvn?: string };
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ onComplete, prefillData }) => {
    const [bvn, setBvn] = useState(prefillData?.bvn || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (prefillData?.bvn) setBvn(prefillData.bvn);
    }, [prefillData]);

    const handleVerify = async () => {
        if (bvn.length !== 11) {
            setError('BVN must be 11 digits');
            return;
        }
        setIsVerifying(true);
        setError('');


        // Call NIBSS Service
        try {
            const result = await import('../../services/nibssService').then(m => m.nibssService.validateBVN(bvn));
            setIsVerifying(false);
            onComplete({
                bvn: result.bvn,
                firstName: result.firstName,
                lastName: result.lastName,
                dob: result.dob,
                photoResult: 'MATCH'
            });
        } catch (err: any) {
            setIsVerifying(false);
            setError(err.message || 'Verification Failed');
        }
    };

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#008751]">
                    <Fingerprint size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-emerald-950">Identity Verification</h3>
                    <p className="text-sm text-emerald-600/60 font-medium">NIBSS BVN & NIMC NIN Real-time Check</p>
                </div>
            </div>

            <div className="space-y-6 max-w-md">
                <div>
                    <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest mb-2">
                        Bank Verification Number (BVN)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            maxLength={11}
                            value={bvn}
                            onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 pl-12 text-lg font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-[#008751] outline-none transition-all placeholder:text-emerald-900/20"
                            placeholder="2222 0000 111"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                    </div>
                    {error && <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={isVerifying || !bvn}
                    className="w-full py-4 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isVerifying ? 'Verifying Identity...' : 'Verify on NIBSS Ledger'}
                </button>
            </div>
        </div>
    );
};

export default IdentityVerification;
