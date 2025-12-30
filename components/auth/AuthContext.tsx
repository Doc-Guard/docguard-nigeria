
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    organization: string | null;
    role_title: string | null;
    preferences: any | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // Use maybeSingle to avoid 406 error on no rows

            if (error) {
                console.warn('Error fetching profile:', error);
            }

            if (data) {
                setProfile(data);
            } else {
                // No profile found (e.g. manually created user in dashboard)
                // We initialize a transient empty profile so the UI doesn't crash
                // It will be created in DB on first 'updateProfile' call
                setProfile({
                    id: userId,
                    full_name: '',
                    avatar_url: '',
                    organization: '',
                    role_title: '',
                    preferences: {}
                });
            }
        } catch (error) {
            console.error('Profile fetch unexpected error:', error);
        }
    };

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return;

        // Optimistic Update
        setProfile(prev => prev ? { ...prev, ...updates } : null);

        // Using upsert to create if not exists
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Profile update failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
