import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextType {
    session: Session | null;
    isLoginModalOpen: boolean;
    toggleLoginModal: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoginModalOpen: false,
    toggleLoginModal: () => {},
});

export const useAuth = () => useContext(AuthContext);