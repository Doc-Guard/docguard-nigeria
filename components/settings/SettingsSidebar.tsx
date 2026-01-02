
import React from 'react';
import { Settings, User, Shield, Bell, Database, Key, Activity } from 'lucide-react';

interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'account', label: 'Account', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'apikeys', label: 'API Keys', icon: Key },
        { id: 'system', label: 'System Health', icon: Activity },
    ];

    return (
        <div className="space-y-2">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === tab.id
                                ? 'bg-[#008751] text-white shadow-lg shadow-emerald-900/20'
                                : 'text-emerald-950 hover:bg-emerald-50'
                            }`}
                    >
                        <Icon size={18} />
                        <span className="text-xs font-black uppercase tracking-wide">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default SettingsSidebar;
