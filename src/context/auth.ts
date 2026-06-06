import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextType {
    session: Session | null;
    isLoginModalOpen: boolean;
    toggleLoginModal: () => void;
    isLogoutModalOpen: boolean;
    toggleLogoutModal: () => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoginModalOpen: false,
    toggleLoginModal: () => {},
    isLogoutModalOpen: false,
    toggleLogoutModal: () => {},
    logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);