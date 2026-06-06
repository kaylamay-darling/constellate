import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleLoginModal = () => setIsLoginModalOpen((prev) => !prev);

    return (
        <AuthContext.Provider value={{ session, isLoginModalOpen, toggleLoginModal }}>
            {children}
        </AuthContext.Provider>
    );
};
