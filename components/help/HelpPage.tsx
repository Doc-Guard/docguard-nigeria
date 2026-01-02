import React from 'react';
import {
    HelpCircle,
    BookOpen,
    FileText,
    ShieldCheck,
    Briefcase,
    UserCheck,
    BarChart3,
    Settings,
    ExternalLink,
    Keyboard,
    Mail,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpPage: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Loan Origination',
            icon: Briefcase,
            color: 'bg-emerald-500',
            items: [
                'Create new loan facilities from the Loan Origination module',
                'Track loan pipeline stages: Review → Approval → Documentation → Disbursement → Active',
                'Link loans to KYC, Documents, and CAC Filings for integrated workflow',
                'Use tracking data (RC Number, TIN, BVN) to pre-fill forms across modules'
            ]
        },
        {
            title: 'KYC Verification',
            icon: UserCheck,
            color: 'bg-purple-500',
            items: [
                'Run identity verification using BVN through NIBSS integration',
                'Verify corporate entities with CAC RC Number lookup',
                'Check TIN status with FIRS integration',
                'Link KYC requests to specific loans for audit trail'
            ]
        },
        {
            title: 'LMA Document Builder',
            icon: FileText,
            color: 'bg-blue-500',
            items: [
                'Generate LMA-compliant loan documents using AI-powered templates',
                'Customize clauses with real-time compliance checking',
                'Export documents as PDF for execution',
                'Link generated documents to loan facilities'
            ]
        },
        {
            title: 'CAC Registry',
            icon: ShieldCheck,
            color: 'bg-amber-500',
            items: [
                'Submit Fixed and Floating Charges to CAC',
                'Track 90-day perfection deadline with Deadline Guardian',
                'View filing status and evidence screenshots',
                'Link filings to loans for complete audit trail'
            ]
        },
        {
            title: 'Analytics Dashboard',
            icon: BarChart3,
            color: 'bg-rose-500',
            items: [
                'View portfolio overview with exposure metrics',
                'Track compliance rates and performance metrics',
                'Analyze impact metrics (hours saved, penalties avoided)',
                'Export analytics data as JSON for reporting'
            ]
        },
        {
            title: 'Settings & Configuration',
            icon: Settings,
            color: 'bg-slate-500',
            items: [
                'Configure API keys for Gemini AI integration',
                'Set CAC Agent ID for registry automation',
                'Manage notification preferences',
                'View system status and connection health'
            ]
        }
    ];

    const shortcuts = [
        { keys: ['Ctrl', 'K'], description: 'Open search' },
        { keys: ['Esc'], description: 'Close modals' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                    <ArrowLeft size={24} className="text-emerald-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight flex items-center gap-3">
                        <HelpCircle className="text-emerald-600" size={32} />
                        Help & Documentation
                    </h1>
                    <p className="text-emerald-600/80 mt-1 font-medium">Learn how to use DocGuard Nigeria effectively.</p>
                </div>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-8 shadow-xl">
                <div className="flex items-start gap-4">
                    <BookOpen size={32} className="flex-shrink-0 mt-1" />
                    <div>
                        <h2 className="text-xl font-bold mb-2">Quick Start Guide</h2>
                        <p className="text-white/90 leading-relaxed">
                            DocGuard Nigeria streamlines loan documentation and compliance for Nigerian banks.
                            Start by <strong>originating a loan</strong>, then follow the guided workflow:
                            <strong> Verify KYC → Build Documents → Register Charges</strong>.
                            The system automatically tracks deadlines and ensures CAMA 2020 compliance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Module Documentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div key={section.title} className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
                                    <Icon size={20} className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-950">{section.title}</h3>
                            </div>
                            <ul className="space-y-2">
                                {section.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-emerald-800 leading-relaxed flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Keyboard size={24} className="text-emerald-600" />
                    <h3 className="text-lg font-bold text-emerald-950">Keyboard Shortcuts</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {shortcuts.map((shortcut, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, kIdx) => (
                                    <kbd key={kIdx} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-mono font-bold rounded-lg border border-emerald-200">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                            <span className="text-sm text-emerald-600">{shortcut.description}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support */}
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Mail size={24} className="text-emerald-600" />
                        <div>
                            <h3 className="font-bold text-emerald-950">Need More Help?</h3>
                            <p className="text-sm text-emerald-600">Contact our support team for assistance</p>
                        </div>
                    </div>
                    <a
                        href="mailto:support@docguard.ng"
                        className="flex items-center gap-2 px-6 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                        Contact Support
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Version Info */}
            <div className="text-center text-xs text-emerald-500 pb-8">
                DocGuard Nigeria v0.9.0 • © 2026 Doc-Guard Team
            </div>
        </div>
    );
};

export default HelpPage;
