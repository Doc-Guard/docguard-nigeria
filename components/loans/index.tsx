
import React from 'react';
import OriginationWizard from './OriginationWizard';

const Loans: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <OriginationWizard />
            {/* Future: Add Loan List / Deal Room Dashboard here */}
        </div>
    );
};

export default Loans;
