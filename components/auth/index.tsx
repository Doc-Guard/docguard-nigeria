
import React from 'react';
import { Leaf, ShieldCheck, Gavel } from 'lucide-react';
import LoginForm from './LoginForm';

const Login: React.FC = () => {
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
                                <ShieldCheck size={32} className="text-white fill-current" />
                            </div>
                            <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Welcome Back</h1>
                            <p className="text-emerald-600/60 font-medium text-center mt-2 max-w-xs">Secure login to Nigeria's leading loan documentation infrastructure.</p>
                        </div>

                        <LoginForm />
                    </div>

                    <div className="bg-emerald-50/50 p-8 border-t border-emerald-100 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-[#008751]" size={16} />
                            <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest leading-none mt-0.5">NDPR COMPLIANT</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                        <div className="flex items-center gap-2">
                            <Gavel className="text-[#008751]" size={16} />
                            <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest leading-none mt-0.5">LMA CERTIFIED</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    DocGuard Nigeria v0.9.0 • Built for Nigerian Banks
                </p>
            </div>
        </div>
    );
};

export default Login;
