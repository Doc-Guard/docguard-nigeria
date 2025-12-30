
import React from 'react';
import { ExternalLink, Camera, Globe } from 'lucide-react';

const PayloadSidebar: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 bg-emerald-50/50 border-b border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40">
                    Active Filing Payload
                </div>
                <div className="p-6 space-y-6">
                    {[
                        { label: 'Target Entity', val: 'Dangote Refinery Ltd' },
                        { label: 'Security Value', val: '$50,000,000.00' },
                        { label: 'Form Type', val: 'CAC Form 8 (Particulars)' }
                    ].map(item => (
                        <div key={item.label}>
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">{item.label}</label>
                            <p className="text-sm font-bold text-emerald-950">{item.val}</p>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-emerald-50 flex flex-col gap-3">
                        <button
                            onClick={() => window.electron?.openExternal('https://search.cac.gov.ng')}
                            className="flex items-center justify-between w-full text-[10px] font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-2 rounded-lg"
                        >
                            <span>Stamped Deed</span>
                            <ExternalLink size={14} />
                        </button>
                        <button
                            onClick={() => window.electron?.openExternal('https://dashboard.guaranty.ng')}
                            className="flex items-center justify-between w-full text-[10px] font-black text-[#008751] uppercase tracking-widest hover:text-emerald-800 transition-colors bg-emerald-50 px-3 py-2 rounded-lg"
                        >
                            <span>Board Resolution</span>
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-950 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,135,81,0.2),transparent)]"></div>
                <h4 className="font-black text-emerald-400 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                    <Camera size={16} />
                    Screenshot Hub
                </h4>
                <p className="text-xs text-emerald-100/60 mb-6 leading-relaxed relative z-10 font-medium">
                    Real-time audit captures of every interaction with the CAC portal for compliance verification.
                </p>
                <div className="bg-white/5 h-40 rounded-xl border border-white/10 flex items-center justify-center text-emerald-800 relative z-10 group-hover:border-[#008751]/30 transition-all">
                    <Globe size={48} className="opacity-20 animate-pulse" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100">
                <h4 className="text-emerald-950 font-black text-xs uppercase tracking-widest mb-6">Network Health</h4>
                <div className="space-y-4">
                    {[
                        { label: 'CAC Portal', val: '240ms', color: 'emerald' },
                        { label: 'NCR API', val: 'Operational', color: 'emerald' },
                        { label: 'Daily Cap', val: '12 / 100', color: 'slate' }
                    ].map(item => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-emerald-900/40 uppercase tracking-widest">{item.label}</span>
                            <span className={`text-[11px] font-black text-${item.color}-600 uppercase`}>{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PayloadSidebar;
