
import React, { useState } from 'react';
import {
    Sparkles,
    MessageSquare,
    CheckCircle,
    ShieldAlert,
    AlertTriangle,
    Wand2,
    RefreshCw
} from 'lucide-react';
import { AnalysisResult, analyzeClause, rewriteClause } from '../../services/geminiService';
import { useToast } from '../common/Toast';

interface AnalysisPanelProps {
    clauseText: string;
    activeTemplate: string;
    onUpdateClause: (text: string) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ clauseText, activeTemplate, onUpdateClause }) => {
    const { showToast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewriteInstruction, setRewriteInstruction] = useState('');
    const [showRewriteInput, setShowRewriteInput] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeClause(clauseText, `Facility Agreement - ${activeTemplate}`);
            setAnalysis(result);
        } catch (err: any) {
            console.error(err);
            showToast(`AI analysis failed: ${err.message}`, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRewrite = async () => {
        if (!rewriteInstruction) return;
        setIsRewriting(true);
        try {
            const newText = await rewriteClause(clauseText, rewriteInstruction);
            onUpdateClause(newText);
            setShowRewriteInput(false);
            setRewriteInstruction('');
            // Invalidate analysis since text changed
            setAnalysis(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-[#008751] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-400" />
                    <span className="font-black text-xs uppercase tracking-widest">Redline AI Analyzer</span>
                </div>
                {analysis && (
                    <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-black tracking-widest">
                        {analysis.score}% SAFETY
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {!analysis && !isAnalyzing ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare size={32} />
                        </div>
                        <p className="text-sm font-bold text-emerald-900/60 mb-6 text-center">Analyze this clause against Nigeria's latest legal frameworks.</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleAnalyze}
                                className="w-full py-3.5 bg-emerald-50 text-[#008751] font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-[#008751] hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                Run Redline Scan
                            </button>
                            <button
                                onClick={() => setShowRewriteInput(!showRewriteInput)}
                                className="w-full py-3.5 bg-purple-50 text-purple-600 font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Wand2 size={14} /> AI Magic Rewrite
                            </button>
                        </div>

                        {showRewriteInput && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-xl animate-in slide-in-from-top-2">
                                <textarea
                                    className="w-full bg-white p-3 rounded-lg text-xs border border-purple-100 outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                                    placeholder="e.g. Make it more favorable to the Lender..."
                                    rows={3}
                                    value={rewriteInstruction}
                                    onChange={(e) => setRewriteInstruction(e.target.value)}
                                />
                                <button
                                    onClick={handleRewrite}
                                    disabled={isRewriting}
                                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-purple-700 transition"
                                >
                                    {isRewriting ? <RefreshCw className="animate-spin mx-auto" size={14} /> : "Apply Rewrite"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : isAnalyzing ? (
                    <div className="space-y-6 py-12">
                        <div className="flex justify-center relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-[#008751]"></div>
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#008751] animate-pulse" size={16} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-center text-[10px] font-black text-emerald-900/40 uppercase tracking-widest animate-pulse">Scanning CAMA 2020 v2</p>
                            <p className="text-center text-[10px] font-black text-emerald-900/40 uppercase tracking-widest animate-pulse delay-75">Checking CBN Circulars</p>
                        </div>
                    </div>
                ) : analysis ? (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-400">
                        <div className={`p-5 rounded-2xl flex items-start gap-4 ${analysis.isCompliant ? 'bg-emerald-50/50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'}`}>
                            <div className={`p-2 rounded-xl ${analysis.isCompliant ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {analysis.isCompliant ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                            </div>
                            <div>
                                <p className="font-black text-xs uppercase tracking-widest mb-1">{analysis.isCompliant ? 'Compliant' : 'Risk Detected'}</p>
                                <p className="text-[10px] font-bold opacity-70 leading-relaxed uppercase">{analysis.legalReference}</p>
                            </div>
                        </div>

                        {analysis.flags.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest border-l-2 border-emerald-200 pl-3">Critical Flags</p>
                                <div className="space-y-2.5">
                                    {analysis.flags.map((f, i) => (
                                        <div key={i} className="flex gap-3 text-xs font-bold text-emerald-950 leading-tight">
                                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.suggestions.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest border-l-2 border-emerald-200 pl-3">Suggested Language</p>
                                <div className="space-y-2.5">
                                    {analysis.suggestions.map((s, i) => (
                                        <div key={i} className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl text-xs text-emerald-900 font-mono italic leading-relaxed">
                                            "{s}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            className="w-full py-3 text-[#008751] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all"
                        >
                            Refresh Analysis
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AnalysisPanel;
