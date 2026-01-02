
import React, { useState } from 'react';
import {
    ShieldCheck,
    Check,
    Fingerprint,
    Briefcase
} from 'lucide-react';
import IdentityVerification from './IdentityVerification';
import DocumentScanner from './DocumentScanner';
import LivenessCheck from './LivenessCheck';
import CorporateVerification from './CorporateVerification';
import RiskScore from './RiskScore';
import LoanSelector from '../common/LoanSelector';
import { useToast } from '../common/Toast';

import { useLocation } from 'react-router-dom';

const KYCOrchestrator: React.FC = () => {
    const { showToast } = useToast();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [kycData, setKycData] = useState<any>({});
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isLoanSelectorOpen, setIsLoanSelectorOpen] = useState(false);
    const [loanContext, setLoanContext] = useState<any>(null);

    React.useEffect(() => {
        if (location.state?.loanId) {
            // Check if we already have this context to avoid infinite loop or reset
            if (loanContext?.id !== location.state.loanId) {
                setLoanContext({
                    id: location.state.loanId,
                    borrower_name: location.state.borrower,
                    // Normalize the data structure
                    rc_number: location.state.rcNumber,
                    tin: location.state.tin,
                    bvn: location.state.bvn
                });
                showToast(`KYC initiated for loan: ${location.state.borrower}`, 'success');
            }
        }
    }, [location, loanContext, showToast]);

    // ... (handleStepComplete and steps array remain same)

    const getPrefillData = () => {
        if (!loanContext) return undefined;
        // Handle both flat structure (from navigation) and nested structure (from LoanSelector)
        return {
            rcNumber: loanContext.rc_number || loanContext.tracking_data?.rc_number,
            tin: loanContext.tin || loanContext.tracking_data?.tin,
            bvn: loanContext.bvn || loanContext.tracking_data?.bvn
        };
    };

    const prefill = getPrefillData();

    const handleStepComplete = (data: any) => {
        setKycData({ ...kycData, ...data });
        if (!completedSteps.includes(step)) {
            setCompletedSteps([...completedSteps, step]);
        }
        if (step < 5) {
            setStep(step + 1);
        }
    };

    const steps = [
        { id: 1, label: 'Identity Check', component: IdentityVerification },
        { id: 2, label: 'Corporate DD', component: CorporateVerification },
        { id: 3, label: 'Document Scan', component: DocumentScanner },
        { id: 4, label: 'Liveness Proof', component: LivenessCheck },
        { id: 5, label: 'Risk Assessment', component: RiskScore }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
                <LoanSelector
                    isOpen={isLoanSelectorOpen}
                    onClose={() => setIsLoanSelectorOpen(false)}
                    onSelect={(loan) => {
                        setLoanContext(loan);
                        showToast(`KYC initiated for loan: ${loan.borrower_name}`, 'success');
                    }}
                />

                {loanContext && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Briefcase size={12} />
                        Linked: {loanContext.borrower_name}
                    </div>
                )}

                <div className="p-3 bg-emerald-100 text-[#008751] rounded-2xl mb-2 cursor-pointer hover:bg-emerald-200 transition-colors" onClick={() => setIsLoanSelectorOpen(true)}>
                    <Fingerprint size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">KYC Verification</h1>
                <p className="text-emerald-600/70 font-medium max-w-lg">
                    Compliance-first identity verification pipeline with real-time biometric and document analysis.
                    <br />
                    <button onClick={() => setIsLoanSelectorOpen(true)} className="text-[#008751] hover:underline text-xs mt-2 font-bold">
                        {loanContext ? 'Change Linked Loan' : 'Link to a Facility'}
                    </button>
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-8 relative mb-12">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-50 -translate-y-1/2 -z-10 mx-12"></div>
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-3 bg-white p-2">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-4 ${step === s.id ? 'bg-[#008751] text-white border-emerald-100 shadow-xl' :
                                completedSteps.includes(s.id) ? 'bg-emerald-500 text-white border-white' :
                                    'bg-white text-emerald-200 border-emerald-50'
                                }`}
                        >
                            {completedSteps.includes(s.id) && step !== s.id ? <Check size={20} /> : s.id}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step === s.id ? 'text-[#008751]' : 'text-emerald-900/40'
                            }`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Active Step */}
            <div className="min-h-[400px]">
                {step === 1 && <IdentityVerification
                    onComplete={handleStepComplete}
                    prefillData={loanContext ? {
                        bvn: loanContext.bvn || loanContext.tracking_data?.bvn
                    } : undefined}
                />}
                {step === 2 && <CorporateVerification
                    onComplete={handleStepComplete}
                    prefillData={loanContext ? {
                        rcNumber: loanContext.rc_number || loanContext.tracking_data?.rc_number,
                        tin: loanContext.tin || loanContext.tracking_data?.tin
                    } : undefined}
                />}
                {step === 3 && <DocumentScanner onComplete={handleStepComplete} />}
                {step === 4 && <LivenessCheck onComplete={handleStepComplete} />}
                {step === 5 && <RiskScore score={98} details={kycData} />}
            </div>

            {/* Dev Navigation (Optional) */}
            <div className="flex justify-center gap-4 opacity-0 hover:opacity-100 transition-opacity">
                {steps.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
                    >
                        Jump to {s.id}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default KYCOrchestrator;
