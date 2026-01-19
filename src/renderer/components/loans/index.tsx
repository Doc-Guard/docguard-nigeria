import React, { useState } from 'react';
import OriginationWizard from './OriginationWizard';
import LoanList from './LoanList';
import LoanDetailView from './LoanDetailView';

type ViewState = 'list' | 'detail' | 'create';

const Loans: React.FC = () => {
    const [view, setView] = useState<ViewState>('list');
    const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

    const handleSelectLoan = (loanId: string) => {
        setSelectedLoanId(loanId);
        setView('detail');
    };

    const handleBackToList = () => {
        setSelectedLoanId(null);
        setView('list');
    };

    return (
        <div className="max-w-7xl mx-auto">
            {view === 'list' && (
                <LoanList
                    onSelectLoan={handleSelectLoan}
                    onNewLoan={() => setView('create')}
                />
            )}

            {view === 'detail' && selectedLoanId && (
                <LoanDetailView
                    loanId={selectedLoanId}
                    onBack={handleBackToList}
                />
            )}

            {view === 'create' && (
                <>
                    <button
                        onClick={() => setView('list')}
                        className="mb-8 text-sm font-bold text-gray-400 hover:text-emerald-700 uppercase tracking-widest transition-colors"
                    >
                        ← Cancel Origination
                    </button>
                    <OriginationWizard onSuccess={handleSelectLoan} />
                </>
            )}
        </div>
    );
};

export default Loans;
