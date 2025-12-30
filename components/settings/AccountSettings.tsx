
import React, { useState, useEffect, useRef } from 'react';
import { User, Upload, Briefcase, Loader2, Save, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';

const AccountSettings: React.FC = () => {
    const { user, profile, updateProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [org, setOrg] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state with profile content when loaded
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setOrg(profile.organization || '');
            setRole(profile.role_title || '');
            setAvatarUrl(profile.avatar_url);
        } else if (user) {
            // Fallback
            setFullName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url);
        }
    }, [profile, user]);

    const handleSave = async () => {
        setIsSaving(true);
        setMsg(null);
        try {
            await updateProfile({
                full_name: fullName,
                organization: org,
                role_title: role
            });
            setMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !user) {
            return;
        }

        setIsUploading(true);
        setMsg(null);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile
            await updateProfile({ avatar_url: publicUrl });
            setAvatarUrl(publicUrl);
            setMsg({ type: 'success', text: 'Avatar updated successfully.' });

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setMsg({ type: 'error', text: 'Failed to upload avatar. Ensure you have created the "avatars" bucket.' });
        } finally {
            setIsUploading(false);
            // Clear input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-3xl border-4 border-white shadow-lg overflow-hidden relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{getInitials(fullName)}</span>
                            )}

                            {/* Overlay for hover/uploading */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {isUploading ? <Loader2 className="text-white animate-spin" size={24} /> : <Upload className="text-white" size={24} />}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-emerald-950 tracking-tight">{fullName || 'User'}</h3>
                        <p className="text-sm text-emerald-600/60 font-medium">{role || 'Role Undefined'}</p>
                        {org && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#008751] text-[10px] font-black uppercase tracking-widest mt-2">
                                {org}
                            </span>
                        )}
                    </div>
                </div>

                {msg && (
                    <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center justify-between ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span>{msg.text}</span>
                        <button onClick={() => setMsg(null)}><X size={14} /></button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Organization</label>
                        <input
                            type="text"
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            placeholder="e.g. Access Bank Plc"
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">Role Title</label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" />
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Credit Officer"
                                className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
