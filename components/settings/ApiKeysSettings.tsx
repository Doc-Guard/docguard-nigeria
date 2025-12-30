
import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Loader2, Check } from 'lucide-react';

const ApiKeysSettings: React.FC = () => {
    const [showKey, setShowKey] = useState(false);
    const [geminiKey, setGeminiKey] = useState('');
    const [cacAgentId, setCacAgentId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadSecrets = async () => {
            if (window.electron) { // Check if in Electron env
                try {
                    const gKey = await window.electron.getSecret('GEMINI_API_KEY');
                    if (gKey.success && gKey.value) setGeminiKey(gKey.value as string);

                    const cKey = await window.electron.getSecret('CAC_AGENT_ID');
                    if (cKey.success && cKey.value) setCacAgentId(cKey.value as string);

                } catch (e) {
                    console.error("Failed to load secrets", e);
                }
            }
            setIsLoading(false);
        };
        loadSecrets();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);

        if (!window.electron) {
            setMsg({ type: 'error', text: 'Secure storage is only available in the Desktop App.' });
            setIsSaving(false);
            return;
        }

        try {
            await window.electron.setSecret('GEMINI_API_KEY', geminiKey);
            await window.electron.setSecret('CAC_AGENT_ID', cacAgentId);
            setMsg({ type: 'success', text: 'Secrets encrypted and saved locally.' });
        } catch (e: any) {
            setMsg({ type: 'error', text: 'Failed to save secrets: ' + e.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin text-emerald-500" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">API Secrets</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Manage third-party integration keys.</p>
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {msg.type === 'success' && <Check size={14} />}
                        {msg.text}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Google Gemini AI Key
                            <span className="bg-emerald-100 text-[#008751] px-1.5 py-0.5 rounded text-[9px]">REQUIRED</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? "text" : "password"}
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full pl-4 pr-12 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-mono text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900/30 hover:text-[#008751] transition-colors"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Used for Compliance Logic and Risk Analysis.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">
                            CAC Portal Agent ID
                        </label>
                        <input
                            type="text"
                            value={cacAgentId}
                            onChange={(e) => setCacAgentId(e.target.value)}
                            placeholder="AGT-..."
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-mono text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? 'Encrypting...' : 'Save Secrets'}
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-xs font-medium leading-relaxed">
                <strong>Safety Note:</strong> Keys are saved locally on your device using Electron Store. Do not export your config file.
            </div>
        </div>
    );
};

export default ApiKeysSettings;
