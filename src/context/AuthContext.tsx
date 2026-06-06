import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        try {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
            }).catch((error) => {
                console.error('Failed to get session:', error);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            });

            return () => subscription.unsubscribe();
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }, []);

    const toggleLoginModal = () => setIsLoginModalOpen((prev) => !prev);
    const toggleLogoutModal = () => setIsLogoutModalOpen((prev) => !prev);

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        }
        setIsLogoutModalOpen(false);
        setIsLoginModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{ session, isLoginModalOpen, toggleLoginModal, isLogoutModalOpen, toggleLogoutModal, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
