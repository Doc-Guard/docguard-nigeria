
import React, { useState } from 'react';
import { useToast } from '../common/Toast';
import {
    X,
    PenTool,
    Check,
    Users,
    ShieldAlert,
    Lock,
    ShieldCheck,
    ChevronRight,
    Loader2,
    AlertOctagon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ExecutionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Signatory {
    id: string;
    name: string;
    role: string;
    status: 'Pending' | 'Signed';
}

const ExecutionModal: React.FC<ExecutionModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [executionStep, setExecutionStep] = useState(1);
    const [isExecuting, setIsExecuting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [signatories, setSignatories] = useState<Signatory[]>([
        { id: '1', name: 'Aliko Dangote', role: 'Director, Borrower', status: 'Pending' },
        { id: '2', name: 'Adeola John', role: 'Legal Counsel, Lender', status: 'Pending' }
    ]);

    if (!isOpen) return null;

    const proceedExecution = () => {
        // This logic needs to be adapted as executionStep is removed.
        // Assuming for now that proceeding directly leads to final confirmation.
        setShowFinalConfirm(true);
    };

    const finalizeExecution = async () => {
        setShowFinalConfirm(false);
        setIsExecuting(true);

        // Persist finalized state to Supabase
        try {
            await supabase.from('loans').update({ status: 'Execution' }).eq('id', 'LD-2024-DEMO');
        } catch (e) { }

        setTimeout(() => {
            setIsExecuting(false);
            onClose();
            showToast("Document successfully executed. Evidence Act 2023 certificates generated and stored in docguard cloud.", 'success');
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-[#0a2e1f]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh] relative">

                {/* Final Confirmation Overlay */}
                {showFinalConfirm && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[110] flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-w-md text-center space-y-6">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border-2 border-amber-100">
                                <AlertOctagon size={40} className="text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-emerald-950">Authorize Final Execution?</h3>
                                <p className="text-sm text-emerald-600/70 font-medium leading-relaxed">
                                    This will apply a legally binding electronic signature under the <strong>Evidence Act 2023</strong> of the Federal Republic of Nigeria. This action cannot be reversed.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={finalizeExecution}
                                    className="w-full py-4 bg-[#008751] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                                >
                                    Confirm & Execute Signature
                                </button>
                                <button
                                    onClick={() => setShowFinalConfirm(false)}
                                    className="w-full py-4 bg-white text-emerald-900 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-8 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#008751] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                            <PenTool size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-emerald-950 tracking-tight">Execute Document</h2>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Evidence Act 2023 Digital Workflow</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-emerald-900/40 hover:text-emerald-950 p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Stepper */}
                    <div className="flex items-center justify-between px-12 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-100 -translate-y-1/2 -z-10 mx-16"></div>
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${executionStep >= step ? 'bg-[#008751] text-white shadow-lg' : 'bg-emerald-50 text-emerald-300'
                                }`}>
                                {executionStep > step ? <Check size={20} /> : step}
                            </div>
                        ))}
                    </div>

                    {executionStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <h3 className="font-black text-emerald-950 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={18} /> Review Signatories
                                </h3>
                                <div className="space-y-3">
                                    {signatories.map(s => (
                                        <div key={s.id} className="bg-white p-4 rounded-xl flex items-center justify-between border border-emerald-100 shadow-sm">
                                            <div>
                                                <p className="text-sm font-black text-emerald-950">{s.name}</p>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase">{s.role}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-[#008751] bg-emerald-50 px-3 py-1 rounded-full uppercase">Verified BVN</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-xl">
                                <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                                    By proceeding, you confirm that all signatories have provided active Bank Verification Numbers (BVN) in accordance with CBN digital lending guidelines.
                                </p>
                            </div>
                        </div>
                    )}

                    {executionStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="p-6 bg-slate-900 rounded-2xl text-white">
                                <h3 className="font-black text-emerald-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Lock size={18} /> Compliance Statement
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-serif italic border-l-2 border-emerald-500/50 pl-4 py-2">
                                    "I, the undersigned, hereby acknowledge that my electronic signature attached hereto is intended to have the same binding legal effect as my handwritten signature, pursuant to Section 93(2) and Section 93(3) of the Evidence Act 2023 of the Federal Republic of Nigeria."
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="text-emerald-400" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        DocGuard uses ISO 27001 compliant encryption to seal this agreement upon execution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {executionStep === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 text-center py-8">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100 relative">
                                <PenTool size={40} className="text-[#008751]" />
                                <div className="absolute inset-0 border-4 border-[#008751] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-black text-emerald-950">Ready for Execution</h3>
                            <p className="text-sm text-emerald-600/70 font-medium max-w-xs mx-auto leading-relaxed">
                                Final documents will be stamped with the DocGuard Digital Notary Seal and sent to the CAC perfection queue.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-emerald-50 bg-emerald-50/20 flex gap-4">
                    {executionStep > 1 && (
                        <button
                            onClick={() => setExecutionStep(executionStep - 1)}
                            className="flex-1 py-4 bg-white text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={proceedExecution}
                        disabled={isExecuting}
                        className="flex-[2] py-4 bg-[#008751] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isExecuting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Securing Documents...
                            </>
                        ) : (
                            <>
                                {executionStep === 3 ? 'Execute with E-Signature' : 'Proceed to Next Step'}
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExecutionModal;
