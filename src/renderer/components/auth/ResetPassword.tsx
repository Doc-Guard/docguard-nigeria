
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, ShieldCheck, Gavel } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Sign out to prevent auto-login
            await supabase.auth.signOut();
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a2e1f] p-6 relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-800/20 rounded-full blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-950/40 rounded-full blur-[100px] -z-0"></div>

                <div className="w-full max-w-lg relative z-10">
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-emerald-900/10">
                        <div className="p-10 md:p-14 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-[#008751]" />
                            </div>
                            <h1 className="text-2xl font-black text-emerald-950 tracking-tight mb-4">Password Updated!</h1>
                            <p className="text-emerald-900/60 font-medium mb-8">
                                Your password has been successfully reset.
                                <br />
                                You can now close this tab and return to the app, or proceed to login.
                            </p>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                Proceed to Login
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a2e1f] p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-800/20 rounded-full blur-[120px] -z-0"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-950/40 rounded-full blur-[100px] -z-0"></div>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-emerald-900/10">
                    <div className="p-10 md:p-14">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-[#008751] rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/20 mb-6 transform hover:rotate-6 transition-transform cursor-pointer">
                                <Lock size={32} className="text-white fill-current" />
                            </div>
                            <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Set New Password</h1>
                            <p className="text-emerald-600/60 font-medium text-center mt-2 max-w-xs">Secure your account with a new, strong password.</p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.2em] ml-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/40" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-950 focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-emerald-900/20 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/40" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-950 focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-emerald-900/20 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        Update Password
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-emerald-50/50 p-8 border-t border-emerald-100 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-[#008751]" size={16} />
                            <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest leading-none mt-0.5">SECURE</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                        <div className="flex items-center gap-2">
                            <Gavel className="text-[#008751]" size={16} />
                            <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest leading-none mt-0.5">PROTECTED</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    DocGuard Nigeria v1.0.0
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
