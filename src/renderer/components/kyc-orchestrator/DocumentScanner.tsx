
import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface DocumentScannerProps {
    onComplete: (data: any) => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setIsScanning(true);

            // Simulating OCR
            setTimeout(() => {
                setIsScanning(false);
                onComplete({
                    docType: 'International Passport',
                    expiryDate: '2030-01-01',
                    ocrMatchScore: 98
                });
            }, 2500);
        }
    };

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#008751]">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-emerald-950">Document Analysis</h3>
                    <p className="text-sm text-emerald-600/60 font-medium">AI-powered OCR & Forgery Detection</p>
                </div>
            </div>

            <div className="border-2 border-dashed border-emerald-100 rounded-2xl p-12 text-center hover:bg-emerald-50/30 transition-colors relative cursor-pointer group">
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*,.pdf"
                    onChange={handleUpload}
                    disabled={isScanning || !!file}
                />

                {isScanning ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-[#008751] animate-spin" />
                        <p className="text-sm font-bold text-emerald-900 uppercase tracking-widest animate-pulse">Scanning Holograms...</p>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 text-[#008751] rounded-full flex items-center justify-center">
                            <CheckCircle size={32} />
                        </div>
                        <p className="text-sm font-bold text-emerald-900">{file.name} Uploaded</p>
                        <p className="text-xs text-emerald-500 font-black uppercase tracking-widest">Analysis Complete</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center group-hover:bg-[#008751] group-hover:text-white transition-colors">
                            <UploadCloud size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-emerald-950">Drop ID Document Here</h4>
                            <p className="text-xs text-emerald-600/60 font-medium">Supports Nigerian Passport, Driver's License, or NIN Slip</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentScanner;
