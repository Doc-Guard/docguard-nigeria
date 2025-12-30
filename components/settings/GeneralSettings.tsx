
import React from 'react';
import RegionalPreferences from './RegionalPreferences';
import SubscriptionCard from './SubscriptionCard';

const GeneralSettings: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <RegionalPreferences />
            <SubscriptionCard />
        </div>
    );
};

export default GeneralSettings;
