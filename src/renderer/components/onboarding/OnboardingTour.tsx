import React, { useState } from 'react';
import { ChevronRight, Check, X, Shield, LayoutDashboard, FileText, Database, Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: "Welcome to DocGuard",
            description: "Your comprehensive loan management and compliance automation platform.",
            icon: Shield,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            content: (
                <div className="space-y-4 mt-6">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        DocGuard streamlines your entire lending lifecycle, from origination to legal automation and post-disbursement monitoring.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-emerald-900 text-xs uppercase mb-1">Secure</h4>
                            <p className="text-[10px] text-gray-500">Bank-grade encryption & RLS</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-emerald-900 text-xs uppercase mb-1">Automated</h4>
                            <p className="text-[10px] text-gray-500">RPA for CAC & KYC checks</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Navigation Guide",
            description: "Everything you need is accessible from the sidebar.",
            icon: LayoutDashboard,
            color: "text-blue-600",
            bg: "bg-blue-50",
            content: (
                <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-emerald-100 p-2 rounded-lg"><FileText size={16} className="text-emerald-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs">Loan Origination</h4>
                            <p className="text-[10px] text-gray-500">Create loans and track pipeline stages</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-purple-100 p-2 rounded-lg"><Lock size={16} className="text-purple-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs">KYC Orchestrator</h4>
                            <p className="text-[10px] text-gray-500">Verify BVN, TIN, and RC Numbers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-amber-100 p-2 rounded-lg"><Database size={16} className="text-amber-600" /></div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs">CAC Registry</h4>
                            <p className="text-[10px] text-gray-500">Automated charge registration filing</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Let's Get Started",
            description: "Set up your profile to enable document signing.",
            icon: Check,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            content: (
                <div className="text-center mt-8">
                    <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4 animate-bounce">
                        <Shield size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-6 px-4">
                        Please verify your profile settings and upload your e-signature to start generating automated legal documents.
                    </p>
                </div>
            )
        }
    ];

    const currentSlide = slides[step];
    const Icon = currentSlide.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full flex">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-full flex-1 transition-all duration-500 ${i <= step ? 'bg-emerald-500' : 'bg-transparent'}`}
                        />
                    ))}
                </div>

                {/* Close (Skip) */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* Header Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${currentSlide.bg} flex items-center justify-center mb-6 shadow-sm`}>
                        <Icon size={28} className={currentSlide.color} />
                    </div>

                    {/* Title & Desc */}
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{currentSlide.title}</h2>
                    <p className="text-gray-500 font-medium">{currentSlide.description}</p>

                    {/* Content */}
                    <div className="min-h-[180px]">
                        {currentSlide.content}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                        <div className="flex gap-2">
                            {/* Dots */}
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-emerald-500 w-6' : 'bg-gray-200'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (step < slides.length - 1) {
                                    setStep(s => s + 1);
                                } else {
                                    onComplete();
                                }
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95"
                        >
                            {step === slides.length - 1 ? (
                                <>Get Started <Check size={18} /></>
                            ) : (
                                <>Next <ChevronRight size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
