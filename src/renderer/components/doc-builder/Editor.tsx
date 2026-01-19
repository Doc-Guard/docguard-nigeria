import React, { useState, useRef, useCallback } from 'react';
import { Leaf, Undo2, Redo2 } from 'lucide-react';

/**
 * Production-Grade Editor Component
 * @author kelexine (https://github.com/kelexine)
 * @description A feature-rich text editor with formatting and undo/redo capabilities
 */

interface EditorProps {
    content: string;
    setContent: (val: string) => void;
}

interface HistoryState {
    content: string;
    selectionStart: number;
    selectionEnd: number;
}

const Editor: React.FC<EditorProps> = ({ content, setContent }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [history, setHistory] = useState<HistoryState[]>([{ content, selectionStart: 0, selectionEnd: 0 }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Calculate statistics
    const stats = {
        chars: content.length,
        words: content.trim() ? content.trim().split(/\s+/).length : 0,
        lines: content.split('\n').length
    };

    // Add to history for undo/redo
    const addToHistory = useCallback((newContent: string, selStart: number, selEnd: number) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ content: newContent, selectionStart: selStart, selectionEnd: selEnd });

        // Limit history to last 50 states to prevent memory issues
        if (newHistory.length > 50) {
            newHistory.shift();
            setHistoryIndex(newHistory.length - 1);
        } else {
            setHistoryIndex(newHistory.length - 1);
        }

        setHistory(newHistory);
    }, [history, historyIndex]);

    // Handle content change with history
    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        const textarea = textareaRef.current;
        if (textarea) {
            addToHistory(newContent, textarea.selectionStart, textarea.selectionEnd);
        }
    };

    // Undo functionality
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const state = history[newIndex];
            setContent(state.content);
            setHistoryIndex(newIndex);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(state.selectionStart, state.selectionEnd);
                    textareaRef.current.focus();
                }
            }, 0);
        }
    };

    // Redo functionality
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const state = history[newIndex];
            setContent(state.content);
            setHistoryIndex(newIndex);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.setSelectionRange(state.selectionStart, state.selectionEnd);
                    textareaRef.current.focus();
                }
            }, 0);
        }
    };

    // Apply formatting (wraps selected text with markdown-style markers)
    const applyFormatting = (type: 'bold' | 'italic' | 'underline') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (!selectedText) return; // No text selected

        let wrapper = '';
        switch (type) {
            case 'bold':
                wrapper = '**';
                break;
            case 'italic':
                wrapper = '_';
                break;
            case 'underline':
                wrapper = '__';
                break;
        }

        const newContent =
            content.substring(0, start) +
            wrapper + selectedText + wrapper +
            content.substring(end);

        handleContentChange(newContent);

        // Restore selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
        }, 0);
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            handleUndo();
        }
        // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
        else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
            e.preventDefault();
            handleRedo();
        }
        // Ctrl/Cmd + B for bold
        else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            applyFormatting('bold');
        }
        // Ctrl/Cmd + I for italic
        else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            applyFormatting('italic');
        }
        // Ctrl/Cmd + U for underline
        else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            applyFormatting('underline');
        }
    };

    return (
        <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/5 min-h-[650px] flex flex-col relative overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-gradient-to-r from-emerald-50/30 to-emerald-50/10">
                <div className="flex gap-2">
                    {/* Formatting buttons */}
                    <button
                        onClick={() => applyFormatting('bold')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 text-emerald-900/60 font-bold rounded-lg transition-all border border-transparent hover:border-emerald-100 hover:scale-105 active:scale-95"
                        title="Bold (Ctrl+B)"
                        aria-label="Bold"
                    >
                        B
                    </button>
                    <button
                        onClick={() => applyFormatting('italic')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 text-emerald-900/60 italic font-semibold rounded-lg transition-all border border-transparent hover:border-emerald-100 hover:scale-105 active:scale-95"
                        title="Italic (Ctrl+I)"
                        aria-label="Italic"
                    >
                        I
                    </button>
                    <button
                        onClick={() => applyFormatting('underline')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 text-emerald-900/60 font-bold rounded-lg transition-all border border-transparent hover:border-emerald-100 hover:scale-105 active:scale-95 underline"
                        title="Underline (Ctrl+U)"
                        aria-label="Underline"
                    >
                        U
                    </button>

                    <div className="w-px h-6 bg-emerald-100 mx-1 self-center" />

                    {/* Undo/Redo buttons */}
                    <button
                        onClick={handleUndo}
                        disabled={historyIndex === 0}
                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 text-emerald-900/60 rounded-lg transition-all border border-transparent hover:border-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        title="Undo (Ctrl+Z)"
                        aria-label="Undo"
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={historyIndex === history.length - 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 text-emerald-900/60 rounded-lg transition-all border border-transparent hover:border-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        title="Redo (Ctrl+Shift+Z)"
                        aria-label="Redo"
                    >
                        <Redo2 size={16} />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-emerald-500">Words: {stats.words}</span>
                    <span className="text-emerald-400">Chars: {stats.chars}</span>
                    <span className="text-emerald-300">Lines: {stats.lines}</span>
                </div>
            </div>

            {/* Editor textarea */}
            <textarea
                ref={textareaRef}
                className="flex-1 p-10 text-emerald-950 text-lg leading-relaxed outline-none resize-none font-medium placeholder:text-emerald-900/20"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder="Begin drafting your Nigerian compliance overlay..."
                aria-label="Editor content"
            />

            {/* Watermark */}
            <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none select-none">
                <Leaf size={180} className="text-[#008751]" />
            </div>
        </div>
    );
};

export default Editor;
