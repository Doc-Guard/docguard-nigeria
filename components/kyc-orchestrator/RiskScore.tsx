
import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskScoreProps {
    score: number;
    details: any;
    onFinalize?: () => void;
}

const RiskScore: React.FC<RiskScoreProps> = ({ score, details, onFinalize }) => {
    const isSafe = score >= 80;

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSafe ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-emerald-950">Risk Assessment</h3>
                    <p className="text-sm text-emerald-600/60 font-medium">Aggregated KYC/AML Compliance Score</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center mb-6 relative ${isSafe ? 'border-emerald-100 text-[#008751]' : 'border-rose-100 text-rose-500'}`}>
                    <span className="text-5xl font-black tracking-tighter">{score}</span>
                    <span className="absolute -bottom-4 bg-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-50 shadow-sm">
                        Out of 100
                    </span>
                </div>

                <h2 className={`text-2xl font-black mb-2 ${isSafe ? 'text-[#008751]' : 'text-rose-500'}`}>
                    {isSafe ? 'LOW RISK PROFILE' : 'HIGH RISK DETECTED'}
                </h2>
                <p className="text-center text-emerald-900/60 text-sm max-w-xs leading-relaxed">
                    {isSafe
                        ? "Identity verified across all bureaus. No adverse media found. Liveness confirmed."
                        : "Critical discrepancies found in Identity Data. Manual review required."}
                </p>
            </div>

            <div className="space-y-3 mt-4 border-t border-emerald-50 pt-6">
                <div className="flex justify-between text-xs font-medium text-emerald-900">
                    <span className="opacity-50">Identity Match</span>
                    <span className="font-bold">100%</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-emerald-900">
                    <span className="opacity-50">Doc Authenticity</span>
                    <span className="font-bold">98%</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-emerald-900">
                    <span className="opacity-50">Liveness Confidence</span>
                    <span className="font-bold text-[#008751]">99.9%</span>
                </div>
            </div>

            <button
                onClick={() => onFinalize?.()}
                className="w-full mt-8 py-4 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Complete KYC Verification
            </button>
        </div>
    );
};

export default RiskScore;
