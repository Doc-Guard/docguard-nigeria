
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, LogOut, LayoutDashboard, FileText, ShieldCheck, UserCheck, BarChart3, HelpCircle, Settings as SettingsIcon, Briefcase } from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Loan Origination', path: '/loans', icon: Briefcase },
        { name: 'KYC', path: '/kyc', icon: UserCheck },
        { name: 'LMA Doc Builder', path: '/doc-builder', icon: FileText },
        { name: 'CAC Registry', path: '/registry', icon: ShieldCheck },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Help ', path: '/help', icon:  HelpCircle },
    ];

    return (
        <aside className="w-68 bg-[#0a2e1f] text-white flex flex-col shadow-2xl border-r border-emerald-900/20">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#008751] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-950/40 transform hover:rotate-3 transition-transform">
                        <ShieldCheck size={24} className="text-white fill-current" />
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold tracking-tight block leading-none text-white">DocGuard</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mt-1">Nigeria</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 mt-2 px-4 space-y-1.5">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-[#008751] text-white shadow-lg shadow-emerald-950/40 translate-x-1'
                                : 'text-emerald-100/60 hover:bg-emerald-800/30 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={`${isActive ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-300'}`} />
                            <span className="font-semibold text-sm tracking-wide">{item.name}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-emerald-800/30 space-y-2">
                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-emerald-800/50 text-white' : 'text-emerald-100/60 hover:text-white hover:bg-emerald-800/20'
                        }`}
                >
                    <SettingsIcon size={20} className="text-emerald-500" />
                    <span className="font-medium text-sm">Settings</span>
                </Link>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 text-emerald-100/60 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl w-full transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
