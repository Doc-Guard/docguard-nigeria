
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Ensure you have been registered on the backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.2em] ml-2">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/40" size={20} />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-950 focus:ring-4 focus:ring-[#008751]/10 focus:border-[#008751] outline-none transition-all placeholder:text-emerald-900/20 font-medium"
                        placeholder="name@bank.com.ng"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-[0.2em]">Password</label>
                    <button type="button" className="text-[10px] font-black text-[#008751] uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
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

            <button
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Authenticating...
                    </>
                ) : (
                    <>
                        Access Portal
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
