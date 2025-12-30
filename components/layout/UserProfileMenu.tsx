import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut, CreditCard } from 'lucide-react';

interface UserProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    onLogout: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
    isOpen,
    onClose,
    userName,
    userEmail,
    onLogout
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const menuItems = [
        { icon: User, label: 'View Profile', action: () => navigate('/settings?tab=account') },
        { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
        { icon: CreditCard, label: 'Subscription', action: () => navigate('/settings?tab=account') },
        { icon: HelpCircle, label: 'Help & Documentation', action: () => navigate('/settings') },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-emerald-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                {/* User Info */}
                <div className="p-4 border-b border-emerald-50">
                    <p className="text-sm font-bold text-emerald-950">{userName}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{userEmail}</p>
                    <div className="mt-3 px-3 py-1.5 bg-emerald-50 rounded-lg inline-block">
                        <p className="text-[10px] font-black text-[#008751] uppercase tracking-wider">Professional Plan</p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.action();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-emerald-900 hover:bg-emerald-50 rounded-xl transition-all group"
                        >
                            <item.icon size={18} className="text-emerald-600 group-hover:text-[#008751]" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-emerald-50">
                    <button
                        onClick={() => {
                            onLogout();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfileMenu;
