
import React from 'react';
import { Database, Server, RefreshCw, CheckCircle2 } from 'lucide-react';

const DatabaseSettings: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">Database Connection</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Supabase configuration status.</p>
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Server size={24} className="text-[#008751]" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-emerald-950">docguard-prod-ng</h4>
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#008751] bg-[#008751]/10 px-2 py-1 rounded-md">
                                <CheckCircle2 size={12} /> Connected
                            </span>
                        </div>
                        <p className="text-xs text-emerald-900/60 font-mono">Region: aws-eu-west-1 (Ireland)</p>
                        <p className="text-xs text-emerald-900/60 font-mono mt-0.5">Pool Mode: Transaction</p>
                    </div>
                </div>

                <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Supabase URL</label>
                        <input type="text" readOnly value="https://xyz.supabase.co" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono text-slate-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Anon Key (Public)</label>
                        <input type="password" readOnly value="**************" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono text-slate-500 outline-none" />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-emerald-50 flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm">
                        <RefreshCw size={16} /> Test Connection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSettings;
