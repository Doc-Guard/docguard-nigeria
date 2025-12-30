
import React, { useState } from 'react';
import { Lock, Smartphone, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SecuritySettings: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdatePassword = async () => {
        setMsg(null);
        if (password.length < 6) {
            setMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        if (password !== confirmPassword) {
            setMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setMsg({ type: 'success', text: 'Password updated successfully.' });
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">Password & Authentication</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Manage your access credentials.</p>
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 rounded-xl text-xs font-bold mb-6 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Confirm New</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="w-full py-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-emerald-950 tracking-tight">Two-Factor Authentication</h3>
                            <p className="text-xs text-emerald-600/50 font-medium">Secure your account with 2FA.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Disabled</span>
                        <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                            <div className="absolute left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-start gap-4">
                <ShieldAlert className="text-rose-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-rose-700 text-sm">Security Log</h4>
                    <p className="text-xs text-rose-600/70 mt-1">Last login detected from 192.168.1.1 (Lagos, NG) on Chrome 120.</p>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
