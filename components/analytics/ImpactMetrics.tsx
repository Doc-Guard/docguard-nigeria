
import React from 'react';
import { BarChart3 } from 'lucide-react';

const ImpactMetrics: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-[#0a2e1f] to-[#008751] rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/40">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-8 tracking-tight">Macro Commercial Impact</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { val: '₦1.2B', label: 'Lender Risk Mitigated' },
                        { val: '83%', label: 'Cycle Cost Reduction' },
                        { val: '2.4k', label: 'Human Hours Saved' },
                        { val: '0.00', label: 'Filing Penalties' }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col">
                            <p className="text-5xl font-black tracking-tighter mb-2">{stat.val}</p>
                            <p className="text-[10px] text-emerald-300 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className="w-8 h-1 bg-emerald-400 mt-4 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
            <BarChart3 className="absolute -bottom-16 -right-16 text-emerald-950 opacity-20 transform -rotate-12" size={340} />
        </div>
    );
};

export default ImpactMetrics;
