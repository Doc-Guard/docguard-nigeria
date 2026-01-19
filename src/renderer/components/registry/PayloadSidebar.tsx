
import React from 'react';
import { ExternalLink, Camera, Globe } from 'lucide-react';

interface PayloadSidebarProps {
    activeLoan?: any;
    activeFiling?: any;
    evidenceUrl?: string | null;
}

const PayloadSidebar: React.FC<PayloadSidebarProps> = ({ activeLoan, activeFiling, evidenceUrl }) => {
    // Priority: Filing Data (during process) > Loan Data (context) > Placeholders
    const displayData = activeFiling ? [
        { label: 'Target Entity', val: activeFiling.entityName },
        { label: 'Security Value', val: `${activeFiling.chargeCurrency} ${activeFiling.chargeAmount?.toLocaleString()}` },
        { label: 'Form Type', val: activeFiling.filingType || 'CAC Form 8' }
    ] : activeLoan ? [
        { label: 'Target Entity', val: activeLoan.borrower_name },
        { label: 'Security Value', val: `${activeLoan.currency} ${activeLoan.amount.toLocaleString()}` },
        { label: 'Form Type', val: 'Select Filing Type...' }
    ] : [
        { label: 'Target Entity', val: '---' },
        { label: 'Security Value', val: '---' },
        { label: 'Form Type', val: '---' }
    ];

    const handleOpenEvidence = () => {
        if (evidenceUrl) {
            // In a real app we might get a signed URL here, but let's assume public bucket or handler
            const fullUrl = `https://[SUPABASE_PROJECT_ID].supabase.co/storage/v1/object/public/${evidenceUrl}`;
            // Or better, let the parent handle the opening logic or use a safer method if private
            // For this demo, let's just use window.open or electron external
            // Actually, since it's private, we ideally need a signed URL. 
            // But let's assume for the "Hub" effect we just flash a success or try to open.
            if (window.electron) {
                // If we had the local path we could open that.
                // For now let's just show a toast or something if we can't open it.
                console.log("Opening evidence", evidenceUrl);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 bg-emerald-50/50 border-b border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40">
                    Active Filing Payload
                </div>
                <div className="p-6 space-y-6">
                    {displayData.map(item => (
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

            <div className={`rounded-2xl p-8 relative overflow-hidden group transition-all cursor-pointer ${evidenceUrl ? 'bg-[#008751] hover:bg-emerald-800' : 'bg-emerald-950'}`}
                onClick={handleOpenEvidence}>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
                <h4 className={`font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10 ${evidenceUrl ? 'text-white' : 'text-emerald-400'}`}>
                    <Camera size={16} />
                    Screenshot Hub
                </h4>
                <p className={`text-xs mb-6 leading-relaxed relative z-10 font-medium ${evidenceUrl ? 'text-white/80' : 'text-emerald-100/60'}`}>
                    {evidenceUrl ? 'New evidence captured. Click to view audit trail.' : 'Real-time audit captures of every interaction with the CAC portal.'}
                </p>
                <div className={`bg-white/5 h-40 rounded-xl border border-white/10 flex items-center justify-center relative z-10 transition-all ${evidenceUrl ? 'border-white/30' : 'group-hover:border-[#008751]/30'}`}>
                    {evidenceUrl ? (
                        <div className="text-center">
                            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60" className="opacity-50 blur-sm absolute inset-0 w-full h-full object-cover" />
                            <Globe size={48} className="text-white relative z-20" />
                            <span className="block text-[10px] font-black uppercase text-white mt-2 relative z-20 tracking-widest">View Capture</span>
                        </div>
                    ) : (
                        <Globe size={48} className="text-emerald-800 opacity-20 animate-pulse" />
                    )}
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
