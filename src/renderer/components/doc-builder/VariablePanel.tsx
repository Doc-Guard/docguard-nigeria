import React, { useState, useEffect } from 'react';
import { Sliders, Check, Wand2 } from 'lucide-react';
import Mustache from 'mustache';

interface VariablePanelProps {
    content: string;
    onUpdate: (newContent: string) => void;
    loanContext?: any;
}

/**
 * VariablePanel Component
 * Automatically detects and manages document variables using Mustache syntax.
 * Supports auto-filling from active loan context.
 */
const VariablePanel: React.FC<VariablePanelProps> = ({ content, onUpdate, loanContext }) => {
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [foundVars, setFoundVars] = useState<string[]>([]);

    // Regex for discovering variables in Mustache format: {{VariableName}}
    const VAR_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

    /**
     * Effect Hook: Scans content for variables and initializes form state.
     * Maps available loan context to detected variables automatically.
     */
    useEffect(() => {
        const matches = [...content.matchAll(VAR_REGEX)];
        const uniqueVars = Array.from(new Set(matches.map(m => m[1])));

        if (JSON.stringify(uniqueVars) !== JSON.stringify(foundVars)) {
            setFoundVars(uniqueVars);
            setVariables(prev => {
                const next = { ...prev };
                uniqueVars.forEach(v => {
                    if (next[v] === undefined) {
                        next[v] = '';
                        // Smart mapping from Loan Context
                        if (loanContext) {
                            if (v === 'Borrower_Name') next[v] = loanContext.borrower_name || '';
                            if (v === 'Loan_Amount') next[v] = loanContext.amount?.toLocaleString() || '';
                            if (v === 'Currency') next[v] = loanContext.currency || '';
                            if (v === 'Interest_Rate') next[v] = loanContext.interest_rate ? `${loanContext.interest_rate}%` : '';
                            if (v === 'RC_Number') next[v] = loanContext.rc_number || '';
                            if (v === 'TIN') next[v] = loanContext.tin || '';
                        }
                    }
                });
                return next;
            });
        }
    }, [content, loanContext]);

    const handleChange = (key: string, val: string) => {
        setVariables(prev => ({ ...prev, [key]: val }));
    };

    /**
     * Renders the template using Mustache.
     * Preserves unfilled variables to allow partial application.
     */
    const applyVariables = () => {
        const view: Record<string, string> = {};

        Object.keys(variables).forEach(key => {
            const val = variables[key];
            // If value is empty, preserve the tag for future application
            view[key] = val || `{{${key}}}`;
        });

        try {
            // Temporarily disable HTML escaping since we are editing text/markdown
            const originalEscape = Mustache.escape;
            Mustache.escape = (text) => text;

            const newContent = Mustache.render(content, view);

            Mustache.escape = originalEscape;
            onUpdate(newContent);
        } catch (err) {
            console.error("Mustache Rendering Failed:", err);
        }
    };

    /**
     * Forces a re-sync of variables from the loan context.
     */
    const autoFill = () => {
        if (!loanContext) return;
        setVariables(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(v => {
                if (v === 'Borrower_Name') next[v] = loanContext.borrower_name || '';
                if (v === 'Loan_Amount') next[v] = loanContext.amount?.toLocaleString() || '';
                if (v === 'Currency') next[v] = loanContext.currency || '';
                if (v === 'Interest_Rate') next[v] = loanContext.interest_rate ? `${loanContext.interest_rate}%` : '';
                if (v === 'RC_Number') next[v] = loanContext.rc_number || '';
                if (v === 'TIN') next[v] = loanContext.tin || '';
            });
            return next;
        });
    };

    if (foundVars.length === 0) return null;

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden mb-6 animate-in slide-in-from-right-4">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sliders size={14} />
                    Smart Variables
                </div>
                {loanContext && (
                    <button
                        onClick={autoFill}
                        className="text-xs text-[#008751] hover:underline flex items-center gap-1"
                    >
                        <Wand2 size={10} /> Auto-Fill
                    </button>
                )}
            </div>
            <div className="p-4 space-y-4">
                {foundVars.map(v => (
                    <div key={v}>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5">{v.replace(/_/g, ' ')}</label>
                        <input
                            type="text"
                            value={variables[v] || ''}
                            onChange={(e) => handleChange(v, e.target.value)}
                            className="w-full bg-emerald-50/30 border border-emerald-100/50 rounded-lg p-2 text-xs font-medium text-emerald-950 focus:ring-1 focus:ring-[#008751] outline-none"
                            placeholder={`Enter ${v.replace(/_/g, ' ')}...`}
                        />
                    </div>
                ))}
                <button
                    onClick={applyVariables}
                    className="w-full py-2 bg-[#008751] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Check size={14} /> Apply All
                </button>
            </div>
        </div>
    );
};

export default VariablePanel;