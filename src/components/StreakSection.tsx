import type { AdictionTrackingData } from '../lib/sobrietyTrackingService';
import styles from './StreakSection.module.css';

interface StreakSectionProps {
    data: AdictionTrackingData[];
}

function formatStreak(days: number): string {
    if (days === 0) return '0 days';
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remaining = days % 30;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
    if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
    if (remaining > 0) parts.push(`${remaining} day${remaining === 1 ? '' : 's'}`);
    return parts.join(', ');
}

export function StreakSection({ data }: StreakSectionProps) {
    return (
        <div className={styles.container}>
            <span className={styles.title}>Longest Streaks</span>
            <div className={styles.grid}>
                {data.map(addiction => (
                    <div key={addiction.name} className={styles.card}>
                        <span className={styles.name}>{addiction.name}</span>
                        <span className={styles.streak}>{formatStreak(addiction.longestStreak)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}