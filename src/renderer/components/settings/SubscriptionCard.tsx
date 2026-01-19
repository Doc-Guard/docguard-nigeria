
import React from 'react';
import { Leaf, Check } from 'lucide-react';

const SubscriptionCard: React.FC = () => {
    return (
        <section className="bg-[#0a2e1f] p-8 rounded-[32px] text-white overflow-hidden relative group">
            <Leaf size={180} className="absolute -bottom-10 -right-10 text-emerald-900/40 group-hover:scale-110 transition-transform pointer-events-none" />
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/40">
                        <Check size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Subscription Plan</h3>
                        <p className="text-xs text-emerald-400 font-medium">DocGuard Enterprise Tier</p>
                    </div>
                </div>
                <p className="text-sm text-emerald-100/70 font-medium leading-relaxed max-w-md">
                    Your institution is currently on the Enterprise Tier. You have unlimited LMA document generation and 100 free CAC RPA filings per month.
                </p>
                <button className="px-6 py-3 bg-white text-emerald-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                    Upgrade Plan
                </button>
            </div>
        </section>
    );
};

export default SubscriptionCard;
