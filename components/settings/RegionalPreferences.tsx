
import React from 'react';
import { Globe } from 'lucide-react';

const RegionalPreferences: React.FC = () => {
    return (
        <section className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                    <Globe size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-emerald-950 tracking-tight">Regional Preferences</h3>
                    <p className="text-xs text-emerald-600/50 font-medium">Compliance jurisdiction and tax settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Default Jurisdiction</label>
                    <select className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all">
                        <option>Nigeria (LMA Standards)</option>
                        <option>Ghana (LMA Africa)</option>
                        <option>Kenya (LMA East Africa)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Tax Engine Year</label>
                    <input type="number" defaultValue={2024} className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                </div>
            </div>

            <div className="pt-6 border-t border-emerald-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black text-emerald-950">Auto-Perfection (CAC)</h4>
                        <p className="text-xs text-emerald-600/60 font-medium">Enable RPA robot to automatically initiate filing upon execution.</p>
                    </div>
                    <div className="w-12 h-6 bg-[#008751] rounded-full relative p-1 cursor-pointer">
                        <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegionalPreferences;
