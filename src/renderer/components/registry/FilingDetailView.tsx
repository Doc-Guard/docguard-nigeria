import React, { useState, useEffect } from 'react';
import { X, FileText, Clock, CheckCircle, AlertCircle, Download, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../common/Toast';

interface FilingDetails {
    id: string;
    reference_id: string;
    entity_name: string;
    rc_number: string;
    filing_type: string;
    charge_amount: number;
    charge_currency: string;
    asset_description: string;
    status: 'Pending' | 'Submitted' | 'Perfected';
    submission_date: string;
    metadata?: any;
}

interface FilingDetailViewProps {
    filingId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

const FilingDetailView: React.FC<FilingDetailViewProps> = ({ filingId, isOpen, onClose, onRefresh }) => {
    const [filing, setFiling] = useState<FilingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen && filingId) {
            fetchFiling();
        }
    }, [isOpen, filingId]);

    const fetchFiling = async () => {
        if (!filingId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('filings')
                .select('*')
                .eq('id', filingId)
                .single();

            if (error) throw error;
            setFiling(data);
        } catch (err: any) {
            showToast('Failed to load filing details', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Perfected': return 'bg-emerald-100 text-emerald-700';
            case 'Submitted': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Perfected': return <CheckCircle size={20} className="text-emerald-600" />;
            case 'Submitted': return <Clock size={20} className="text-amber-600" />;
            default: return <AlertCircle size={20} className="text-slate-500" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-emerald-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileText size={20} className="text-[#008751]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-emerald-950">Filing Details</h2>
                            <p className="text-xs text-emerald-600/60 font-mono">{filing?.reference_id || filingId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
                        <X size={20} className="text-emerald-700" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                        </div>
                    ) : filing ? (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${getStatusColor(filing.status)}`}>
                                {getStatusIcon(filing.status)}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest">Status</p>
                                    <p className="text-lg font-bold">{filing.status}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBlock label="Entity Name" value={filing.entity_name} />
                                <InfoBlock label="RC Number" value={filing.rc_number} />
                                <InfoBlock label="Filing Type" value={filing.filing_type} />
                                <InfoBlock label="Charge Amount" value={`${filing.charge_currency} ${filing.charge_amount?.toLocaleString() || '—'}`} />
                                <InfoBlock label="Submission Date" value={new Date(filing.submission_date).toLocaleDateString()} />
                                <InfoBlock label="Reference ID" value={filing.reference_id} mono />
                            </div>

                            {/* Asset Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">Asset Description</label>
                                <p className="p-4 bg-emerald-50/50 rounded-xl text-sm text-emerald-900 border border-emerald-100">
                                    {filing.asset_description || 'Not specified'}
                                </p>
                            </div>

                            {/* Actions based on Status */}
                            <div className="pt-4 border-t border-emerald-100 flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        fetchFiling();
                                        onRefresh?.();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                                >
                                    <RefreshCw size={14} /> Refresh Status
                                </button>

                                {filing.status === 'Perfected' && (
                                    <button className="flex items-center gap-2 px-6 py-2 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                                        <Download size={14} /> Download Certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-emerald-600/60 py-10">No filing data found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoBlock: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-emerald-900/50 uppercase tracking-widest">{label}</label>
        <p className={`text-sm font-bold text-emerald-950 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
);

export default FilingDetailView;
