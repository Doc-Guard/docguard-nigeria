
import React from 'react';
import { FileSearch, Zap, Loader2 } from 'lucide-react';

interface RiskAnalysis {
    summary: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface DeadlineGuardianProps {
    riskAnalysis: RiskAnalysis | null;
    isAnalyzing: boolean;
    onRunAnalysis: () => void;
}

const DeadlineGuardian: React.FC<DeadlineGuardianProps> = ({ riskAnalysis, isAnalyzing, onRunAnalysis }) => {
    return (
        <div className="bg-[#0a2e1f] text-white rounded-2xl p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileSearch size={120} />
            </div>
            <h2 className="font-extrabold text-xl mb-8 flex items-center gap-3">
                Deadline Guardian
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            </h2>

            <div className="space-y-8 relative z-10">
                {/* AI Risk Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-6 transition-all duration-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-yellow-400" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-100">AI Risk Assessment</span>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                        {riskAnalysis ? riskAnalysis.summary : "System calibrating. Click audit to run analysis..."}
                    </p>
                    {riskAnalysis && (
                        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${riskAnalysis.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/50' : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/50'
                            }`}>
                            {riskAnalysis.severity} Severity
                        </div>
                    )}
                </div>

                {[
                    { days: 5, entity: 'Ibeto Cement', task: 'CAC Charge Registration', color: 'rose', val: 94 },
                    { days: 15, entity: 'Innoson Motors', task: 'STMA Filing (NCR)', color: 'amber', val: 75 },
                    { days: 42, entity: 'MainOne Facility', task: 'Shared Security Deed', color: 'emerald', val: 45 },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-lg`}>
                            <span className={`text-${item.color}-400`}>{item.days < 10 ? `0${item.days}` : item.days}</span>
                            <span className="text-[8px] uppercase text-white/40 tracking-[0.2em]">Days</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-white tracking-tight">{item.entity}</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">{item.task}</p>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div
                                    className={`h-full bg-${item.color}-500 transition-all duration-1000`}
                                    style={{ width: `${item.val}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-10 py-4 bg-[#008751] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Running Compliance Model...
                    </span>
                ) : "Audit All Deadlines"}
            </button>
        </div>
    );
};

export default DeadlineGuardian;
