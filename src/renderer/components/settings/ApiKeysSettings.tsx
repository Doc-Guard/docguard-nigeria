import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Loader2, Check, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * ApiKeysSettings Component
 * Manages third-party API keys and integration secrets.
 * Keys are stored securely using Electron's safeStorage via IPC.
 */
const ApiKeysSettings: React.FC = () => {
    const [showKey, setShowKey] = useState(false);
    const [geminiKey, setGeminiKey] = useState('');
    const [cacAgentId, setCacAgentId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load initial secrets on mount
    useEffect(() => {
        const loadSecrets = async () => {
            if (window.electron) {
                try {
                    const gKey = await window.electron.getSecret('GEMINI_API_KEY');
                    if (gKey.success && gKey.value) setGeminiKey(gKey.value as string);

                    const cKey = await window.electron.getSecret('CAC_AGENT_ID');
                    if (cKey.success && cKey.value) setCacAgentId(cKey.value as string);
                } catch (e) {
                    console.error("Failed to load secrets:", e);
                }
            }
            setIsLoading(false);
        };
        loadSecrets();
    }, []);

    /**
     * Validates the provided Gemini API key by attempting a lightweight generation request.
     */
    const handleValidate = async () => {
        if (!geminiKey) {
            setMsg({ type: 'error', text: 'Please enter a Gemini API Key first.' });
            return;
        }
        setIsValidating(true);
        setMsg(null);
        try {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            // Using ai.models directly to match project SDK pattern
            // @ts-ignore
            await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: "Test connection"
            });
            setMsg({ type: 'success', text: 'Valid API Key! Connection successful.' });
        } catch (e: any) {
            console.error("API Key Validation Failed:", e);
            setMsg({ type: 'error', text: 'Validation failed: ' + (e.message || 'Unknown error') });
        } finally {
            setIsValidating(false);
        }
    };

    /**
     * Persists the API keys to secure local storage.
     */
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
                    {/* Google Gemini AI Configuration */}
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
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Used for Compliance Logic and Risk Analysis.</p>
                            <button
                                onClick={handleValidate}
                                disabled={isValidating || !geminiKey}
                                className="text-[10px] font-bold text-[#008751] hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                            >
                                {isValidating ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                {isValidating ? 'Testing...' : 'Test Connection'}
                            </button>
                        </div>
                    </div>

                    {/* CAC Agent Configuration */}
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

            <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium leading-relaxed">
                <strong>🔒 Security:</strong> API keys are encrypted using OS-level security (DPAPI on Windows, Keychain on macOS, Keyring on Linux) and stored locally on your device. Never share your config files.
            </div>
        </div>
    );
};

export default ApiKeysSettings;