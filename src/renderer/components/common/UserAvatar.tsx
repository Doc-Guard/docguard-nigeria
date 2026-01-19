import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    email?: string;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    showOnlineIndicator?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name,
    email,
    size = 'md',
    onClick,
    showOnlineIndicator = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl'
    };

    const getInitial = () => {
        if (name) return name.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return '?';
    };

    return (
        <div className="relative inline-block">
            {src ? (
                <img
                    src={src}
                    alt={name || email || 'User'}
                    className={`${sizeClasses[size]} rounded-xl object-cover shadow-md ${onClick ? 'cursor-pointer transform hover:scale-110 transition-transform' : ''}`}
                    onClick={onClick}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-emerald-500 to-[#008751] flex items-center justify-center text-white font-bold shadow-md ${onClick ? 'cursor-pointer transform hover:scale-110 transition-transform' : ''}`}
                    onClick={onClick}
                >
                    {getInitial()}
                </div>
            )}

            {showOnlineIndicator && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
        </div>
    );
};

export default UserAvatar;
