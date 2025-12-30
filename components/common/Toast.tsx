import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration: number = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const config = {
        success: {
            icon: CheckCircle2,
            bgClass: 'bg-emerald-50 border-emerald-200',
            iconClass: 'text-emerald-600',
            textClass: 'text-emerald-900'
        },
        error: {
            icon: XCircle,
            bgClass: 'bg-rose-50 border-rose-200',
            iconClass: 'text-rose-600',
            textClass: 'text-rose-900'
        },
        warning: {
            icon: AlertCircle,
            bgClass: 'bg-amber-50 border-amber-200',
            iconClass: 'text-amber-600',
            textClass: 'text-amber-900'
        },
        info: {
            icon: Info,
            bgClass: 'bg-blue-50 border-blue-200',
            iconClass: 'text-blue-600',
            textClass: 'text-blue-900'
        }
    };

    const { icon: Icon, bgClass, iconClass, textClass } = config[toast.type];

    return (
        <div
            className={`${bgClass} border rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] pointer-events-auto animate-in slide-in-from-right-full duration-300`}
        >
            <Icon size={20} className={`${iconClass} shrink-0 mt-0.5`} />
            <p className={`${textClass} text-sm font-medium flex-1 leading-snug`}>
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition shrink-0"
            >
                <X size={16} />
            </button>
        </div>
    );
};
