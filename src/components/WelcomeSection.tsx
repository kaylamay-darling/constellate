import { useAuth } from '../context/auth';
import styles from './WelcomeSection.module.css';

export default function WelcomeSection() {
    const { session } = useAuth();

    if (!session) {
        return (
            <div className={styles.welcomeContainer}>
                <h1 className={styles.welcomeText}>Log in to get started.</h1>
            </div>
        );
    }

    const userName = session.user.user_metadata.full_name?.split(' ')[0] || 'User';

    return (
        <div className={styles.welcomeContainer}>
            <h1 className={styles.welcomeText}>Welcome, {userName}</h1>
        </div>
    );
}
