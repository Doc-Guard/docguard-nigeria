import React, { useState } from 'react';
import { X, FileText, DollarSign, Building2, Package } from 'lucide-react';
import { useToast } from '../common/Toast';

interface FilingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FilingFormData) => void;
    linkedLoanId?: string | null;
    linkedDocumentId?: string | null;
    prefillData?: Partial<FilingFormData>;
}

export interface FilingFormData {
    entityName: string;
    rcNumber: string;
    filingType: string;
    chargeAmount: number;
    chargeCurrency: string;
    assetDescription: string;
    loanId?: string | null;
    documentId?: string | null;
}

const FilingForm: React.FC<FilingFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    linkedLoanId,
    linkedDocumentId,
    prefillData
}) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<FilingFormData>({
        entityName: prefillData?.entityName || '',
        rcNumber: prefillData?.rcNumber || '',
        filingType: prefillData?.filingType || 'Fixed and Floating Charge',
        chargeAmount: prefillData?.chargeAmount || 0,
        chargeCurrency: prefillData?.chargeCurrency || 'NGN',
        assetDescription: prefillData?.assetDescription || '',
        loanId: linkedLoanId,
        documentId: linkedDocumentId
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.entityName || !formData.rcNumber) {
            showToast('Entity Name and RC Number are required', 'warning');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    const handleChange = (field: keyof FilingFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-900 to-[#008751] text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={24} />
                        <h2 className="text-xl font-black uppercase tracking-wider">New CAC Charge Filing</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Entity Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900/60 border-b border-emerald-100 pb-2">
                            Entity Information
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-2">
                                <Building2 size={14} className="inline mr-1" />
                                Entity Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.entityName}
                                onChange={(e) => handleChange('entityName', e.target.value)}
                                className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#008751] outline-none"
                                placeholder="e.g., Dangote Cement Plc"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-2">RC Number *</label>
                            <input
                                type="text"
                                required
                                value={formData.rcNumber}
                                onChange={(e) => handleChange('rcNumber', e.target.value)}
                                className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-[#008751] outline-none"
                                placeholder="e.g., RC123456"
                            />
                        </div>
                    </div>

                    {/* Charge Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900/60 border-b border-emerald-100 pb-2">
                            Charge Details
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-2">Filing Type</label>
                            <select
                                value={formData.filingType}
                                onChange={(e) => handleChange('filingType', e.target.value)}
                                className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#008751] outline-none"
                            >
                                <option>Fixed and Floating Charge</option>
                                <option>Fixed Charge Only</option>
                                <option>Debenture</option>
                                <option>Mortgage</option>
                                <option>Legal Charge</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-emerald-900 mb-2">
                                    <DollarSign size={14} className="inline mr-1" />
                                    Charge Amount
                                </label>
                                <input
                                    type="number"
                                    value={formData.chargeAmount}
                                    onChange={(e) => handleChange('chargeAmount', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-[#008751] outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-emerald-900 mb-2">Currency</label>
                                <select
                                    value={formData.chargeCurrency}
                                    onChange={(e) => handleChange('chargeCurrency', e.target.value)}
                                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#008751] outline-none"
                                >
                                    <option>NGN</option>
                                    <option>USD</option>
                                    <option>EUR</option>
                                    <option>GBP</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-2">
                                <Package size={14} className="inline mr-1" />
                                Asset Description
                            </label>
                            <textarea
                                value={formData.assetDescription}
                                onChange={(e) => handleChange('assetDescription', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#008751] outline-none resize-none"
                                placeholder="Describe the secured assets (e.g., All present and future assets, Plant & Machinery, Book Debts, etc.)"
                            />
                        </div>
                    </div>

                    {/* Linked Context */}
                    {(linkedLoanId || linkedDocumentId) && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900/60">Linked Context</h3>
                            {linkedLoanId && (
                                <div className="text-xs font-medium text-emerald-700">
                                    🔗 Loan ID: <span className="font-mono">{linkedLoanId.slice(0, 8)}...</span>
                                </div>
                            )}
                            {linkedDocumentId && (
                                <div className="text-xs font-medium text-emerald-700">
                                    📄 Document ID: <span className="font-mono">{linkedDocumentId.slice(0, 8)}...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-emerald-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-slate-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-[#008751] text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition"
                        >
                            Submit to RPA
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilingForm;
