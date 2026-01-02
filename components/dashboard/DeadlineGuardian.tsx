
import React from 'react';
import { FileSearch, Zap, Loader2, AlertCircle } from 'lucide-react';

interface RiskAnalysis {
    summary: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface DeadlineItem {
    id: string;
    days: number;
    entity: string;
    task: string;
}

interface DeadlineGuardianProps {
    riskAnalysis: RiskAnalysis | null;
    isAnalyzing: boolean;
    onRunAnalysis: () => void;
    deadlines: DeadlineItem[];
    isLoading?: boolean;
}

const DeadlineGuardian: React.FC<DeadlineGuardianProps> = ({
    riskAnalysis,
    isAnalyzing,
    onRunAnalysis,
    deadlines,
    isLoading
}) => {


    const getEscalationStatus = (daysRemaining: number) => {
        // Project Plan: Alerts at Day 60 (30 left), Day 75 (15 left), Day 85 (5 left)
        if (daysRemaining <= 5) return { color: 'rose', val: 100, label: 'CRITICAL (Day 85+)' };
        if (daysRemaining <= 15) return { color: 'amber', val: 85, label: 'URGENT (Day 75+)' };
        if (daysRemaining <= 30) return { color: 'yellow', val: 65, label: 'WARNING (Day 60+)' };
        return { color: 'emerald', val: 30, label: 'ON TRACK' };
    };

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

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-emerald-400" size={24} />
                    </div>
                ) : deadlines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-white/40">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="text-xs font-medium">No active deadlines found.</p>
                    </div>
                ) : (
                    deadlines.slice(0, 3).map((item) => {
                        const { color, val, label } = getEscalationStatus(item.days);
                        const isSovereignRisk = item.entity.toLowerCase().includes('state') || item.entity.toLowerCase().includes('federal');

                        // Map dynamic colors
                        const textColor = color === 'rose' ? 'text-rose-400' : color === 'amber' ? 'text-amber-400' : color === 'yellow' ? 'text-yellow-400' : 'text-emerald-400';
                        const badgeBg = color === 'rose' ? 'bg-rose-500/20' : color === 'amber' ? 'bg-amber-500/20' : color === 'yellow' ? 'bg-yellow-500/20' : 'bg-emerald-500/20';
                        const badgeText = color === 'rose' ? 'text-rose-300' : color === 'amber' ? 'text-amber-300' : color === 'yellow' ? 'text-yellow-300' : 'text-emerald-300';
                        const progressColor = color === 'yellow' ? 'bg-yellow-400' : color === 'rose' ? 'bg-rose-500' : color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';

                        return (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-lg relative`}>
                                    <span className={textColor}>{item.days < 10 ? `0${item.days}` : item.days}</span>
                                    <span className="text-[8px] uppercase text-white/40 tracking-[0.2em]">Days</span>
                                    {isSovereignRisk && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white/20 animate-pulse" title="Sovereign Immunity Risk"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold text-white tracking-tight">{item.entity}</p>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${badgeBg} ${badgeText}`}>
                                            {label}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">{item.task}</p>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${progressColor}`}
                                            style={{
                                                width: `${val}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
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
