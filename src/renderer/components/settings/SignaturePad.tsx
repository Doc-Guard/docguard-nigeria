import React, { useRef, useState, useEffect } from 'react';
import { Save, RefreshCw, Type, PenTool } from 'lucide-react';
import { useToast } from '../common/Toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

interface SignaturePadProps {
    currentSignature?: string | null;
    onSave: (url: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ currentSignature, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'draw' | 'type'>('draw');
    const [typedName, setTypedName] = useState('');
    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        // Initialize canvas
        if (mode === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = '#000000';
                }
            }
        }
    }, [mode]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
        const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
        const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        setTypedName('');
    };

    const handleSave = async () => {
        if (!user) return;

        let signatureDataUrl = '';

        if (mode === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas) return;
            // Check if empty
            const blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;
            if (canvas.toDataURL() === blank.toDataURL()) {
                showToast('Please sign before saving', 'warning');
                return;
            }
            signatureDataUrl = canvas.toDataURL('image/png');
        } else {
            if (!typedName.trim()) {
                showToast('Please type your name', 'warning');
                return;
            }
            // Render text to canvas to create image
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = 'italic 48px "Dancing Script", cursive, serif'; // Simulating handwritten font
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedName, 250, 100);
                signatureDataUrl = canvas.toDataURL('image/png');
            }
        }

        try {
            // Upload to Supabase Storage
            const blob = await (await fetch(signatureDataUrl)).blob();
            const fileName = `${user.id}/signature_${Date.now()}.png`;

            // 1. Upload
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars') // Using avatars bucket for now, ideally 'signatures'
                .upload(fileName, blob, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            onSave(publicUrl);
            showToast('Signature saved securey', 'success');
        } catch (error: any) {
            console.error('Signature save error:', error);
            showToast('Failed to save signature: ' + error.message, 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-emerald-950">E-Signature</label>
                <div className="flex gap-2 text-xs">
                    <button
                        onClick={() => setMode('draw')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${mode === 'draw' ? 'bg-[#008751] text-white font-bold' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                        <PenTool size={12} /> Draw
                    </button>
                    <button
                        onClick={() => setMode('type')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${mode === 'type' ? 'bg-[#008751] text-white font-bold' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                        <Type size={12} /> Type
                    </button>
                </div>
            </div>

            <div className="border-2 border-dashed border-emerald-200 rounded-2xl bg-white relative overflow-hidden h-48 flex items-center justify-center">
                {mode === 'draw' ? (
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={192}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none"
                    />
                ) : (
                    <input
                        type="text"
                        placeholder="Type your full name"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="text-4xl text-center italic font-serif w-full h-full outline-none text-emerald-900 placeholder:text-emerald-100 bg-transparent"
                        style={{ fontFamily: '"Dancing Script", cursive, serif' }}
                    />
                )}

                <button
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    title="Clear"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {currentSignature && (
                <div className="flex items-center gap-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-50">
                    <span className="text-xs font-bold text-emerald-700">Current:</span>
                    <img src={currentSignature} alt="Current Signature" className="h-8 object-contain" />
                </div>
            )}

            <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#008751] transition-all flex items-center justify-center gap-2"
            >
                <Save size={16} />
                Save Secure Signature
            </button>

            <p className="text-[10px] text-emerald-600/60 text-center">
                By saving, you consent to use this digital signature for processing legal documents under the Evidence Act 2023.
            </p>
        </div>
    );
};

export default SignaturePad;
