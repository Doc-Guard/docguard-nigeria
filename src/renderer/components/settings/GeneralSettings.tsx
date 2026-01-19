
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import RegionalPreferences from './RegionalPreferences';
import SubscriptionCard from './SubscriptionCard';
import { useToast } from '../common/Toast';

const GeneralSettings: React.FC = () => {
    const { profile, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // App Preferences
    const [defaultCurrency, setDefaultCurrency] = useState('NGN');
    const [defaultLoanType, setDefaultLoanType] = useState('Term Facility');
    const [defaultPage, setDefaultPage] = useState('/');
    const [autoArchiveDays, setAutoArchiveDays] = useState(90);

    useEffect(() => {
        if (profile?.preferences?.app) {
            const app = profile.preferences.app;
            setDefaultCurrency(app.defaultCurrency || 'NGN');
            setDefaultLoanType(app.defaultLoanType || 'Term Facility');
            setDefaultPage(app.defaultPage || '/');
            setAutoArchiveDays(app.autoArchiveDays || 90);
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const currentPrefs = profile?.preferences || {};
            await updateProfile({
                preferences: {
                    ...currentPrefs,
                    app: {
                        defaultCurrency,
                        defaultLoanType,
                        defaultPage,
                        autoArchiveDays
                    }
                }
            });
            showToast('App preferences saved successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Failed to save preferences', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* App Preferences */}
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 text-[#008751] rounded-2xl flex items-center justify-center">
                        <SettingsIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-950 tracking-tight">App Preferences</h3>
                        <p className="text-xs text-emerald-600/50 font-medium">Configure default values and behaviors</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">
                            Default Currency
                        </label>
                        <select
                            value={defaultCurrency}
                            onChange={(e) => setDefaultCurrency(e.target.value)}
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        >
                            <option value="NGN">Nigerian Naira (₦)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="GBP">British Pound (£)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                        <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Default currency for new loans</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">
                            Default Loan Type
                        </label>
                        <select
                            value={defaultLoanType}
                            onChange={(e) => setDefaultLoanType(e.target.value)}
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        >
                            <option value="Term Facility">Term Facility</option>
                            <option value="Revolving Credit">Revolving Credit</option>
                            <option value="Project Finance">Project Finance</option>
                            <option value="Working Capital">Working Capital</option>
                        </select>
                        <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Pre-selected type in origination wizard</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">
                            Default Landing Page
                        </label>
                        <select
                            value={defaultPage}
                            onChange={(e) => setDefaultPage(e.target.value)}
                            className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        >
                            <option value="/">Dashboard</option>
                            <option value="/loans">Loan Origination</option>
                            <option value="/kyc">KYC Orchestrator</option>
                            <option value="/doc-builder">LMA Smart Docs</option>
                            <option value="/registry">CAC Registry Bot</option>
                            <option value="/analytics">Analytics</option>
                        </select>
                        <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Page shown after login</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">
                            Auto-Archive Period
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={autoArchiveDays}
                                onChange={(e) => setAutoArchiveDays(parseInt(e.target.value) || 90)}
                                min="30"
                                max="365"
                                className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-600/60 font-bold">days</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/60 font-medium ml-1">Archive completed loans older than this</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#008751] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>

            <RegionalPreferences />
            <SubscriptionCard />
        </div>
    );
};

export default GeneralSettings;
