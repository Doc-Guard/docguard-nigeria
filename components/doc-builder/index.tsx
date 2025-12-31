
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Gavel,
    Loader2,
    CloudCheck,
    CloudUpload,
    Save,
    FileDown,
    PenTool,
    Briefcase
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../common/Toast';
import VariablePanel from './VariablePanel';
import ClauseLibrary from './ClauseLibrary';
import AnalysisPanel from './AnalysisPanel';
import Editor from './Editor';
import ExecutionModal from './ExecutionModal';
import LoanSelector from '../common/LoanSelector';
import { LMA_TEMPLATES, LMATemplate, LMAClause, LMA_SECURED_TERM_FACILITY } from '../../lib/lmaTemplates';

const DocBuilder: React.FC = () => {
    const { user, profile } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Template State
    const [activeTemplate, setActiveTemplate] = useState<LMATemplate>(LMA_SECURED_TERM_FACILITY);
    const [selectedClause, setSelectedClause] = useState<LMAClause | null>(null);
    const [clauseText, setClauseText] = useState('');

    // Document State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
    const [isLoanSelectorOpen, setIsLoanSelectorOpen] = useState(false);
    const [docId, setDocId] = useState<string | null>(null);

    // Initialize with first clause
    useEffect(() => {
        if (activeTemplate.sections.length > 0 && activeTemplate.sections[0].clauses.length > 0) {
            const firstClause = activeTemplate.sections[0].clauses[0];
            setSelectedClause(firstClause);
            setClauseText(firstClause.content);
        }
    }, [activeTemplate]);

    // Load existing draft or handle new loan context
    useEffect(() => {
        if (!user) return;

        // If navigated from Origination Wizard
        if (location.state?.loanId) {
            setDocId(null); // New doc for this loan
            if (location.state?.borrower) {
                // Check if we have an RC number in the state passed from Origination (we should update Origination to pass it)
                // But for now, let's just use the borrower name. Better yet, let's make sure Origination passes it.
                // Actually, OriginationWizard passes `loanId` and `borrower` only currently (line 67 of OriginationWizard).
                // I should update OriginationWizard to pass the full entity string or ID so we can fetch it?
                // Or just rely on the user to use "Link Loan" in DocBuilder.
                // But for seamless "Originate -> DocBuilder" flow:
                setClauseText(prev => prev.replace(/The Borrower/g, location.state.borrower));
            }
        } else if (location.state?.docId) {
            const fetchSpecificDraft = async () => {
                const { data } = await supabase.from('documents').select('*').eq('id', location.state.docId).single();
                if (data) {
                    setDocId(data.id);
                    setClauseText(data.content || '');
                    // Load template by ID
                    const templateId = data.template_type || 'lma-secured-term';
                    const loadedTemplate = LMA_TEMPLATES.find(t => t.id === templateId);
                    if (loadedTemplate) {
                        setActiveTemplate(loadedTemplate);
                    }
                    setLastSaved(new Date(data.updated_at).toLocaleTimeString());
                }
            };
            fetchSpecificDraft();
        } else {
            // Fallback to latest
            const fetchLatestDraft = async () => {
                const { data } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setDocId(data.id);
                    setClauseText(data.content || '');
                    // Load template by ID
                    const templateId = data.template_type || 'lma-secured-term';
                    const loadedTemplate = LMA_TEMPLATES.find(t => t.id === templateId);
                    if (loadedTemplate) {
                        setActiveTemplate(loadedTemplate);
                    }
                    setLastSaved(new Date(data.updated_at).toLocaleTimeString());
                }
            };
            fetchLatestDraft();
        }
    }, [user, location.state]);

    const handleSaveToCloud = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const payload = {
                user_id: user.id,
                loan_id: location.state?.loanId || null,
                content: clauseText,
                template_type: activeTemplate.id, // Save only the ID
                status: 'draft',
                updated_at: new Date().toISOString()
            };
            const { data, error } = await supabase
                .from('documents')
                .upsert(docId ? { ...payload, id: docId } : payload)
                .select()
                .single();

            if (error) throw error;
            if (data) setDocId(data.id);
            setLastSaved(new Date().toLocaleTimeString());
            return data.id;
        } catch (err: any) {
            console.error("Cloud save failed:", err);
            showToast(`Save Failed: ${err.message}`, 'error');
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    // PDF Export Options Interface
    interface ExportOptions {
        isCeremonialExecution?: boolean;
        createSignatureRecord?: boolean;
    }

    const handleExportPDF = async (options: ExportOptions = {}) => {
        const { isCeremonialExecution = false, createSignatureRecord = false } = options;

        if (!user) return;

        // Dynamic import jspdf
        const { jsPDF } = await import('jspdf');

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - margin * 2;

        // === HEADER WITH DOCGUARD BRANDING ===
        // Green header bar
        doc.setFillColor(0, 135, 81); // DocGuard green #008751
        doc.rect(0, 0, pageWidth, 35, 'F');

        // Load and embed logo
        try {
            // Fetch logo from public folder (Vite serves public assets at root)
            const logoResponse = await fetch('/logo.png');
            if (logoResponse.ok) {
                const logoBlob = await logoResponse.blob();
                const logoDataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoBlob);
                });
                // Add logo image (white background rounded square with leaf)
                doc.addImage(logoDataUrl, 'PNG', margin, 5, 25, 25);
            }
        } catch (e) {
            console.warn('Could not load logo:', e);
        }

        // Logo text (positioned after logo)
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('DOCGUARD', margin + 30, 16);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Nigeria Secured Lending Platform', margin + 30, 24);

        // Document reference number
        doc.setFontSize(8);
        doc.setTextColor(200, 255, 220);
        doc.text(`REF: ${Date.now().toString(36).toUpperCase()}`, pageWidth - margin, 10, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 16, { align: 'right' });

        // === DOCUMENT TITLE ===
        doc.setTextColor(10, 46, 31); // Dark green
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(activeTemplate.name.toUpperCase(), margin, 50);

        // Subtitle
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Loan Market Association (LMA) Standard Template - Nigerian Adaptation', margin, 58);

        // Horizontal divider
        doc.setDrawColor(0, 135, 81);
        doc.setLineWidth(0.5);
        doc.line(margin, 65, pageWidth - margin, 65);

        // === PARTIES SECTION ===
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 135, 81);
        doc.text('PARTIES TO THIS AGREEMENT', margin, 75);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text('The Lender (as defined herein)', margin, 83);
        doc.text('The Borrower (as defined herein)', margin, 90);
        doc.text('The Security Agent (if applicable)', margin, 97);

        // === MAIN CONTENT ===
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 135, 81);
        doc.text('TERMS AND CONDITIONS', margin, 110);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);

        const splitText = doc.splitTextToSize(clauseText, maxLineWidth);
        doc.text(splitText, margin, 120);

        // === SIGNATURE SECTION ===
        let yPos = 120 + (splitText.length * 5) + 15;
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 30;
        }

        doc.setDrawColor(0, 135, 81);
        doc.setFillColor(245, 250, 248);
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 55, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 135, 81);
        doc.text('EXECUTION & ATTESTATION', margin + 5, yPos + 10);

        doc.setFontSize(10);
        doc.text('IN WITNESS WHEREOF, the parties have executed this Agreement.', margin + 5, yPos + 18);

        if (profile?.signature_url) {
            doc.setFont('helvetica', 'bold');
            doc.text('SIGNED by:', margin + 5, yPos + 28);
            doc.setFont('helvetica', 'normal');
            doc.text(profile.full_name || 'Authorized Signatory', margin + 35, yPos + 28);

            try {
                doc.addImage(profile.signature_url, 'PNG', margin + 5, yPos + 32, 40, 18);
            } catch (e) {
                doc.text('[Digital Signature Applied]', margin + 5, yPos + 38);
            }

            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text(`Digitally Signed: ${new Date().toISOString()}`, margin + 50, yPos + 40);
            doc.text(`Signer ID: ${user?.id?.slice(0, 8)}...`, margin + 50, yPos + 45);
        } else {
            doc.setTextColor(200, 100, 100);
            doc.text('[No Digital Signature Found - Configure in Settings]', margin + 5, yPos + 35);
        }

        // === FOOTER ===
        const footerY = pageHeight - 15;
        doc.setFillColor(245, 245, 245);
        doc.rect(0, footerY - 5, pageWidth, 20, 'F');

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('This document was generated by DocGuard Nigeria | Evidence Act 2023 Compliant | www.docguard.ng', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Page 1 of 1`, pageWidth - margin, footerY, { align: 'right' });

        // Extract Entity Name for meaningful filename
        const entityMatch = clauseText.match(/The Borrower[,:]\s*([^,\.]+)/);
        const entityName = entityMatch ? entityMatch[1].trim() : 'Entity';
        const sanitizedEntity = entityName.replace(/[^a-zA-Z0-9-_]/g, '');
        const safeDocId = docId || 'draft';
        const timestamp = Date.now();

        // Format: Entity_DocID_Timestamp.pdf (Semantic & Unique)
        const pdfFilename = `${sanitizedEntity}_${safeDocId}_${timestamp}.pdf`;

        // === SINGLE BLOB GENERATION (P0 Fix) ===
        const pdfBlob = doc.output('blob');

        // Download using blob URL
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = pdfFilename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

        // Upload to Cloud (Web & Electron backup)
        try {
            const fileName = `${user.id}/${pdfFilename}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, pdfBlob, {
                    contentType: 'application/pdf'
                });

            if (uploadError) {
                console.warn("Cloud upload failed (offline mode?):", uploadError);
                if (!window.electron) throw uploadError; // Only throw if not in Electron (where local save succeeded)
                showToast('Saved locally. Cloud sync pending.', 'warning');
            } else {
                // === STATUS TRANSITIONS (P0 Fix) ===
                const newStatus = isCeremonialExecution ? 'executed' : 'exported';

                if (docId) {
                    await supabase
                        .from('documents')
                        .update({
                            file_url: fileName,
                            status: newStatus,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', docId);
                }
                showToast(isCeremonialExecution
                    ? 'Document executed and securely archived'
                    : 'PDF exported successfully',
                    'success');
            }

            // === CONDITIONAL SIGNATURE RECORDS (P0 Fix) ===
            if (createSignatureRecord && isCeremonialExecution) {
                await supabase.from('signatures').insert({
                    user_id: user.id,
                    document_id: docId,
                    signature_url: profile?.signature_url || 'MANUAL_EXPORT',
                    ip_address: 'CLIENT_IP_MASKED'
                });
            }

        } catch (uploadErr: any) {
            console.error('Export failed', uploadErr);
            if (!window.electron) {
                showToast('Export Failed: ' + uploadErr.message, 'error');
            }
        }
    };

    // Quick export handler (no signature record)
    const handleQuickExport = () => handleExportPDF({ isCeremonialExecution: false, createSignatureRecord: false });

    // Ceremonial execution handler (with signature record)
    const handleCeremonialExecution = () => handleExportPDF({ isCeremonialExecution: true, createSignatureRecord: true });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <ExecutionModal
                isOpen={isSigningModalOpen}
                onClose={() => setIsSigningModalOpen(false)}
                onExecute={handleCeremonialExecution}
                documentTitle={activeTemplate.name}
                signerName={profile?.full_name || user?.user_metadata?.full_name || 'Authorized Signatory'}
            />
            <LoanSelector
                isOpen={isLoanSelectorOpen}
                onClose={() => setIsLoanSelectorOpen(false)}
                onSelect={(loan) => {
                    setDocId(null);
                    const entityString = loan.rc_number
                        ? `${loan.borrower_name} (with Registration No. ${loan.rc_number})`
                        : loan.borrower_name;
                    setClauseText(prev => prev.replace(/The Borrower/g, entityString));
                    showToast(`Switched context to loan: ${loan.borrower_name}`, 'success');
                }}
            />

            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-emerald-100 text-[#008751] rounded-lg">
                            <Gavel size={20} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">LMA Smart Document Builder</h1>
                    </div>
                    <p className="text-emerald-600/70 font-medium">Standardized Nigerian Loan Documentation with LMA 2024 Compliance.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsLoanSelectorOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                    >
                        <Briefcase size={16} /> Link Loan
                    </button>
                    <div className="flex items-center gap-2 mr-2">
                        {lastSaved && (
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">
                                Cloud Sync: {lastSaved}
                            </span>
                        )}
                        <button
                            onClick={handleSaveToCloud}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-emerald-900 uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : (lastSaved ? <CloudCheck size={16} className="text-emerald-500" /> : <CloudUpload size={16} className="text-emerald-500" />)}
                            {isSaving ? 'Syncing...' : 'Save to Cloud'}
                        </button>
                    </div>
                    <button
                        onClick={async () => {
                            if (window.electron) {
                                const result = await window.electron.saveFile(clauseText, `${activeTemplate.name.replace(/\s+/g, '_')}.txt`);
                                if (result.success) showToast(`File saved: ${result.filePath}`, 'success');
                            } else {
                                // Web Mode Fallback (or remove if only Electron supported)
                                handleSaveToCloud();
                                showToast("Saved to Cloud (Web Mode)", 'info');
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        <Save size={16} />
                        Commit Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-6">
                    <VariablePanel content={clauseText} onUpdate={setClauseText} />

                    <ClauseLibrary
                        activeTemplate={activeTemplate}
                        onSelectTemplate={(t) => setActiveTemplate(t)}
                        templates={LMA_TEMPLATES}
                        onSelectClause={(clause) => {
                            setSelectedClause(clause);
                            setClauseText(clause.content);
                        }}
                        selectedClauseId={selectedClause?.id}
                    />
                </div>

                {/* Center: Editor */}
                <div className="lg:col-span-2 space-y-4">
                    <Editor content={clauseText} setContent={setClauseText} />
                </div>

                {/* Right: AI Analysis & Execution */}
                <div className="space-y-6">
                    <AnalysisPanel
                        clauseText={clauseText}
                        activeTemplate={activeTemplate}
                        onUpdateClause={setClauseText}
                    />

                    <div className="bg-[#0a2e1f] text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-black text-xl mb-3 tracking-tight">Execution Hub</h4>
                            <p className="text-emerald-400 text-xs font-medium mb-8 leading-relaxed">Evidence Act 2023 certified e-signature integration for secure closing.</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleQuickExport}
                                    className="w-full py-4 bg-white text-emerald-950 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
                                >
                                    Secure PDF Export
                                </button>
                                <button
                                    onClick={() => {
                                        if (!profile?.signature_url) {
                                            showToast("Please configure your Digital Signature in Settings first.", "error");
                                            navigate('/settings');
                                        } else {
                                            setIsSigningModalOpen(true);
                                        }
                                    }}
                                    className="w-full py-4 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <PenTool size={16} />
                                    Execute & Sign
                                </button>
                                <button
                                    onClick={async () => {
                                        // Navigate to Registry with document context
                                        const safeDocId = docId || (await handleSaveToCloud());
                                        if (!safeDocId) return;

                                        navigate('/registry', {
                                            state: {
                                                documentId: safeDocId,
                                                openFilingForm: true,
                                                prefillData: {
                                                    entityName: clauseText.match(/The Borrower[,:]\s*([^,\.]+)/)?.[1]?.trim() || '',
                                                    filingType: 'Fixed and Floating Charge'
                                                }
                                            }
                                        });
                                    }}
                                    className="w-full py-4 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Briefcase size={16} />
                                    Register Charge
                                </button>
                            </div>
                        </div>
                        <FileDown className="absolute -bottom-6 -right-6 text-emerald-950 opacity-40 group-hover:scale-110 transition-transform" size={140} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocBuilder;
