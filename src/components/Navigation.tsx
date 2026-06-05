import GlassContainer from './GlassContainer';
import constellateIcon from '../assets/constellate-icon.png';
import styles from './Navigation.module.css';

interface NavigationProps {
    currentPage?: 'Asterism' | 'Support';
}

export default function Navigation({ currentPage = 'Asterism' }: NavigationProps) {
    return (
        <GlassContainer className={styles.container}>
            <div className={styles.logoArea}>
                <img
                    src={constellateIcon}
                    alt="Constellate Logo"
                    className={styles.icon}
                />
                <span className={styles.logoText}>CONSTELLATE</span>
            </div>

            <nav className={styles.navLinks}>
                <span
                    className={`${styles.navLink} ${currentPage === 'Asterism' ? styles.navLinkActive : ''}`}
                    aria-current={currentPage === 'Asterism' ? 'page' : undefined}
                    tabIndex={0}
                >
                    Asterism
                </span>
                <span
                    className={`${styles.navLink} ${currentPage === 'Support' ? styles.navLinkActive : ''}`}
                    aria-current={currentPage === 'Support' ? 'page' : undefined}
                    tabIndex={0}
                >
                    Support
                </span>
            </nav>

            <div className={styles.actionArea}
            tabIndex={0}>
                Sign in
            </div>
        </GlassContainer>
    );
}