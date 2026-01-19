
import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    BookOpen,
    CheckSquare,
    FileCheck,
    Shield,
    AlertTriangle,
    Lock,
    FileText,
    Sparkles,
    Scale
} from 'lucide-react';
import { LMATemplate, LMASection, LMAClause } from '../../lib/lmaTemplates';

interface ClauseLibraryProps {
    activeTemplate: LMATemplate;
    onSelectTemplate: (template: LMATemplate) => void;
    templates: LMATemplate[];
    onSelectClause: (clause: LMAClause) => void;
    selectedClauseId?: string;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
    'BookOpen': <BookOpen size={14} />,
    'CheckSquare': <CheckSquare size={14} />,
    'FileCheck': <FileCheck size={14} />,
    'Shield': <Shield size={14} />,
    'AlertTriangle': <AlertTriangle size={14} />,
    'Lock': <Lock size={14} />,
    'FileText': <FileText size={14} />
};

const ClauseLibrary: React.FC<ClauseLibraryProps> = ({
    activeTemplate,
    onSelectTemplate,
    templates,
    onSelectClause,
    selectedClauseId
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['definitions']));

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const getNigerianClauseCount = (section: LMASection) => {
        return section.clauses.filter(c => c.category === 'nigerian_adapted').length;
    };

    return (
        <div className="space-y-4">
            {/* Template Selector */}
            <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                    <Scale size={14} />
                    LMA Template
                </div>
                <div className="p-4">
                    <select
                        className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-3 text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-[#008751] outline-none transition-all cursor-pointer"
                        value={activeTemplate.id}
                        onChange={(e) => {
                            const template = templates.find(t => t.id === e.target.value);
                            if (template) onSelectTemplate(template);
                        }}
                    >
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-emerald-600/60 mt-2 leading-relaxed">
                        {activeTemplate.description}
                    </p>
                </div>
            </div>

            {/* Section Navigator */}
            <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                    <BookOpen size={14} />
                    LMA Sections
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {activeTemplate.sections.map((section) => (
                        <div key={section.id} className="border-b border-emerald-50 last:border-b-0">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-emerald-50/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-[#008751]">
                                        {SECTION_ICONS[section.icon] || <FileText size={14} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-emerald-950">{section.name}</p>
                                        <p className="text-[10px] text-emerald-600/50">{section.clauses.length} clauses</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getNigerianClauseCount(section) > 0 && (
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full flex items-center gap-1">
                                            <Sparkles size={10} />
                                            {getNigerianClauseCount(section)} NG
                                        </span>
                                    )}
                                    {expandedSections.has(section.id) ? (
                                        <ChevronDown size={16} className="text-emerald-400" />
                                    ) : (
                                        <ChevronRight size={16} className="text-emerald-400" />
                                    )}
                                </div>
                            </button>

                            {/* Section Clauses */}
                            {expandedSections.has(section.id) && (
                                <div className="bg-emerald-50/20 px-4 pb-3 space-y-1">
                                    {section.clauses.map((clause) => (
                                        <button
                                            key={clause.id}
                                            onClick={() => onSelectClause(clause)}
                                            className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-2 group ${selectedClauseId === clause.id
                                                    ? 'bg-[#008751] text-white shadow-lg'
                                                    : 'text-emerald-900/70 hover:bg-white hover:shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedClauseId === clause.id
                                                    ? 'bg-white'
                                                    : clause.category === 'nigerian_adapted'
                                                        ? 'bg-amber-400'
                                                        : 'bg-emerald-300'
                                                }`} />
                                            <span className="flex-1 truncate font-medium">{clause.name}</span>
                                            {clause.category === 'nigerian_adapted' && selectedClauseId !== clause.id && (
                                                <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-bold uppercase">
                                                    NG
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="px-3 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-4 text-[9px] text-emerald-600/60">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-300" />
                        <span>Standard LMA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Nigerian Adapted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClauseLibrary;
