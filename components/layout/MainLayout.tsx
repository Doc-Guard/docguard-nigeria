
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
    children: ReactNode;
    userEmail: string;
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, userEmail, onLogout }) => {
    return (
        <div className="flex h-screen bg-[#fcfdfc] overflow-hidden">
            <Sidebar onLogout={onLogout} />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none"></div>

                <Header userEmail={userEmail} />

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
