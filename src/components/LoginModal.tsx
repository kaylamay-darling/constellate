import { useAuth } from '../context/auth';
import { supabase } from '../lib/supabaseClient';
import ModalContainer from './ModalContainer';
import styles from './LoginModal.module.css';

export const LoginModal = () => {
    const { isLoginModalOpen, toggleLoginModal } = useAuth();

    if (!isLoginModalOpen) return null;

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'http://localhost:5174/' },
        });
        if (error) console.error('Login error:', error.message);
    };

    return (
        <ModalContainer onClose={toggleLoginModal}>
            <div className={styles.toolContent}>
                <header className={styles.header}>
                    <h3 className={styles.title}>Sign In</h3>
                    <button onClick={toggleLoginModal} className={styles.closeBtn}>X</button>
                </header>
                <div className={styles.body}>
                    <p>Sign in to access your asterism data and journaling features.</p>
                    <button className={styles.loginButton} onClick={handleGoogleLogin}>
                        Sign in with Google
                    </button>
                </div>
            </div>
        </ModalContainer>
    );
};