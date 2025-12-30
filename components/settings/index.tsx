
import React, { useState } from 'react';
import SettingsSidebar from './SettingsSidebar';
import GeneralSettings from './GeneralSettings';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import DatabaseSettings from './DatabaseSettings';
import ApiKeysSettings from './ApiKeysSettings';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'account': return <AccountSettings />;
            case 'security': return <SecuritySettings />;
            case 'notifications': return <NotificationSettings />;
            case 'database': return <DatabaseSettings />;
            case 'apikeys': return <ApiKeysSettings />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">System Settings</h1>
                <p className="text-emerald-600/80 mt-1 font-medium italic">Configure your DocGuard environment and compliance preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="md:col-span-3 pb-20">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
