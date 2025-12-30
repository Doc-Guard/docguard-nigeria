
import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const NotificationSettings: React.FC = () => {
    const { profile, updateProfile } = useAuth();
    const [prefs, setPrefs] = useState<any>({});

    useEffect(() => {
        if (profile?.preferences) {
            setPrefs(profile.preferences);
        }
    }, [profile]);

    const togglePref = async (key: string, type: 'email' | 'push') => {
        const currentSetting = prefs[key]?.[type]; // true/false/undefined

        // Logic: If undefined, default to TRUE for these important alerts, so toggle means turn OFF
        // Or simpler: default false. Let's assume default false for simplicity unless set.
        const newValue = !currentSetting;

        const newPrefs = {
            ...prefs,
            [key]: {
                ...prefs[key],
                [type]: newValue
            }
        };

        setPrefs(newPrefs); // Optimistic UI
        await updateProfile({ preferences: newPrefs });
    };

    const isEnabled = (key: string, type: 'email' | 'push') => !!prefs[key]?.[type];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">Notification Preferences</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Manage how DocGuard alerts you.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { id: 'rpa_complete', label: 'RPA Filing Completion', desc: 'Alert when CAC bot successfully files a document.' },
                        { id: 'compliance_warn', label: 'Compliance Deadlines', desc: 'Warnings for upcoming 90-day filing deadlines.' },
                        { id: 'doc_comments', label: 'Document Comments', desc: 'When team members comment on your drafts.' },
                        { id: 'sys_updates', label: 'System Updates', desc: 'Platform maintenance and feature releases.' },
                    ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-4 border-b border-emerald-50 last:border-0">
                            <div className="max-w-xs">
                                <h4 className="text-sm font-bold text-emerald-950">{item.label}</h4>
                                <p className="text-[11px] text-emerald-600/60 font-medium leading-tight mt-1">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                    <Mail size={18} className={isEnabled(item.id, 'email') ? "text-[#008751]" : "text-emerald-900/20"} />
                                    <input
                                        type="checkbox"
                                        checked={isEnabled(item.id, 'email')}
                                        onChange={() => togglePref(item.id, 'email')}
                                        className="accent-[#008751]"
                                    />
                                </label>
                                <label className="flex flex-col items-center gap-2 cursor-pointer group">
                                    <MessageSquare size={18} className={isEnabled(item.id, 'push') ? "text-[#008751]" : "text-emerald-900/20"} />
                                    <input
                                        type="checkbox"
                                        checked={isEnabled(item.id, 'push')}
                                        onChange={() => togglePref(item.id, 'push')}
                                        className="accent-[#008751]"
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
