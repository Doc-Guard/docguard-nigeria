
import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
    userEmail: string;
}

const Header: React.FC<HeaderProps> = ({ userEmail }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const userInitial = userEmail.charAt(0).toUpperCase();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between px-10 z-20 sticky top-0">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/50" size={18} />
                <input
                    type="text"
                    placeholder="Search loans, borrowers, or filings..."
                    className="w-full pl-12 pr-6 py-2.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-sm focus:ring-2 focus:ring-[#008751] focus:bg-white outline-none transition-all placeholder:text-emerald-900/30"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 text-emerald-900/60 hover:bg-emerald-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 z-50 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h4 className="font-black text-xs uppercase tracking-widest text-emerald-950">Notifications</h4>
                                <span className="text-[10px] font-bold text-[#008751] bg-emerald-50 px-2 py-1 rounded-md">3 New</span>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 group cursor-pointer hover:bg-emerald-50">
                                    <p className="text-xs font-bold text-emerald-900">Charge Registered Successfully</p>
                                    <p className="text-[10px] text-emerald-600/70 mt-1">Ref: CAC-CHG-9912 for Dangote Refinery Ltd</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-emerald-50 group cursor-pointer hover:bg-emerald-50">
                                    <p className="text-xs font-bold text-emerald-900">Deadline Warning</p>
                                    <p className="text-[10px] text-amber-600 mt-1">Ibeto Cement filing due in 5 days!</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-emerald-50 group cursor-pointer hover:bg-emerald-50">
                                    <p className="text-xs font-bold text-emerald-900">KYC Flag Detected</p>
                                    <p className="text-[10px] text-rose-600 mt-1">Credit utilization alert for MTN Nigeria</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 text-[10px] font-black text-[#008751] uppercase tracking-widest hover:bg-emerald-50 rounded-xl transition-all">
                                View All Activity
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-10 w-px bg-emerald-100/80 mx-1"></div>
                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-emerald-950 group-hover:text-[#008751] transition-colors">{userEmail.split('@')[0]}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">DocGuard Professional</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#008751] flex items-center justify-center text-white font-bold shadow-md transform group-hover:scale-110 transition-transform">
                        {userInitial}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
