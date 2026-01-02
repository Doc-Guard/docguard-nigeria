import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface PipelineStepperProps {
    currentStage: string;
}

const STAGES = ['Review', 'Approval', 'Documentation', 'Disbursement', 'Active'];

const PipelineStepper: React.FC<PipelineStepperProps> = ({ currentStage }) => {
    // Normalize stage for comparison
    const stageIndex = STAGES.findIndex(s => s.toLowerCase() === (currentStage || 'review').toLowerCase());
    const currentIndex = stageIndex === -1 ? 0 : stageIndex;

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full" />
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-700"
                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                        <div key={step} className="flex flex-col items-center gap-2 group cursor-default">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                ${isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200'
                                    : isCurrent
                                        ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg scale-110'
                                        : 'bg-white border-gray-200 text-gray-300'
                                }
                            `}>
                                {isCompleted ? (
                                    <CheckCircle2 size={16} />
                                ) : isCurrent ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                ) : (
                                    <Circle size={10} className="fill-current" />
                                )}
                            </div>
                            <span className={`
                                text-[10px] font-black uppercase tracking-widest transition-colors duration-300 absolute -bottom-6 w-24 text-center
                                ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-emerald-950 scale-105' : 'text-gray-300'}
                            `}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="h-4" /> {/* Spacer for labels */}
        </div>
    );
};

export default PipelineStepper;
