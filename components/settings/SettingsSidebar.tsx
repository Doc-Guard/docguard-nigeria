
import React from 'react';
import { User, Shield, Bell, Database, Key, Globe } from 'lucide-react';

interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="space-y-2">
            {[
                { label: 'General', id: 'general', icon: Globe },
                { label: 'Account', id: 'account', icon: User },
                { label: 'Security', id: 'security', icon: Shield },
                { label: 'Notifications', id: 'notifications', icon: Bell },
                { label: 'Database', id: 'database', icon: Database },
                { label: 'API Keys', id: 'apikeys', icon: Key },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                            ? 'bg-[#008751] text-white shadow-lg shadow-emerald-900/10'
                            : 'text-emerald-900/40 hover:bg-emerald-50 hover:text-[#008751]'
                        }`}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
        </aside>
    );
};

export default SettingsSidebar;
