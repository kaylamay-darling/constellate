import { useAuth } from '../context/auth';
import GlassContainer from './GlassContainer';
import constellateIcon from '../assets/constellate-icon.png';
import styles from './Navigation.module.css';

interface NavigationProps {
    currentPage?: 'Asterism' | 'Support';
    onNavigate: (page: 'Asterism' | 'Support') => void;
}

export default function Navigation({ currentPage = 'Asterism', onNavigate }: NavigationProps) {
    const { session, toggleLoginModal, toggleLogoutModal } = useAuth();

    return (
        <GlassContainer className={styles.container}>
            <div className={styles.logoArea}>
                <img src={constellateIcon} alt="Constellate Logo" className={styles.icon} />
                <span className={styles.logoText}>CONSTELLATE</span>
            </div>

            <nav className={styles.navLinks}>
                <span
                    className={`${styles.navLink} ${currentPage === 'Asterism' ? styles.navLinkActive : ''}`}
                    aria-current={currentPage === 'Asterism' ? 'page' : undefined}
                    tabIndex={0}
                    onClick={() => onNavigate('Asterism')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onNavigate('Asterism')}
                >
                    Asterism
                </span>
                <span
                    className={`${styles.navLink} ${currentPage === 'Support' ? styles.navLinkActive : ''}`}
                    aria-current={currentPage === 'Support' ? 'page' : undefined}
                    tabIndex={0}
                    onClick={() => onNavigate('Support')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onNavigate('Support')}
                >
                    Support
                </span>
            </nav>

            <div
                className={styles.actionArea}
                tabIndex={!session ? 0 : -1}
                role={!session ? 'button' : undefined}
                onClick={!session ? toggleLoginModal : undefined}
                onKeyDown={(e) => {
                    if (!session && (e.key === 'Enter' || e.key === ' ')) toggleLoginModal();
                }}
            >
                {session ? (
                    <div
                        className={styles.userProfile}
                        role="button"
                        tabIndex={0}
                        onClick={toggleLogoutModal}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') toggleLogoutModal();
                        }}
                        aria-label="Open logout modal"
                    >
                        <span className={styles.userName}>
                            {session.user.user_metadata.full_name?.split(' ')[0] || 'User'}
                        </span>
                        {session.user.user_metadata.avatar_url && (
                            <img src={session.user.user_metadata.avatar_url} alt="Profile" className={styles.userAvatar} />
                        )}
                    </div>
                ) : (
                    <span>Sign in</span>
                )}
            </div>
        </GlassContainer>
    );
}