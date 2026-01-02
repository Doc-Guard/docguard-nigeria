
import React, { useState, useEffect } from 'react';
import { Building2, Search, CheckCircle, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { cacService } from '../../services/cacService';
import { firsService } from '../../services/firsService';
import { saveVerification, checkExistingVerification } from '../../services/kycPersistence';

interface CorporateVerificationProps {
    onComplete: (data: any) => void;
    prefillData?: {
        rcNumber?: string;
        tin?: string;
    };
    loanId?: string;
    entityName?: string; // Borrower/Company name from linked loan
}

const CorporateVerification: React.FC<CorporateVerificationProps> = ({ onComplete, prefillData, loanId, entityName }) => {
    const [rcNumber, setRcNumber] = useState(prefillData?.rcNumber || '');
    const [tin, setTin] = useState(prefillData?.tin || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [cacData, setCacData] = useState<any>(null);
    const [firsData, setFirsData] = useState<any>(null);
    const [error, setError] = useState('');
    const [existingRc, setExistingRc] = useState<any>(null);
    const [existingTin, setExistingTin] = useState<any>(null);

    useEffect(() => {
        if (prefillData) {
            if (prefillData.rcNumber) setRcNumber(prefillData.rcNumber);
            if (prefillData.tin) setTin(prefillData.tin);
        }
    }, [prefillData]);

    // Check for existing verifications
    useEffect(() => {
        const checkExisting = async () => {
            if (rcNumber.length >= 5) {
                const rc = await checkExistingVerification('CAC_RC', rcNumber);
                setExistingRc(rc.exists ? rc.record : null);
            } else {
                setExistingRc(null);
            }
        };
        checkExisting();
    }, [rcNumber]);

    useEffect(() => {
        const checkExistingTin = async () => {
            if (tin.length >= 8) {
                const t = await checkExistingVerification('FIRS_TIN', tin);
                setExistingTin(t.exists ? t.record : null);
            } else {
                setExistingTin(null);
            }
        };
        checkExistingTin();
    }, [tin]);

    const handleVerifySync = async () => {
        // Block if identifiers already verified to different entities
        if (existingRc) {
            setError(`This RC Number is already registered to: ${existingRc.entity_name}`);
            return;
        }
        if (existingTin) {
            setError(`This TIN is already registered to: ${existingTin.entity_name}`);
            return;
        }

        setIsVerifying(true);
        setError('');
        try {
            // Parallel execution of independent checks - pass entity context
            const [cacResult, firsResult] = await Promise.all([
                rcNumber ? cacService.searchCompany(rcNumber, { entityName }) : Promise.resolve(null),
                tin ? firsService.validateTIN(tin, { entityName }) : Promise.resolve(null)
            ]);

            setCacData(cacResult);
            setFirsData(firsResult);

            // If both (or provided ones) are valid, save and complete step
            if (cacResult?.status === 'ACTIVE' && (tin ? firsResult?.activeStatus === 'Active' : true)) {
                // Save RC verification
                if (cacResult) {
                    const rcSave = await saveVerification({
                        verificationType: 'CAC_RC',
                        entityName: cacResult.companyName,
                        identifier: rcNumber,
                        status: 'Verified',
                        details: cacResult,
                        loanId
                    });
                    if (!rcSave.success) {
                        setIsVerifying(false);
                        setError(rcSave.error || 'Failed to save RC verification');
                        return;
                    }
                }

                // Save TIN verification
                if (firsResult) {
                    const tinSave = await saveVerification({
                        verificationType: 'FIRS_TIN',
                        entityName: cacResult?.companyName || 'Unknown Entity',
                        identifier: tin,
                        status: 'Verified',
                        details: firsResult,
                        loanId
                    });
                    if (!tinSave.success) {
                        setIsVerifying(false);
                        setError(tinSave.error || 'Failed to save TIN verification');
                        return;
                    }
                }

                setIsVerifying(false);
                onComplete({
                    corporate: {
                        companyName: cacResult.companyName,
                        rcNumber: cacResult.rcNumber,
                        tin: firsResult?.tin,
                        directors: cacResult.directors,
                        status: 'VERIFIED_ACTIVE'
                    }
                });
            } else {
                setIsVerifying(false);
                setError("Entity is not in good standing with one or more agencies.");
            }

        } catch (err: any) {
            console.error(err);
            setIsVerifying(false);
            setError(err.message || "Corporate Verification Failed");
        }
    };

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <Building2 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-emerald-950">Corporate Due Diligence</h3>
                    <p className="text-sm text-emerald-600/60 font-medium">CAC Status & Tax Compliance (FIRS)</p>
                </div>
            </div>

            <div className="space-y-6 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest mb-2">
                            RC Number
                        </label>
                        <input
                            type="text"
                            value={rcNumber}
                            onChange={(e) => setRcNumber(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="RC123456"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest mb-2">
                            Tax ID (TIN)
                        </label>
                        <input
                            type="text"
                            value={tin}
                            onChange={(e) => setTin(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="1000234567"
                        />
                    </div>
                </div>

                {error && <p className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}

                {/* Existing verification badges */}
                {existingRc && !error && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <p className="text-xs font-bold text-emerald-700">
                            RC Previously verified: {existingRc.entity_name}
                        </p>
                    </div>
                )}
                {existingTin && !error && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <p className="text-xs font-bold text-emerald-700">
                            TIN Previously verified: {existingTin.entity_name}
                        </p>
                    </div>
                )}

                {/* Results Display */}
                {cacData && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-xs font-black text-emerald-900">{cacData.companyName}</p>
                            <p className="text-[10px] text-emerald-600">Status: {cacData.status} | Cap: ₦{cacData.shareCapital?.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleVerifySync}
                    disabled={isVerifying || (!rcNumber && !tin)}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-purple-700 shadow-xl shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isVerifying ? 'Running Compliance Check...' : 'Verify Entity Status'}
                </button>
            </div>
        </div>
    );
};

export default CorporateVerification;
