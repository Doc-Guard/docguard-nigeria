import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LoanKYCStatus } from '../../services/kycPersistence';

interface KYCStatusBadgeProps {
    status: LoanKYCStatus;
    loanId?: string;
    showDetails?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const KYCStatusBadge: React.FC<KYCStatusBadgeProps> = ({
    status,
    loanId,
    showDetails = false,
    size = 'md',
    onClick
}) => {
    const { isFullyVerified, verifiedCount, totalRequired, missingVerifications } = status;

    const isPartial = verifiedCount > 0 && !isFullyVerified;
    const isNone = verifiedCount === 0;

    // Determine colors and icon
    let bgColor = 'bg-emerald-50';
    let borderColor = 'border-emerald-200';
    let textColor = 'text-emerald-700';
    let Icon = ShieldCheck;
    let label = 'KYC Verified';

    if (isPartial) {
        bgColor = 'bg-amber-50';
        borderColor = 'border-amber-200';
        textColor = 'text-amber-700';
        Icon = ShieldAlert;
        label = `KYC Partial (${verifiedCount}/${totalRequired})`;
    } else if (isNone) {
        bgColor = 'bg-rose-50';
        borderColor = 'border-rose-200';
        textColor = 'text-rose-700';
        Icon = ShieldX;
        label = 'KYC Required';
    }

    // Size classes
    const sizeClasses = {
        sm: 'px-2 py-1 text-[10px] gap-1',
        md: 'px-3 py-1.5 text-xs gap-2',
        lg: 'px-4 py-2 text-sm gap-2'
    };

    const iconSizes = { sm: 12, md: 14, lg: 16 };

    const badgeContent = (
        <div
            className={`inline-flex items-center ${sizeClasses[size]} ${bgColor} ${textColor} border ${borderColor} rounded-full font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={onClick}
        >
            <Icon size={iconSizes[size]} />
            <span>{label}</span>
            {loanId && <ChevronRight size={iconSizes[size]} className="opacity-50" />}
        </div>
    );

    // If loanId provided, make it a link to KYC module
    if (loanId && !onClick) {
        return (
            <Link
                to={`/kyc`}
                state={{ loanId, borrower: status.verifications[0]?.entity_name }}
                className="inline-block"
            >
                {badgeContent}
            </Link>
        );
    }

    return badgeContent;
};

export default KYCStatusBadge;

/**
 * Compact inline KYC status indicator for tables/lists
 */
export const KYCStatusDot: React.FC<{ status: LoanKYCStatus }> = ({ status }) => {
    const { isFullyVerified, verifiedCount } = status;
    const isPartial = verifiedCount > 0 && !isFullyVerified;

    let dotColor = 'bg-emerald-500';
    let title = 'KYC Fully Verified';

    if (isPartial) {
        dotColor = 'bg-amber-500';
        title = `KYC Partial (${verifiedCount}/3)`;
    } else if (verifiedCount === 0) {
        dotColor = 'bg-rose-500';
        title = 'KYC Not Started';
    }

    return (
        <span
            className={`inline-block w-2.5 h-2.5 ${dotColor} rounded-full`}
            title={title}
        />
    );
};

/**
 * KYC Blocking Message - shown when action is blocked due to missing KYC
 */
export const KYCBlockingMessage: React.FC<{
    status: LoanKYCStatus;
    loanId?: string;
    action: string; // e.g., "build documents", "submit filing"
}> = ({ status, loanId, action }) => {
    if (status.isFullyVerified) return null;

    const missingLabels: Record<string, string> = {
        'BVN': 'Identity (BVN)',
        'CAC_RC': 'Corporate (RC Number)',
        'FIRS_TIN': 'Tax (TIN)'
    };

    return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
                <ShieldX className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <p className="text-sm font-bold text-rose-800 mb-1">
                        KYC Verification Required
                    </p>
                    <p className="text-xs text-rose-600 mb-2">
                        You must complete KYC verification before you can {action}.
                    </p>
                    <p className="text-xs text-rose-500 mb-3">
                        Missing: {status.missingVerifications.map(v => missingLabels[v] || v).join(', ')}
                    </p>
                    {loanId && (
                        <Link
                            to="/kyc"
                            state={{ loanId }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                        >
                            <ShieldCheck size={14} />
                            Complete KYC Verification
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
