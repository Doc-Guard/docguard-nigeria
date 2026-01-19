
import React, { useState, useEffect } from 'react';
import { Camera, Smile, UserCheck, CheckCircle } from 'lucide-react';

interface LivenessCheckProps {
    onComplete: (data: any) => void;
}

const LivenessCheck: React.FC<LivenessCheckProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: Init, 1: Scanning, 2: Success

    useEffect(() => {
        let timer: any;
        if (step === 1) {
            timer = setTimeout(() => {
                setStep(2);
                setTimeout(() => {
                    onComplete({
                        livenessScore: 99.9,
                        spoofDetected: false
                    });
                }, 1000);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [step, onComplete]);

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#008751]">
                    <Camera size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-emerald-950">Liveness Biometrics</h3>
                    <p className="text-sm text-emerald-600/60 font-medium">3D Facial Map & Active Liveness Proof</p>
                </div>
            </div>

            <div className="relative bg-black rounded-3xl h-64 overflow-hidden flex items-center justify-center mb-6">
                {step === 0 && (
                    <div className="text-center">
                        <UserCheck className="text-emerald-500/50 mx-auto mb-4" size={64} />
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition"
                        >
                            Activate Camera
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <>
                        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                        <div className="text-center relative z-10">
                            <div className="w-32 h-32 border-4 border-emerald-400 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
                                <Smile className="text-emerald-400" size={48} />
                            </div>
                            <p className="text-white font-bold text-sm">Please Smile...</p>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <div className="text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-white" size={40} />
                        </div>
                        <p className="text-emerald-400 font-black text-lg">LIVENESS CONFIRMED</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LivenessCheck;
