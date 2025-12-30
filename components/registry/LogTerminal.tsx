
import React, { useRef, useEffect } from 'react';
import { Terminal, Cpu, ShieldCheck } from 'lucide-react';
import { RPAActivity } from '../../types';

interface LogTerminalProps {
    logs: RPAActivity[];
    isBotActive: boolean;
    progress: number;
}

const LogTerminal: React.FC<LogTerminalProps> = ({ logs, isBotActive, progress }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#051a12] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,135,81,0.15)] border border-emerald-900/40 relative">
                <div className="bg-[#0a2e1f] px-6 py-4 flex items-center justify-between border-b border-emerald-900/50">
                    <div className="flex items-center gap-3">
                        <Terminal size={16} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em]">GuardBot Engine v3.2.0-NATIVE</span>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-emerald-900/50"></div>)}
                    </div>
                </div>

                <div className="h-[500px] overflow-y-auto p-8 font-mono text-sm space-y-3 custom-scrollbar-dark selection:bg-emerald-500/30">
                    {logs.length === 0 && !isBotActive && (
                        <div className="h-full flex flex-col items-center justify-center text-emerald-900/30">
                            <Cpu size={64} className="mb-6 opacity-20" />
                            <p className="font-bold tracking-widest uppercase text-xs">Awaiting Command Link...</p>
                        </div>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="animate-in fade-in slide-in-from-left-2 duration-300 flex gap-4">
                            <span className="text-emerald-700/50 shrink-0">[{log.timestamp}]</span>{' '}
                            <span className={`font-black uppercase tracking-tighter shrink-0 ${log.type === 'success' ? 'text-emerald-400' :
                                log.type === 'error' ? 'text-rose-400' :
                                    'text-emerald-500/60'
                                }`}>
                                {log.type}:
                            </span>{' '}
                            <span className="text-emerald-100 font-medium">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>

                {isBotActive && (
                    <div className="px-8 py-5 bg-[#0a2e1f] border-t border-emerald-900/50">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Portal Submission Flow</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">{progress}% COMPLETE</span>
                        </div>
                        <div className="w-full bg-emerald-950 h-2 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <p className="font-black text-emerald-950 text-lg tracking-tight">Perfection Shield ACTIVE</p>
                        <p className="text-sm text-emerald-600/60 font-medium">Automatic 90-day CAMA deadline tracking & early filing warnings.</p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-[#008751] uppercase tracking-[0.2em] hover:underline px-4 py-2 bg-emerald-50 rounded-lg">View Policy</button>
            </div>
        </div>
    );
};

export default LogTerminal;
