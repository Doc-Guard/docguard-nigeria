import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        {
            icon: PlusCircle,
            label: 'Create Loan',
            description: 'Start new facility',
            route: '/loans?action=create',
            bgColor: 'bg-emerald-500',
            shadowColor: 'shadow-emerald-200/50'
        },
        {
            icon: FileText,
            label: 'Generate Document',
            description: 'LMA templates',
            route: '/doc-builder',
            bgColor: 'bg-blue-500',
            shadowColor: 'shadow-blue-200/50'
        },
        {
            icon: ShieldCheck,
            label: 'File Charge',
            description: 'CAC registry',
            route: '/registry',
            bgColor: 'bg-amber-500',
            shadowColor: 'shadow-amber-200/50'
        },
        {
            icon: UserCheck,
            label: 'Run KYC Check',
            description: 'Verify entities',
            route: '/kyc',
            bgColor: 'bg-purple-500',
            shadowColor: 'shadow-purple-200/50'
        }
    ];

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-emerald-950">Quick Actions</h2>
                <span className="text-xs text-emerald-600/60 font-semibold">One-click workflows</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.route}
                            onClick={() => navigate(action.route)}
                            className="group relative overflow-hidden p-6 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all duration-300 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-lg"
                        >
                            {/* Icon Container - Using solid bg instead of gradient */}
                            <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg ${action.shadowColor}`}>
                                <Icon size={24} className="text-white" />
                            </div>

                            {/* Label */}
                            <h3 className="text-sm font-bold text-emerald-950 mb-1">{action.label}</h3>
                            <p className="text-[10px] text-emerald-600/60 font-medium">{action.description}</p>

                            {/* Hover Arrow */}
                            <ArrowRight
                                size={16}
                                className="absolute top-4 right-4 text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;
