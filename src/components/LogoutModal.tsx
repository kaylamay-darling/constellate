import { useAuth } from '../context/auth';
import ModalContainer from './ModalContainer';
import styles from './LoginModal.module.css';

export const LogoutModal = () => {
    const { isLogoutModalOpen, toggleLogoutModal, logout } = useAuth();

    if (!isLogoutModalOpen) return null;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ModalContainer onClose={toggleLogoutModal}>
            <div className={styles.toolContent}>
                <header className={styles.header}>
                    <h3 className={styles.title}>Log Out</h3>
                    <button onClick={toggleLogoutModal} className={styles.closeBtn}>X</button>
                </header>
                <div className={styles.body}>
                    <p>Are you sure you want to log out? This will end your current session.</p>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </div>
        </ModalContainer>
    );
};
