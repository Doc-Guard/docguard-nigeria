import React from 'react';
import { AlertTriangle, Trash2, Info, HelpCircle, X } from 'lucide-react';

export type ConfirmDialogType = 'danger' | 'warning' | 'info' | 'question';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmDialogType;
    isLoading?: boolean;
}

const iconMap = {
    danger: Trash2,
    warning: AlertTriangle,
    info: Info,
    question: HelpCircle
};

const colorMap = {
    danger: {
        icon: 'text-rose-500',
        iconBg: 'bg-rose-50',
        button: 'bg-rose-600 hover:bg-rose-700 text-white',
        border: 'border-rose-100'
    },
    warning: {
        icon: 'text-amber-500',
        iconBg: 'bg-amber-50',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        border: 'border-amber-100'
    },
    info: {
        icon: 'text-blue-500',
        iconBg: 'bg-blue-50',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        border: 'border-blue-100'
    },
    question: {
        icon: 'text-emerald-500',
        iconBg: 'bg-emerald-50',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        border: 'border-emerald-100'
    }
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'question',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const Icon = iconMap[type];
    const colors = colorMap[type];

    const handleConfirm = () => {
        onConfirm();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border ${colors.border} animate-in zoom-in-95 duration-200`}>
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
                            <Icon size={24} className={colors.icon} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 pt-4 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${colors.button}`}
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

/**
 * Hook for managing confirm dialog state
 */
export const useConfirmDialog = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [config, setConfig] = React.useState<{
        title: string;
        message: string;
        type: ConfirmDialogType;
        confirmText?: string;
        onConfirm: () => void | Promise<void>;
    }>({
        title: '',
        message: '',
        type: 'question',
        onConfirm: () => { }
    });

    const openDialog = (options: {
        title: string;
        message: string;
        type?: ConfirmDialogType;
        confirmText?: string;
        onConfirm: () => void | Promise<void>;
    }) => {
        setConfig({
            title: options.title,
            message: options.message,
            type: options.type || 'question',
            confirmText: options.confirmText,
            onConfirm: options.onConfirm
        });
        setIsOpen(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await config.onConfirm();
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
        }
    };

    return {
        isOpen,
        isLoading,
        config,
        openDialog,
        handleConfirm,
        handleClose,
        ConfirmDialogProps: {
            isOpen,
            isLoading,
            onClose: handleClose,
            onConfirm: handleConfirm,
            title: config.title,
            message: config.message,
            type: config.type,
            confirmText: config.confirmText
        }
    };
};
